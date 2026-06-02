import { Link, useLocation, useNavigate } from "@tanstack/react-router";
import { useEffect, type ReactNode } from "react";
import { useAuth, type Identity } from "@/lib/auth";
import {
  Home as HomeIcon,
  Users,
  Compass,
  User,
  Bell,
  ChevronLeft,
} from "lucide-react";

export function PhoneFrame({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen w-full bg-background flex items-stretch justify-center sm:items-center sm:py-8">
      <div className="relative w-full sm:max-w-[420px] sm:rounded-[44px] sm:border sm:border-border sm:shadow-2xl sm:overflow-hidden bg-background min-h-screen sm:min-h-[860px] sm:h-[860px] sm:max-h-[860px] overflow-hidden flex flex-col">
        {children}
      </div>
    </div>
  );
}

export function RequireAuth({ children }: { children: ReactNode }) {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  useEffect(() => {
    if (!isAuthenticated) {
      navigate({ to: "/signin", search: { redirect: location.pathname } as never });
    }
  }, [isAuthenticated, navigate, location.pathname]);
  if (!isAuthenticated) return null;
  return <>{children}</>;
}

interface AppHeaderProps {
  title?: string;
  back?: boolean;
  showIdentitySwitcher?: boolean;
  showBell?: boolean;
  right?: ReactNode;
}

export function AppHeader({ title, back, showIdentitySwitcher, showBell = true, right }: AppHeaderProps) {
  const { user, identity, setIdentity } = useAuth();
  const navigate = useNavigate();
  const initial = user?.name?.[0]?.toUpperCase() ?? "P";

  return (
    <header className="sticky top-0 z-40 bg-background/85 backdrop-blur-xl px-5 pt-5 pb-3 border-b border-border/40">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3 min-w-0">
          {back ? (
            <button
              onClick={() => navigate({ to: ".." as never })}
              className="size-10 rounded-full bg-surface border border-border grid place-items-center shrink-0"
              aria-label="Back"
            >
              <ChevronLeft className="size-5" />
            </button>
          ) : (
            <div className="size-10 rounded-full bg-gradient-to-br from-primary to-primary/40 grid place-items-center text-primary-foreground font-bold shrink-0">
              {initial}
            </div>
          )}
          <div className="min-w-0">
            {title ? (
              <p className="font-bold text-base truncate">{title}</p>
            ) : (
              <>
                <p className="text-[11px] text-muted-foreground">Good morning,</p>
                <p className="font-bold text-sm truncate">{user?.name ?? "Friend"}</p>
              </>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2">
          {right}
          {showBell && (
            <Link
              to="/notifications"
              className="relative size-10 rounded-full border border-border bg-surface grid place-items-center"
              aria-label="Notifications"
            >
              <Bell className="size-4" />
              <span className="absolute top-2 right-2 size-2 rounded-full bg-primary ring-2 ring-background" />
            </Link>
          )}
        </div>
      </div>

      {showIdentitySwitcher && (
        <div className="mt-4 flex p-1 bg-surface border border-border rounded-full">
          {(["Personal", "Business", "Network"] as const).map((id) => (
            <button
              key={id}
              onClick={() => setIdentity(id)}
              className={`flex-1 py-2 text-[12px] font-semibold rounded-full transition-all ${
                identity === id
                  ? "bg-primary text-primary-foreground shadow-[0_4px_14px_-4px_oklch(0.72_0.21_240/0.6)]"
                  : "text-muted-foreground"
              }`}
            >
              {id}
            </button>
          ))}
        </div>
      )}
    </header>
  );
}

interface NavLink {
  to: string;
  label: string;
  icon: typeof HomeIcon;
}

const NAV: NavLink[] = [
  { to: "/home", label: "Home", icon: HomeIcon },
  { to: "/circles", label: "Circles", icon: Users },
  { to: "/discover", label: "Discover", icon: Compass },
  { to: "/profile", label: "Profile", icon: User },
];

export function BottomNav() {
  const location = useLocation();
  const navigate = useNavigate();
  // Split nav so Pay sits in the middle
  const left = NAV.slice(0, 2);
  const right = NAV.slice(2);

  return (
    <nav className="absolute bottom-0 inset-x-0 px-4 pb-5 pt-3 bg-background/90 backdrop-blur-xl border-t border-border z-40">
      <div className="flex items-end justify-between max-w-md mx-auto">
        {left.map((n) => (
          <NavItem key={n.to} {...n} active={location.pathname.startsWith(n.to)} />
        ))}
        <button
          onClick={() => navigate({ to: "/pay" })}
          className="relative -mt-8 size-16 rounded-2xl grid place-items-center text-primary-foreground font-extrabold tracking-tight border-4 border-background active:scale-95 transition-transform"
          style={{ background: "var(--gradient-neon)", boxShadow: "var(--glow-neon)" }}
          aria-label="Pay"
        >
          <span className="text-[13px]">PAY</span>
        </button>
        {right.map((n) => (
          <NavItem key={n.to} {...n} active={location.pathname.startsWith(n.to)} />
        ))}
      </div>
    </nav>
  );
}

function NavItem({ to, label, icon: Icon, active }: NavLink & { active?: boolean }) {
  return (
    <Link
      to={to}
      className="flex flex-col items-center gap-1 w-14"
    >
      <Icon
        className={`size-5 ${active ? "text-primary" : "text-muted-foreground"}`}
        strokeWidth={active ? 2.4 : 2}
      />
      <span
        className={`text-[10px] font-semibold ${
          active ? "text-primary" : "text-muted-foreground"
        }`}
      >
        {label}
      </span>
    </Link>
  );
}

export function ScreenScroll({ children }: { children: ReactNode }) {
  return <main className="flex-1 overflow-y-auto px-5 pt-2 pb-32 no-scrollbar">{children}</main>;
}

export function SectionHeader({ title, action, onAction }: { title: string; action?: string; onAction?: () => void }) {
  return (
    <div className="flex items-center justify-between mb-3 mt-6 first:mt-0">
      <h3 className="font-bold text-base">{title}</h3>
      {action && (
        <button onClick={onAction} className="text-[11px] font-semibold uppercase tracking-wider text-primary">
          {action}
        </button>
      )}
    </div>
  );
}

export function IdentityChip({ identity }: { identity: Identity }) {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 border border-primary/20 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-primary">
      <span className="size-1.5 rounded-full bg-primary" />
      {identity}
    </span>
  );
}
