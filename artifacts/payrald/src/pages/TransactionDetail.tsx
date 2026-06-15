import { useLocation, useParams } from "wouter";
import { useListTransactions } from "@workspace/api-client-react";
import { formatNgn } from "@/lib/format";
import {
  ArrowLeft, ArrowUpRight, ArrowDownRight, ScanLine,
  Landmark, CheckCircle2, Clock, XCircle, Copy
} from "lucide-react";
import { motion } from "framer-motion";
import { useToast } from "@/hooks/use-toast";

const TYPE_LABEL: Record<string, string> = {
  transfer:          "Transfer",
  transfer_sent:     "Transfer Sent",
  transfer_received: "Transfer Received",
  payment:           "Merchant Payment",
  withdrawal:        "Bank Withdrawal",
};

const STATUS_CONFIG: Record<string, { label: string; icon: typeof CheckCircle2; color: string; bg: string }> = {
  completed: { label: "Completed",  icon: CheckCircle2, color: "text-green-600",      bg: "bg-green-50 border-green-200" },
  pending:   { label: "Pending",    icon: Clock,        color: "text-yellow-600",     bg: "bg-yellow-50 border-yellow-200" },
  failed:    { label: "Failed",     icon: XCircle,      color: "text-destructive",    bg: "bg-destructive/5 border-destructive/20" },
  processing:{ label: "Processing", icon: Clock,        color: "text-primary",        bg: "bg-primary/8 border-primary/20" },
};

export default function TransactionDetail() {
  const { id } = useParams<{ id: string }>();
  const [, setLocation] = useLocation();
  const { toast } = useToast();

  // Load up to 100 to find the right one (no single-tx endpoint in spec)
  const { data: page, isLoading } = useListTransactions({ limit: 100 });
  const tx = page?.data.find((t) => t.id === id);

  function copy(value: string, label: string) {
    navigator.clipboard.writeText(value).then(() => {
      toast({ title: `${label} copied` });
    });
  }

  // ── Loading ───────────────────────────────────────────────────────────────
  if (isLoading) {
    return (
      <div className="p-6 pt-10">
        <button onClick={() => setLocation("/transactions")} className="w-10 h-10 bg-card rounded-full flex items-center justify-center border border-border mb-6">
          <ArrowLeft size={18} />
        </button>
        <div className="space-y-3 animate-pulse">
          {[1,2,3,4].map(i => <div key={i} className="h-14 bg-secondary rounded-2xl" />)}
        </div>
      </div>
    );
  }

  // ── Not found ─────────────────────────────────────────────────────────────
  if (!tx) {
    return (
      <div className="p-6 pt-10 flex flex-col items-center justify-center gap-4 h-full">
        <XCircle size={40} className="text-muted-foreground/40" />
        <p className="font-semibold text-muted-foreground">Transaction not found</p>
        <button onClick={() => setLocation("/transactions")} className="text-primary text-sm font-medium">
          Back to Activity
        </button>
      </div>
    );
  }

  const isCredit = tx.direction === "credit";
  const statusCfg = STATUS_CONFIG[tx.status] ?? STATUS_CONFIG.pending;
  const StatusIcon = statusCfg.icon;

  // Icon for transaction type
  const TxIcon = tx.type === "payment"
    ? ScanLine
    : tx.type === "withdrawal"
    ? Landmark
    : isCredit ? ArrowDownRight : ArrowUpRight;

  return (
    <div className="p-6 pt-10 space-y-5">
      {/* Header */}
      <div className="flex items-center gap-4">
        <button
          onClick={() => setLocation("/transactions")}
          className="w-10 h-10 bg-card rounded-full flex items-center justify-center border border-border"
        >
          <ArrowLeft size={18} />
        </button>
        <div>
          <h1 className="text-xl font-bold leading-tight">Transaction</h1>
          <p className="text-xs text-muted-foreground">{TYPE_LABEL[tx.type] ?? tx.type}</p>
        </div>
      </div>

      {/* Hero amount card */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-3xl p-6 flex flex-col items-center gap-3 text-center"
        style={{ background: "linear-gradient(135deg, #1B2744 0%, #243357 100%)" }}
      >
        <div className="w-14 h-14 rounded-full bg-white/15 flex items-center justify-center">
          <TxIcon size={26} className="text-white" />
        </div>
        <div>
          <p className="text-white/60 text-sm mb-1">{isCredit ? "Amount received" : "Amount sent"}</p>
          <p className="text-white text-4xl font-bold tracking-tight">
            {isCredit ? "+" : "-"}{formatNgn(tx.amount)}
          </p>
          {tx.fee > 0 && (
            <p className="text-white/40 text-xs mt-1.5">Fee: {formatNgn(tx.fee)}</p>
          )}
        </div>

        {/* Status badge */}
        <div className={`mt-1 flex items-center gap-1.5 px-3 py-1 rounded-full border text-xs font-semibold ${statusCfg.bg} ${statusCfg.color}`}>
          <StatusIcon size={12} />
          {statusCfg.label}
        </div>
      </motion.div>

      {/* Details card */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.08 }}
        className="bg-card border border-border rounded-2xl overflow-hidden divide-y divide-border"
      >
        <Row label={isCredit ? "From" : "To"} value={tx.counterpartyName} />
        {tx.counterpartyAlias && (
          <Row label="Handle" value={tx.counterpartyAlias} mono />
        )}
        {tx.description && (
          <Row label="Description" value={tx.description} />
        )}
        <Row
          label="Date"
          value={new Date(tx.createdAt).toLocaleString("en-NG", {
            weekday: "short", day: "numeric", month: "short",
            year: "numeric", hour: "2-digit", minute: "2-digit",
          })}
        />
        <Row label="Currency" value={tx.currency ?? "NGN"} />
        {tx.fee > 0 && (
          <Row label="Fee" value={formatNgn(tx.fee)} />
        )}
      </motion.div>

      {/* Reference */}
      {tx.reference && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.14 }}
          className="bg-card border border-border rounded-2xl p-4"
        >
          <p className="text-xs text-muted-foreground mb-2 font-medium">Reference ID</p>
          <div className="flex items-center justify-between gap-3">
            <p className="font-mono text-xs text-foreground break-all flex-1">{tx.reference}</p>
            <button
              onClick={() => copy(tx.reference, "Reference")}
              className="shrink-0 w-8 h-8 bg-secondary rounded-lg flex items-center justify-center border border-border"
            >
              <Copy size={13} className="text-muted-foreground" />
            </button>
          </div>
        </motion.div>
      )}

      {/* Transaction ID */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="flex justify-center"
      >
        <button
          onClick={() => copy(tx.id, "Transaction ID")}
          className="flex items-center gap-1.5 text-xs text-muted-foreground/60 hover:text-muted-foreground transition-colors"
        >
          <Copy size={11} />
          ID: {tx.id.slice(0, 8)}…
        </button>
      </motion.div>
    </div>
  );
}

function Row({ label, value, mono = false }: { label: string; value: string; mono?: boolean }) {
  return (
    <div className="flex justify-between items-start gap-4 px-4 py-3.5">
      <p className="text-sm text-muted-foreground shrink-0">{label}</p>
      <p className={`text-sm font-medium text-right leading-snug ${mono ? "font-mono text-xs" : ""}`}>{value}</p>
    </div>
  );
}
