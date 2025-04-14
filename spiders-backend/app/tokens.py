# tokens.py
from datetime import datetime, timedelta
from jose import JWTError, jwt

SECRET_KEY = "chave_supersecreta"  # movemos depois pro config/env
ALGORITHM = "HS256"
EXPIRE_MINUTES = 30  # tempo de validade do token

def create_activation_token(email: str):
    expire = datetime.utcnow() + timedelta(minutes=EXPIRE_MINUTES)
    payload = {"sub": email, "exp": expire}
    return jwt.encode(payload, SECRET_KEY, algorithm=ALGORITHM)

def verify_activation_token(token: str):
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        return payload.get("sub")
    except JWTError:
        return None

