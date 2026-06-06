import { useState, useEffect } from "react";
import axios from "axios";
import StatCard from "../components/StatCard";
import CandlestickChart from "../components/CandlestickChart";

const API = "http://localhost:8000";

const CATEGORIES = {
  "🇺🇸 US Tech": ["AAPL","MSFT","GOOGL","TSLA","AMZN","NVDA","META","NFLX","AMD","INTC","ORCL","ADBE","CRM","UBER","SNAP"],
  "🏦 Finance": ["JPM","BAC","WFC","GS","MS","C","AXP","V","MA","BLK","SCHW","USB"],
  "💊 Healthcare": ["JNJ","PFE","UNH","MRK","ABBV","TMO","ABT","DHR","BMY","AMGN"],
  "🛍 Consumer": ["WMT","DIS","MCD","KO","PEP","NKE","SBUX","TGT","HD","LOW","COST"],
  "🇮🇳 India": ["RELIANCE.NS","TCS.NS","INFY.NS","HDFCBANK.NS","WIPRO.NS","ICICIBANK.NS","HINDUNILVR.NS","BAJFINANCE.NS","SBIN.NS","ADANIENT.NS"],
  "₿ Crypto": ["BTC-USD","ETH-USD","BNB-USD","SOL-USD","DOGE-USD","BITO","GBTC"],
};

export default function Dashboard({ onSelectTicker }) {
  const [category, setCategory] = useState("🇺🇸 US Tech");
  const [summaries, setSummaries] = useState([]);
  const [activeTicker, setActiveTicker] = useState("AAPL");
  const [stockData, setStockData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [chartLoading, setChartLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [searchResult, setSearchResult] = useState(null);
  const [searchLoading, setSearchLoading] = useState(false);

  useEffect(() => {
    setSummaries([]);
    setLoading(true);
    const tickers = CATEGORIES[category];
    Promise.all(tickers.map(t => axios.get(`${API}/api/summary/${t}`).catch(() => null)))
      .then(results => {
        setSummaries(results.filter(r => r !== null).map(r => r.data));
        setLoading(false);
      });
  }, [category]);

  useEffect(() => {
    setChartLoading(true);
    axios.get(`${API}/api/stock/${activeTicker}?period=6mo`).then(res => {
      setStockData(res.data);
      setChartLoading(false);
    });
  }, [activeTicker]);

  const handleSearch = async () => {
    if (!search.trim()) return;
    setSearchLoading(true);
    setSearchResult(null);
    try {
      const res = await axios.get(`${API}/api/summary/${search.trim().toUpperCase()}`);
      setSearchResult(res.data);
      setActiveTicker(search.trim().toUpperCase());
    } catch {
      setSearchResult({ error: "Ticker not found. Try AAPL, TSLA, RELIANCE.NS..." });
    }
    setSearchLoading(false);
  };

  const active = searchResult?.ticker ? searchResult : summaries.find(s => s.ticker === activeTicker);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>

      {/* Header row */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div>
          <h1 style={{
            fontFamily: "'Syne', sans-serif", fontSize: "28px",
            fontWeight: "800", color: "var(--text)", letterSpacing: "-0.5px",
          }}>
            Market Overview
          </h1>
          <p style={{ fontSize: "12px", color: "var(--text3)", marginTop: "4px" }}>
            Real-time data via Yahoo Finance
          </p>
        </div>

        {/* Search */}
        <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
          <div style={{ position: "relative" }}>
            <span style={{
              position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)",
              fontSize: "14px", color: "var(--text3)",
            }}>🔍</span>
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              onKeyDown={e => e.key === "Enter" && handleSearch()}
              placeholder="Search ticker... NVDA, BTC-USD"
              style={{
                background: "var(--bg3)", border: "1px solid var(--border)",
                borderRadius: "8px", padding: "10px 14px 10px 36px",
                color: "var(--text)", fontFamily: "inherit", fontSize: "12px",
                width: "260px", transition: "border-color 0.2s",
              }}
            />
          </div>
          <button className="btn-primary" onClick={handleSearch}>
            {searchLoading ? "..." : "Search"}
          </button>
        </div>
      </div>

      {/* Search result banner */}
      {searchResult && !searchResult.error && (
        <div className="slide-in" style={{
          background: "linear-gradient(135deg, rgba(0,212,255,0.08), rgba(0,212,255,0.03))",
          border: "1px solid rgba(0,212,255,0.3)",
          borderRadius: "12px", padding: "1.25rem 1.5rem",
          display: "flex", alignItems: "center", gap: "2rem",
        }}>
          <div>
            <div style={{ fontSize: "10px", color: "var(--accent)", letterSpacing: "2px", fontFamily: "'Syne', sans-serif", fontWeight: "700" }}>SEARCH RESULT</div>
            <div style={{ fontSize: "22px", fontWeight: "800", fontFamily: "'Syne', sans-serif", color: "var(--text)", marginTop: "2px" }}>{searchResult.ticker}</div>
            <div style={{ fontSize: "12px", color: "var(--text2)" }}>{searchResult.name}</div>
          </div>
          <div style={{ borderLeft: "1px solid var(--border)", paddingLeft: "2rem" }}>
            <div style={{ fontSize: "28px", fontWeight: "300", fontVariantNumeric: "tabular-nums" }}>${searchResult.price}</div>
            <div style={{ fontSize: "13px", color: searchResult.change_pct >= 0 ? "var(--green)" : "var(--red)", marginTop: "2px" }}>
              {searchResult.change_pct >= 0 ? "▲" : "▼"} {Math.abs(searchResult.change_pct)}%
            </div>
          </div>
          <div style={{ fontSize: "12px", color: "var(--text2)" }}>
            <div>Vol: {searchResult.volume?.toLocaleString()}</div>
            <div style={{ marginTop: "4px" }}>P/E: {searchResult.pe_ratio?.toFixed(1) || "—"}</div>
          </div>
          <button className="btn-outline" onClick={() => onSelectTicker(searchResult.ticker)} style={{ marginLeft: "auto" }}>
            Full Analysis →
          </button>
        </div>
      )}
      {searchResult?.error && (
        <div style={{ color: "var(--red)", fontSize: "12px", padding: "8px 12px", background: "rgba(255,77,109,0.1)", borderRadius: "6px", border: "1px solid rgba(255,77,109,0.2)" }}>
          ⚠ {searchResult.error}
        </div>
      )}

      {/* Category pills */}
      <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
        {Object.keys(CATEGORIES).map(cat => (
          <button key={cat} onClick={() => { setCategory(cat); setSearchResult(null); }}
            className={`category-btn ${category === cat ? "active" : "inactive"}`}>
            {cat}
          </button>
        ))}
      </div>

      {/* Stock cards grid */}
      <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
        {loading ? (
          Array(8).fill(0).map((_, i) => (
            <div key={i} style={{
              background: "var(--bg3)", border: "1px solid var(--border)",
              borderRadius: "10px", padding: "12px 16px", minWidth: "120px",
              opacity: 0.4,
            }}>
              <div style={{ height: "10px", background: "var(--border2)", borderRadius: "4px", marginBottom: "8px", width: "60%" }} />
              <div style={{ height: "18px", background: "var(--border2)", borderRadius: "4px", marginBottom: "6px" }} />
              <div style={{ height: "10px", background: "var(--border2)", borderRadius: "4px", width: "40%" }} />
            </div>
          ))
        ) : (
          summaries.map((s, i) => (
            <button key={s.ticker}
              onClick={() => { setActiveTicker(s.ticker); setSearchResult(null); }}
              className={`ticker-card ${activeTicker === s.ticker && !searchResult ? "active" : ""}`}
              style={{ animationDelay: `${i * 30}ms` }}>
              <div style={{
                fontSize: "11px", fontWeight: "700", letterSpacing: "0.5px",
                fontFamily: "'Syne', sans-serif",
                color: activeTicker === s.ticker && !searchResult ? "var(--accent)" : "var(--text2)",
                marginBottom: "6px",
              }}>
                {s.ticker.replace(".NS","").replace("-USD","")}
              </div>
              <div style={{ fontSize: "16px", fontWeight: "500", fontVariantNumeric: "tabular-nums", marginBottom: "4px" }}>
                ${s.price}
              </div>
              <div style={{
                fontSize: "11px", fontWeight: "600",
                color: s.change_pct >= 0 ? "var(--green)" : "var(--red)",
              }}>
                {s.change_pct >= 0 ? "▲" : "▼"} {Math.abs(s.change_pct)}%
              </div>
            </button>
          ))
        )}
      </div>

      {/* Stats + Chart row */}
      {active && (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(130px, 1fr))", gap: "10px" }}>
          <StatCard label="Price" value={`$${active.price}`} />
          <StatCard label="Change" value={`${active.change_pct > 0 ? "+" : ""}${active.change_pct}%`} positive={active.change_pct >= 0} />
          <StatCard label="Volume" value={active.volume ? (active.volume > 1e9 ? `${(active.volume/1e9).toFixed(1)}B` : `${(active.volume/1e6).toFixed(1)}M`) : "—"} />
          <StatCard label="Mkt Cap" value={active.market_cap ? `$${(active.market_cap/1e12).toFixed(2)}T` : "—"} />
          <StatCard label="52W High" value={active.fifty_two_week_high ? `$${active.fifty_two_week_high}` : "—"} />
          <StatCard label="52W Low" value={active.fifty_two_week_low ? `$${active.fifty_two_week_low}` : "—"} />
          <StatCard label="P/E Ratio" value={active.pe_ratio ? active.pe_ratio.toFixed(1) : "—"} />
        </div>
      )}

      {/* Chart */}
      <div className="card" style={{ padding: "1.5rem" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.25rem" }}>
          <div>
            <h2 style={{ fontFamily: "'Syne', sans-serif", fontSize: "16px", fontWeight: "700", color: "var(--text)" }}>
              {activeTicker} <span style={{ color: "var(--text3)", fontWeight: "400" }}>/ Price Chart</span>
            </h2>
            <p style={{ fontSize: "11px", color: "var(--text3)", marginTop: "3px" }}>6 month closing price</p>
          </div>
          <button className="btn-outline" onClick={() => onSelectTicker(activeTicker)}>
            Full Analysis →
          </button>
        </div>
        {chartLoading ? (
          <div style={{ height: "300px", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <div style={{ textAlign: "center" }}>
              <div style={{ fontSize: "24px", marginBottom: "8px" }}>⟳</div>
              <div style={{ fontSize: "12px", color: "var(--text3)" }}>Loading chart data...</div>
            </div>
          </div>
        ) : (
          <CandlestickChart data={stockData} />
        )}
      </div>
    </div>
  );
}
