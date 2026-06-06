export default function IndicatorPanel({ data }) {
  const rsi = data?.RSI;
  const macd = data?.MACD;
  const macdSignal = data?.MACD_Signal;
  const bbUpper = data?.BB_Upper;
  const bbLower = data?.BB_Lower;
  const sma50 = data?.SMA_50;
  const sma200 = data?.SMA_200;
  const close = data?.Close;

  const rsiColor = rsi < 30 ? "var(--green)" : rsi > 70 ? "var(--red)" : "var(--gold)";
  const rsiLabel = rsi < 30 ? "OVERSOLD" : rsi > 70 ? "OVERBOUGHT" : "NEUTRAL";
  const macdBullish = macd > macdSignal;
  const aboveSma50 = close > sma50;
  const aboveSma200 = close > sma200;

  const Row = ({ label, value, color, sub }) => (
    <div style={{
      display: "flex", justifyContent: "space-between", alignItems: "center",
      padding: "10px 0", borderBottom: "1px solid var(--border)",
    }}>
      <span style={{ fontSize: "12px", color: "var(--text2)" }}>{label}</span>
      <div style={{ textAlign: "right" }}>
        <span style={{ fontSize: "13px", fontWeight: "500", color: color || "var(--text)", fontVariantNumeric: "tabular-nums" }}>{value}</span>
        {sub && <div style={{ fontSize: "10px", color: "var(--text3)", marginTop: "2px" }}>{sub}</div>}
      </div>
    </div>
  );

  const signals = [
    { label: "MACD Bullish", active: macdBullish, green: true },
    { label: "Above SMA 50", active: aboveSma50, green: true },
    { label: "Above SMA 200", active: aboveSma200, green: true },
  ];

  return (
    <div>
      {/* RSI meter */}
      <div style={{ marginBottom: "1.25rem" }}>
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "8px" }}>
          <span style={{ fontSize: "12px", color: "var(--text2)" }}>RSI (14)</span>
          <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
            <span style={{ fontSize: "16px", fontWeight: "600", color: rsiColor, fontVariantNumeric: "tabular-nums" }}>{rsi?.toFixed(1)}</span>
            <span style={{ fontSize: "10px", color: rsiColor, letterSpacing: "1px", fontFamily: "'Syne', sans-serif", fontWeight: "700" }}>{rsiLabel}</span>
          </div>
        </div>
        {/* RSI track */}
        <div style={{ height: "6px", background: "var(--bg2)", borderRadius: "3px", position: "relative", overflow: "visible" }}>
          {/* Zones */}
          <div style={{ position: "absolute", left: 0, width: "30%", height: "100%", background: "rgba(0,230,118,0.15)", borderRadius: "3px 0 0 3px" }} />
          <div style={{ position: "absolute", left: "30%", width: "40%", height: "100%", background: "rgba(255,215,0,0.1)" }} />
          <div style={{ position: "absolute", left: "70%", width: "30%", height: "100%", background: "rgba(255,77,109,0.15)", borderRadius: "0 3px 3px 0" }} />
          {/* Dot */}
          <div style={{
            position: "absolute", top: "50%", left: `${Math.min(Math.max(rsi, 0), 100)}%`,
            transform: "translate(-50%, -50%)",
            width: "12px", height: "12px", borderRadius: "50%",
            background: rsiColor, border: "2px solid var(--bg)",
            boxShadow: `0 0 8px ${rsiColor}`,
            transition: "left 0.5s ease",
          }} />
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", marginTop: "4px", fontSize: "10px", color: "var(--text3)" }}>
          <span>0</span><span>30</span><span>70</span><span>100</span>
        </div>
      </div>

      <Row label="MACD" value={macd?.toFixed(4)} sub={`Signal: ${macdSignal?.toFixed(4)}`} color={macdBullish ? "var(--green)" : "var(--red)"} />
      <Row label="BB Upper" value={bbUpper ? `$${bbUpper.toFixed(2)}` : "—"} color="var(--text2)" />
      <Row label="BB Lower" value={bbLower ? `$${bbLower.toFixed(2)}` : "—"} color="var(--text2)" />
      <Row label="SMA 50" value={sma50 ? `$${sma50.toFixed(2)}` : "—"} color={aboveSma50 ? "var(--green)" : "var(--red)"} sub={aboveSma50 ? "Price above" : "Price below"} />
      <Row label="SMA 200" value={sma200 ? `$${sma200.toFixed(2)}` : "—"} color={aboveSma200 ? "var(--green)" : "var(--red)"} sub={aboveSma200 ? "Long-term bull" : "Long-term bear"} />

      {/* Signal badges */}
      <div style={{ display: "flex", gap: "6px", flexWrap: "wrap", marginTop: "1rem" }}>
        {signals.map(s => (
          <span key={s.label} style={{
            padding: "4px 10px", borderRadius: "4px", fontSize: "10px",
            fontFamily: "'Syne', sans-serif", fontWeight: "700", letterSpacing: "0.5px",
            background: s.active ? (s.green ? "rgba(0,230,118,0.12)" : "rgba(255,77,109,0.12)") : "var(--bg2)",
            color: s.active ? (s.green ? "var(--green)" : "var(--red)") : "var(--text3)",
            border: `1px solid ${s.active ? (s.green ? "rgba(0,230,118,0.3)" : "rgba(255,77,109,0.3)") : "var(--border)"}`,
          }}>
            {s.active ? "✓" : "✗"} {s.label}
          </span>
        ))}
      </div>
    </div>
  );
}
