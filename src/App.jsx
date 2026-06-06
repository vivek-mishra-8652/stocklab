import { useState, useEffect } from "react";
import Dashboard from "./pages/Dashboard";
import StockDetail from "./pages/StockDetail";
import Screener from "./pages/Screener";

const style = `
  @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=JetBrains+Mono:wght@300;400;500&display=swap');

  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

  :root {
    --bg: #080b12;
    --bg2: #0c1018;
    --bg3: #111620;
    --border: #1a2235;
    --border2: #243044;
    --accent: #00d4ff;
    --accent2: #0099cc;
    --green: #00e676;
    --red: #ff4d6d;
    --text: #e8edf5;
    --text2: #8899aa;
    --text3: #445566;
    --gold: #ffd700;
  }

  body {
    background: var(--bg);
    color: var(--text);
    font-family: 'JetBrains Mono', monospace;
    -webkit-font-smoothing: antialiased;
  }

  ::-webkit-scrollbar { width: 4px; height: 4px; }
  ::-webkit-scrollbar-track { background: var(--bg); }
  ::-webkit-scrollbar-thumb { background: var(--border2); border-radius: 2px; }

  .nav-link {
    background: none; border: none; cursor: pointer;
    font-family: 'Syne', sans-serif;
    font-size: 13px; font-weight: 600;
    letter-spacing: 1.5px; text-transform: uppercase;
    padding: 8px 16px; border-radius: 6px;
    transition: all 0.2s;
    position: relative;
  }
  .nav-link:hover { background: rgba(0,212,255,0.08); }
  .nav-link.active { color: var(--accent); background: rgba(0,212,255,0.1); }
  .nav-link.inactive { color: var(--text3); }

  .ticker-card {
    background: var(--bg3);
    border: 1px solid var(--border);
    border-radius: 10px;
    padding: 12px 16px;
    cursor: pointer;
    min-width: 120px;
    transition: all 0.2s;
    position: relative;
    overflow: hidden;
  }
  .ticker-card::before {
    content: '';
    position: absolute;
    top: 0; left: 0; right: 0;
    height: 2px;
    background: linear-gradient(90deg, transparent, var(--accent), transparent);
    opacity: 0;
    transition: opacity 0.2s;
  }
  .ticker-card:hover { border-color: var(--border2); transform: translateY(-1px); }
  .ticker-card:hover::before { opacity: 1; }
  .ticker-card.active { border-color: var(--accent); background: rgba(0,212,255,0.06); }
  .ticker-card.active::before { opacity: 1; }

  .btn-primary {
    background: linear-gradient(135deg, var(--accent), var(--accent2));
    color: var(--bg);
    border: none; border-radius: 8px;
    padding: 10px 20px; cursor: pointer;
    font-family: 'Syne', sans-serif;
    font-size: 12px; font-weight: 700;
    letter-spacing: 1px; text-transform: uppercase;
    transition: all 0.2s;
  }
  .btn-primary:hover { opacity: 0.85; transform: translateY(-1px); }

  .btn-outline {
    background: transparent;
    color: var(--accent);
    border: 1px solid var(--accent);
    border-radius: 8px; padding: 8px 18px;
    cursor: pointer; font-family: 'Syne', sans-serif;
    font-size: 12px; font-weight: 600;
    letter-spacing: 1px; text-transform: uppercase;
    transition: all 0.2s;
  }
  .btn-outline:hover { background: rgba(0,212,255,0.1); transform: translateY(-1px); }

  .card {
    background: var(--bg3);
    border: 1px solid var(--border);
    border-radius: 12px;
    padding: 1.5rem;
  }

  .stat-card {
    background: var(--bg2);
    border: 1px solid var(--border);
    border-radius: 10px;
    padding: 1rem 1.25rem;
    transition: border-color 0.2s;
  }
  .stat-card:hover { border-color: var(--border2); }

  .glow-text { text-shadow: 0 0 20px rgba(0,212,255,0.5); }

  .pulse {
    animation: pulse 2s ease-in-out infinite;
  }
  @keyframes pulse {
    0%, 100% { opacity: 1; }
    50% { opacity: 0.5; }
  }

  .fade-in {
    animation: fadeIn 0.4s ease-out;
  }
  @keyframes fadeIn {
    from { opacity: 0; transform: translateY(8px); }
    to { opacity: 1; transform: translateY(0); }
  }

  .slide-in {
    animation: slideIn 0.3s ease-out;
  }
  @keyframes slideIn {
    from { opacity: 0; transform: translateX(-8px); }
    to { opacity: 1; transform: translateX(0); }
  }

  input:focus { outline: none; border-color: var(--accent) !important; }

  .category-btn {
    background: transparent;
    border: 1px solid var(--border);
    border-radius: 20px;
    padding: 5px 14px; cursor: pointer;
    font-family: 'JetBrains Mono', monospace;
    font-size: 11px; font-weight: 500;
    transition: all 0.15s;
    white-space: nowrap;
  }
  .category-btn:hover { border-color: var(--border2); color: var(--text); }
  .category-btn.active {
    background: var(--accent); color: var(--bg);
    border-color: var(--accent); font-weight: 700;
  }
  .category-btn.inactive { color: var(--text2); }

  table { border-collapse: collapse; width: 100%; }
  th { font-family: 'Syne', sans-serif; font-size: 10px; font-weight: 700;
       letter-spacing: 1.5px; text-transform: uppercase; color: var(--text3);
       padding: 10px 16px; text-align: left; border-bottom: 1px solid var(--border); }
  td { padding: 12px 16px; font-size: 13px; border-bottom: 1px solid var(--border); }
  tr:last-child td { border-bottom: none; }
  tr:hover td { background: rgba(255,255,255,0.02); }
`;

export default function App() {
  const [page, setPage] = useState("dashboard");
  const [selectedTicker, setSelectedTicker] = useState("AAPL");
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const t = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  const navigate = (target, ticker = null) => {
    if (ticker) setSelectedTicker(ticker);
    setPage(target);
  };

  const isMarketOpen = () => {
    const now = new Date();
    const day = now.getUTCDay();
    const hours = now.getUTCHours();
    const mins = now.getUTCMinutes();
    const totalMins = hours * 60 + mins;
    return day >= 1 && day <= 5 && totalMins >= 870 && totalMins <= 1230;
  };

  return (
    <>
      <style>{style}</style>
      <div style={{ minHeight: "100vh", background: "var(--bg)" }}>

        {/* Top ticker bar */}
        <div style={{
          background: "var(--bg2)", borderBottom: "1px solid var(--border)",
          padding: "6px 2rem", display: "flex", gap: "2rem",
          fontSize: "11px", color: "var(--text2)", overflow: "hidden",
        }}>
          <span style={{ color: "var(--text3)" }}>LIVE</span>
          {["AAPL","MSFT","GOOGL","TSLA","NVDA","AMZN","META"].map(t => (
            <span key={t} style={{ whiteSpace: "nowrap" }}>
              <span style={{ color: "var(--text3)" }}>{t} </span>
              <span style={{ color: "var(--text)" }}>—</span>
            </span>
          ))}
        </div>

        {/* Main nav */}
        <nav style={{
          display: "flex", alignItems: "center", gap: "0.5rem",
          padding: "0.75rem 2rem",
          borderBottom: "1px solid var(--border)",
          background: "var(--bg2)",
        }}>
          {/* Logo */}
          <div style={{ marginRight: "1.5rem', display: 'flex', alignItems: 'center', gap: '10px" }}>
            <div style={{
              width: "32px", height: "32px", borderRadius: "8px",
              background: "linear-gradient(135deg, var(--accent), #0055ff)",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: "16px", marginRight: "10px",
            }}>📈</div>
            <span style={{
              fontFamily: "'Syne', sans-serif", fontSize: "20px",
              fontWeight: "800", color: "var(--text)",
              letterSpacing: "2px",
            }}>
              STOCK<span style={{ color: "var(--accent)" }}>LAB</span>
            </span>
          </div>

          <div style={{ display: "flex", gap: "4px", flex: 1 }}>
            {[["dashboard","Dashboard"],["screener","Screener"]].map(([p, label]) => (
              <button key={p} onClick={() => navigate(p)}
                className={`nav-link ${page === p ? "active" : "inactive"}`}>
                {label}
              </button>
            ))}
            {page === "detail" && (
              <button onClick={() => navigate("detail")}
                className="nav-link active">
                ◆ {selectedTicker}
              </button>
            )}
          </div>

          {/* Right side */}
          <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
              <div style={{
                width: "6px", height: "6px", borderRadius: "50%",
                background: isMarketOpen() ? "var(--green)" : "var(--red)",
                boxShadow: `0 0 6px ${isMarketOpen() ? "var(--green)" : "var(--red)"}`,
              }} className={isMarketOpen() ? "pulse" : ""} />
              <span style={{ fontSize: "11px", color: "var(--text2)" }}>
                {isMarketOpen() ? "MARKET OPEN" : "MARKET CLOSED"}
              </span>
            </div>
            <span style={{ fontSize: "11px", color: "var(--text3)", fontVariantNumeric: "tabular-nums" }}>
              {time.toLocaleTimeString()}
            </span>
          </div>
        </nav>

        {/* Page content */}
        <main style={{ padding: "2rem", maxWidth: "1400px", margin: "0 auto" }}>
          <div className="fade-in" key={page}>
            {page === "dashboard" && <Dashboard onSelectTicker={(t) => navigate("detail", t)} />}
            {page === "detail" && <StockDetail ticker={selectedTicker} onBack={() => navigate("dashboard")} />}
            {page === "screener" && <Screener onSelectTicker={(t) => navigate("detail", t)} />}
          </div>
        </main>

        {/* Footer */}
        <footer style={{
          borderTop: "1px solid var(--border)", padding: "1rem 2rem",
          display: "flex", justifyContent: "space-between",
          fontSize: "11px", color: "var(--text3)",
        }}>
          <span>STOCKLAB © 2026 — Educational purposes only. Not financial advice.</span>
          <span>Powered by Yahoo Finance</span>
        </footer>
      </div>
    </>
  );
}
