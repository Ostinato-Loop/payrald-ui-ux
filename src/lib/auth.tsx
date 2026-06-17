// RALD PayRald — Auth context
// Security: JWT stored in memory only (never localStorage/sessionStorage).
// Token is lost on page refresh — user must re-authenticate. This is intentional.
// LILCKY STUDIO LIMITED

import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { apiPost, apiFetch, setAuthToken, clearAuthToken } from "./api";

export interface AuthUser {
  id: string;
  rald_id: string;
  name: string;
  email?: string;
  phone?: string;
  kyc_tier: number;
  created_at: string;
}

interface SignUpPayload {
  raldId: string;
  name: string;
  email?: string;
  phone?: string;
  pin: string;
}

interface AuthContextValue {
  user: AuthUser | null;
  loading: boolean;
  signIn: (raldId: string, pin: string) => Promise<void>;
  signUp: (payload: SignUpPayload) => Promise<void>;
  signOut: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(false);

  const signIn = useCallback(async (raldId: string, pin: string) => {
    const data = await apiPost<{ token: string; user: AuthUser }>("/auth/signin", {
      rald_id: raldId,
      pin,
    });
    setAuthToken(data.token);
    setUser(data.user);
  }, []);

  const signUp = useCallback(async (payload: SignUpPayload) => {
    const data = await apiPost<{ token: string; user: AuthUser }>("/auth/signup", {
      rald_id: payload.raldId,
      name: payload.name,
      email: payload.email,
      phone: payload.phone,
      pin: payload.pin,
    });
    setAuthToken(data.token);
    setUser(data.user);
  }, []);

  const signOut = useCallback(() => {
    clearAuthToken();
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading, signIn, signUp, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside <AuthProvider>");
  return ctx;
}
