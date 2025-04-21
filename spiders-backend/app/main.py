from fastapi import FastAPI, Request, Body
from database import engine
import models
from auth import router as auth_router
from throttle import get_delay
from fastapi.staticfiles import StaticFiles
import os
from config import RECAPTCHA_ENABLED
import httpx

app = FastAPI(title="Spiders API")

# Cria as tabelas no banco (modo simples por enquanto)
models.Base.metadata.create_all(bind=engine)

# Inclui as rotas com prefixo /api
app.include_router(auth_router, prefix="/api")

@app.get("/")
def read_root():
    return {"message": "Spiders API funcionando 🕷️"}

@app.get("/api/throttle-status")
async def throttle_status(request: Request):
    forwarded = request.headers.get("x-forwarded-for")
    client_ip = forwarded.split(",")[0].strip() if forwarded else request.client.host
    delay = await get_delay(client_ip, "dummy@example.com")
    return {
        "delay": delay,
        "client_ip": client_ip,
        "source": "x-forwarded-for" if forwarded else "request.client.host"
    }

@app.post("/api/verificar-recaptcha")
async def verificar_recaptcha(data: dict = Body(...)):
    if not RECAPTCHA_ENABLED:
        # Modo simulado
        return {"success": True, "score": 0.91, "simulated": True}

    token = data.get("token")
    if not token:
        return {"success": False}

    async with httpx.AsyncClient() as client:
        response = await client.post(
            "https://www.google.com/recaptcha/api/siteverify",
            data={
                "secret": os.getenv("RECAPTCHA_SECRET"),
                "response": token
            }
        )
    result = response.json()
    return {
        "success": result.get("success", False),
        "score": result.get("score", 0.0),
        "action": result.get("action", "")
    }

# Monta a pasta de arquivos estáticos (html, js, css)
app.mount("/", StaticFiles(directory="/html", html=True), name="static")

