import { createFileRoute, Outlet } from "@tanstack/react-router";
import { PhoneFrame, RequireAuth, BottomNav } from "@/components/AppShell";

export const Route = createFileRoute("/_authenticated")({
  component: AuthenticatedLayout,
});

function AuthenticatedLayout() {
  return (
    <PhoneFrame>
      <RequireAuth>
        <Outlet />
        <BottomNav />
      </RequireAuth>
    </PhoneFrame>
  );
}
