import { useEffect, useState } from "react";

interface SplashProps {
  onDone: () => void;
}

export default function Splash({ onDone }: SplashProps) {
  const [phase, setPhase] = useState<"in" | "hold" | "out">("in");

  useEffect(() => {
    const t1 = setTimeout(() => setPhase("hold"), 200);
    const t2 = setTimeout(() => setPhase("out"),  1800);
    const t3 = setTimeout(onDone,                 2250);
    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); };
  }, [onDone]);

  return (
    <div
      aria-hidden="true"
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 9999,
        background: "#06101E",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        transition: phase === "out" ? "opacity 0.45s ease" : "opacity 0.3s ease",
        opacity: phase === "in" ? 0 : phase === "hold" ? 1 : 0,
        pointerEvents: "none",
      }}
    >
      {/* Ambient glow behind logo */}
      <div style={{
        position: "absolute",
        width: 320, height: 320,
        borderRadius: "50%",
        background: "radial-gradient(circle, rgba(27,47,78,0.6) 0%, transparent 70%)",
        filter: "blur(40px)",
      }} />

      {/* Logo — large, centred */}
      <img
        src="/payrald-logo.png"
        alt="PayRald"
        style={{
          width: 128,
          height: 128,
          objectFit: "contain",
          position: "relative",
          zIndex: 1,
          filter: "drop-shadow(0 8px 32px rgba(212,48,42,0.25)) drop-shadow(0 4px 16px rgba(240,160,32,0.2))",
        }}
      />

      {/* Wordmark */}
      <p style={{
        position: "relative",
        zIndex: 1,
        marginTop: 20,
        fontFamily: "Inter, -apple-system, sans-serif",
        fontSize: 30,
        fontWeight: 900,
        color: "#ffffff",
        letterSpacing: "-0.5px",
        lineHeight: 1,
      }}>
        PayRald
      </p>

      <p style={{
        position: "relative",
        zIndex: 1,
        marginTop: 8,
        fontFamily: "Inter, -apple-system, sans-serif",
        fontSize: 13,
        color: "rgba(255,255,255,0.4)",
        letterSpacing: "0.02em",
      }}>
        Move money at the speed of Africa
      </p>

      {/* Brand-coloured loading dots */}
      <div style={{
        position: "relative",
        zIndex: 1,
        display: "flex",
        gap: 8,
        marginTop: 52,
      }}>
        {[
          { color: "#D4302A", delay: "0s" },
          { color: "#1B2F4E", delay: "0.2s" },
          { color: "#F0A020", delay: "0.4s" },
        ].map(({ color, delay }, i) => (
          <span
            key={i}
            style={{
              width: 8,
              height: 8,
              borderRadius: "50%",
              background: color,
              display: "inline-block",
              animation: `splashBounce 1.1s ease-in-out ${delay} infinite`,
              border: i === 1 ? "1px solid rgba(168,191,221,0.4)" : "none",
            }}
          />
        ))}
      </div>

      <style>{`
        @keyframes splashBounce {
          0%, 80%, 100% { transform: scale(1); opacity: 0.7; }
          40%            { transform: scale(1.35); opacity: 1; }
        }
      `}</style>
    </div>
  );
}
