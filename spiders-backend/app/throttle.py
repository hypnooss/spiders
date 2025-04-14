
import asyncio
import redis.asyncio as redis

r = redis.Redis(host="redis", port=6379, decode_responses=True)

DEFAULT_TTL = 900  # 15 minutos
MAX_DELAY = 30     # segundos
TRUSTED_TTL = 86400  # 24h

async def get_delay(ip: str, email: str) -> int:
    # Se IP for confiável, nenhum delay
    if await r.exists(f"trusted:{ip}"):
        return 0

    ip_key = f"throttle:ip:{ip}"
    email_key = f"throttle:email:{email}"

    ip_count = await r.get(ip_key)
    email_count = await r.get(email_key)

    ip_count = int(ip_count) if ip_count else 0
    email_count = int(email_count) if email_count else 0

    worst = max(ip_count, email_count)
    delay = min(2 ** (worst - 1), MAX_DELAY) if worst > 0 else 0

    return delay

async def apply_delay(ip: str, email: str):
    delay = await get_delay(ip, email)
    if delay > 0:
        print(f"⏳ Delay aplicado para {ip} OU {email}: {delay}s")
        await asyncio.sleep(delay)

async def penalize(ip: str, email: str):
    await r.incr(f"throttle:ip:{ip}")
    await r.expire(f"throttle:ip:{ip}", DEFAULT_TTL)
    await r.incr(f"throttle:email:{email}")
    await r.expire(f"throttle:email:{email}", DEFAULT_TTL)

async def mark_ip_as_trusted(ip: str):
    await r.set(f"trusted:{ip}", "1", ex=TRUSTED_TTL)

