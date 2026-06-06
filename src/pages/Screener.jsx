import { useState } from "react";
import axios from "axios";

const API = "http://localhost:8000";
const DEFAULT_TICKERS = "AAPL,MSFT,GOOGL,AMZN,TSLA,META,NVDA,JPM,BAC,V,NFLX,AMD,INTC,UBER,DIS";

export default function Screener({ onSelectTicker }) {
  const [tickers, setTickers] = useState(DEFAULT_TICKERS);
  const [rsiMin, setRsiMin] = useState(0);
  const [rsiMax, setRsiMax] = useState(100);
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [sorted, setSorted] = useState({ key: "rsi", dir: 1 });

  const run = async () => {
    setLoading(true);
    const res = await axios.get(`${API}/api/screener`, {
      params: { tickers, rsi_min: rsiMin, rsi_max: rsiMax },
    });
    setResults(res.data);
    setLoading(false);
  };

  const sortedResults = [...results].sort((a, b) => {
    const av = a[sorted.key] ?? 0;
    const bv = b[sorted.key] ?? 0;
    return (av - bv) * sorted.dir;
  });

  const toggleSort = (key) => {
    setSorted(prev => prev.key === key ? { key, dir: -prev.dir } : { key, dir: -1 });
  };

  const rsiColor = (rsi) => {
    if (!rsi) return "var(--text3)";
    if (rsi < 30) return "var(--green)";
    if (rsi > 70) return "var(--red)";
    return "var(--gold)";
  };

  const rsiLabel = (rsi) => {
    if (!rsi) return "—";
    if (rsi < 30) return "OVERSOLD";
    if (rsi > 70) return "OVERBOUGHT";
    return "NEUTRAL";
  };

  const SortIcon = ({ col }) => {
    if (sorted.key !== col) return <span style={{ color: "var(--text3)" }}>⇅</span>;
    return <span style={{ color: "var(--accent)" }}>{sorted.dir === -1 ? "↓" : "↑"}</span>;
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>

      {/* Header */}
      <div>
        <h1 style={{ fontFamily: "'Syne', sans-serif", fontSize: "28px", fontWeight: "800", letterSpacing: "-0.5px" }}>
          Stock Screener
        </h1>
        <p style={{ fontSize: "12px", color: "var(--text3)", marginTop: "4px" }}>
          Filter stocks by technical indicators to find opportunities
        </p>
      </div>

      {/* RSI guide */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "10px" }}>
        {[
          { label: "Oversold Zone", range: "RSI 0–30", desc: "Potential buy signal", color: "var(--green)" },
          { label: "Neutral Zone", range: "RSI 30–70", desc: "No clear signal", color: "var(--gold)" },
          { label: "Overbought Zone", range: "RSI 70–100", desc: "Potential sell signal", color: "var(--red)" },
        ].map(z => (
          <div key={z.label} style={{
            background: "var(--bg3)", border: `1px solid var(--border)`,
            borderRadius: "10px", padding: "1rem",
            borderLeft: `3px solid ${z.color}`,
          }}>
            <div style={{ fontSize: "10px", color: z.color, fontFamily: "'Syne', sans-serif", fontWeight: "700", letterSpacing: "1px", marginBottom: "4px" }}>
              {z.label}
            </div>
            <div style={{ fontSize: "14px", fontWeight: "500", marginBottom: "2px" }}>{z.range}</div>
            <div style={{ fontSize: "11px", color: "var(--text3)" }}>{z.desc}</div>
          </div>
        ))}
      </div>

      {/* Controls */}
      <div className="card" style={{ display: "grid", gridTemplateColumns: "1fr auto auto auto", gap: "1rem", alignItems: "end" }}>
        <div>
          <label style={{ display: "block", fontSize: "10px", color: "var(--text3)", marginBottom: "8px", letterSpacing: "1.5px", fontFamily: "'Syne', sans-serif", fontWeight: "700" }}>
            TICKERS (comma-separated)
          </label>
          <input value={tickers} onChange={e => setTickers(e.target.value)}
            style={{
              width: "100%", background: "var(--bg2)", border: "1px solid var(--border)",
              borderRadius: "8px", padding: "10px 14px", color: "var(--text)",
              fontFamily: "inherit", fontSize: "12px",
            }} />
        </div>
        <div>
          <label style={{ display: "block", fontSize: "10px", color: "var(--text3)", marginBottom: "8px", letterSpacing: "1.5px", fontFamily: "'Syne', sans-serif", fontWeight: "700" }}>RSI MIN</label>
          <input type="number" value={rsiMin} onChange={e => setRsiMin(+e.target.value)} min="0" max="100"
            style={{ width: "90px", background: "var(--bg2)", border: "1px solid var(--border)", borderRadius: "8px", padding: "10px 14px", color: "var(--text)", fontFamily: "inherit", fontSize: "12px" }} />
        </div>
        <div>
          <label style={{ display: "block", fontSize: "10px", color: "var(--text3)", marginBottom: "8px", letterSpacing: "1.5px", fontFamily: "'Syne', sans-serif", fontWeight: "700" }}>RSI MAX</label>
          <input type="number" value={rsiMax} onChange={e => setRsiMax(+e.target.value)} min="0" max="100"
            style={{ width: "90px", background: "var(--bg2)", border: "1px solid var(--border)", borderRadius: "8px", padding: "10px 14px", color: "var(--text)", fontFamily: "inherit", fontSize: "12px" }} />
        </div>
        <button className="btn-primary" onClick={run} disabled={loading}
          style={{ opacity: loading ? 0.7 : 1, padding: "10px 24px" }}>
          {loading ? "Scanning..." : "▶ Run Screen"}
        </button>
      </div>

      {/* Results table */}
      {results.length > 0 && (
        <div className="card" style={{ padding: 0, overflow: "hidden" }}>
          <div style={{ padding: "1.25rem 1.5rem", borderBottom: "1px solid var(--border)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <h2 style={{ fontFamily: "'Syne', sans-serif", fontSize: "15px", fontWeight: "700" }}>
              Results <span style={{ color: "var(--accent)", marginLeft: "6px" }}>{results.length}</span>
            </h2>
            <span style={{ fontSize: "11px", color: "var(--text3)" }}>Click column headers to sort</span>
          </div>
          <div style={{ overflowX: "auto" }}>
            <table>
              <thead>
                <tr>
                  {[["ticker","Ticker"],["price","Price"],["rsi","RSI"],["macd","MACD"],["sma_50","SMA 50"]].map(([key, label]) => (
                    <th key={key} onClick={() => toggleSort(key)}
                      style={{ cursor: "pointer", userSelect: "none" }}>
                      {label} <SortIcon col={key} />
                    </th>
                  ))}
                  <th>Signal</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {sortedResults.map((r, i) => (
                  <tr key={r.ticker} className="fade-in" style={{ animationDelay: `${i * 30}ms` }}>
                    <td>
                      <span style={{ fontFamily: "'Syne', sans-serif", fontWeight: "700", color: "var(--accent)", fontSize: "14px" }}>
                        {r.ticker}
                      </span>
                    </td>
                    <td style={{ fontVariantNumeric: "tabular-nums" }}>${r.price}</td>
                    <td>
                      <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                        <span style={{
                          color: rsiColor(r.rsi),
                          background: rsiColor(r.rsi) + "22",
                          padding: "2px 8px", borderRadius: "4px",
                          fontSize: "12px", fontWeight: "600",
                          fontVariantNumeric: "tabular-nums",
                        }}>{r.rsi?.toFixed(1)}</span>
                        <span style={{ fontSize: "10px", color: rsiColor(r.rsi), letterSpacing: "0.5px" }}>
                          {rsiLabel(r.rsi)}
                        </span>
                      </div>
                    </td>
                    <td style={{ color: r.macd >= 0 ? "var(--green)" : "var(--red)", fontVariantNumeric: "tabular-nums" }}>
                      {r.macd >= 0 ? "▲" : "▼"} {Math.abs(r.macd)?.toFixed(4)}
                    </td>
                    <td style={{ color: "var(--text2)", fontVariantNumeric: "tabular-nums" }}>${r.sma_50?.toFixed(2)}</td>
                    <td>
                      <span style={{
                        fontSize: "10px", fontWeight: "700", letterSpacing: "1px",
                        fontFamily: "'Syne', sans-serif",
                        color: r.rsi < 30 ? "var(--green)" : r.rsi > 70 ? "var(--red)" : "var(--gold)",
                        background: r.rsi < 30 ? "rgba(0,230,118,0.1)" : r.rsi > 70 ? "rgba(255,77,109,0.1)" : "rgba(255,215,0,0.1)",
                        padding: "3px 8px", borderRadius: "4px",
                      }}>
                        {r.rsi < 30 ? "BUY?" : r.rsi > 70 ? "SELL?" : "HOLD"}
                      </span>
                    </td>
                    <td>
                      <button className="btn-outline" onClick={() => onSelectTicker(r.ticker)}
                        style={{ padding: "5px 12px", fontSize: "11px" }}>
                        Analyze →
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {results.length === 0 && !loading && (
        <div style={{ textAlign: "center", padding: "4rem", color: "var(--text3)" }}>
          <div style={{ fontSize: "40px", marginBottom: "1rem" }}>🔍</div>
          <div style={{ fontFamily: "'Syne', sans-serif", fontSize: "16px", marginBottom: "6px" }}>No results yet</div>
          <div style={{ fontSize: "12px" }}>Set your filters above and click Run Screen</div>
        </div>
      )}
    </div>
  );
}
