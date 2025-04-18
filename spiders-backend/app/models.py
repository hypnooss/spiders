from sqlalchemy import Column, Integer, String, Boolean, ForeignKey, DateTime
from sqlalchemy.orm import relationship
from database import Base
from datetime import datetime, timedelta

class User(Base):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)
    is_active = Column(Boolean, default=False)  # Conta começa inativa
    mfa_secret = Column(String, nullable=True)  # Para MFA (já existente na sua auth.py)
    activation_tokens = relationship("ActivationToken", back_populates="user")

class ActivationToken(Base):
    __tablename__ = "activation_tokens"
    id = Column(Integer, primary_key=True, index=True)
    token = Column(String, unique=True, index=True, nullable=False)  # Token JWT
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)  # Liga ao usuário
    expires_at = Column(DateTime, nullable=False)  # Data de expiração
    used = Column(Boolean, default=False)  # Se o token já foi usado
    user = relationship("User", back_populates="activation_tokens")
