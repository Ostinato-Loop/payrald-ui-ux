export function PayRaldLogo({ className = "", size = "md" }: { className?: string; size?: "sm" | "md" | "lg" }) {
  const sizes = {
    sm: { box: "size-8", text: "text-base", letter: "text-sm" },
    md: { box: "size-10", text: "text-xl", letter: "text-lg" },
    lg: { box: "size-14", text: "text-3xl", letter: "text-2xl" },
  };
  const s = sizes[size];
  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <div className={`relative ${s.box} rounded-2xl bg-primary grid place-items-center shadow-[0_8px_24px_-8px_oklch(0.72_0.21_240/0.7)]`}>
        <span className={`font-extrabold text-primary-foreground ${s.letter} tracking-tighter`}>P</span>
        <div className="absolute -bottom-0.5 -right-0.5 size-2.5 rounded-full bg-background border-2 border-primary" />
      </div>
      <span className={`font-extrabold tracking-tight text-foreground ${s.text}`}>
        Pay<span className="text-primary">Rald</span>
      </span>
    </div>
  );
}

