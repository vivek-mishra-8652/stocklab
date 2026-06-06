from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from data_fetcher import fetch_stock_data
from indicators import add_indicators
from model import StockPredictor
import pandas as pd

app = FastAPI(title="Stock Market Analysis API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

predictor = StockPredictor()


@app.get("/")
def root():
    return {"message": "Stock Market Analysis API is running"}


@app.get("/api/stock/{ticker}")
def get_stock(ticker: str, period: str = "1y"):
    """
    Returns OHLCV data + technical indicators for a given ticker.
    period options: 1mo, 3mo, 6mo, 1y, 2y
    """
    try:
        df = fetch_stock_data(ticker.upper(), period)
        df = add_indicators(df)
        df = df.reset_index()
        df["Date"] = df["Date"].astype(str)
        df = df.fillna(0)
        return df.to_dict(orient="records")
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@app.get("/api/predict/{ticker}")
def predict_stock(ticker: str):
    """
    Returns next-day price prediction and direction for a ticker.
    """
    try:
        df = fetch_stock_data(ticker.upper(), period="2y")
        result = predictor.predict(df, ticker.upper())
        return result
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@app.get("/api/summary/{ticker}")
def get_summary(ticker: str):
    """
    Returns key stats: current price, % change, volume, market cap.
    """
    try:
        import yfinance as yf
        stock = yf.Ticker(ticker.upper())
        info = stock.info
        hist = stock.history(period="2d")
        
        prev_close = hist["Close"].iloc[-2] if len(hist) >= 2 else hist["Close"].iloc[-1]
        curr_close = hist["Close"].iloc[-1]
        change_pct = ((curr_close - prev_close) / prev_close) * 100

        return {
            "ticker": ticker.upper(),
            "name": info.get("longName", ticker),
            "price": round(curr_close, 2),
            "change_pct": round(change_pct, 2),
            "volume": info.get("volume", 0),
            "market_cap": info.get("marketCap", 0),
            "pe_ratio": info.get("trailingPE", None),
            "fifty_two_week_high": info.get("fiftyTwoWeekHigh", None),
            "fifty_two_week_low": info.get("fiftyTwoWeekLow", None),
        }
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@app.get("/api/screener")
def screen_stocks(
    tickers: str = "AAPL,MSFT,GOOGL,AMZN,TSLA",
    rsi_min: float = 0,
    rsi_max: float = 100,
):
    """
    Filter a list of tickers by RSI range.
    tickers: comma-separated string of symbols
    """
    ticker_list = [t.strip().upper() for t in tickers.split(",")]
    results = []

    for ticker in ticker_list:
        try:
            df = fetch_stock_data(ticker, period="3mo")
            df = add_indicators(df)
            latest = df.iloc[-1]
            results.append({
                "ticker": ticker,
                "price": round(latest["Close"], 2),
                "rsi": round(latest["RSI"], 2) if latest["RSI"] else None,
                "macd": round(latest["MACD"], 4) if latest["MACD"] else None,
                "sma_50": round(latest["SMA_50"], 2) if latest["SMA_50"] else None,
            })
        except Exception:
            continue

    filtered = [r for r in results if r["rsi"] and rsi_min <= r["rsi"] <= rsi_max]
    return filtered
