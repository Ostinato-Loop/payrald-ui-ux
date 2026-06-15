interface LogoProps {
  size?: "sm" | "md" | "lg";
  showText?: boolean;
  className?: string;
}

const sizes = {
  sm: { img: "h-7 w-7", text: "text-lg" },
  md: { img: "h-9 w-9", text: "text-xl" },
  lg: { img: "h-12 w-12", text: "text-2xl" },
};

export default function Logo({ size = "md", showText = true, className = "" }: LogoProps) {
  const s = sizes[size];
  return (
    <span className={`inline-flex items-center gap-2 ${className}`}>
      <img
        src="/payrald-logo.png"
        alt="PayRald"
        className={`${s.img} object-contain`}
        style={{ filter: "drop-shadow(0 0 6px rgba(26,111,255,0.25))" }}
      />
      {showText && (
        <span className={`font-black ${s.text} tracking-tight`}>
          <span className="text-white">Pay</span>
          <span style={{ color: "var(--blue)" }}>Rald</span>
        </span>
      )}
    </span>
  );
}
