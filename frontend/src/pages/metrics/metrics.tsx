import React from "react";
import { useQuery } from "@tanstack/react-query";
import { PageTitle } from "../../components/page-title/page-title";
import { useAuth } from "@/hooks/useAuth";

interface MetricsSummaryResponse {
  totalUsers: number;
  totalUseCases: number;
  totalOrders: number;
  errMsg?: string | null;
}

interface PendingRequestsResponse {
  requests: Array<Record<string, unknown>>;
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

const fetchPendingRequestsCount = async (
  userEmail: string
): Promise<number> => {
  const base = (import.meta.env.VITE_API_BASE_URL || "").toString().trim();
  const prefix = base ? base.replace(/\/+$/, "") : ""; // strip trailing slashes
  const endpoint = `${prefix}/api/requests/viewPending`;
  const res = await globalThis.fetch(endpoint, {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
    },
    credentials: "include",
    body: JSON.stringify({ userEmail }),
  });
  if (!res.ok) {
    throw new Error(`Failed to fetch pending requests: ${res.status}`);
  }
  const data: PendingRequestsResponse = await res.json();
  return Array.isArray(data.requests) ? data.requests.length : 0;
};

export const Metrics: React.FC = () => {
  const { getUserInfo } = useAuth();
  const userInfo = getUserInfo();

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["metrics", "summary"],
    queryFn: fetchMetricsSummary,
    staleTime: 1000 * 60, // 1 minute
  });

  const {
    data: pendingRequestsCount,
    isLoading: isPendingLoading,
    isError: isPendingError,
    error: pendingError,
  } = useQuery({
    queryKey: ["metrics", "pendingRequests", userInfo?.email],
    queryFn: () => fetchPendingRequestsCount(userInfo?.email || ""),
    staleTime: 1000 * 60, // 1 minute
    enabled: !!userInfo?.email, // Only run if we have a user email
  });

  return (
    <div className="metrics-page marketplace-content">
      <PageTitle title="Metrics" />

      {(isLoading || isPendingLoading) && <div>Loading metrics…</div>}
      {(isError || isPendingError) && (
        <div role="alert" style={{ color: "#b91c1c" }}>
          {(error as Error)?.message ||
            (pendingError as Error)?.message ||
            "Error loading metrics"}
        </div>
      )}

      {data && (
        <section aria-labelledby="metrics-chart-heading">
          <h2 id="metrics-chart-heading" className="sr-only">
            Summary
          </h2>
          {(() => {
            const items = [
              {
                label: "Unique users",
                value: data.totalUsers,
              },
              {
                label: "Total requests",
                value: data.totalUseCases,
              },
              {
                label: "Pending requests",
                value: pendingRequestsCount ?? 0,
              },
              // { label: "Orders", value: data.totalOrders, color: "#f59e0b" },
            ];
            return (
              <ul
                role="list"
                style={{
                  padding: 0,
                  margin: 0,
                  listStyle: "none",
                  maxWidth: 420,
                }}
              >
                {items.map((item) => {
                  return (
                    <li
                      key={item.label}
                      style={{
                        display: "grid",
                        gridTemplateColumns: "200px 1fr 50px",
                        alignItems: "center",
                        gap: 12,
                        margin: "12px 0",
                      }}
                      aria-label={`${item.label}: ${item.value}`}
                    >
                      <div style={{ fontWeight: 600 }}>{item.label}</div>
                      <div
                        style={{
                          textAlign: "right",
                          fontVariantNumeric: "tabular-nums",
                        }}
                      >
                        {item.value}
                      </div>
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
