import finnhub

from app.config import settings

_client: finnhub.Client | None = None


def get_finnhub() -> finnhub.Client:
    global _client
    if _client is None:
        _client = finnhub.Client(api_key=settings.finnhub_api_key)
    return _client


def stock_quote(symbol: str) -> dict:
    return get_finnhub().quote(symbol)


def company_profile(symbol: str) -> dict:
    return get_finnhub().company_profile2(symbol=symbol)


def company_news(symbol: str, from_date: str, to_date: str) -> list[dict]:
    return get_finnhub().company_news(symbol, _from=from_date, to=to_date)


def general_news(category: str = "general") -> list[dict]:
    return get_finnhub().general_news(category)


def recommendation_trends(symbol: str) -> list[dict]:
    return get_finnhub().recommendation_trends(symbol)


def price_target(symbol: str) -> dict:
    return get_finnhub().price_target(symbol)


def earnings_calendar(from_date: str = None, to_date: str = None, symbol: str = None) -> dict:
    kwargs = {}
    if from_date:
        kwargs["_from"] = from_date
    if to_date:
        kwargs["to"] = to_date
    if symbol:
        kwargs["symbol"] = symbol
    return get_finnhub().earnings_calendar(**kwargs)


def company_basic_financials(symbol: str) -> dict:
    return get_finnhub().company_basic_financials(symbol, "all")


def stock_insider_transactions(symbol: str) -> dict:
    return get_finnhub().stock_insider_transactions(symbol)


def economic_calendar() -> dict:
    return get_finnhub().economic_calendar()


def ipo_calendar(from_date: str, to_date: str) -> dict:
    return get_finnhub().ipo_calendar(_from=from_date, to=to_date)
