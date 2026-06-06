export default function StatCard({ label, value, positive, sub }) {
  const valueColor =
    positive === true ? "var(--green)" :
    positive === false ? "var(--red)" :
    "var(--text)";

  return (
    <div className="stat-card">
      <div style={{
        fontSize: "10px", color: "var(--text3)",
        marginBottom: "8px", letterSpacing: "1.5px",
        fontFamily: "'Syne', sans-serif", fontWeight: "700",
        textTransform: "uppercase",
      }}>
        {label}
      </div>
      <div style={{ fontSize: "20px", fontWeight: "500", color: valueColor, fontVariantNumeric: "tabular-nums" }}>
        {value ?? "—"}
      </div>
      {sub && <div style={{ fontSize: "11px", color: "var(--text3)", marginTop: "4px" }}>{sub}</div>}
    </div>
  );
}
