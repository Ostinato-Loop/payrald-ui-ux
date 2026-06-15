import { useState } from "react";
import { Link, useLocation } from "wouter";
import { useAuth } from "../lib/auth";
import { ApiError } from "../lib/api";
import Logo from "../components/Logo";

export default function SignIn() {
  const { signIn } = useAuth();
  const [, navigate] = useLocation();
  const [raldId, setRaldId] = useState("");
  const [pin, setPin] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!raldId.trim()) return setError("Enter your RALD ID");
    if (pin.length !== 6) return setError("PIN must be exactly 6 digits");

    setLoading(true);
    try {
      await signIn(raldId.trim().toLowerCase(), pin);
      navigate("/dashboard");
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Sign in failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4" style={{ background: "var(--bg)" }}>
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="text-center mb-8">
          <Link href="/">
            <span className="inline-flex cursor-pointer justify-center">
              <Logo size="lg" />
            </span>
          </Link>
          <p className="mt-3 text-sm" style={{ color: "var(--text-secondary)" }}>
            Welcome back
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="p-8 rounded-2xl border"
          style={{ background: "var(--surface)", borderColor: "var(--border)" }}
        >
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-white mb-1.5">RALD ID</label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm" style={{ color: "var(--text-muted)" }}>@</span>
                <input
                  type="text"
                  value={raldId}
                  onChange={(e) => setRaldId(e.target.value.replace(/^@/, ""))}
                  placeholder="yourname"
                  autoComplete="username"
                  className="w-full pl-7 pr-4 py-3 rounded-xl text-sm text-white outline-none border transition-colors"
                  style={{
                    background: "var(--surface-2)",
                    borderColor: "var(--border)",
                  }}
                  onFocus={(e) => (e.currentTarget.style.borderColor = "var(--blue)")}
                  onBlur={(e) => (e.currentTarget.style.borderColor = "var(--border)")}
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-white mb-1.5">6-digit PIN</label>
              <input
                type="password"
                inputMode="numeric"
                pattern="\d{6}"
                maxLength={6}
                value={pin}
                onChange={(e) => setPin(e.target.value.replace(/\D/g, "").slice(0, 6))}
                placeholder="••••••"
                autoComplete="current-password"
                className="w-full px-4 py-3 rounded-xl text-sm text-white outline-none border transition-colors tracking-widest"
                style={{
                  background: "var(--surface-2)",
                  borderColor: "var(--border)",
                  letterSpacing: pin ? "0.5em" : undefined,
                }}
                onFocus={(e) => (e.currentTarget.style.borderColor = "var(--blue)")}
                onBlur={(e) => (e.currentTarget.style.borderColor = "var(--border)")}
              />
            </div>

            {error && (
              <div className="text-sm px-3 py-2.5 rounded-lg" style={{ background: "var(--error-dim)", color: "var(--error)" }}>
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 rounded-xl font-bold text-white transition-opacity text-sm"
              style={{ background: "var(--blue)", opacity: loading ? 0.7 : 1 }}
            >
              {loading ? "Signing in…" : "Sign in"}
            </button>
          </div>
        </form>

        <p className="text-center mt-6 text-sm" style={{ color: "var(--text-secondary)" }}>
          Don't have an account?{" "}
          <Link href="/signup">
            <span className="cursor-pointer font-medium" style={{ color: "var(--blue)" }}>
              Create one
            </span>
          </Link>
        </p>
      </div>
    </div>
  );
}
