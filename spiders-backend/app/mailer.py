import os
import smtplib
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText
from dotenv import load_dotenv

load_dotenv()

SMTP_SERVER = os.getenv("SMTP_SERVER")
SMTP_PORT = int(os.getenv("SMTP_PORT", 587))
SMTP_USERNAME = os.getenv("SMTP_USER")
SMTP_PASSWORD = os.getenv("SMTP_PASSWORD")
SENDER_NAME = os.getenv("SENDER_NAME", "Spiders")
ACTIVATION_BASE_URL = os.getenv("ACTIVATION_BASE_URL", "http://localhost:8000/confirm")


def build_activation_email_html(email: str, activation_link: str) -> str:
    return f"""
    <html>
      <body style="font-family: Arial, sans-serif; background-color: #0e0e10; color: #e5e5e5; padding: 40px;">
        <div style="max-width: 600px; margin: auto; background-color: #161616; border-radius: 12px; padding: 30px; border: 1px solid #2a2a2a;">
          <div style="text-align: center;">
            <h2 style="color: #e5e5e5; margin-bottom: 20px;">🕷️ Ative sua conta no Spiders</h2>
          </div>
          <p style="font-size: 15px; color: #e5e5e5;">Olá, <strong>{email}</strong></p>
          <p style="font-size: 15px; color: #e5e5e5;">
            Seu cadastro foi realizado com sucesso!<br />
            Para ativar sua conta, clique no botão abaixo:
          </p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="{activation_link}" style="
              background-color: rgba(124, 58, 237, 1);
              color: white;
              padding: 14px 28px;
              text-decoration: none;
              border-radius: 8px;
              display: inline-block;
              font-weight: bold;
              font-size: 15px;
            ">Ativar Conta</a>
          </div>
          <p style="font-size: 14px; color: #e5e5e5;">
            Se você não realizou esse cadastro, apenas ignore este e-mail.
          </p>
          <hr style="border: none; border-top: 1px solid #333; margin: 30px 0;" />
          <p style="text-align: center; font-size: 13px; color: rgb(107, 114, 128);">
            🕷️ Spiders is watching the surface...
          </p>
        </div>
      </body>
    </html>
    """


def send_activation_email(to_email: str, activation_link: str):
    print("📧 Enviando e-mail de ativação...")
    print(f"📡 Conectando a {SMTP_SERVER}:{SMTP_PORT} como {SMTP_USERNAME}")

    message = MIMEMultipart("alternative")
    message["Subject"] = "🕷️ Ative sua conta no Spiders"
    message["From"] = f"{SENDER_NAME} <{SMTP_USERNAME}>"
    message["To"] = to_email

    html_content = build_activation_email_html(to_email, activation_link)
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

    print("📧 Processo de envio finalizado.")


