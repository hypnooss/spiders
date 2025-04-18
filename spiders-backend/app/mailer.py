import os
import smtplib
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText
from dotenv import load_dotenv
from pathlib import Path

load_dotenv()

SMTP_SERVER = os.getenv("SMTP_SERVER")
SMTP_PORT = int(os.getenv("SMTP_PORT", 587))
SMTP_USERNAME = os.getenv("SMTP_USER")
SMTP_PASSWORD = os.getenv("SMTP_PASSWORD")
SENDER_NAME = os.getenv("SENDER_NAME", "Spiders")
ACTIVATION_BASE_URL = os.getenv("ACTIVATION_BASE_URL", "http://localhost:8000")
ACTIVATION_PATH = "/api/activate"

def build_activation_email_html(email: str, activation_link: str) -> str:
    html_path = Path(__file__).parent.parent / "html" / "mail-register.html"

    try:
        with open(html_path, "r", encoding="utf-8") as file:
            html_content = file.read()
    except FileNotFoundError:
        raise Exception(f"Arquivo {html_path} não encontrado")

    html_content = html_content.replace('href="#"', f'href="{activation_link}"')
    html_content = html_content.replace("{{email}}", email)

    return html_content

def send_activation_email(to_email: str, token: str):
    activation_link = f"{ACTIVATION_BASE_URL}{ACTIVATION_PATH}?token={token}"

    print("📧 Enviando e-mail de ativação...")
    print(f"📡 Conectando a {SMTP_SERVER}:{SMTP_PORT} como {SMTP_USERNAME}")
    print(f"🔗 Link de ativação: {activation_link}")

    message = MIMEMultipart("alternative")
    message["Subject"] = "Ative sua conta"
    message["From"] = f"{SENDER_NAME} <{SMTP_USERNAME}>"
    message["To"] = to_email

    plain_text = f"""Olá, {to_email},

Seu cadastro foi realizado com sucesso!
Para ativar sua conta, clique no link abaixo:
{activation_link}

O token de ativação expira em 24h ou após ser utilizado.
Se você não realizou esse cadastro, apenas ignore este e-mail.
"""

    html_content = build_activation_email_html(to_email, activation_link)

    message.attach(MIMEText(plain_text, "plain"))
    message.attach(MIMEText(html_content, "html"))

    try:
        with smtplib.SMTP(SMTP_SERVER, SMTP_PORT) as server:
            server.ehlo()
            server.starttls()
            print("🔐 TLS iniciado")
            server.login(SMTP_USERNAME, SMTP_PASSWORD)
            print("✅ Login SMTP bem-sucedido")
            server.sendmail(SMTP_USERNAME, to_email, message.as_string())
            print("✅ E-mail enviado com sucesso")
    except Exception as e:
        print("❌ Erro ao enviar e-mail:", e)
        raise Exception(f"Erro ao enviar e-mail: {str(e)}")

    print("📧 Processo de envio finalizado.")

