import { Link } from "wouter";
import { useState, useEffect } from "react";
import Logo from "../components/Logo";

const aliases = ["@amaka", "08012345678", "john@gmail.com", "@busman", "+2349031234567", "@fatima"];

export default function Landing() {
  const [aliasIdx, setAliasIdx] = useState(0);
  const [fade, setFade] = useState(true);

  useEffect(() => {
    const t = setInterval(() => {
      setFade(false);
      setTimeout(() => {
        setAliasIdx((i) => (i + 1) % aliases.length);
        setFade(true);
      }, 180);
    }, 2400);
    return () => clearInterval(t);
  }, []);

  return (
    <div className="min-h-screen" style={{ background: "var(--bg)" }}>

      {/* ── Ambient background glows ── */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden" style={{ zIndex: 0 }}>
        <div style={{
          position: "absolute", top: "-10%", left: "20%",
          width: 600, height: 600, borderRadius: "50%",
          background: "radial-gradient(circle, rgba(27,47,78,0.35) 0%, transparent 70%)",
          filter: "blur(40px)",
        }} />
        <div style={{
          position: "absolute", top: "30%", right: "-5%",
          width: 400, height: 400, borderRadius: "50%",
          background: "radial-gradient(circle, rgba(212,48,42,0.12) 0%, transparent 70%)",
          filter: "blur(60px)",
        }} />
        <div style={{
          position: "absolute", bottom: "10%", left: "5%",
          width: 350, height: 350, borderRadius: "50%",
          background: "radial-gradient(circle, rgba(240,160,32,0.08) 0%, transparent 70%)",
          filter: "blur(50px)",
        }} />
      </div>

      {/* ── Nav ── */}
      <nav className="fixed top-0 inset-x-0 z-50" style={{
        borderBottom: "1px solid rgba(27,47,78,0.4)",
        background: "rgba(6,16,30,0.85)",
        backdropFilter: "blur(24px)",
      }}>
        <div className="max-w-6xl mx-auto px-5 h-16 flex items-center justify-between">
          <Logo size="sm" />
          <div className="flex items-center gap-2">
            <Link href="/signin">
              <span className="text-sm px-4 py-2 rounded-lg cursor-pointer font-medium transition-colors"
                style={{ color: "var(--text-secondary)" }}
                onMouseEnter={e => (e.currentTarget.style.color = "#fff")}
                onMouseLeave={e => (e.currentTarget.style.color = "var(--text-secondary)")}
              >
                Sign in
              </span>
            </Link>
            <Link href="/signup">
              <span className="text-sm font-bold px-5 py-2 rounded-lg cursor-pointer text-white transition-all"
                style={{ background: "var(--red)" }}
                onMouseEnter={e => (e.currentTarget.style.background = "#B82820")}
                onMouseLeave={e => (e.currentTarget.style.background = "var(--red)")}
              >
                Get started
              </span>
            </Link>
          </div>
        </div>
      </nav>

      {/* ── Hero ── */}
      <section className="relative z-10 pt-36 pb-24 px-5 text-center">
        <div className="max-w-4xl mx-auto">

          {/* Badge */}
          <div className="inline-flex items-center gap-2 mb-8 px-4 py-2 rounded-full text-xs font-semibold uppercase tracking-widest"
            style={{
              border: "1px solid rgba(27,47,78,0.7)",
              background: "rgba(27,47,78,0.25)",
              color: "#A8BFDD",
            }}>
            <span className="w-2 h-2 rounded-full animate-pulse" style={{ background: "var(--amber)" }} />
            Enterprise African payment rails
          </div>

          {/* Headline */}
          <h1 className="text-5xl sm:text-6xl lg:text-[4.5rem] font-black leading-[1.05] tracking-tight mb-6 text-white">
            Send money to<br />
            <span
              style={{
                color: "var(--amber)",
                transition: "opacity 0.18s",
                opacity: fade ? 1 : 0,
                display: "inline-block",
                minWidth: "10ch",
              }}
            >
              {aliases[aliasIdx]}
            </span>
            <br />
            not a bank number.
          </h1>

          <p className="text-lg max-w-xl mx-auto mb-10 leading-relaxed" style={{ color: "var(--text-secondary)" }}>
            PayRald routes payments using email, phone, or @username —
            powered by RALD ALIA's alias network. Instant settlement. Zero account numbers.
          </p>

          {/* CTAs */}
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link href="/signup">
              <span className="inline-flex items-center gap-2 px-8 py-4 rounded-xl font-bold text-white cursor-pointer text-sm transition-all"
                style={{ background: "var(--red)", boxShadow: "0 4px 24px rgba(212,48,42,0.35)" }}
                onMouseEnter={e => { e.currentTarget.style.background = "#B82820"; e.currentTarget.style.boxShadow = "0 4px 32px rgba(212,48,42,0.5)"; }}
                onMouseLeave={e => { e.currentTarget.style.background = "var(--red)"; e.currentTarget.style.boxShadow = "0 4px 24px rgba(212,48,42,0.35)"; }}
              >
                Open account — it's free
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </span>
            </Link>
            <Link href="/signin">
              <span className="inline-flex items-center gap-2 px-8 py-4 rounded-xl font-semibold cursor-pointer text-sm transition-all"
                style={{
                  border: "1px solid rgba(27,47,78,0.6)",
                  background: "rgba(27,47,78,0.2)",
                  color: "var(--text-secondary)",
                }}
                onMouseEnter={e => { e.currentTarget.style.background = "rgba(27,47,78,0.4)"; e.currentTarget.style.color = "#fff"; }}
                onMouseLeave={e => { e.currentTarget.style.background = "rgba(27,47,78,0.2)"; e.currentTarget.style.color = "var(--text-secondary)"; }}
              >
                Sign in
              </span>
            </Link>
          </div>

          {/* Stats strip */}
          <div className="mt-20 grid grid-cols-2 sm:grid-cols-4 gap-px overflow-hidden rounded-2xl"
            style={{ background: "rgba(27,47,78,0.3)", border: "1px solid rgba(27,47,78,0.45)" }}>
            {[
              { value: "₦0",    label: "Transfer fees",  accent: "var(--amber)" },
              { value: "<3s",   label: "Settlement",     accent: "var(--red)"   },
              { value: "99.9%", label: "Uptime SLA",     accent: "var(--amber)" },
              { value: "256-bit", label: "Encryption",   accent: "var(--red)"   },
            ].map(({ value, label, accent }) => (
              <div key={label} className="px-5 py-5 text-center" style={{ background: "var(--surface)" }}>
                <p className="text-2xl font-black" style={{ color: accent }}>{value}</p>
                <p className="text-xs mt-1 uppercase tracking-wider" style={{ color: "var(--text-muted)" }}>{label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Features ── */}
      <section className="relative z-10 py-20 px-5">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-14">
            <h2 className="text-3xl font-black text-white mb-3">Everything you need to move money in Africa</h2>
            <p className="text-sm" style={{ color: "var(--text-muted)" }}>Built for people and businesses across Nigeria</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[
              { icon: "⚡", title: "Instant transfers", color: "var(--amber)",
                desc: "Send to any Nigerian bank or wallet using @username, email, or phone. No routing numbers." },
              { icon: "🔐", title: "Bank-grade security", color: "var(--red)",
                desc: "6-digit PIN + AES-256 encryption. Every transaction is signed and audited." },
              { icon: "💳", title: "Virtual account", color: "var(--amber)",
                desc: "Get your own NGN virtual account. Receive payments from anywhere." },
              { icon: "📊", title: "Real-time analytics", color: "var(--red)",
                desc: "Track your spending, income, and monthly trends in one dashboard." },
              { icon: "🏦", title: "Bank withdrawals", color: "var(--amber)",
                desc: "Withdraw to any Nigerian bank in seconds. ₦50 flat fee, no surprises." },
              { icon: "🤝", title: "ALIA-powered", color: "var(--red)",
                desc: "Built on RALD ALIA — Africa's financial identity infrastructure." },
            ].map(({ icon, title, desc, color }) => (
              <div key={title} className="p-6 rounded-2xl transition-all cursor-default"
                style={{
                  background: "var(--surface)",
                  border: "1px solid rgba(27,47,78,0.4)",
                }}>
                <div className="w-11 h-11 rounded-xl flex items-center justify-center text-xl mb-4"
                  style={{ background: "rgba(27,47,78,0.4)", border: `1px solid ${color}22` }}>
                  {icon}
                </div>
                <h3 className="text-sm font-bold text-white mb-2">{title}</h3>
                <p className="text-sm leading-relaxed" style={{ color: "var(--text-secondary)" }}>{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA banner ── */}
      <section className="relative z-10 py-20 px-5">
        <div className="max-w-2xl mx-auto rounded-3xl overflow-hidden relative"
          style={{
            background: "linear-gradient(135deg, #0F1E33 0%, #1B2F4E 60%, #243D62 100%)",
            border: "1px solid rgba(46,79,128,0.5)",
          }}>
          <div className="absolute top-0 right-0 w-64 h-64 opacity-20" style={{
            background: "radial-gradient(circle at top right, var(--amber), transparent 65%)",
          }} />
          <div className="relative z-10 p-10 text-center">
            <div className="flex justify-center mb-6">
              <img src="/payrald-logo.png" alt="PayRald" className="h-16 w-auto" />
            </div>
            <h2 className="text-3xl font-black text-white mb-3">Ready to move money faster?</h2>
            <p className="text-sm mb-8" style={{ color: "var(--text-secondary)" }}>
              Join thousands of Nigerians sending money with just a username.
            </p>
            <Link href="/signup">
              <span className="inline-flex items-center gap-2 px-8 py-4 rounded-xl font-bold text-white cursor-pointer text-sm"
                style={{ background: "var(--red)", boxShadow: "0 4px 24px rgba(212,48,42,0.4)" }}>
                Create your account →
              </span>
            </Link>
          </div>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="relative z-10 py-8 px-5 text-center text-sm"
        style={{ borderTop: "1px solid rgba(27,47,78,0.35)", color: "var(--text-muted)" }}>
        <div className="flex justify-center mb-4">
          <Logo size="xs" />
        </div>
        <p>© 2026 LILCKY STUDIO LIMITED · PayRald is powered by RALD.cloud</p>
        <p className="mt-1 flex items-center justify-center gap-3">
          <a href="https://rald.cloud" style={{ color: "var(--text-muted)" }} className="hover:underline">rald.cloud</a>
          <span>·</span>
          <a href="https://alia.rald.cloud" style={{ color: "var(--text-muted)" }} className="hover:underline">ALIA</a>
        </p>
      </footer>
    </div>
  );
}
