import math
import pandas as pd


def safe_float(val, default=None):
    if val is None or (isinstance(val, float) and math.isnan(val)):
        return default
    try:
        return float(val)
    except (TypeError, ValueError):
        return default


def safe_int(val, default=None):
    if val is None:
        return default
    try:
        return int(val)
    except (TypeError, ValueError):
        return default


def df_to_records(df: pd.DataFrame) -> list[dict]:
    if df is None or df.empty:
        return []
    df = df.copy()
    # Convert datetime index to string
    if isinstance(df.index, pd.DatetimeIndex):
        df.index = df.index.strftime("%Y-%m-%d")
    df = df.where(pd.notnull(df), None)
    records = df.reset_index().to_dict(orient="records")
    return records
