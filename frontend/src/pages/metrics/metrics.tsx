import React from "react";
import { useQuery } from "@tanstack/react-query";
import { PageTitle } from "../../components/page-title/page-title";

interface MetricsSummaryResponse {
  totalUsers: number;
  totalUseCases: number;
  totalOrders: number;
  errMsg?: string | null;
}

const fetchMetricsSummary = async (): Promise<MetricsSummaryResponse> => {
  const base = (import.meta.env.VITE_API_BASE_URL || "").toString().trim();
  const prefix = base ? base.replace(/\/+$/, "") : ""; // strip trailing slashes
  const endpoint = `${prefix}/api/report/summary`;
  const res = await globalThis.fetch(endpoint, {
    headers: { Accept: "application/json" },
    credentials: "include",
  });
  if (!res.ok) {
    throw new Error(`Failed to fetch metrics: ${res.status}`);
  }
  return res.json();
};

export const Metrics: React.FC = () => {
  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["metrics", "summary"],
    queryFn: fetchMetricsSummary,
    staleTime: 1000 * 60, // 1 minute
  });

  return (
    <div className="metrics-page marketplace-content">
      <PageTitle title="Metrics" />

      {isLoading && <div>Loading metrics…</div>}
      {isError && (
        <div role="alert" style={{ color: "#b91c1c" }}>
          {(error as Error)?.message || "Error loading metrics"}
        </div>
      )}

      {data && (
        <section aria-labelledby="metrics-chart-heading">
          <h2 id="metrics-chart-heading" className="sr-only">Summary</h2>
          {(() => {
            const items = [
              { label: "Users", value: data.totalUsers, color: "#4f46e5" },
              { label: "Use Cases", value: data.totalUseCases, color: "#10b981" },
              { label: "Orders", value: data.totalOrders, color: "#f59e0b" },
            ];
            const max = Math.max(...items.map(i => i.value), 1);
            return (
              <ul role="list" style={{ padding: 0, margin: 0, listStyle: "none", maxWidth: 520 }}>
                {items.map((item) => {
                  const pct = Math.round((item.value / max) * 100);
                  return (
                    <li key={item.label} style={{ display: "grid", gridTemplateColumns: "110px 1fr 50px", alignItems: "center", gap: 12, margin: "12px 0" }} aria-label={`${item.label}: ${item.value}`}>
                      <div style={{ fontWeight: 600 }}>{item.label}</div>
                      <div style={{ height: 12, background: "#e5e7eb", borderRadius: 6, overflow: "hidden" }} aria-hidden>
                        <div style={{ height: "100%", width: `${pct}%`, background: item.color, transition: "width .3s ease" }} />
                      </div>
                      <div style={{ textAlign: "right", fontVariantNumeric: "tabular-nums" }}>{item.value}</div>
                    </li>
                  );
                })}
              </ul>
            );
          })()}
        </section>
      )}
    </div>
  );
};

export default Metrics;
