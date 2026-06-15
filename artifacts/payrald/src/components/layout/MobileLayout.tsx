import { ReactNode } from "react";
import { Link, useLocation } from "wouter";
import { Home, Send, ScanLine, Wallet, User as UserIcon } from "lucide-react";

export function MobileLayout({ children }: { children: ReactNode }) {
  const [location] = useLocation();

  const navItems = [
    { href: "/", label: "Home", icon: Home },
    { href: "/send", label: "Send", icon: Send },
    { href: "/pay", label: "Pay", icon: ScanLine },
    { href: "/transactions", label: "Activity", icon: Wallet },
    { href: "/profile", label: "Profile", icon: UserIcon },
  ];

  return (
    <div className="min-h-[100dvh] w-full bg-background flex justify-center">
      <div className="w-full max-w-[390px] bg-card relative shadow-xl shadow-primary/5 overflow-hidden flex flex-col border-x border-border">
        <main className="flex-1 overflow-y-auto pb-20 no-scrollbar">
          {children}
        </main>

        <nav className="absolute bottom-0 w-full bg-card/95 backdrop-blur-xl border-t border-border flex justify-between px-4 py-3 pb-5 z-50">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location === item.href || (item.href !== "/" && location.startsWith(item.href));
            return (
              <Link key={item.href} href={item.href} className="flex flex-col items-center gap-0.5">
                <div className={`p-2 rounded-xl transition-all duration-200 ${
                  isActive
                    ? 'bg-primary text-white'
                    : 'text-muted-foreground hover:text-foreground hover:bg-secondary'
                }`}>
                  <Icon size={19} strokeWidth={isActive ? 2.5 : 2} />
                </div>
                <span className={`text-[9px] font-semibold transition-colors ${isActive ? 'text-primary' : 'text-muted-foreground'}`}>
                  {item.label}
                </span>
              </Link>
            );
          })}
        </nav>
      </div>
    </div>
  );
}
