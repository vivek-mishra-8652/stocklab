import { useState, useEffect } from "react";
import axios from "axios";
import CandlestickChart from "../components/CandlestickChart";
import IndicatorPanel from "../components/IndicatorPanel";
import PredictionCard from "../components/PredictionCard";

const API = "http://localhost:8000";
const PERIODS = [
  { label: "1M", value: "1mo" },
  { label: "3M", value: "3mo" },
  { label: "6M", value: "6mo" },
  { label: "1Y", value: "1y" },
  { label: "2Y", value: "2y" },
];

export default function StockDetail({ ticker, onBack }) {
  const [period, setPeriod] = useState("6mo");
  const [stockData, setStockData] = useState([]);
  const [summary, setSummary] = useState(null);
  const [prediction, setPrediction] = useState(null);
  const [loading, setLoading] = useState(true);
  const [predLoading, setPredLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    Promise.all([
      axios.get(`${API}/api/stock/${ticker}?period=${period}`),
      axios.get(`${API}/api/summary/${ticker}`),
    ]).then(([stockRes, summaryRes]) => {
      setStockData(stockRes.data);
      setSummary(summaryRes.data);
      setLoading(false);
    });
  }, [ticker, period]);

  useEffect(() => {
    setPredLoading(true);
    setPrediction(null);
    axios.get(`${API}/api/predict/${ticker}`).then(res => {
      setPrediction(res.data);
      setPredLoading(false);
    }).catch(() => setPredLoading(false));
  }, [ticker]);

  const latest = stockData[stockData.length - 1];
  const isUp = summary?.change_pct >= 0;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>

      {/* Back + Header */}
      <div style={{ display: "flex", alignItems: "flex-start", gap: "1rem" }}>
        <button onClick={onBack} style={{
          background: "var(--bg3)", border: "1px solid var(--border)",
          borderRadius: "8px", padding: "8px 12px", cursor: "pointer",
          color: "var(--text2)", fontFamily: "inherit", fontSize: "12px",
          marginTop: "4px", transition: "all 0.2s",
        }}>← Back</button>

        <div style={{ flex: 1 }}>
          <div style={{ display: "flex", alignItems: "baseline", gap: "1rem", flexWrap: "wrap" }}>
            <h1 style={{
              fontFamily: "'Syne', sans-serif", fontSize: "36px",
              fontWeight: "800", color: "var(--text)", letterSpacing: "-1px",
            }}>{ticker}</h1>
            {summary && (
              <>
                <span style={{ fontSize: "32px", fontWeight: "300", fontVariantNumeric: "tabular-nums" }}>
                  ${summary.price}
                </span>
                <span style={{
                  fontSize: "16px", fontWeight: "600",
                  color: isUp ? "var(--green)" : "var(--red)",
                  background: isUp ? "rgba(0,230,118,0.1)" : "rgba(255,77,109,0.1)",
                  padding: "4px 10px", borderRadius: "6px",
                }}>
                  {isUp ? "▲" : "▼"} {Math.abs(summary.change_pct)}%
                </span>
              </>
            )}
          </div>
          {summary && (
            <p style={{ fontSize: "13px", color: "var(--text2)", marginTop: "4px" }}>{summary.name}</p>
          )}
        </div>
      </div>

      {/* Period selector */}
      <div style={{ display: "flex", gap: "6px" }}>
        {PERIODS.map(p => (
          <button key={p.value} onClick={() => setPeriod(p.value)} style={{
            background: period === p.value ? "var(--accent)" : "var(--bg3)",
            color: period === p.value ? "var(--bg)" : "var(--text2)",
            border: `1px solid ${period === p.value ? "var(--accent)" : "var(--border)"}`,
            borderRadius: "6px", padding: "6px 16px", cursor: "pointer",
            fontSize: "12px", fontFamily: "'Syne', sans-serif", fontWeight: "700",
            transition: "all 0.15s",
          }}>{p.label}</button>
        ))}
      </div>

      {/* Key stats */}
      {summary && (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(130px, 1fr))", gap: "10px" }}>
          <StatMini label="Current Price" value={`$${summary.price}`} />
          <StatMini label="Volume" value={summary.volume ? `${(summary.volume/1e6).toFixed(1)}M` : "—"} />
          <StatMini label="Market Cap" value={summary.market_cap ? `$${(summary.market_cap/1e12).toFixed(2)}T` : "—"} />
          <StatMini label="52W High" value={summary.fifty_two_week_high ? `$${summary.fifty_two_week_high}` : "—"} positive />
          <StatMini label="52W Low" value={summary.fifty_two_week_low ? `$${summary.fifty_two_week_low}` : "—"} negative />
          <StatMini label="P/E Ratio" value={summary.pe_ratio ? summary.pe_ratio.toFixed(1) : "—"} />
        </div>
      )}

      {/* Chart */}
      <div className="card">
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.25rem" }}>
          <h2 style={{ fontFamily: "'Syne', sans-serif", fontSize: "15px", fontWeight: "700" }}>
            Price Chart <span style={{ color: "var(--text3)", fontWeight: "400", fontSize: "13px" }}>with Bollinger Bands</span>
          </h2>
        </div>
        {loading ? (
          <div style={{ height: "300px", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--text3)", fontSize: "12px" }}>
            Loading chart...
          </div>
        ) : (
          <CandlestickChart data={stockData} showBollinger />
        )}
      </div>

      {/* Indicators + Prediction */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.5rem" }}>
        <div className="card">
          <h2 style={{ fontFamily: "'Syne', sans-serif", fontSize: "15px", fontWeight: "700", marginBottom: "1.25rem" }}>
            Technical Indicators
          </h2>
          {latest ? <IndicatorPanel data={latest} /> : <div style={{ color: "var(--text3)", fontSize: "12px" }}>Loading...</div>}
        </div>

        <div className="card">
          <h2 style={{ fontFamily: "'Syne', sans-serif", fontSize: "15px", fontWeight: "700", marginBottom: "1.25rem" }}>
            ML Prediction
            <span style={{ fontSize: "11px", color: "var(--text3)", fontWeight: "400", marginLeft: "8px" }}>RandomForest + LinearRegression</span>
          </h2>
          {predLoading ? (
            <div style={{ color: "var(--text3)", fontSize: "12px", padding: "2rem 0", textAlign: "center" }}>
              <div style={{ fontSize: "20px", marginBottom: "8px" }}>🤖</div>
              Training model on 2 years of data...
            </div>
          ) : (
            <PredictionCard data={prediction} />
          )}
        </div>
      </div>
    </div>
  );
}

function StatMini({ label, value, positive, negative }) {
  return (
    <div className="stat-card">
      <div style={{ fontSize: "10px", color: "var(--text3)", letterSpacing: "1.5px", fontFamily: "'Syne', sans-serif", fontWeight: "700", textTransform: "uppercase", marginBottom: "6px" }}>{label}</div>
      <div style={{ fontSize: "18px", fontWeight: "500", fontVariantNumeric: "tabular-nums", color: positive ? "var(--green)" : negative ? "var(--red)" : "var(--text)" }}>{value}</div>
    </div>
  );
}
