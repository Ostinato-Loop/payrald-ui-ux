interface LogoProps {
  size?: "xs" | "sm" | "md" | "lg";
  showText?: boolean;
  className?: string;
}

const cfg = {
  xs: { h: "h-6",  text: "text-base" },
  sm: { h: "h-7",  text: "text-lg"   },
  md: { h: "h-9",  text: "text-xl"   },
  lg: { h: "h-11", text: "text-2xl"  },
};

export default function Logo({ size = "md", showText = true, className = "" }: LogoProps) {
  const c = cfg[size];
  return (
    <span className={`inline-flex items-center gap-2.5 ${className}`}>
      <img
        src="/payrald-logo-dark.png"
        alt="PayRald"
        className={`${c.h} w-auto object-contain`}
        draggable={false}
      />
      {showText && (
        <span className={`font-black ${c.text} tracking-tight leading-none text-white`}>
          PayRald
        </span>
      )}
    </span>
  );
}
