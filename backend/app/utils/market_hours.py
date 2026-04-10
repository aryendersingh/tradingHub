from datetime import datetime
import zoneinfo

ET = zoneinfo.ZoneInfo("America/New_York")

MARKET_OPEN_HOUR = 9
MARKET_OPEN_MINUTE = 30
MARKET_CLOSE_HOUR = 16
MARKET_CLOSE_MINUTE = 0


def now_et() -> datetime:
    return datetime.now(ET)


def is_market_open() -> bool:
    now = now_et()
    if now.weekday() >= 5:  # Saturday=5, Sunday=6
        return False
    market_open = now.replace(
        hour=MARKET_OPEN_HOUR, minute=MARKET_OPEN_MINUTE, second=0, microsecond=0
    )
    market_close = now.replace(
        hour=MARKET_CLOSE_HOUR, minute=MARKET_CLOSE_MINUTE, second=0, microsecond=0
    )
    return market_open <= now <= market_close


def is_extended_hours() -> bool:
    now = now_et()
    if now.weekday() >= 5:
        return False
    hour = now.hour
    # Pre-market: 4:00 AM - 9:30 AM, After-hours: 4:00 PM - 8:00 PM
    pre_market = 4 <= hour < MARKET_OPEN_HOUR or (
        hour == MARKET_OPEN_HOUR and now.minute < MARKET_OPEN_MINUTE
    )
    after_hours = MARKET_CLOSE_HOUR <= hour < 20
    return pre_market or after_hours


def market_status() -> str:
    if is_market_open():
        return "open"
    if is_extended_hours():
        return "extended"
    return "closed"
