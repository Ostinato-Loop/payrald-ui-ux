import { useAuth } from "@/lib/auth";
import { useGetWallet, getGetWalletQueryKey, useListTransactions, getListTransactionsQueryKey, useListContacts, getListContactsQueryKey } from "@workspace/api-client-react";
import { formatNgn } from "@/lib/format";
import { Link } from "wouter";
import { ArrowUpRight, ArrowDownRight, ScanLine, Landmark, ArrowRight, User as UserIcon } from "lucide-react";
import { motion } from "framer-motion";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

export default function Home() {
  const { user } = useAuth();
  const { data: wallet, isLoading: walletLoading } = useGetWallet({ query: { queryKey: getGetWalletQueryKey() } });
  const { data: transactionsPage } = useListTransactions({ limit: 5 }, { query: { queryKey: getListTransactionsQueryKey({ limit: 5 }) } });
  const { data: contacts } = useListContacts({ query: { queryKey: getListContactsQueryKey() } });

  const totalBalance = wallet?.totalNgn || 0;

  return (
    <div className="p-6 pt-12 space-y-8">
      <motion.div 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex justify-between items-center"
      >
        <div className="flex items-center gap-3">
          <Avatar className="h-10 w-10 border-2 border-primary/20">
            <AvatarFallback className="bg-primary/10 text-primary font-bold">
              {user?.name?.charAt(0).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div>
            <p className="text-xs text-muted-foreground">Welcome back,</p>
            <p className="font-semibold">{user?.name}</p>
          </div>
        </div>
        <div className="bg-card px-3 py-1 rounded-full text-xs font-medium border border-border">
          @{user?.raldId}
        </div>
      </motion.div>

      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.1 }}
        className="bg-gradient-to-br from-primary/20 to-card border border-primary/20 rounded-3xl p-6 relative overflow-hidden"
      >
        <div className="absolute top-0 right-0 w-32 h-32 bg-primary/20 rounded-full blur-3xl -mr-10 -mt-10 pointer-events-none" />
        
        <p className="text-sm font-medium text-primary/80 mb-2">Total Balance</p>
        <h2 className="text-4xl font-bold tracking-tight text-white mb-6">
          {walletLoading ? "..." : formatNgn(totalBalance)}
        </h2>

        <div className="flex gap-4">
          <Link href="/send" className="flex-1">
            <button className="w-full bg-primary hover:bg-primary/90 text-primary-foreground py-3 rounded-xl font-medium text-sm transition-colors flex items-center justify-center gap-2">
              <ArrowUpRight size={18} /> Send
            </button>
          </Link>
          <Link href="/pay" className="flex-1">
            <button className="w-full bg-card hover:bg-card/80 border border-border text-foreground py-3 rounded-xl font-medium text-sm transition-colors flex items-center justify-center gap-2">
              <ScanLine size={18} /> Pay
            </button>
          </Link>
        </div>
      </motion.div>

      <div className="grid grid-cols-4 gap-4">
        <Link href="/send">
          <div className="flex flex-col items-center gap-2">
            <div className="w-12 h-12 bg-card rounded-2xl flex items-center justify-center border border-border">
              <ArrowUpRight className="text-primary" size={24} />
            </div>
            <span className="text-[10px] font-medium text-muted-foreground">Transfer</span>
          </div>
        </Link>
        <Link href="/withdraw">
          <div className="flex flex-col items-center gap-2">
            <div className="w-12 h-12 bg-card rounded-2xl flex items-center justify-center border border-border">
              <Landmark className="text-primary" size={24} />
            </div>
            <span className="text-[10px] font-medium text-muted-foreground">Withdraw</span>
          </div>
        </Link>
        <Link href="/pay">
          <div className="flex flex-col items-center gap-2">
            <div className="w-12 h-12 bg-card rounded-2xl flex items-center justify-center border border-border">
              <ScanLine className="text-primary" size={24} />
            </div>
            <span className="text-[10px] font-medium text-muted-foreground">Pay Merchant</span>
          </div>
        </Link>
        <div className="flex flex-col items-center gap-2 opacity-50">
          <div className="w-12 h-12 bg-card rounded-2xl flex items-center justify-center border border-border">
            <ArrowDownRight className="text-muted-foreground" size={24} />
          </div>
          <span className="text-[10px] font-medium text-muted-foreground">Request</span>
        </div>
      </div>

      {contacts && contacts.length > 0 && (
        <div className="space-y-4">
          <p className="text-sm font-semibold">Recent Contacts</p>
          <div className="flex gap-4 overflow-x-auto pb-2 no-scrollbar">
            {contacts.slice(0, 5).map((contact) => (
              <div key={contact.id} className="flex flex-col items-center gap-2 min-w-[60px]">
                <Avatar className="h-12 w-12 border border-border">
                  <AvatarFallback className="bg-card text-xs">{contact.initials}</AvatarFallback>
                </Avatar>
                <span className="text-[10px] font-medium text-center truncate w-full">{contact.displayName.split(' ')[0]}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="space-y-4">
        <div className="flex justify-between items-end">
          <p className="text-sm font-semibold">Recent Activity</p>
          <Link href="/transactions" className="text-xs text-primary font-medium flex items-center gap-1">
            View all <ArrowRight size={12} />
          </Link>
        </div>

        <div className="space-y-3 bg-card border border-border rounded-2xl p-4">
          {transactionsPage?.data.slice(0, 4).map((tx) => (
            <div key={tx.id} className="flex justify-between items-center py-2">
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                  tx.direction === 'credit' ? 'bg-green-500/10 text-green-500' : 'bg-card border border-border text-foreground'
                }`}>
                  {tx.direction === 'credit' ? <ArrowDownRight size={16} /> : <ArrowUpRight size={16} />}
                </div>
                <div>
                  <p className="font-medium text-sm">{tx.counterpartyName}</p>
                  <p className="text-xs text-muted-foreground truncate max-w-[120px]">
                    {tx.direction === 'credit' ? 'Received' : 'Sent'} • {new Date(tx.createdAt).toLocaleDateString()}
                  </p>
                </div>
              </div>
              <div className="text-right">
                <p className={`font-semibold text-sm ${tx.direction === 'credit' ? 'text-green-500' : ''}`}>
                  {tx.direction === 'credit' ? '+' : '-'}{formatNgn(tx.amount)}
                </p>
              </div>
            </div>
          ))}
          {(!transactionsPage?.data || transactionsPage.data.length === 0) && (
            <p className="text-center text-sm text-muted-foreground py-4">No recent activity</p>
          )}
        </div>
      </div>
    </div>
  );
}
