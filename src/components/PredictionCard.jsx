export default function PredictionCard({ data }) {
  if (!data) return <div style={{ color: "var(--text3)", fontSize: "12px" }}>No prediction available.</div>;

  const isUp = data.direction === "UP";
  const color = isUp ? "var(--green)" : "var(--red)";
  const bgColor = isUp ? "rgba(0,230,118,0.08)" : "rgba(255,77,109,0.08)";
  const borderColor = isUp ? "rgba(0,230,118,0.25)" : "rgba(255,77,109,0.25)";

  return (
    <div>
      {/* Direction hero */}
      <div style={{
        background: bgColor, border: `1px solid ${borderColor}`,
        borderRadius: "10px", padding: "1.25rem", marginBottom: "1.25rem",
        display: "flex", alignItems: "center", gap: "1rem",
      }}>
        <div style={{
          fontSize: "48px", lineHeight: 1,
          filter: `drop-shadow(0 0 12px ${color})`,
        }}>
          {isUp ? "↑" : "↓"}
        </div>
        <div>
          <div style={{ fontSize: "26px", fontWeight: "800", fontFamily: "'Syne', sans-serif", color, letterSpacing: "-0.5px" }}>
            {data.direction}
          </div>
          <div style={{ fontSize: "12px", color: "var(--text2)", marginTop: "2px" }}>
            {data.confidence}% confidence
          </div>
        </div>
        <div style={{ marginLeft: "auto", textAlign: "right" }}>
          <div style={{ fontSize: "11px", color: "var(--text3)", marginBottom: "4px" }}>PREDICTED CHANGE</div>
          <div style={{ fontSize: "20px", fontWeight: "600", color, fontVariantNumeric: "tabular-nums" }}>
            {data.change_pct > 0 ? "+" : ""}{data.change_pct}%
          </div>
        </div>
      </div>

      {/* Confidence bar */}
      <div style={{ marginBottom: "1.25rem" }}>
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "6px", fontSize: "11px", color: "var(--text3)" }}>
          <span>Confidence</span>
          <span style={{ color }}>{data.confidence}%</span>
        </div>
        <div style={{ height: "4px", background: "var(--bg2)", borderRadius: "2px" }}>
          <div style={{
            height: "100%", width: `${data.confidence}%`,
            background: `linear-gradient(90deg, ${color}88, ${color})`,
            borderRadius: "2px", transition: "width 0.6s ease",
            boxShadow: `0 0 8px ${color}44`,
          }} />
        </div>
      </div>

      {/* Price comparison */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px", marginBottom: "1.25rem" }}>
        {[
          { label: "Current Price", value: `$${data.current_price}`, color: "var(--text)" },
          { label: "Predicted Price", value: `$${data.predicted_price}`, color },
        ].map(item => (
          <div key={item.label} style={{
            background: "var(--bg2)", borderRadius: "8px", padding: "12px",
            border: "1px solid var(--border)",
          }}>
            <div style={{ fontSize: "10px", color: "var(--text3)", marginBottom: "6px", letterSpacing: "1.5px", fontFamily: "'Syne', sans-serif", fontWeight: "700", textTransform: "uppercase" }}>
              {item.label}
            </div>
            <div style={{ fontSize: "20px", fontWeight: "500", color: item.color, fontVariantNumeric: "tabular-nums" }}>
              {item.value}
            </div>
          </div>
        ))}
      </div>

      {/* Feature importance */}
      {data.top_features && (
        <div style={{ borderTop: "1px solid var(--border)", paddingTop: "1rem" }}>
          <div style={{ fontSize: "10px", color: "var(--text3)", letterSpacing: "1.5px", fontFamily: "'Syne', sans-serif", fontWeight: "700", marginBottom: "10px", textTransform: "uppercase" }}>
            Top Influencing Factors
          </div>
          {data.top_features.map((f, i) => (
            <div key={f.name} style={{ marginBottom: "8px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: "12px", marginBottom: "4px" }}>
                <span style={{ color: "var(--text2)" }}>{f.name}</span>
                <span style={{ color: "var(--accent)", fontVariantNumeric: "tabular-nums" }}>{(f.importance * 100).toFixed(1)}%</span>
              </div>
              <div style={{ height: "3px", background: "var(--bg2)", borderRadius: "2px" }}>
                <div style={{
                  height: "100%", width: `${f.importance * 100}%`,
                  background: `linear-gradient(90deg, var(--accent2), var(--accent))`,
                  borderRadius: "2px",
                }} />
              </div>
            </div>
          ))}
        </div>
      )}

      <p style={{ fontSize: "11px", color: "var(--text3)", marginTop: "1rem", fontStyle: "italic", borderTop: "1px solid var(--border)", paddingTop: "0.75rem" }}>
        ⚠ {data.disclaimer}
      </p>
    </div>
  );
}
