import { useState } from "react";
import { useListTransactions } from "@workspace/api-client-react";
import { formatNgn } from "@/lib/format";
import { ArrowUpRight, ArrowDownRight, ScanLine, Landmark } from "lucide-react";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function Transactions() {
  const [activeTab, setActiveTab] = useState<string>("all");
  
  // Map our UI tabs to API types
  let queryType = undefined;
  if (activeTab === "sent") queryType = "transfer"; // Simplification, server returns all transfers
  if (activeTab === "received") queryType = "transfer";
  if (activeTab === "payments") queryType = "payment";
  if (activeTab === "withdrawals") queryType = "withdrawal";

  const { data: transactionsPage, isLoading } = useListTransactions({ 
    limit: 50, 
    type: queryType as any 
  });

  const transactions = transactionsPage?.data || [];
  
  // Client side filtering for sent/received transfers since API just has 'transfer'
  const filteredTransactions = transactions.filter(tx => {
    if (activeTab === "sent" && tx.type === "transfer_sent") return true;
    if (activeTab === "received" && tx.type === "transfer_received") return true;
    if (activeTab === "all" || activeTab === "payments" || activeTab === "withdrawals") return true;
    return false;
  });

  const getIcon = (type: string, direction: string) => {
    if (type === 'payment') return <ScanLine size={16} />;
    if (type === 'withdrawal') return <Landmark size={16} />;
    if (direction === 'credit') return <ArrowDownRight size={16} />;
    return <ArrowUpRight size={16} />;
  };

  const getIconBg = (type: string, direction: string) => {
    if (direction === 'credit') return 'bg-green-500/10 text-green-500';
    if (type === 'payment') return 'bg-primary/10 text-primary';
    if (type === 'withdrawal') return 'bg-yellow-500/10 text-yellow-500';
    return 'bg-card border border-border text-foreground';
  };

  return (
    <div className="p-6 pt-12 space-y-6 h-full flex flex-col">
      <h1 className="text-2xl font-bold">Activity</h1>

      <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="w-full bg-card border border-border h-auto p-1 overflow-x-auto justify-start no-scrollbar flex-nowrap">
          <TabsTrigger value="all" className="rounded-lg shrink-0">All</TabsTrigger>
          <TabsTrigger value="sent" className="rounded-lg shrink-0">Sent</TabsTrigger>
          <TabsTrigger value="received" className="rounded-lg shrink-0">Received</TabsTrigger>
          <TabsTrigger value="payments" className="rounded-lg shrink-0">Payments</TabsTrigger>
          <TabsTrigger value="withdrawals" className="rounded-lg shrink-0">Withdrawals</TabsTrigger>
        </TabsList>
      </Tabs>

      <div className="flex-1 space-y-4">
        {isLoading ? (
          <div className="flex items-center justify-center h-32">
            <p className="text-muted-foreground">Loading...</p>
          </div>
        ) : filteredTransactions.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-48 bg-card border border-border rounded-2xl">
            <p className="text-muted-foreground">No transactions found</p>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredTransactions.map((tx) => (
              <div key={tx.id} className="bg-card border border-border rounded-2xl p-4 flex justify-between items-center">
                <div className="flex items-center gap-3">
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center ${getIconBg(tx.type, tx.direction)}`}>
                    {getIcon(tx.type, tx.direction)}
                  </div>
                  <div>
                    <p className="font-semibold">{tx.counterpartyName}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {tx.type.split('_').join(' ').replace(/\b\w/g, l => l.toUpperCase())} • {new Date(tx.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className={`font-bold ${tx.direction === 'credit' ? 'text-green-500' : ''}`}>
                    {tx.direction === 'credit' ? '+' : '-'}{formatNgn(tx.amount)}
                  </p>
                  <p className="text-[10px] text-muted-foreground mt-1 capitalize">{tx.status}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
