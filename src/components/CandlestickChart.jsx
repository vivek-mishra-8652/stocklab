import { useEffect, useRef } from "react";
import Chart from "chart.js/auto";

export default function CandlestickChart({ data, showBollinger = false }) {
  const canvasRef = useRef(null);
  const chartRef = useRef(null);

  useEffect(() => {
    if (!data || data.length === 0) return;
    if (chartRef.current) chartRef.current.destroy();

    const ctx = canvasRef.current.getContext("2d");
    const labels = data.map(d => d.Date?.slice(0, 10));
    const closes = data.map(d => d.Close);

    const datasets = [
      {
        label: "Close Price",
        data: closes,
        borderColor: "#00d4ff",
        backgroundColor: "rgba(0,212,255,0.05)",
        borderWidth: 2,
        pointRadius: 0,
        fill: true,
        tension: 0.2,
      },
    ];

    if (showBollinger && data[0]?.BB_Upper) {
      datasets.push({
        label: "BB Upper",
        data: data.map(d => d.BB_Upper),
        borderColor: "rgba(0,212,255,0.25)",
        borderWidth: 1,
        pointRadius: 0,
        fill: false,
        tension: 0.3,
      });
      datasets.push({
        label: "BB Lower",
        data: data.map(d => d.BB_Lower),
        borderColor: "rgba(0,212,255,0.25)",
        borderWidth: 1,
        pointRadius: 0,
        fill: false,
        tension: 0.3,
      });
    }

    chartRef.current = new Chart(ctx, {
      type: "line",
      data: { labels, datasets },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false },
          tooltip: {
            backgroundColor: "#0c1018",
            borderColor: "#1a2235",
            borderWidth: 1,
            titleColor: "#8899aa",
            bodyColor: "#e8edf5",
            callbacks: {
              label: (item) => ` $${item.raw?.toFixed(2)}`,
            },
          },
        },
        scales: {
          x: {
            ticks: {
              color: "#445566",
              font: { size: 11, family: "JetBrains Mono" },
              maxTicksLimit: 8,
              maxRotation: 0,
            },
            grid: { color: "#1a2235" },
          },
          y: {
            ticks: {
              color: "#445566",
              font: { size: 11, family: "JetBrains Mono" },
              callback: (val) => `$${val.toFixed(0)}`,
            },
            grid: { color: "#1a2235" },
          },
        },
      },
    });

    return () => chartRef.current?.destroy();
  }, [data, showBollinger]);

  return (
    <div style={{ height: "300px", position: "relative" }}>
      <canvas ref={canvasRef} />
    </div>
  );
}