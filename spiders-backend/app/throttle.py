import asyncio
import redis.asyncio as redis
from fastapi import Request

r = redis.Redis(host="redis", port=6379, decode_responses=True)

DEFAULT_TTL = 900
MAX_DELAY = 30
TRUSTED_TTL = 86400

def get_real_ip(request: Request) -> str:
    forwarded = request.headers.get("x-forwarded-for")
    return forwarded.split(",")[0].strip() if forwarded else request.client.host

async def get_delay(ip: str, email: str) -> int:
    print(f"[DEBUG] Checking delay for IP={ip} / Email={email}")

    trust_key = f"trusted:{ip}:{email}"
    ip_key = f"throttle:ip:{ip}"
    email_key = f"throttle:email:{email}"

    trust_exists = await r.exists(trust_key)
    ip_count = int(await r.get(ip_key) or 0)
    email_count = int(await r.get(email_key) or 0)

    print(f"[DEBUG] {trust_key} -> {trust_exists}")
    print(f"[DEBUG] {ip_key} -> {ip_count}")
    print(f"[DEBUG] {email_key} -> {email_count}")

    if trust_exists:
        return 0

    delay = min(2 ** (max(ip_count, email_count) - 1), MAX_DELAY) if max(ip_count, email_count) > 0 else 0
    return delay

async def apply_delay(ip: str, email: str):
    delay = await get_delay(ip, email)
    if delay > 0:
        print(f"⏳ Delay aplicado: {delay}s para IP={ip} ou EMAIL={email}")
        await asyncio.sleep(delay)

async def penalize(ip: str, email: str):
    await r.incr(f"throttle:ip:{ip}")
    await r.expire(f"throttle:ip:{ip}", DEFAULT_TTL)
    await r.incr(f"throttle:email:{email}")
    await r.expire(f"throttle:email:{email}", DEFAULT_TTL)

async def mark_ip_as_trusted(ip: str, email: str):
    await r.set(f"trusted:{ip}:{email}", "1", ex=TRUSTED_TTL)
    print(f"[THROTTLE] IP confiável registrado: {ip} / {email}")

async def is_penalized(ip: str) -> bool:
    delay = await get_delay(ip, "dummy@example.com")
    return delay >= 8

