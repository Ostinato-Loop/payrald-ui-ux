import { createContext, useContext, useState, useEffect, type ReactNode } from "react";
import { api } from "./api";

export type AuthUser = {
  id: string;
  raldId: string;
  name: string;
  email?: string | null;
  phone?: string | null;
  kycTier: number;
  trustScore: number;
  activatedTypes: string[];
  createdAt: string;
};

type AuthCtx = {
  user: AuthUser | null;
  token: string | null;
  loading: boolean;
  signIn: (raldId: string, pin: string) => Promise<void>;
  signUp: (data: SignUpData) => Promise<void>;
  signOut: () => void;
};

type SignUpData = {
  raldId: string;
  name: string;
  email?: string;
  phone?: string;
  pin: string;
};

const AuthContext = createContext<AuthCtx | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [token, setToken] = useState<string | null>(() =>
    localStorage.getItem("payrald_token"),
  );
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!token) {
      setLoading(false);
      return;
    }
    api
      .get<AuthUser>("/auth/me")
      .then((u) => setUser(u))
      .catch(() => {
        localStorage.removeItem("payrald_token");
        setToken(null);
      })
      .finally(() => setLoading(false));
  }, [token]);

  const signIn = async (raldId: string, pin: string) => {
    const res = await api.post<{ user: AuthUser; token: string }>(
      "/auth/signin",
      { raldId, pin },
    );
    localStorage.setItem("payrald_token", res.token);
    setToken(res.token);
    setUser(res.user);
  };

  const signUp = async (data: SignUpData) => {
    const res = await api.post<{ user: AuthUser; token: string }>(
      "/auth/signup",
      data,
    );
    localStorage.setItem("payrald_token", res.token);
    setToken(res.token);
    setUser(res.user);
  };

  const signOut = () => {
    localStorage.removeItem("payrald_token");
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, signIn, signUp, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthCtx {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be inside AuthProvider");
  return ctx;
}
