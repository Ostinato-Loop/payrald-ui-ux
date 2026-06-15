import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { api } from "../lib/api";
import { formatNGN, formatDate } from "../lib/format";

type Transaction = {
  id: string;
  type: string;
  description: string;
  counterpartyName: string;
  counterpartyAlias: string;
  amount: number;
  fee: number;
  currency: string;
  direction: string;
  status: string;
  reference: string;
  createdAt: string;
};

type TxPage = { data: Transaction[]; total: number; nextCursor: string | null };

const FILTERS = [
  { label: "All", value: "" },
  { label: "Transfers", value: "transfer" },
  { label: "Payments", value: "payment" },
  { label: "Withdrawals", value: "withdrawal" },
];

const STATUS_COLORS: Record<string, string> = {
  completed: "var(--success)",
  processing: "var(--warning)",
  pending: "var(--warning)",
  failed: "var(--error)",
};

export default function History() {
  const [, navigate] = useLocation();
  const [filter, setFilter] = useState("");
  const [limit, setLimit] = useState(30);

  const { data, isLoading } = useQuery<TxPage>({
    queryKey: ["transactions", filter, limit],
    queryFn: () => api.get(`/transactions?limit=${limit}${filter ? `&type=${filter}` : ""}`),
  });

  const txs = data?.data ?? [];

  const typeIcon = (type: string, direction: string) => {
    if (type === "withdrawal") return "↑";
    if (direction === "credit") return "↓";
    return "→";
  };

  const typeColor = (direction: string) =>
    direction === "credit" ? "var(--success)" : "var(--blue)";

  return (
    <div className="min-h-screen pb-24" style={{ background: "var(--bg)" }}>
      {/* Header */}
      <div className="fixed top-0 inset-x-0 z-40 border-b" style={{ borderColor: "var(--border)", background: "rgba(4,12,24,0.95)", backdropFilter: "blur(16px)" }}>
        <div className="max-w-2xl mx-auto px-4 h-14 flex items-center gap-3">
          <button onClick={() => navigate("/dashboard")} className="p-2 rounded-lg" style={{ color: "var(--text-secondary)" }}>
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <h1 className="text-base font-bold text-white">Transaction history</h1>
        </div>
        {/* Filter tabs */}
        <div className="max-w-2xl mx-auto px-4 pb-3 flex gap-2 overflow-x-auto">
          {FILTERS.map(({ label, value }) => (
            <button
              key={value}
              onClick={() => setFilter(value)}
              className="flex-shrink-0 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all"
              style={{
                background: filter === value ? "var(--blue)" : "var(--surface)",
                color: filter === value ? "white" : "var(--text-secondary)",
                border: `1px solid ${filter === value ? "var(--blue)" : "var(--border)"}`,
              }}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      <main className="max-w-2xl mx-auto px-4 pt-28">
        {isLoading ? (
          <div className="py-20 flex items-center justify-center">
            <div className="w-8 h-8 border-2 border-[#0066FF] border-t-transparent rounded-full animate-spin" />
          </div>
        ) : !txs.length ? (
          <div className="py-16 text-center rounded-xl border" style={{ background: "var(--surface)", borderColor: "var(--border)" }}>
            <p className="text-3xl mb-3">📋</p>
            <p className="text-sm font-medium text-white">No transactions found</p>
            <p className="text-xs mt-1" style={{ color: "var(--text-muted)" }}>
              {filter ? "Try a different filter" : "Your transaction history will appear here"}
            </p>
          </div>
        ) : (
          <div className="space-y-1">
            {txs.map((tx) => (
              <div
                key={tx.id}
                className="flex items-center gap-3 p-4 rounded-xl border"
                style={{ background: "var(--surface)", borderColor: "var(--border)" }}
              >
                {/* Icon */}
                <div
                  className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0"
                  style={{ background: tx.direction === "credit" ? "var(--success-dim)" : "var(--blue-dim)", color: typeColor(tx.direction) }}
                >
                  {typeIcon(tx.type, tx.direction)}
                </div>
                {/* Info */}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-white truncate">{tx.description}</p>
                  <p className="text-xs truncate" style={{ color: "var(--text-muted)" }}>
                    {formatDate(tx.createdAt)}
                  </p>
                  {tx.fee > 0 && (
                    <p className="text-xs" style={{ color: "var(--text-muted)" }}>
                      Fee: {formatNGN(tx.fee)}
                    </p>
                  )}
                </div>
                {/* Amount + status */}
                <div className="text-right flex-shrink-0">
                  <p
                    className="text-sm font-bold"
                    style={{ color: tx.direction === "credit" ? "var(--success)" : "var(--text)" }}
                  >
                    {tx.direction === "credit" ? "+" : "-"}{formatNGN(tx.amount)}
                  </p>
                  <p className="text-xs capitalize" style={{ color: STATUS_COLORS[tx.status] ?? "var(--text-muted)" }}>
                    {tx.status}
                  </p>
                </div>
              </div>
            ))}

            {data?.nextCursor && (
              <button
                onClick={() => setLimit((l) => l + 30)}
                className="w-full py-3.5 mt-2 rounded-xl text-sm font-semibold border"
                style={{ borderColor: "var(--border)", color: "var(--text-secondary)" }}
              >
                Load more
              </button>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
