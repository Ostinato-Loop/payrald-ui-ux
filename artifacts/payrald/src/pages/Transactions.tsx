import { useState } from "react";
import { useLocation } from "wouter";
import { useListTransactions } from "@workspace/api-client-react";
import { formatNgn } from "@/lib/format";
import { ArrowUpRight, ArrowDownRight, ScanLine, Landmark, ChevronRight, Loader2 } from "lucide-react";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { motion } from "framer-motion";

type Tab = "all" | "sent" | "received" | "payments" | "withdrawals";

const TAB_LABELS: Record<Tab, string> = {
  all:         "All",
  sent:        "Sent",
  received:    "Received",
  payments:    "Payments",
  withdrawals: "Withdrawals",
};

export default function Transactions() {
  const [activeTab, setActiveTab] = useState<Tab>("all");
  const [, setLocation] = useLocation();

  // Map tabs to API query type
  const queryType =
    activeTab === "payments"    ? "payment" :
    activeTab === "withdrawals" ? "withdrawal" :
    undefined;

  const { data: page, isLoading } = useListTransactions({
    limit: 100,
    type: queryType as any,
  });

  const all = page?.data ?? [];

  // Client-side filter for sent / received (both are type "transfer" in API)
  const transactions = all.filter((tx) => {
    if (activeTab === "sent")     return tx.direction === "debit"  && tx.type !== "withdrawal";
    if (activeTab === "received") return tx.direction === "credit";
    return true; // all, payments, withdrawals already filtered server-side
  });

  function getIcon(tx: typeof all[0]) {
    if (tx.type === "payment")    return <ScanLine size={16} />;
    if (tx.type === "withdrawal") return <Landmark size={16} />;
    if (tx.direction === "credit") return <ArrowDownRight size={16} />;
    return <ArrowUpRight size={16} />;
  }

  function getIconStyle(tx: typeof all[0]) {
    if (tx.direction === "credit")  return "bg-green-50 text-green-600";
    if (tx.type === "payment")      return "bg-primary/10 text-primary";
    if (tx.type === "withdrawal")   return "bg-[#D4922A]/10 text-[#D4922A]";
    return "bg-secondary text-foreground";
  }

  function formatType(tx: typeof all[0]) {
    if (tx.type === "payment")    return "Merchant payment";
    if (tx.type === "withdrawal") return "Bank withdrawal";
    return tx.direction === "credit" ? "Received" : "Sent";
  }

  return (
    <div className="flex flex-col h-full">
      <div className="p-6 pt-10 pb-0 space-y-5">
        <h1 className="text-xl font-bold">Activity</h1>

        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as Tab)}>
          <TabsList className="w-full bg-secondary border border-border p-1 h-auto flex gap-1 overflow-x-auto no-scrollbar justify-start">
            {(Object.keys(TAB_LABELS) as Tab[]).map((tab) => (
              <TabsTrigger
                key={tab}
                value={tab}
                className="rounded-lg shrink-0 text-xs px-3 py-1.5 data-[state=active]:bg-primary data-[state=active]:text-white data-[state=active]:shadow-none"
              >
                {TAB_LABELS[tab]}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>
      </div>

      <div className="flex-1 overflow-y-auto no-scrollbar px-6 pb-6 pt-4">
        {isLoading ? (
          <div className="flex items-center justify-center h-32 gap-2 text-muted-foreground">
            <Loader2 size={18} className="animate-spin" />
            <span className="text-sm">Loading…</span>
          </div>
        ) : transactions.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-48 gap-2">
            <p className="font-medium text-muted-foreground text-sm">No transactions yet</p>
            <p className="text-xs text-muted-foreground/60">
              {activeTab === "all" ? "Send money to get started" : `No ${TAB_LABELS[activeTab].toLowerCase()} found`}
            </p>
          </div>
        ) : (
          <motion.div
            key={activeTab}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="bg-card border border-border rounded-2xl overflow-hidden divide-y divide-border"
          >
            {transactions.map((tx) => (
              <button
                key={tx.id}
                onClick={() => setLocation(`/transactions/${tx.id}`)}
                className="w-full flex items-center gap-3 px-4 py-3.5 hover:bg-secondary/50 transition-colors text-left"
              >
                {/* Icon */}
                <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${getIconStyle(tx)}`}>
                  {getIcon(tx)}
                </div>

                {/* Name + type */}
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-sm leading-tight truncate">{tx.counterpartyName}</p>
                  <p className="text-[11px] text-muted-foreground mt-0.5">
                    {formatType(tx)} · {new Date(tx.createdAt).toLocaleDateString("en-NG", { day: "numeric", month: "short", year: "numeric" })}
                  </p>
                </div>

                {/* Amount + status */}
                <div className="text-right shrink-0 flex items-center gap-2">
                  <div>
                    <p className={`font-bold text-sm leading-tight ${tx.direction === "credit" ? "text-green-600" : ""}`}>
                      {tx.direction === "credit" ? "+" : "-"}{formatNgn(tx.amount)}
                    </p>
                    <p className={`text-[10px] mt-0.5 capitalize font-medium ${
                      tx.status === "completed" ? "text-green-600" :
                      tx.status === "failed"    ? "text-destructive" :
                      "text-yellow-600"
                    }`}>
                      {tx.status}
                    </p>
                  </div>
                  <ChevronRight size={14} className="text-muted-foreground/40 shrink-0" />
                </div>
              </button>
            ))}
          </motion.div>
        )}

        {transactions.length > 0 && (
          <p className="text-center text-xs text-muted-foreground/50 mt-4">
            {transactions.length} transaction{transactions.length !== 1 ? "s" : ""}
          </p>
        )}
      </div>
    </div>
  );
}
