
import asyncio
import redis.asyncio as redis

r = redis.Redis(host="redis", port=6379, decode_responses=True)

DEFAULT_TTL = 900
MAX_DELAY = 30
TRUSTED_TTL = 86400

async def get_delay(ip: str, email: str) -> int:
    if await r.exists(f"trusted:{ip}"):
        return 0

    ip_count = int(await r.get(f"throttle:ip:{ip}") or 0)
    email_count = int(await r.get(f"throttle:email:{email}") or 0)
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

async def mark_ip_as_trusted(ip: str):
    await r.set(f"trusted:{ip}", "1", ex=TRUSTED_TTL)

async def is_penalized(ip: str) -> bool:
    delay = await get_delay(ip, "dummy@example.com")
    return delay >= 8

