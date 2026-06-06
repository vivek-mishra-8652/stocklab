import numpy as np
import pandas as pd
from sklearn.preprocessing import MinMaxScaler
from sklearn.ensemble import RandomForestClassifier
from sklearn.linear_model import LinearRegression
from indicators import add_indicators


class StockPredictor:
    """
    Combines a Random Forest classifier (direction) and Linear Regression
    (next-day price estimate) for stock prediction.
    """

    def __init__(self):
        self.scaler = MinMaxScaler()
        self.direction_model = RandomForestClassifier(n_estimators=100, random_state=42)
        self.price_model = LinearRegression()

    def _prepare_features(self, df: pd.DataFrame) -> pd.DataFrame:
        df = add_indicators(df)
        features = [
            "Close", "Volume", "RSI", "MACD", "MACD_Signal",
            "BB_Upper", "BB_Lower", "SMA_50", "EMA_20", "ATR",
        ]
        df = df[features].dropna()
        return df

    def train(self, df: pd.DataFrame):
        data = self._prepare_features(df)

        X = data.iloc[:-1].values
        y_direction = (data["Close"].shift(-1).dropna() > data["Close"].iloc[:-1]).astype(int).values
        y_price = data["Close"].shift(-1).dropna().values

        X_scaled = self.scaler.fit_transform(X)

        self.direction_model.fit(X_scaled, y_direction)
        self.price_model.fit(X_scaled, y_price)

    def predict(self, df: pd.DataFrame, ticker: str) -> dict:
        self.train(df)
        data = self._prepare_features(df)
        latest = data.iloc[-1].values.reshape(1, -1)
        latest_scaled = self.scaler.transform(latest)

        direction_prob = self.direction_model.predict_proba(latest_scaled)[0]
        direction = "UP" if direction_prob[1] > 0.5 else "DOWN"
        confidence = round(float(max(direction_prob)) * 100, 1)

        predicted_price = float(self.price_model.predict(latest_scaled)[0])
        current_price = float(data["Close"].iloc[-1])
        change_pct = round(((predicted_price - current_price) / current_price) * 100, 2)

        # Feature importance
        feature_names = [
            "Close", "Volume", "RSI", "MACD", "MACD_Signal",
            "BB_Upper", "BB_Lower", "SMA_50", "EMA_20", "ATR",
        ]
        importances = self.direction_model.feature_importances_
        top_features = sorted(
            zip(feature_names, importances), key=lambda x: x[1], reverse=True
        )[:3]

        return {
            "ticker": ticker,
            "current_price": round(current_price, 2),
            "predicted_price": round(predicted_price, 2),
            "direction": direction,
            "confidence": confidence,
            "change_pct": change_pct,
            "top_features": [{"name": f, "importance": round(i, 4)} for f, i in top_features],
            "disclaimer": "This is for educational purposes only, not financial advice.",
        }
