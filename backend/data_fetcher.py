import yfinance as yf
import pandas as pd


def fetch_stock_data(ticker: str, period: str = "1y") -> pd.DataFrame:
    """
    Fetches historical OHLCV data for a given ticker symbol.

    Args:
        ticker: Stock symbol e.g. 'AAPL'
        period: Time period — '1mo', '3mo', '6mo', '1y', '2y', '5y'

    Returns:
        DataFrame with columns: Open, High, Low, Close, Volume
    """
    stock = yf.Ticker(ticker)
    df = stock.history(period=period)

    if df.empty:
        raise ValueError(f"No data found for ticker: {ticker}")

    # Keep only core OHLCV columns
    df = df[["Open", "High", "Low", "Close", "Volume"]]
    df.dropna(inplace=True)
    df.index = pd.to_datetime(df.index)

    return df


def fetch_multiple(tickers: list, period: str = "1y") -> dict:
    """
    Fetches data for multiple tickers at once.

    Returns:
        Dict of {ticker: DataFrame}
    """
    result = {}
    for ticker in tickers:
        try:
            result[ticker] = fetch_stock_data(ticker, period)
        except ValueError as e:
            print(f"Warning: {e}")
    return result
