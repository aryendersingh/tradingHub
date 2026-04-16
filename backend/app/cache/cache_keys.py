# Cache TTLs in seconds
MARKET_OVERVIEW_TTL = 30
MARKET_SECTORS_TTL = 60
MARKET_MOVERS_TTL = 60
MARKET_BREADTH_TTL = 60
STOCK_QUOTE_TTL = 15
STOCK_PROFILE_TTL = 86400  # 24h
STOCK_HISTORY_INTRADAY_TTL = 300  # 5min
STOCK_HISTORY_DAILY_TTL = 3600  # 1h
STOCK_FUNDAMENTALS_TTL = 21600  # 6h
STOCK_RATIOS_TTL = 3600  # 1h
STOCK_DIVIDENDS_TTL = 21600  # 6h
STOCK_HOLDERS_TTL = 86400  # 24h
STOCK_INSIDERS_TTL = 21600  # 6h
OPTIONS_CHAIN_TTL = 120  # 2min
OPTIONS_EXPIRATIONS_TTL = 3600  # 1h
INDICATORS_TTL = 300  # 5min
NEWS_MARKET_TTL = 300  # 5min
NEWS_STOCK_TTL = 300  # 5min
NEWS_FILINGS_TTL = 3600  # 1h
ANALYST_RATINGS_TTL = 21600  # 6h
ANALYST_TARGETS_TTL = 21600  # 6h
EARNINGS_TTL = 21600  # 6h
ECONOMIC_YIELDS_TTL = 3600  # 1h
ECONOMIC_CALENDAR_TTL = 21600  # 6h
ECONOMIC_SERIES_TTL = 3600  # 1h
ECONOMIC_FOREX_TTL = 300  # 5min
ECONOMIC_COMMODITIES_TTL = 300  # 5min
EARNINGS_CALENDAR_TTL = 3600  # 1h
PUTCALL_RATIO_TTL = 300  # 5min
SHORT_INTEREST_TTL = 3600  # 1h
GLOBAL_INDICES_TTL = 60  # 1min
FEAR_GREED_TTL = 300  # 5min
IPO_CALENDAR_TTL = 21600  # 6h
PEER_COMPARISON_TTL = 3600  # 1h
STOCK_COMPARISON_TTL = 3600  # 1h


def market_overview_key() -> str:
    return "market:overview"


def market_sectors_key() -> str:
    return "market:sectors"


def market_movers_key(category: str) -> str:
    return f"market:movers:{category}"


def market_breadth_key() -> str:
    return "market:breadth"


def stock_quote_key(symbol: str) -> str:
    return f"stock:{symbol}:quote"


def stock_profile_key(symbol: str) -> str:
    return f"stock:{symbol}:profile"


def stock_history_key(symbol: str, period: str, interval: str) -> str:
    return f"stock:{symbol}:history:{period}:{interval}"


def stock_fundamentals_key(symbol: str) -> str:
    return f"stock:{symbol}:fundamentals"


def stock_ratios_key(symbol: str) -> str:
    return f"stock:{symbol}:ratios"


def stock_dividends_key(symbol: str) -> str:
    return f"stock:{symbol}:dividends"


def stock_holders_key(symbol: str, holder_type: str) -> str:
    return f"stock:{symbol}:holders:{holder_type}"


def stock_insiders_key(symbol: str) -> str:
    return f"stock:{symbol}:insiders"


def options_expirations_key(symbol: str) -> str:
    return f"stock:{symbol}:options:expirations"


def options_chain_key(symbol: str, expiry: str) -> str:
    return f"stock:{symbol}:options:chain:{expiry}"


def indicators_key(symbol: str, indicator: str, period: str, interval: str) -> str:
    return f"stock:{symbol}:indicators:{indicator}:{period}:{interval}"


def news_market_key() -> str:
    return "news:market"


def news_stock_key(symbol: str) -> str:
    return f"news:{symbol}"


def filings_key(symbol: str) -> str:
    return f"filings:{symbol}"


def analyst_ratings_key(symbol: str) -> str:
    return f"stock:{symbol}:ratings"


def analyst_targets_key(symbol: str) -> str:
    return f"stock:{symbol}:targets"


def earnings_key(symbol: str) -> str:
    return f"stock:{symbol}:earnings"


def economic_yields_key() -> str:
    return "economic:yields"


def economic_calendar_key() -> str:
    return "economic:calendar"


def economic_series_key(series_id: str) -> str:
    return f"economic:series:{series_id}"


def economic_forex_key() -> str:
    return "economic:forex"


def economic_commodities_key() -> str:
    return "economic:commodities"


def earnings_calendar_key(from_date: str, to_date: str) -> str:
    return f"earnings:calendar:{from_date}:{to_date}"


def putcall_ratio_key() -> str:
    return "market:putcall"


def short_interest_key(symbol: str) -> str:
    return f"stock:{symbol}:short_interest"


def global_indices_key() -> str:
    return "market:global_indices"


def fear_greed_key() -> str:
    return "market:fear_greed"


def ipo_calendar_key(from_date: str, to_date: str) -> str:
    return f"market:ipo:{from_date}:{to_date}"


def peer_comparison_key(symbol: str) -> str:
    return f"stock:{symbol}:peers"


def stock_comparison_key(symbols_hash: str, period: str) -> str:
    return f"compare:{symbols_hash}:{period}"
