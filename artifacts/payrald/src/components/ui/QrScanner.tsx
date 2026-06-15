import { useEffect, useRef, useState, useCallback } from "react";
import jsQR from "jsqr";
import { X, Camera, ZapOff } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface QrScannerProps {
  onScan: (value: string) => void;
  onClose: () => void;
}

type ScanState = "requesting" | "scanning" | "denied" | "unsupported";

export function QrScanner({ onScan, onClose }: QrScannerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rafRef    = useRef<number>(0);
  const streamRef = useRef<MediaStream | null>(null);

  const [scanState, setScanState] = useState<ScanState>("requesting");
  const [detected, setDetected]   = useState(false);

  const stopStream = useCallback(() => {
    cancelAnimationFrame(rafRef.current);
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
  }, []);

  const handleClose = useCallback(() => {
    stopStream();
    onClose();
  }, [stopStream, onClose]);

  // Parse PayRald QR payload: "payrald:@handle", "payrald:handle", or raw "@handle" / "handle"
  function extractHandle(raw: string): string | null {
    const s = raw.trim();
    // payrald: scheme
    const schemed = s.match(/^payrald:[@]?(.+)$/i);
    if (schemed) return "@" + schemed[1].replace(/^@/, "");
    // bare @handle or handle (no spaces, no URL)
    if (/^@?[\w.-]+$/.test(s)) return "@" + s.replace(/^@/, "");
    return null;
  }

  useEffect(() => {
    let mounted = true;

    async function startCamera() {
      if (!navigator.mediaDevices?.getUserMedia) {
        setScanState("unsupported");
        return;
      }

      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: "environment", width: { ideal: 1280 }, height: { ideal: 720 } },
        });
        if (!mounted) { stream.getTracks().forEach((t) => t.stop()); return; }

        streamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          await videoRef.current.play();
        }
        setScanState("scanning");
        tick();
      } catch (err: any) {
        if (!mounted) return;
        const name = err?.name ?? "";
        setScanState(name === "NotAllowedError" || name === "PermissionDeniedError" ? "denied" : "unsupported");
      }
    }

    function tick() {
      const video  = videoRef.current;
      const canvas = canvasRef.current;
      if (!video || !canvas || video.readyState < 2) {
        rafRef.current = requestAnimationFrame(tick);
        return;
      }

      canvas.width  = video.videoWidth;
      canvas.height = video.videoHeight;
      const ctx = canvas.getContext("2d", { willReadFrequently: true })!;
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      const img = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const code = jsQR(img.data, img.width, img.height, { inversionAttempts: "dontInvert" });

      if (code) {
        const handle = extractHandle(code.data);
        if (handle) {
          setDetected(true);
          stopStream();
          // brief flash then callback
          setTimeout(() => {
            if (mounted) onScan(handle);
          }, 450);
          return;
        }
      }

      rafRef.current = requestAnimationFrame(tick);
    }

    startCamera();

    return () => {
      mounted = false;
      stopStream();
    };
  }, []);

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 bg-black flex flex-col"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 pt-12 pb-4 z-10">
          <div>
            <p className="text-white font-semibold text-lg">Scan QR Code</p>
            <p className="text-white/50 text-xs mt-0.5">Point at a PayRald merchant QR code</p>
          </div>
          <button
            onClick={handleClose}
            className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center"
          >
            <X size={20} className="text-white" />
          </button>
        </div>

        {/* Viewfinder area */}
        <div className="relative flex-1 flex items-center justify-center overflow-hidden">
          {/* Live video */}
          <video
            ref={videoRef}
            className="absolute inset-0 w-full h-full object-cover"
            playsInline
            muted
          />

          {/* Scanner frame overlay */}
          {scanState === "scanning" && !detected && (
            <div className="relative z-10 w-64 h-64">
              {/* Dimmed outer mask via box-shadow */}
              <div className="absolute inset-0 rounded-2xl"
                style={{ boxShadow: "0 0 0 9999px rgba(0,0,0,0.55)" }} />
              {/* Corner brackets */}
              {[
                "top-0 left-0 border-t-[3px] border-l-[3px] rounded-tl-2xl",
                "top-0 right-0 border-t-[3px] border-r-[3px] rounded-tr-2xl",
                "bottom-0 left-0 border-b-[3px] border-l-[3px] rounded-bl-2xl",
                "bottom-0 right-0 border-b-[3px] border-r-[3px] rounded-br-2xl",
              ].map((cls, i) => (
                <div key={i} className={`absolute w-8 h-8 border-white ${cls}`} />
              ))}
              {/* Scanning line */}
              <motion.div
                className="absolute left-2 right-2 h-0.5 bg-[#D4922A] rounded-full"
                initial={{ top: "8px" }}
                animate={{ top: "calc(100% - 10px)" }}
                transition={{ duration: 2, repeat: Infinity, repeatType: "reverse", ease: "linear" }}
              />
            </div>
          )}

          {/* Detected flash */}
          {detected && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              className="relative z-10 w-64 h-64 rounded-2xl flex items-center justify-center"
              style={{ background: "rgba(27,39,68,0.9)" }}
            >
              <div className="text-center">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", stiffness: 300 }}
                  className="w-16 h-16 rounded-full bg-[#D4922A] flex items-center justify-center mx-auto mb-3"
                >
                  <Camera size={28} className="text-white" />
                </motion.div>
                <p className="text-white font-semibold text-sm">QR Detected!</p>
              </div>
            </motion.div>
          )}

          {/* Permission denied */}
          {scanState === "denied" && (
            <div className="relative z-10 text-center px-8">
              <ZapOff size={40} className="text-white/40 mx-auto mb-4" />
              <p className="text-white font-semibold mb-2">Camera access denied</p>
              <p className="text-white/50 text-sm">Allow camera access in your browser settings, then try again.</p>
              <button onClick={handleClose} className="mt-6 bg-white/10 text-white px-6 py-2.5 rounded-xl text-sm font-medium">
                Go back
              </button>
            </div>
          )}

          {/* Unsupported */}
          {scanState === "unsupported" && (
            <div className="relative z-10 text-center px-8">
              <ZapOff size={40} className="text-white/40 mx-auto mb-4" />
              <p className="text-white font-semibold mb-2">Camera not available</p>
              <p className="text-white/50 text-sm">Your browser doesn't support camera access. Type the merchant handle instead.</p>
              <button onClick={handleClose} className="mt-6 bg-white/10 text-white px-6 py-2.5 rounded-xl text-sm font-medium">
                Go back
              </button>
            </div>
          )}

          {/* Requesting */}
          {scanState === "requesting" && (
            <div className="relative z-10 text-center px-8">
              <div className="w-12 h-12 rounded-full border-2 border-white/30 border-t-white animate-spin mx-auto mb-4" />
              <p className="text-white/70 text-sm">Starting camera…</p>
            </div>
          )}
        </div>

        {/* Hidden canvas for QR processing */}
        <canvas ref={canvasRef} className="hidden" />

        {/* Bottom hint */}
        {scanState === "scanning" && !detected && (
          <div className="pb-12 pt-6 text-center z-10">
            <p className="text-white/40 text-xs">Scanning automatically when a QR is in frame</p>
          </div>
        )}
      </motion.div>
    </AnimatePresence>
  );
}
