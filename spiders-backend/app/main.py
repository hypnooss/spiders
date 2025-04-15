from fastapi import FastAPI
from database import engine
import models
from auth import router as auth_router
from fastapi import Request
from throttle import get_delay

app = FastAPI(title="Spiders API")

# Cria as tabelas no banco (modo simples por enquanto)
models.Base.metadata.create_all(bind=engine)
app.include_router(auth_router)

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
