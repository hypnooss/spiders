# app/auth.py
from throttle import apply_delay  # 👈 no topo do arquivo
from fastapi import APIRouter, Depends, HTTPException, status, Request
from sqlalchemy.orm import Session
from passlib.context import CryptContext
from jose import jwt
from datetime import datetime, timedelta

import models, schemas
from database import SessionLocal
from mailer import send_activation_email
from config import ACTIVATION_BASE_URL

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

    # Sempre retorna a mesma resposta, mesmo se e-mail não for encontrado
    response_message = {
        "message": "Se este e-mail estiver registrado, enviaremos instruções de redefinição."
    }

    if not user:
        return response_message

    # Gerar token JWT com ação "recover"
    token = jwt.encode(
        {
            "sub": data.email,
            "action": "recover",
            "exp": datetime.utcnow() + timedelta(minutes=30)
        },
        SECRET_KEY,
        algorithm=ALGORITHM
    )

    # Gerar link de recuperação
    recovery_link = f"{ACTIVATION_BASE_URL}/reset-password?token={token}"

    # Reaproveitar o mailer
    send_activation_email(data.email, recovery_link)  # Pode criar outro template depois se quiser

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
    new_user = models.User(email=user.email, hashed_password=hashed_pw)
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

    activation_link = f"{ACTIVATION_BASE_URL}/confirm?token={token}"
    send_activation_email(user.email, activation_link)

    await mark_ip_as_trusted(ip)

    print(f"[REGISTER] ✅ Registro OK: {user.email} / IP: {ip}")

    return {"access_token": token, "token_type": "bearer"}
