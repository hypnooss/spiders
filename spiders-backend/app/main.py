from fastapi import FastAPI
from database import engine
import models
from auth import router as auth_router

app = FastAPI(title="Spiders API")

# Cria as tabelas no banco (modo simples por enquanto)
models.Base.metadata.create_all(bind=engine)
app.include_router(auth_router)

@app.get("/")
def read_root():
    return {"message": "Spiders API funcionando 🕷️"}


