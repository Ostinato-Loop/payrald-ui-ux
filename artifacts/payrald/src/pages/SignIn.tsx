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
    <div className="min-h-screen flex flex-col items-center justify-center px-4 py-10"
      style={{ background: "var(--bg)" }}>

      {/* Background glow */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div style={{
          position: "absolute", top: "-5%", left: "50%", transform: "translateX(-50%)",
          width: 600, height: 400, borderRadius: "50%",
          background: "radial-gradient(circle, rgba(27,47,78,0.4) 0%, transparent 70%)",
          filter: "blur(50px)",
        }} />
      </div>

      <div className="relative z-10 w-full max-w-sm">
        {/* Logo */}
        <div className="text-center mb-8">
          <Link href="/">
            <span className="inline-flex justify-center cursor-pointer">
              <Logo size="lg" />
            </span>
          </Link>
          <p className="mt-3 text-sm" style={{ color: "var(--text-secondary)" }}>Welcome back</p>
        </div>

        {/* Card */}
        <div className="rounded-2xl p-8"
          style={{
            background: "var(--surface)",
            border: "1px solid rgba(27,47,78,0.55)",
            boxShadow: "0 24px 64px rgba(0,0,0,0.4)",
          }}>
          <form onSubmit={handleSubmit} className="space-y-4">

            <div>
              <label className="block text-sm font-medium text-white mb-2">RALD ID</label>
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-sm font-medium"
                  style={{ color: "var(--amber)" }}>@</span>
                <input
                  type="text"
                  value={raldId}
                  onChange={(e) => setRaldId(e.target.value.replace(/^@/, ""))}
                  placeholder="yourname"
                  autoComplete="username"
                  className="w-full pl-8 pr-4 py-3 rounded-xl text-sm text-white outline-none transition-all"
                  style={{
                    background: "var(--surface-2)",
                    border: "1px solid rgba(27,47,78,0.5)",
                  }}
                  onFocus={(e) => (e.currentTarget.style.borderColor = "var(--navy-bright)")}
                  onBlur={(e) => (e.currentTarget.style.borderColor = "rgba(27,47,78,0.5)")}
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-white mb-2">6-digit PIN</label>
              <input
                type="password"
                inputMode="numeric"
                pattern="\d{6}"
                maxLength={6}
                value={pin}
                onChange={(e) => setPin(e.target.value.replace(/\D/g, "").slice(0, 6))}
                placeholder="••••••"
                autoComplete="current-password"
                className="w-full px-4 py-3 rounded-xl text-sm text-white outline-none transition-all tracking-widest"
                style={{
                  background: "var(--surface-2)",
                  border: "1px solid rgba(27,47,78,0.5)",
                  letterSpacing: pin ? "0.45em" : undefined,
                }}
                onFocus={(e) => (e.currentTarget.style.borderColor = "var(--navy-bright)")}
                onBlur={(e) => (e.currentTarget.style.borderColor = "rgba(27,47,78,0.5)")}
              />
            </div>

            {error && (
              <div className="text-xs px-3 py-2.5 rounded-lg"
                style={{ background: "var(--error-dim)", color: "var(--error)", border: "1px solid rgba(255,75,75,0.2)" }}>
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 rounded-xl font-bold text-white text-sm transition-all"
              style={{
                background: loading ? "var(--navy)" : "var(--red)",
                boxShadow: loading ? "none" : "0 4px 20px rgba(212,48,42,0.35)",
                opacity: loading ? 0.7 : 1,
              }}
            >
              {loading ? "Signing in…" : "Sign in"}
            </button>
          </form>
        </div>

        <p className="text-center mt-5 text-sm" style={{ color: "var(--text-secondary)" }}>
          Don't have an account?{" "}
          <Link href="/signup">
            <span className="cursor-pointer font-semibold" style={{ color: "var(--amber)" }}>Create one</span>
          </Link>
        </p>
      </div>
    </div>
  );
}
