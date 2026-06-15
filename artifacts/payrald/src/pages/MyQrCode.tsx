import { useRef } from "react";
import { useAuth } from "@/lib/auth";
import { useLocation } from "wouter";
import { QRCodeCanvas } from "qrcode.react";
import { ArrowLeft, Download, Share2 } from "lucide-react";
import { motion } from "framer-motion";
import { useToast } from "@/hooks/use-toast";
import payraldLogo from "/payrald-logo.png";

export default function MyQrCode() {
  const { user } = useAuth();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const cardRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  if (!user) return null;

  const handle   = `@${user.raldId}`;
  const qrValue  = `payrald:${handle}`;
  const cardSize = 280; // px — the hidden canvas QR size for export

  async function handleDownload() {
    // Find the qrcode.react canvas inside the card
    const qrCanvas = cardRef.current?.querySelector("canvas") as HTMLCanvasElement | null;
    if (!qrCanvas) return;

    // Build a branded export canvas
    const CARD_W = 560, CARD_H = 680, PAD = 40;
    const out = document.createElement("canvas");
    out.width  = CARD_W;
    out.height = CARD_H;
    const ctx = out.getContext("2d")!;

    // Background
    ctx.fillStyle = "#FFFFFF";
    ctx.beginPath();
    roundRect(ctx, 0, 0, CARD_W, CARD_H, 32);
    ctx.fill();

    // Navy top stripe
    ctx.fillStyle = "#1B2744";
    ctx.beginPath();
    roundRect(ctx, 0, 0, CARD_W, 140, 32);
    ctx.fill();
    ctx.fillRect(0, 108, CARD_W, 32); // square off bottom of stripe

    // Logo image (try to load from public)
    try {
      const img = await loadImage(payraldLogo);
      const logoH = 48, logoW = (img.width / img.height) * logoH;
      ctx.drawImage(img, (CARD_W - logoW) / 2, 28, logoW, logoH);
    } catch {
      // fallback: text
      ctx.fillStyle = "#FFFFFF";
      ctx.font = "bold 28px system-ui";
      ctx.textAlign = "center";
      ctx.fillText("PayRald", CARD_W / 2, 80);
    }

    // QR code (scale up 2×)
    const QR_SIZE = CARD_W - PAD * 2;
    ctx.drawImage(qrCanvas, PAD, 160, QR_SIZE, QR_SIZE);

    // Handle text
    ctx.fillStyle = "#1B2744";
    ctx.font = "bold 28px system-ui";
    ctx.textAlign = "center";
    ctx.fillText(handle, CARD_W / 2, 160 + QR_SIZE + 44);

    ctx.fillStyle = "#6B7280";
    ctx.font = "18px system-ui";
    ctx.fillText(user.name, CARD_W / 2, 160 + QR_SIZE + 76);

    // Bottom tip
    ctx.fillStyle = "#D4922A";
    ctx.font = "bold 15px system-ui";
    ctx.fillText("Scan to pay with PayRald", CARD_W / 2, CARD_H - 28);

    // Red + gold pills (logo accent strip)
    const pillY = CARD_H - 14, pillH = 6, pillW = 48, gap = 8;
    const totalW = pillW * 3 + gap * 2;
    const startX = (CARD_W - totalW) / 2;
    ctx.beginPath(); roundRect(ctx, startX, pillY - pillH, pillW, pillH, 3);
    ctx.fillStyle = "#CC2A2A"; ctx.fill();
    ctx.beginPath(); roundRect(ctx, startX + pillW + gap, pillY - pillH, pillW, pillH, 3);
    ctx.fillStyle = "#1B2744"; ctx.fill();
    ctx.beginPath(); roundRect(ctx, startX + (pillW + gap) * 2, pillY - pillH, pillW, pillH, 3);
    ctx.fillStyle = "#D4922A"; ctx.fill();

    // Download
    const a = document.createElement("a");
    a.download = `payrald-qr-${user.raldId}.png`;
    a.href = out.toDataURL("image/png");
    a.click();

    toast({ title: "QR code saved!", description: "Share it with anyone to receive PayRald payments." });
  }

  async function handleShare() {
    const qrCanvas = cardRef.current?.querySelector("canvas") as HTMLCanvasElement | null;
    if (!qrCanvas) return;

    try {
      const blob: Blob = await new Promise((res) => qrCanvas.toBlob((b) => res(b!), "image/png"));
      const file = new File([blob], `payrald-${user.raldId}.png`, { type: "image/png" });

      if (navigator.share && navigator.canShare?.({ files: [file] })) {
        await navigator.share({
          title: "My PayRald QR Code",
          text: `Pay me on PayRald: ${handle}`,
          files: [file],
        });
      } else if (navigator.share) {
        await navigator.share({ title: "My PayRald QR Code", text: `Pay me on PayRald: ${handle}\nScan or send to ${qrValue}` });
      } else {
        await navigator.clipboard.writeText(qrValue);
        toast({ title: "Link copied!", description: `${qrValue} copied to clipboard.` });
      }
    } catch (err: any) {
      if (err?.name !== "AbortError") {
        toast({ variant: "destructive", title: "Share failed", description: "Try downloading instead." });
      }
    }
  }

  return (
    <div className="p-6 pt-10 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <button
          onClick={() => setLocation("/profile")}
          className="w-10 h-10 bg-card rounded-full flex items-center justify-center border border-border"
        >
          <ArrowLeft size={18} />
        </button>
        <div>
          <h1 className="text-xl font-bold leading-tight">My QR Code</h1>
          <p className="text-xs text-muted-foreground">Let anyone scan to pay you</p>
        </div>
      </div>

      {/* QR Card */}
      <motion.div
        ref={cardRef}
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
        className="flex flex-col items-center"
      >
        <div className="w-full max-w-[320px] mx-auto bg-white rounded-3xl shadow-lg shadow-primary/10 border border-border overflow-hidden">
          {/* Navy header */}
          <div
            className="flex flex-col items-center justify-center py-5 gap-1"
            style={{ background: "linear-gradient(135deg, #1B2744 0%, #243357 100%)" }}
          >
            <img src={payraldLogo} alt="PayRald" className="h-8 object-contain" />
          </div>

          {/* QR Code */}
          <div className="flex flex-col items-center px-8 pt-6 pb-5 gap-4">
            <div className="p-3 rounded-2xl bg-white border border-border shadow-sm">
              <QRCodeCanvas
                value={qrValue}
                size={200}
                level="H"
                marginSize={1}
                fgColor="#1B2744"
                bgColor="#FFFFFF"
                imageSettings={{
                  src: "/payrald-icon-192.png",
                  width: 36,
                  height: 36,
                  excavate: true,
                }}
              />
            </div>

            <div className="text-center">
              <p className="text-primary font-bold text-lg tracking-tight">{handle}</p>
              <p className="text-muted-foreground text-sm mt-0.5">{user.name}</p>
            </div>
          </div>

          {/* Bottom accent */}
          <div className="flex justify-center gap-2 pb-5">
            <p className="text-xs text-muted-foreground">Scan to pay with PayRald</p>
          </div>

          {/* Pill strip — matching the logo */}
          <div className="flex justify-center gap-1.5 pb-4">
            <div className="h-1.5 w-10 rounded-full bg-[#CC2A2A]" />
            <div className="h-1.5 w-10 rounded-full bg-[#1B2744]" />
            <div className="h-1.5 w-10 rounded-full bg-[#D4922A]" />
          </div>
        </div>
      </motion.div>

      {/* Info pill */}
      <p className="text-center text-xs text-muted-foreground px-4">
        Anyone with the PayRald app can scan this code to send you money instantly.
      </p>

      {/* Action buttons */}
      <div className="flex gap-3 max-w-[320px] mx-auto w-full">
        <button
          onClick={handleDownload}
          className="flex-1 flex items-center justify-center gap-2 bg-primary text-white font-semibold py-3 rounded-xl text-sm transition-opacity active:opacity-80"
          style={{ background: "linear-gradient(135deg, #1B2744 0%, #243357 100%)" }}
        >
          <Download size={16} /> Save Image
        </button>
        <button
          onClick={handleShare}
          className="flex-1 flex items-center justify-center gap-2 bg-card border border-border text-foreground font-semibold py-3 rounded-xl text-sm transition-colors hover:bg-secondary"
        >
          <Share2 size={16} /> Share
        </button>
      </div>

      {/* QR value chip */}
      <div className="flex justify-center">
        <div className="bg-secondary border border-border rounded-full px-4 py-1.5 flex items-center gap-2">
          <div className="w-1.5 h-1.5 rounded-full bg-[#D4922A]" />
          <span className="text-xs font-mono text-muted-foreground">{qrValue}</span>
        </div>
      </div>
    </div>
  );
}

// ── helpers ──────────────────────────────────────────────────────────────────

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((res, rej) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload  = () => res(img);
    img.onerror = rej;
    img.src     = src;
  });
}

function roundRect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + r);
  ctx.lineTo(x + w, y + h - r);
  ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  ctx.lineTo(x + r, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - r);
  ctx.lineTo(x, y + r);
  ctx.quadraticCurveTo(x, y, x + r, y);
  ctx.closePath();
}
