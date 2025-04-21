from dotenv import load_dotenv
import os

load_dotenv()  # Carrega o .env

ACTIVATION_BASE_URL = os.getenv("ACTIVATION_BASE_URL", "http://localhost:8000")
RECAPTCHA_ENABLED = os.getenv("RECAPTCHA_ENABLED", "False") == "True"

