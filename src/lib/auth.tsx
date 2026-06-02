import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";

export type Identity = "Personal" | "Business" | "Network";

export interface RaldUser {
  id: string;
  raldId: string; // @handle
  name: string;
  email?: string;
  phone?: string;
  activatedTypes: Identity[];
}

interface AuthContextValue {
  user: RaldUser | null;
  isAuthenticated: boolean;
  identity: Identity;
  setIdentity: (id: Identity) => void;
  signIn: (raldId: string, pin: string) => Promise<RaldUser>;
  signUp: (data: { name: string; raldId: string; email: string; phone: string; pin: string; activatedTypes: Identity[] }) => Promise<RaldUser>;
  signOut: () => void;
  activateType: (type: Identity) => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

const USER_KEY = "payrald.user";
const IDENTITY_KEY = "payrald.identity";

function readUser(): RaldUser | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(USER_KEY);
    return raw ? (JSON.parse(raw) as RaldUser) : null;
  } catch {
    return null;
  }
}

function readIdentity(): Identity {
  if (typeof window === "undefined") return "Personal";
  const v = localStorage.getItem(IDENTITY_KEY);
  return v === "Business" || v === "Network" ? v : "Personal";
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<RaldUser | null>(null);
  const [identity, setIdentityState] = useState<Identity>("Personal");
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setUser(readUser());
    setIdentityState(readIdentity());
    setHydrated(true);
  }, []);

  const persistUser = useCallback((u: RaldUser | null) => {
    setUser(u);
    if (typeof window !== "undefined") {
      if (u) localStorage.setItem(USER_KEY, JSON.stringify(u));
      else localStorage.removeItem(USER_KEY);
    }
  }, []);

  const setIdentity = useCallback((id: Identity) => {
    setIdentityState(id);
    if (typeof window !== "undefined") localStorage.setItem(IDENTITY_KEY, id);
  }, []);

  const signIn = useCallback(async (raldId: string, pin: string) => {
    await new Promise((r) => setTimeout(r, 600));
    if (pin.length < 4) throw new Error("PIN must be at least 4 digits");
    const cleanId = raldId.replace(/^@/, "");
    const u: RaldUser = {
      id: cleanId || "boyd",
      raldId: `@${cleanId || "boyd"}`,
      name: (cleanId || "Boyd").replace(/^./, (c) => c.toUpperCase()),
      email: `${cleanId || "boyd"}@rald.network`,
      activatedTypes: ["Personal"],
    };
    persistUser(u);
    return u;
  }, [persistUser]);

  const signUp = useCallback(async (data: { name: string; raldId: string; email: string; phone: string; pin: string; activatedTypes: Identity[] }) => {
    await new Promise((r) => setTimeout(r, 700));
    const cleanId = data.raldId.replace(/^@/, "");
    const u: RaldUser = {
      id: cleanId,
      raldId: `@${cleanId}`,
      name: data.name,
      email: data.email,
      phone: data.phone,
      activatedTypes: data.activatedTypes.length ? data.activatedTypes : ["Personal"],
    };
    persistUser(u);
    return u;
  }, [persistUser]);

  const signOut = useCallback(() => {
    persistUser(null);
    setIdentity("Personal");
  }, [persistUser, setIdentity]);

  const activateType = useCallback((type: Identity) => {
    setUser((prev) => {
      if (!prev) return prev;
      if (prev.activatedTypes.includes(type)) return prev;
      const next = { ...prev, activatedTypes: [...prev.activatedTypes, type] };
      if (typeof window !== "undefined") localStorage.setItem(USER_KEY, JSON.stringify(next));
      return next;
    });
  }, []);

  const value = useMemo<AuthContextValue>(() => ({
    user,
    isAuthenticated: !!user,
    identity,
    setIdentity,
    signIn,
    signUp,
    signOut,
    activateType,
  }), [user, identity, setIdentity, signIn, signUp, signOut, activateType]);

  // Don't render auth-dependent UI before hydration to avoid mismatch
  if (!hydrated) return <div className="min-h-screen bg-background" />;

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
}
