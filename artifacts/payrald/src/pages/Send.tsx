import { useState } from "react";
import { Link, useLocation } from "wouter";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api, ApiError } from "../lib/api";
import { formatNGN } from "../lib/format";

type ResolvedIdentity = {
  alias: string;
  aliasType: string;
  displayName: string;
  avatarInitials: string;
  verified: boolean;
};

type Transfer = { id: string; status: string; amount: number; recipientDisplay: string };
type WalletResponse = { balances: { available: number }[]; totalNgn: number };

export default function Send() {
  const [, navigate] = useLocation();
  const qc = useQueryClient();

  const [step, setStep] = useState<"recipient" | "amount" | "confirm" | "done">("recipient");
  const [recipient, setRecipient] = useState("");
  const [amount, setAmount] = useState("");
  const [note, setNote] = useState("");
  const [resolved, setResolved] = useState<ResolvedIdentity | null>(null);
  const [error, setError] = useState("");
  const [result, setResult] = useState<Transfer | null>(null);

  const { data: wallet } = useQuery<WalletResponse>({
    queryKey: ["wallet"],
    queryFn: () => api.get("/wallet"),
  });

  const balance = wallet?.balances?.[0]?.available ?? 0;

  const resolveMutation = useMutation({
    mutationFn: (alias: string) => api.post<ResolvedIdentity>("/resolve", { alias }),
    onSuccess: (data) => {
      setResolved(data);
      setError("");
      setStep("amount");
    },
    onError: (err) => {
      setError(err instanceof ApiError ? err.message : "Could not resolve recipient");
    },
  });

  const transferMutation = useMutation({
    mutationFn: () =>
      api.post<Transfer>("/transfers", {
        recipient,
        amount: parseFloat(amount),
        note: note || undefined,
      }),
    onSuccess: (data) => {
      setResult(data);
      setStep("done");
      qc.invalidateQueries({ queryKey: ["wallet"] });
      qc.invalidateQueries({ queryKey: ["transactions"] });
    },
    onError: (err) => {
      setError(err instanceof ApiError ? err.message : "Transfer failed");
    },
  });

  return (
    <div className="min-h-screen pb-20" style={{ background: "var(--bg)" }}>
      {/* Header */}
      <div className="fixed top-0 inset-x-0 z-40 border-b" style={{ borderColor: "var(--border)", background: "rgba(4,12,24,0.95)", backdropFilter: "blur(16px)" }}>
        <div className="max-w-2xl mx-auto px-4 h-14 flex items-center gap-3">
          <button onClick={() => navigate("/dashboard")} className="p-2 rounded-lg" style={{ color: "var(--text-secondary)" }}>
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <h1 className="text-base font-bold text-white">Send money</h1>
        </div>
      </div>

      <main className="max-w-2xl mx-auto px-4 pt-20">
        {/* Balance pill */}
        <div className="mt-6 flex items-center justify-center">
          <span className="text-xs px-3 py-1.5 rounded-full" style={{ background: "var(--blue-dim)", color: "var(--blue)" }}>
            Available: {formatNGN(balance)}
          </span>
        </div>

        {step === "recipient" && (
          <div className="mt-8 space-y-4">
            <div>
              <label className="block text-sm font-medium text-white mb-2">Send to</label>
              <input
                type="text"
                value={recipient}
                onChange={(e) => { setRecipient(e.target.value); setError(""); }}
                placeholder="@username, email, or +234..."
                autoFocus
                className="w-full px-4 py-4 rounded-xl text-white text-base outline-none border"
                style={{ background: "var(--surface)", borderColor: "var(--border)" }}
                onFocus={(e) => (e.currentTarget.style.borderColor = "var(--blue)")}
                onBlur={(e) => (e.currentTarget.style.borderColor = "var(--border)")}
                onKeyDown={(e) => { if (e.key === "Enter" && recipient.trim()) resolveMutation.mutate(recipient.trim()); }}
              />
              <p className="text-xs mt-2" style={{ color: "var(--text-muted)" }}>
                Enter a RALD @username, email address, or phone number
              </p>
            </div>

            {error && (
              <div className="text-sm px-3 py-2.5 rounded-lg" style={{ background: "var(--error-dim)", color: "var(--error)" }}>
                {error}
              </div>
            )}

            <button
              onClick={() => recipient.trim() && resolveMutation.mutate(recipient.trim())}
              disabled={!recipient.trim() || resolveMutation.isPending}
              className="w-full py-4 rounded-xl font-bold text-white text-sm"
              style={{ background: "var(--blue)", opacity: !recipient.trim() || resolveMutation.isPending ? 0.6 : 1 }}
            >
              {resolveMutation.isPending ? "Looking up…" : "Continue"}
            </button>
          </div>
        )}

        {step === "amount" && resolved && (
          <div className="mt-8 space-y-4">
            {/* Resolved recipient */}
            <div className="flex items-center gap-3 p-4 rounded-xl border" style={{ background: "var(--surface)", borderColor: "var(--border)" }}>
              <div className="w-12 h-12 rounded-full flex items-center justify-center text-sm font-bold" style={{ background: "var(--blue-dim)", color: "var(--blue)" }}>
                {resolved.avatarInitials}
              </div>
              <div>
                <p className="font-semibold text-white text-sm">{resolved.displayName}</p>
                <p className="text-xs" style={{ color: "var(--text-muted)" }}>{recipient}</p>
              </div>
              {resolved.verified && (
                <span className="ml-auto text-xs px-2 py-0.5 rounded-full" style={{ background: "var(--success-dim)", color: "var(--success)" }}>✓ Verified</span>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-white mb-2">Amount (NGN)</label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-2xl font-bold" style={{ color: "var(--text-muted)" }}>₦</span>
                <input
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="0.00"
                  autoFocus
                  min="1"
                  className="w-full pl-10 pr-4 py-4 text-2xl font-bold text-white rounded-xl outline-none border"
                  style={{ background: "var(--surface)", borderColor: "var(--border)" }}
                  onFocus={(e) => (e.currentTarget.style.borderColor = "var(--blue)")}
                  onBlur={(e) => (e.currentTarget.style.borderColor = "var(--border)")}
                />
              </div>
              {/* Quick amounts */}
              <div className="flex gap-2 mt-2">
                {[1000, 2000, 5000, 10000].map((v) => (
                  <button
                    key={v}
                    onClick={() => setAmount(String(v))}
                    className="flex-1 py-1.5 rounded-lg text-xs font-semibold border"
                    style={{
                      background: amount === String(v) ? "var(--blue-dim)" : "transparent",
                      borderColor: amount === String(v) ? "var(--blue)" : "var(--border)",
                      color: amount === String(v) ? "var(--blue)" : "var(--text-secondary)",
                    }}
                  >
                    ₦{(v / 1000).toFixed(0)}k
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-white mb-2">Note (optional)</label>
              <input
                type="text"
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="What's this for?"
                maxLength={100}
                className="w-full px-4 py-3 rounded-xl text-sm text-white outline-none border"
                style={{ background: "var(--surface)", borderColor: "var(--border)" }}
                onFocus={(e) => (e.currentTarget.style.borderColor = "var(--blue)")}
                onBlur={(e) => (e.currentTarget.style.borderColor = "var(--border)")}
              />
            </div>

            {error && (
              <div className="text-sm px-3 py-2.5 rounded-lg" style={{ background: "var(--error-dim)", color: "var(--error)" }}>
                {error}
              </div>
            )}

            <div className="flex gap-3">
              <button onClick={() => { setStep("recipient"); setError(""); }} className="flex-1 py-3.5 rounded-xl font-semibold text-sm border" style={{ borderColor: "var(--border)", color: "var(--text-secondary)" }}>
                Back
              </button>
              <button
                onClick={() => {
                  if (!amount || parseFloat(amount) <= 0) return setError("Enter an amount");
                  if (parseFloat(amount) > balance) return setError("Insufficient balance");
                  setError("");
                  setStep("confirm");
                }}
                className="flex-1 py-3.5 rounded-xl font-bold text-white text-sm"
                style={{ background: "var(--blue)" }}
              >
                Review
              </button>
            </div>
          </div>
        )}

        {step === "confirm" && resolved && (
          <div className="mt-8 space-y-4">
            <div className="p-6 rounded-2xl border space-y-4" style={{ background: "var(--surface)", borderColor: "var(--border)" }}>
              <h2 className="text-base font-bold text-white">Confirm transfer</h2>
              {[
                { label: "To", value: resolved.displayName },
                { label: "Alias", value: recipient },
                { label: "Amount", value: formatNGN(parseFloat(amount)) },
                { label: "Fee", value: "₦0.00" },
                { label: "Note", value: note || "—" },
              ].map(({ label, value }) => (
                <div key={label} className="flex justify-between text-sm">
                  <span style={{ color: "var(--text-secondary)" }}>{label}</span>
                  <span className="font-semibold text-white">{value}</span>
                </div>
              ))}
              <div className="pt-3 border-t flex justify-between text-base font-bold" style={{ borderColor: "var(--border)" }}>
                <span className="text-white">Total deducted</span>
                <span style={{ color: "var(--blue)" }}>{formatNGN(parseFloat(amount))}</span>
              </div>
            </div>

            {error && (
              <div className="text-sm px-3 py-2.5 rounded-lg" style={{ background: "var(--error-dim)", color: "var(--error)" }}>
                {error}
              </div>
            )}

            <div className="flex gap-3">
              <button onClick={() => { setStep("amount"); setError(""); }} className="flex-1 py-3.5 rounded-xl font-semibold text-sm border" style={{ borderColor: "var(--border)", color: "var(--text-secondary)" }}>
                Back
              </button>
              <button
                onClick={() => transferMutation.mutate()}
                disabled={transferMutation.isPending}
                className="flex-1 py-3.5 rounded-xl font-bold text-white text-sm"
                style={{ background: "var(--blue)", opacity: transferMutation.isPending ? 0.7 : 1 }}
              >
                {transferMutation.isPending ? "Sending…" : "Send now"}
              </button>
            </div>
          </div>
        )}

        {step === "done" && result && (
          <div className="mt-8 text-center">
            <div className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6" style={{ background: "var(--success-dim)" }}>
              <svg className="w-10 h-10" fill="none" stroke="var(--success)" viewBox="0 0 24 24" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h2 className="text-2xl font-black text-white mb-2">Money sent!</h2>
            <p className="text-sm mb-2" style={{ color: "var(--text-secondary)" }}>
              {formatNGN(result.amount)} sent to {result.recipientDisplay}
            </p>
            <p className="text-xs mb-8" style={{ color: "var(--text-muted)" }}>
              Status: <span className="capitalize">{result.status}</span>
            </p>
            <div className="flex gap-3">
              <button onClick={() => { setStep("recipient"); setRecipient(""); setAmount(""); setNote(""); setResolved(null); setResult(null); }} className="flex-1 py-3.5 rounded-xl font-semibold text-sm border" style={{ borderColor: "var(--border)", color: "var(--text-secondary)" }}>
                Send again
              </button>
              <Link href="/dashboard" className="flex-1">
                <button className="w-full py-3.5 rounded-xl font-bold text-white text-sm" style={{ background: "var(--blue)" }}>
                  Done
                </button>
              </Link>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
