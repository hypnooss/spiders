# app/auth.py
from throttle import apply_delay, penalize, mark_ip_as_trusted
from fastapi import APIRouter, Depends, HTTPException, status, Request, Response
from sqlalchemy.orm import Session
from passlib.context import CryptContext
from jose import jwt
from datetime import datetime, timedelta
import models, schemas
from database import SessionLocal
from mailer import send_activation_email
from config import ACTIVATION_BASE_URL
from fastapi.responses import HTMLResponse
import os
from pathlib import Path
from fastapi.responses import RedirectResponse

router = APIRouter()

SECRET_KEY = "spiders-super-secret"
ALGORITHM = "HS256"

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

@router.post("/api/recovery")
async def recovery(data: schemas.EmailOnly, request: Request, db: Session = Depends(get_db)):
    ip = request.client.host
    await apply_delay(ip, data.email)

    user = db.query(models.User).filter(models.User.email == data.email).first()

    response_message = {
        "message": "Se este e-mail estiver registrado, enviaremos instruções de redefinição."
    }

    if not user:
        return response_message

    token = jwt.encode(
        {
            "sub": data.email,
            "action": "recover",
            "exp": datetime.utcnow() + timedelta(minutes=30)
        },
        SECRET_KEY,
        algorithm=ALGORITHM
    )

    recovery_link = f"{ACTIVATION_BASE_URL}/reset-password?token={token}"
    send_activation_email(data.email, recovery_link)

    return response_message

@router.post("/register", response_model=schemas.Token)
async def register(user: schemas.UserCreate, request: Request, db: Session = Depends(get_db)):
    ip = request.client.host
    await apply_delay(ip, user.email)

    print(f"[REGISTER] Tentativa de registro: {user.email} / IP: {ip}")

    db_user = db.query(models.User).filter(models.User.email == user.email).first()
    if db_user:
        await penalize(ip, user.email)
        print(f"[REGISTER] ❌ Email já registrado: {user.email}")
        raise HTTPException(status_code=400, detail="Email já registrado")

    hashed_pw = pwd_context.hash(user.password)
    new_user = models.User(email=user.email, hashed_password=hashed_pw, is_active=False)
    db.add(new_user)
    db.commit()
    db.refresh(new_user)

    token = jwt.encode(
        {
            "sub": user.email,
            "action": "activate",
            "exp": datetime.utcnow() + timedelta(hours=24)
        },
        SECRET_KEY,
        algorithm=ALGORITHM
    )

    activation_token = models.ActivationToken(
        token=token,
        user_id=new_user.id,
        expires_at=datetime.utcnow() + timedelta(hours=24),
        used=False
    )
    db.add(activation_token)
    db.commit()

    send_activation_email(user.email, token)

    await mark_ip_as_trusted(ip, user.email)

    print(f"[REGISTER] ✅ Registro OK: {user.email} / IP: {ip}")

    return {"access_token": token, "token_type": "bearer"}

@router.post("/login", response_model=schemas.LoginResponse)
async def login(data: schemas.LoginRequest, request: Request, db: Session = Depends(get_db)):
    ip = request.client.host
    await apply_delay(ip, data.email)

    user = db.query(models.User).filter(models.User.email == data.email).first()
    if not user or not pwd_context.verify(data.password, user.hashed_password):
        await penalize(ip, data.email)
        print(f"[LOGIN] ❌ Falha de login para: {data.email} / IP: {ip}")
        raise HTTPException(status_code=401, detail="Credenciais inválidas")

    if not user.is_active:
        print(f"[LOGIN] ❌ Conta não ativada: {data.email}")
        raise HTTPException(status_code=403, detail="Conta não ativada")

    if user.mfa_secret:
        print(f"[LOGIN] 🔐 MFA requerido para: {data.email}")
        return {"pending_mfa": True, "user_id": user.id}

    await mark_ip_as_trusted(ip, data.email)
    print(f"[LOGIN] ✅ Login OK: {data.email} / IP: {ip}")

    token = jwt.encode(
        {
            "sub": data.email,
            "action": "auth",
            "exp": datetime.utcnow() + timedelta(hours=12)
        },
        SECRET_KEY,
        algorithm=ALGORITHM
    )

    return {"access_token": token, "token_type": "bearer"}

@router.post("/verify-mfa", response_model=schemas.Token)
async def verify_mfa(data: schemas.MFARequest, request: Request, db: Session = Depends(get_db)):
    ip = request.client.host
    await apply_delay(ip)

    user = db.query(models.User).filter(models.User.id == data.user_id).first()
    if not user or not user.mfa_secret:
        await penalize(ip)
        raise HTTPException(status_code=401, detail="Usuário ou MFA inválido")

    import pyotp
    totp = pyotp.TOTP(user.mfa_secret)
    if not totp.verify(data.code):
        await penalize(ip)
        print(f"[MFA] ❌ Código inválido para: {user.email} / IP: {ip}")
        raise HTTPException(status_code=401, detail="Código MFA inválido")

    await mark_ip_as_trusted(ip)
    print(f"[MFA] ✅ Verificado com sucesso: {user.email} / IP: {ip}")

    token = jwt.encode(
        {
            "sub": user.email,
            "action": "auth",
            "exp": datetime.utcnow() + timedelta(hours=12)
        },
        SECRET_KEY,
        algorithm=ALGORITHM
    )

    return {"access_token": token, "token_type": "bearer"}

from fastapi.responses import RedirectResponse

@router.get("/activate")
async def activate_account(token: str, db: Session = Depends(get_db)):
    try:
        activation_token = db.query(models.ActivationToken).filter(models.ActivationToken.token == token).first()
        if not activation_token:
            return RedirectResponse("/index.html#activated?status=invalid", status_code=302)

        if activation_token.used:
            return RedirectResponse("/index.html#activated?status=used", status_code=302)

        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        email = payload.get("sub")
        action = payload.get("action")

        if action != "activate" or not email:
            return RedirectResponse("/index.html#activated?status=invalid", status_code=302)

        user = db.query(models.User).filter(models.User.email == email).first()
        if not user:
            return RedirectResponse("/index.html#activated?status=invalid", status_code=302)

        user.is_active = True
        activation_token.used = True
        db.commit()

        print(f"[ACTIVATE] ✅ Conta ativada: {email}")
        return RedirectResponse("/index.html#activated?status=activated", status_code=302)

    except jwt.ExpiredSignatureError:
        return RedirectResponse("/index.html#activated?status=invalid", status_code=302)
    except jwt.JWTError:
        return RedirectResponse("/index.html#activated?status=invalid", status_code=302)

