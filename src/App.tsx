import { Switch, Route, Redirect } from "wouter";
import { useAuth } from "./lib/auth";
import Landing from "./pages/Landing";
import SignIn from "./pages/SignIn";
import SignUp from "./pages/SignUp";
import Dashboard from "./pages/Dashboard";
import Send from "./pages/Send";
import History from "./pages/History";
import Withdraw from "./pages/Withdraw";
import Vouchers from "./pages/Vouchers";

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: "var(--bg)" }}>
        <div className="w-8 h-8 border-2 border-t-transparent rounded-full animate-spin" style={{ borderColor: "var(--blue)", borderTopColor: "transparent" }} />
      </div>
    );
  }
  if (!user) return <Redirect to="/signin" />;
  return <>{children}</>;
}

function GuestRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: "var(--bg)" }}>
        <div className="w-8 h-8 border-2 border-t-transparent rounded-full animate-spin" style={{ borderColor: "var(--blue)", borderTopColor: "transparent" }} />
      </div>
    );
  }
  if (user) return <Redirect to="/dashboard" />;
  return <>{children}</>;
}

export default function App() {
  return (
    <Switch>
      <Route path="/">
        <GuestRoute>
          <Landing />
        </GuestRoute>
      </Route>
      <Route path="/signin">
        <GuestRoute>
          <SignIn />
        </GuestRoute>
      </Route>
      <Route path="/signup">
        <GuestRoute>
          <SignUp />
        </GuestRoute>
      </Route>
      <Route path="/dashboard">
        <ProtectedRoute>
          <Dashboard />
        </ProtectedRoute>
      </Route>
      <Route path="/send">
        <ProtectedRoute>
          <Send />
        </ProtectedRoute>
      </Route>
      <Route path="/history">
        <ProtectedRoute>
          <History />
        </ProtectedRoute>
      </Route>
      <Route path="/withdraw">
        <ProtectedRoute>
          <Withdraw />
        </ProtectedRoute>
      </Route>
      <Route path="/vouchers">
        <ProtectedRoute>
          <Vouchers />
        </ProtectedRoute>
      </Route>
      <Route>
        <Redirect to="/" />
      </Route>
    </Switch>
  );
}
