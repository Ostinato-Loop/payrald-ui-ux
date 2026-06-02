import raldLogo from "@/assets/rald-logo.asset.json";

export function RaldMark({ className = "size-7" }: { className?: string }) {
  return <img src={raldLogo.url} alt="RALD" className={`${className} object-contain`} />;
}
