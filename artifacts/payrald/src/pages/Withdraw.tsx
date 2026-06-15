import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { api, ApiError } from "../lib/api";
import { formatNGN } from "../lib/format";

type Bank = { code: string; name: string; shortName: string; logo?: string };
type WalletResponse = { balances: { available: number }[] };
type Withdrawal = { id: string; status: string; amount: number; bankName: string };

export default function Withdraw() {
  const [, navigate] = useLocation();
  const qc = useQueryClient();

  const [step, setStep] = useState<"form" | "verify" | "confirm" | "done">("form");
  const [bankCode, setBankCode] = useState("");
  const [accountNumber, setAccountNumber] = useState("");
  const [accountName, setAccountName] = useState("");
  const [amount, setAmount] = useState("");
  const [error, setError] = useState("");
  const [result, setResult] = useState<Withdrawal | null>(null);
  const [bankSearch, setBankSearch] = useState("");

  const { data: wallet } = useQuery<WalletResponse>({
    queryKey: ["wallet"],
    queryFn: () => api.get("/wallet"),
  });

  const { data: banks } = useQuery<Bank[]>({
    queryKey: ["banks"],
    queryFn: () => api.get("/withdrawals/banks"),
    staleTime: 60_000,
  });

  const balance = wallet?.balances?.[0]?.available ?? 0;

  const verifyMutation = useMutation({
    mutationFn: () =>
      api.post<{ accountName: string }>("/withdrawals/verify-account", {
        accountNumber,
        bankCode,
      }),
    onSuccess: (data) => {
      setAccountName(data.accountName);
      setError("");
      setStep("confirm");
    },
    onError: (err) => {
      setError(err instanceof ApiError ? err.message : "Account verification failed");
    },
  });

  const withdrawMutation = useMutation({
    mutationFn: () =>
      api.post<Withdrawal>("/withdrawals", {
        bankCode,
        accountName,
        accountNumber,
        amount: parseFloat(amount),
      }),
    onSuccess: (data) => {
      setResult(data);
      setStep("done");
      qc.invalidateQueries({ queryKey: ["wallet"] });
      qc.invalidateQueries({ queryKey: ["transactions"] });
    },
    onError: (err) => {
      setError(err instanceof ApiError ? err.message : "Withdrawal failed");
    },
  });

  const selectedBank = banks?.find((b) => b.code === bankCode);
  const filteredBanks = banks?.filter((b) =>
    !bankSearch || b.name.toLowerCase().includes(bankSearch.toLowerCase()) || b.shortName.toLowerCase().includes(bankSearch.toLowerCase())
  );

  return (
    <div className="min-h-screen pb-20" style={{ background: "var(--bg)" }}>
      <div className="fixed top-0 inset-x-0 z-40 border-b" style={{ borderColor: "var(--border)", background: "rgba(4,12,24,0.95)", backdropFilter: "blur(16px)" }}>
        <div className="max-w-2xl mx-auto px-4 h-14 flex items-center gap-3">
          <button onClick={() => navigate("/dashboard")} className="p-2 rounded-lg" style={{ color: "var(--text-secondary)" }}>
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <h1 className="text-base font-bold text-white">Withdraw to bank</h1>
        </div>
      </div>

      <main className="max-w-2xl mx-auto px-4 pt-20">
        <div className="mt-6 flex justify-center">
          <span className="text-xs px-3 py-1.5 rounded-full" style={{ background: "var(--blue-dim)", color: "var(--blue)" }}>
            Available: {formatNGN(balance)}
          </span>
        </div>

        {step === "form" && (
          <div className="mt-8 space-y-4">
            <div>
              <label className="block text-sm font-medium text-white mb-2">Select bank</label>
              <input
                type="text"
                value={bankSearch}
                onChange={(e) => setBankSearch(e.target.value)}
                placeholder="Search banks…"
                className="w-full px-4 py-3 rounded-xl text-sm text-white outline-none border mb-2"
                style={{ background: "var(--surface)", borderColor: "var(--border)" }}
                onFocus={(e) => (e.currentTarget.style.borderColor = "var(--blue)")}
                onBlur={(e) => (e.currentTarget.style.borderColor = "var(--border)")}
              />
              <div className="max-h-48 overflow-y-auto rounded-xl border" style={{ borderColor: "var(--border)" }}>
                {!banks ? (
                  <div className="p-4 text-center text-sm" style={{ color: "var(--text-muted)" }}>Loading banks…</div>
                ) : !filteredBanks?.length ? (
                  <div className="p-4 text-center text-sm" style={{ color: "var(--text-muted)" }}>No banks found</div>
                ) : (
                  filteredBanks.map((bank) => (
                    <button
                      key={bank.code}
                      onClick={() => { setBankCode(bank.code); setBankSearch(bank.name); }}
                      className="w-full flex items-center gap-3 px-4 py-3 text-left text-sm transition-colors border-b last:border-b-0"
                      style={{
                        background: bankCode === bank.code ? "var(--blue-dim)" : "var(--surface)",
                        borderColor: "var(--border)",
                        color: bankCode === bank.code ? "var(--blue)" : "var(--text)",
                      }}
                    >
                      <span className="font-medium">{bank.shortName}</span>
                      <span className="text-xs" style={{ color: "var(--text-muted)" }}>{bank.name}</span>
                    </button>
                  ))
                )}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-white mb-2">Account number</label>
              <input
                type="text"
                inputMode="numeric"
                value={accountNumber}
                onChange={(e) => setAccountNumber(e.target.value.replace(/\D/g, "").slice(0, 10))}
                placeholder="0123456789"
                maxLength={10}
                className="w-full px-4 py-3 rounded-xl text-sm text-white outline-none border"
                style={{ background: "var(--surface)", borderColor: "var(--border)" }}
                onFocus={(e) => (e.currentTarget.style.borderColor = "var(--blue)")}
                onBlur={(e) => (e.currentTarget.style.borderColor = "var(--border)")}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-white mb-2">Amount (NGN)</label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-xl font-bold" style={{ color: "var(--text-muted)" }}>₦</span>
                <input
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="0.00"
                  min="100"
                  className="w-full pl-9 pr-4 py-4 text-xl font-bold text-white rounded-xl outline-none border"
                  style={{ background: "var(--surface)", borderColor: "var(--border)" }}
                  onFocus={(e) => (e.currentTarget.style.borderColor = "var(--blue)")}
                  onBlur={(e) => (e.currentTarget.style.borderColor = "var(--border)")}
                />
              </div>
              <p className="text-xs mt-1" style={{ color: "var(--text-muted)" }}>₦50 flat fee applies</p>
            </div>

            {error && (
              <div className="text-sm px-3 py-2.5 rounded-lg" style={{ background: "var(--error-dim)", color: "var(--error)" }}>
                {error}
              </div>
            )}

            <button
              onClick={() => {
                if (!bankCode) return setError("Select a bank");
                if (accountNumber.length !== 10) return setError("Enter a valid 10-digit account number");
                if (!amount || parseFloat(amount) < 100) return setError("Minimum withdrawal is ₦100");
                if (parseFloat(amount) + 50 > balance) return setError("Insufficient balance (amount + ₦50 fee)");
                setError("");
                verifyMutation.mutate();
              }}
              disabled={verifyMutation.isPending}
              className="w-full py-4 rounded-xl font-bold text-white text-sm"
              style={{ background: "var(--blue)", opacity: verifyMutation.isPending ? 0.7 : 1 }}
            >
              {verifyMutation.isPending ? "Verifying account…" : "Verify account"}
            </button>
          </div>
        )}

        {step === "confirm" && (
          <div className="mt-8 space-y-4">
            <div className="p-6 rounded-2xl border space-y-4" style={{ background: "var(--surface)", borderColor: "var(--border)" }}>
              <h2 className="text-base font-bold text-white">Confirm withdrawal</h2>
              {[
                { label: "Bank", value: selectedBank?.name ?? bankCode },
                { label: "Account name", value: accountName },
                { label: "Account number", value: accountNumber },
                { label: "Amount", value: formatNGN(parseFloat(amount)) },
                { label: "Fee", value: formatNGN(50) },
              ].map(({ label, value }) => (
                <div key={label} className="flex justify-between text-sm">
                  <span style={{ color: "var(--text-secondary)" }}>{label}</span>
                  <span className="font-semibold text-white">{value}</span>
                </div>
              ))}
              <div className="pt-3 border-t flex justify-between text-base font-bold" style={{ borderColor: "var(--border)" }}>
                <span className="text-white">Total deducted</span>
                <span style={{ color: "var(--blue)" }}>{formatNGN(parseFloat(amount) + 50)}</span>
              </div>
            </div>

            {error && (
              <div className="text-sm px-3 py-2.5 rounded-lg" style={{ background: "var(--error-dim)", color: "var(--error)" }}>
                {error}
              </div>
            )}

            <div className="flex gap-3">
              <button onClick={() => { setStep("form"); setError(""); }} className="flex-1 py-3.5 rounded-xl font-semibold text-sm border" style={{ borderColor: "var(--border)", color: "var(--text-secondary)" }}>
                Back
              </button>
              <button
                onClick={() => withdrawMutation.mutate()}
                disabled={withdrawMutation.isPending}
                className="flex-1 py-3.5 rounded-xl font-bold text-white text-sm"
                style={{ background: "var(--blue)", opacity: withdrawMutation.isPending ? 0.7 : 1 }}
              >
                {withdrawMutation.isPending ? "Processing…" : "Withdraw now"}
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
            <h2 className="text-2xl font-black text-white mb-2">Withdrawal submitted!</h2>
            <p className="text-sm mb-1" style={{ color: "var(--text-secondary)" }}>
              {formatNGN(result.amount)} to {result.bankName}
            </p>
            <p className="text-xs mb-8" style={{ color: "var(--text-muted)" }}>
              Usually arrives within 30 seconds · Status: {result.status}
            </p>
            <button
              onClick={() => navigate("/dashboard")}
              className="w-full py-3.5 rounded-xl font-bold text-white text-sm"
              style={{ background: "var(--blue)" }}
            >
              Back to dashboard
            </button>
          </div>
        )}
      </main>
    </div>
  );
}
