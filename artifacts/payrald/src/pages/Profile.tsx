import { useAuth } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { useSignOut } from "@workspace/api-client-react";
import { LogOut, ShieldCheck, Star, QrCode, ChevronRight } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Link } from "wouter";

export default function Profile() {
  const { user, logout } = useAuth();
  const signOutMutation = useSignOut();

  const handleSignOut = () => {
    signOutMutation.mutate(undefined, {
      onSettled: () => {
        logout();
      }
    });
  };

  if (!user) return null;

  return (
    <div className="p-6 pt-12 space-y-8">
      <div className="flex flex-col items-center justify-center space-y-4">
        <Avatar className="h-24 w-24 border-4 border-primary/20">
          <AvatarFallback className="bg-primary/10 text-primary text-3xl font-bold">
            {user.name.charAt(0).toUpperCase()}
          </AvatarFallback>
        </Avatar>
        <div className="text-center">
          <h1 className="text-2xl font-bold">{user.name}</h1>
          <p className="text-primary font-medium">@{user.raldId}</p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="bg-card border border-border rounded-2xl p-4 flex flex-col items-center justify-center gap-2">
          <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
            <ShieldCheck className="text-primary" size={20} />
          </div>
          <p className="text-xs text-muted-foreground">KYC Tier</p>
          <p className="font-bold text-lg">Tier {user.kycTier}</p>
        </div>
        <div className="bg-card border border-border rounded-2xl p-4 flex flex-col items-center justify-center gap-2">
          <div className="w-10 h-10 bg-yellow-500/10 rounded-full flex items-center justify-center">
            <Star className="text-yellow-500" size={20} />
          </div>
          <p className="text-xs text-muted-foreground">Trust Score</p>
          <p className="font-bold text-lg">{user.trustScore}/100</p>
        </div>
      </div>

      <div className="space-y-4">
        <p className="text-sm font-semibold">Active Identities</p>
        <div className="bg-card border border-border rounded-2xl overflow-hidden divide-y divide-border">
          {user.activatedTypes.map((type) => (
            <div key={type} className="p-4 flex items-center justify-between">
              <span className="font-medium text-sm">{type}</span>
              <div className="w-2 h-2 rounded-full bg-green-500" />
            </div>
          ))}
        </div>
      </div>

      {/* QR Code card */}
      <Link href="/my-qr">
        <div className="bg-primary rounded-2xl p-4 flex items-center gap-4 cursor-pointer active:opacity-80 transition-opacity"
          style={{ background: "linear-gradient(135deg, #1B2744 0%, #243357 100%)" }}>
          <div className="w-12 h-12 rounded-xl bg-white/15 flex items-center justify-center shrink-0">
            <QrCode size={24} className="text-white" />
          </div>
          <div className="flex-1">
            <p className="font-semibold text-white text-sm">My QR Code</p>
            <p className="text-white/60 text-xs mt-0.5">Share to receive payments instantly</p>
          </div>
          <ChevronRight size={18} className="text-white/40" />
        </div>
      </Link>

      <div className="space-y-4">
        <p className="text-sm font-semibold">Account Settings</p>
        <div className="bg-card border border-border rounded-2xl overflow-hidden divide-y divide-border">
          <div className="p-4 flex flex-col gap-1">
            <span className="text-xs text-muted-foreground">Email</span>
            <span className="font-medium text-sm">{user.email || "Not provided"}</span>
          </div>
          <div className="p-4 flex flex-col gap-1">
            <span className="text-xs text-muted-foreground">Phone</span>
            <span className="font-medium text-sm">{user.phone || "Not provided"}</span>
          </div>
        </div>
      </div>

      <Button variant="destructive" className="w-full h-12" onClick={handleSignOut} disabled={signOutMutation.isPending}>
        <LogOut className="mr-2" size={18} /> Sign Out
      </Button>
    </div>
  );
}
