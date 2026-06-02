import { createFileRoute } from "@tanstack/react-router";
import { AppHeader, ScreenScroll } from "@/components/AppShell";

export const Route = createFileRoute("/_authenticated/notifications")({
  head: () => ({ meta: [{ title: "Notifications" }] }),
  component: Notifications,
});

const NOTIFS = [
  { c: "Payments", items: [
    { t: "Payment received", s: "₦50,000 from Family Circle", time: "2m ago", unread: true },
    { t: "Pending approval", s: "Tunde requested ₦12,000 for split bill", time: "1h ago", unread: true },
  ]},
  { c: "Circles", items: [
    { t: "Lagos Techies vote", s: "Vote on new venue closes today", time: "3h ago", unread: false },
    { t: "New member", s: "Femi joined Creator Collective", time: "Yesterday", unread: false },
  ]},
  { c: "Goals", items: [
    { t: "Goal milestone", s: "Lagos Studio reached 72%", time: "Yesterday", unread: false },
  ]},
  { c: "System", items: [
    { t: "Security tip", s: "Turn on biometric auth for faster sign-in", time: "2d ago", unread: false },
  ]},
];

function Notifications() {
  return (
    <>
      <AppHeader title="Notifications" back showBell={false} />
      <ScreenScroll>
        {NOTIFS.map((g) => (
          <div key={g.c} className="mt-4 first:mt-2">
            <p className="text-[10px] uppercase tracking-widest text-muted-foreground font-semibold mb-2">{g.c}</p>
            <div className="space-y-2">
              {g.items.map((n) => (
                <div key={n.t} className={`p-4 rounded-2xl border ${n.unread ? "border-primary/30 bg-primary/5" : "border-border bg-surface"}`}>
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <p className="font-bold text-sm">{n.t}</p>
                        {n.unread && <span className="size-1.5 rounded-full bg-primary" />}
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">{n.s}</p>
                    </div>
                    <span className="text-[10px] text-muted-foreground whitespace-nowrap">{n.time}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </ScreenScroll>
    </>
  );
}
