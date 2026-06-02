import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { AppHeader, ScreenScroll } from "@/components/AppShell";
import { useState } from "react";
import { ChevronLeft, Check, Loader2 } from "lucide-react";

export const Route = createFileRoute("/_authenticated/circles/new")({
  head: () => ({ meta: [{ title: "Create Circle" }] }),
  component: NewCircle,
});

function NewCircle() {
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [desc, setDesc] = useState("");
  const [privacy, setPrivacy] = useState<"Private" | "Invite" | "Public">("Invite");
  const [loading, setLoading] = useState(false);

  const submit = async () => {
    setLoading(true);
    await new Promise(r => setTimeout(r, 600));
    navigate({ to: "/circles" });
  };

  return (
    <>
      <AppHeader title="New Circle" back showBell={false} />
      <ScreenScroll>
        <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Circle name</label>
        <input
          autoFocus
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="e.g. Family Fund"
          className="mt-2 w-full h-14 rounded-2xl border border-border bg-surface px-4 outline-none focus:border-primary"
        />

        <label className="mt-5 block text-xs font-semibold text-muted-foreground uppercase tracking-wider">Description</label>
        <textarea
          value={desc}
          onChange={(e) => setDesc(e.target.value)}
          placeholder="What is this circle for?"
          rows={3}
          className="mt-2 w-full rounded-2xl border border-border bg-surface px-4 py-3 outline-none focus:border-primary"
        />

        <label className="mt-5 block text-xs font-semibold text-muted-foreground uppercase tracking-wider">Privacy</label>
        <div className="mt-2 space-y-2">
          {(["Private", "Invite", "Public"] as const).map((p) => (
            <button
              key={p}
              onClick={() => setPrivacy(p)}
              className={`w-full flex items-center justify-between p-4 rounded-2xl border ${privacy === p ? "border-primary bg-primary/5" : "border-border bg-surface"}`}
            >
              <div className="text-left">
                <p className="font-semibold text-sm">{p}</p>
                <p className="text-[11px] text-muted-foreground">{p === "Private" ? "Only you can invite" : p === "Invite" ? "Members invite others" : "Anyone with link can join"}</p>
              </div>
              <div className={`size-5 rounded-full grid place-items-center ${privacy === p ? "bg-primary" : "border-2 border-border"}`}>
                {privacy === p && <Check className="size-3 text-primary-foreground" />}
              </div>
            </button>
          ))}
        </div>

        <button
          onClick={submit}
          disabled={!name || loading}
          className="mt-6 w-full h-14 rounded-2xl bg-primary text-primary-foreground font-semibold disabled:opacity-40 flex items-center justify-center gap-2"
        >
          {loading && <Loader2 className="size-4 animate-spin" />}
          Create Circle
        </button>

        <Link to="/circles" className="mt-3 block text-center text-xs text-muted-foreground">
          <ChevronLeft className="inline size-3" /> Cancel
        </Link>
      </ScreenScroll>
    </>
  );
}
