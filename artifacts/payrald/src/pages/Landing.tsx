import { Link } from "wouter";
import { useState, useEffect } from "react";

const aliases = ["@amaka", "08012345678", "john@gmail.com", "@busman", "+2349031234567", "@fatima"];

export default function Landing() {
  const [aliasIdx, setAliasIdx] = useState(0);

  useEffect(() => {
    const t = setInterval(() => setAliasIdx((i) => (i + 1) % aliases.length), 2000);
    return () => clearInterval(t);
  }, []);

  return (
    <div className="min-h-screen" style={{ background: "var(--bg)" }}>
      {/* Nav */}
      <nav className="fixed top-0 inset-x-0 z-50 border-b" style={{ borderColor: "var(--border)", background: "rgba(4,12,24,0.9)", backdropFilter: "blur(16px)" }}>
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="font-black text-xl text-white tracking-tight">Pay</span>
            <span className="font-black text-xl tracking-tight" style={{ color: "var(--blue)" }}>Rald</span>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/signin">
              <span className="text-sm cursor-pointer" style={{ color: "var(--text-secondary)" }}>Sign in</span>
            </Link>
            <Link href="/signup">
              <span className="text-sm font-semibold px-4 py-2 rounded-lg cursor-pointer text-white transition-colors" style={{ background: "var(--blue)" }}>
                Get started
              </span>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="pt-32 pb-24 px-4 text-center relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none" style={{ background: "radial-gradient(60% 50% at 50% 0%, rgba(0,102,255,0.15) 0%, transparent 70%)" }} />
        <div className="relative z-10 max-w-4xl mx-auto">
          <div className="inline-flex items-center gap-2 mb-8 px-3 py-1.5 rounded-full border text-xs font-medium" style={{ borderColor: "rgba(0,102,255,0.3)", background: "rgba(0,102,255,0.08)", color: "var(--blue)" }}>
            <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: "var(--blue)" }} />
            Enterprise-grade African payment rails
          </div>

          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-black leading-tight mb-6 text-white">
            Send money to
            <br />
            <span className="font-mono transition-all duration-300" style={{ color: "var(--blue)" }}>{aliases[aliasIdx]}</span>
            <br />
            not a bank number.
          </h1>

          <p className="text-lg max-w-2xl mx-auto mb-10 leading-relaxed" style={{ color: "var(--text-secondary)" }}>
            PayRald routes payments using email, phone, or @username — powered by RALD ALIA's
            alias resolution network. Instant settlement. Zero account numbers.
          </p>

          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link href="/signup">
              <span className="inline-flex items-center gap-2 px-8 py-4 rounded-xl font-bold text-white cursor-pointer transition-all" style={{ background: "var(--blue)" }}>
                Open account — it's free
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </span>
            </Link>
            <Link href="/signin">
              <span className="inline-flex items-center gap-2 px-8 py-4 rounded-xl font-semibold cursor-pointer border transition-all" style={{ color: "var(--text-secondary)", borderColor: "var(--border)" }}>
                Sign in
              </span>
            </Link>
          </div>

          {/* Stats */}
          <div className="mt-20 grid grid-cols-2 sm:grid-cols-4 gap-px rounded-2xl overflow-hidden border" style={{ borderColor: "var(--border)", background: "var(--border)" }}>
            {[
              { value: "₦0", label: "Transfer fees" },
              { value: "<3s", label: "Settlement time" },
              { value: "99.9%", label: "Uptime SLA" },
              { value: "256-bit", label: "AES Encryption" },
            ].map(({ value, label }) => (
              <div key={label} className="px-6 py-5 text-center" style={{ background: "var(--surface)" }}>
                <p className="text-2xl font-black text-white">{value}</p>
                <p className="text-xs mt-1 uppercase tracking-wider" style={{ color: "var(--text-muted)" }}>{label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 px-4 max-w-6xl mx-auto">
        <h2 className="text-3xl font-black text-white text-center mb-12">
          Everything you need to move money in Africa
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[
            { icon: "⚡", title: "Instant transfers", desc: "Send to any Nigerian bank or wallet using @username, email, or phone. No routing numbers." },
            { icon: "🔐", title: "Bank-grade security", desc: "6-digit PIN + AES-256 encryption. Every transaction is signed and audited." },
            { icon: "💳", title: "Virtual account", desc: "Get your own NGN virtual account number. Receive payments from anywhere." },
            { icon: "📊", title: "Real-time analytics", desc: "Track your spending, income, and monthly trends in one place." },
            { icon: "🏦", title: "Bank withdrawals", desc: "Withdraw to any Nigerian bank account in seconds. ₦50 flat fee." },
            { icon: "🤝", title: "ALIA-powered", desc: "Built on RALD ALIA — Africa's financial identity infrastructure." },
          ].map(({ icon, title, desc }) => (
            <div key={title} className="p-6 rounded-2xl border" style={{ background: "var(--surface)", borderColor: "var(--border)" }}>
              <span className="text-3xl mb-4 block">{icon}</span>
              <h3 className="text-base font-bold text-white mb-2">{title}</h3>
              <p className="text-sm leading-relaxed" style={{ color: "var(--text-secondary)" }}>{desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-4 text-center">
        <div className="max-w-xl mx-auto p-10 rounded-3xl border" style={{ background: "var(--surface)", borderColor: "var(--border)" }}>
          <h2 className="text-3xl font-black text-white mb-4">Ready to move money faster?</h2>
          <p className="mb-8 text-sm" style={{ color: "var(--text-secondary)" }}>
            Join thousands of Nigerians sending money with just a username.
          </p>
          <Link href="/signup">
            <span className="inline-flex items-center gap-2 px-8 py-4 rounded-xl font-bold text-white cursor-pointer" style={{ background: "var(--blue)" }}>
              Create your account →
            </span>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t py-8 px-4 text-center text-sm" style={{ borderColor: "var(--border)", color: "var(--text-muted)" }}>
        <p>© 2026 LILCKY STUDIO LIMITED · PayRald is powered by RALD.cloud</p>
        <p className="mt-1">
          <a href="https://rald.cloud" className="hover:underline">rald.cloud</a>
          {" · "}
          <a href="https://alia.rald.cloud" className="hover:underline">ALIA</a>
        </p>
      </footer>
    </div>
  );
}
