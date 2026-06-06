import pandas as pd
import numpy as np


def add_indicators(df: pd.DataFrame) -> pd.DataFrame:
    """
    Adds common technical indicators to a stock DataFrame.

    Indicators added:
        - RSI (14)
        - MACD + Signal line
        - Bollinger Bands (20, 2)
        - SMA 50 / SMA 200
        - EMA 20
        - ATR (14)
        - OBV (On-Balance Volume)
    """
    df = df.copy()
    close = df["Close"]
    high = df["High"]
    low = df["Low"]
    volume = df["Volume"]

    # --- RSI ---
    delta = close.diff()
    gain = delta.clip(lower=0)
    loss = -delta.clip(upper=0)
    avg_gain = gain.ewm(com=13, adjust=False).mean()
    avg_loss = loss.ewm(com=13, adjust=False).mean()
    rs = avg_gain / avg_loss
    df["RSI"] = 100 - (100 / (1 + rs))

    # --- MACD ---
    ema12 = close.ewm(span=12, adjust=False).mean()
    ema26 = close.ewm(span=26, adjust=False).mean()
    df["MACD"] = ema12 - ema26
    df["MACD_Signal"] = df["MACD"].ewm(span=9, adjust=False).mean()
    df["MACD_Hist"] = df["MACD"] - df["MACD_Signal"]

    # --- Bollinger Bands ---
    sma20 = close.rolling(20).mean()
    std20 = close.rolling(20).std()
    df["BB_Upper"] = sma20 + (2 * std20)
    df["BB_Mid"] = sma20
    df["BB_Lower"] = sma20 - (2 * std20)

    # --- Moving Averages ---
    df["SMA_50"] = close.rolling(50).mean()
    df["SMA_200"] = close.rolling(200).mean()
    df["EMA_20"] = close.ewm(span=20, adjust=False).mean()

    # --- ATR (Average True Range) ---
    tr1 = high - low
    tr2 = (high - close.shift()).abs()
    tr3 = (low - close.shift()).abs()
    true_range = pd.concat([tr1, tr2, tr3], axis=1).max(axis=1)
    df["ATR"] = true_range.rolling(14).mean()

    # --- OBV (On-Balance Volume) ---
    obv = [0]
    for i in range(1, len(close)):
        if close.iloc[i] > close.iloc[i - 1]:
            obv.append(obv[-1] + volume.iloc[i])
        elif close.iloc[i] < close.iloc[i - 1]:
            obv.append(obv[-1] - volume.iloc[i])
        else:
            obv.append(obv[-1])
    df["OBV"] = obv

    return df


def get_signal(df: pd.DataFrame) -> str:
    """
    Returns a simple BUY / SELL / HOLD signal based on RSI + MACD.
    """
    latest = df.iloc[-1]
    rsi = latest.get("RSI", 50)
    macd = latest.get("MACD", 0)
    macd_signal = latest.get("MACD_Signal", 0)

    if rsi < 35 and macd > macd_signal:
        return "BUY"
    elif rsi > 65 and macd < macd_signal:
        return "SELL"
    else:
        return "HOLD"
