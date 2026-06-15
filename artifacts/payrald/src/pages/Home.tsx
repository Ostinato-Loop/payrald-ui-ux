import { useAuth } from "@/lib/auth";
import { useGetWallet, getGetWalletQueryKey, useListTransactions, getListTransactionsQueryKey, useListContacts, getListContactsQueryKey } from "@workspace/api-client-react";
import { formatNgn } from "@/lib/format";
import { Link } from "wouter";
import { ArrowUpRight, ArrowDownRight, ScanLine, Landmark, ArrowRight } from "lucide-react";
import { motion } from "framer-motion";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import payraldIcon from "/payrald-icon-192.png";

export default function Home() {
  const { user } = useAuth();
  const { data: wallet, isLoading: walletLoading } = useGetWallet({ query: { queryKey: getGetWalletQueryKey() } });
  const { data: transactionsPage } = useListTransactions({ limit: 5 }, { query: { queryKey: getListTransactionsQueryKey({ limit: 5 }) } });
  const { data: contacts } = useListContacts({ query: { queryKey: getListContactsQueryKey() } });

  const totalBalance = wallet?.totalNgn || 0;

  return (
    <div className="p-6 pt-10 space-y-6">
      <motion.div 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex justify-between items-center"
      >
        <div className="flex items-center gap-3">
          <Avatar className="h-10 w-10 border-2 border-primary/20">
            <AvatarFallback className="bg-primary/10 text-primary font-bold text-sm">
              {user?.name?.charAt(0).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div>
            <p className="text-xs text-muted-foreground">Welcome back,</p>
            <p className="font-semibold text-sm">{user?.name}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <img src={payraldIcon} alt="PayRald" className="w-6 h-6 object-contain" />
          <div className="bg-secondary px-3 py-1 rounded-full text-xs font-medium border border-border text-foreground">
            @{user?.raldId}
          </div>
        </div>
      </motion.div>

      {/* Balance card — solid PayRald navy, matching the logo's center bar color */}
      <motion.div 
        initial={{ opacity: 0, scale: 0.97 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.1 }}
        className="bg-primary rounded-3xl p-6 relative overflow-hidden"
        style={{ background: "linear-gradient(135deg, #1B2744 0%, #243357 100%)" }}
      >
        <div className="absolute top-0 right-0 w-40 h-40 rounded-full opacity-10 -mr-12 -mt-12 pointer-events-none"
          style={{ background: "radial-gradient(circle, #D4922A 0%, transparent 70%)" }} />
        <div className="absolute bottom-0 left-0 w-32 h-32 rounded-full opacity-10 -ml-10 -mb-10 pointer-events-none"
          style={{ background: "radial-gradient(circle, #CC2A2A 0%, transparent 70%)" }} />

        <p className="text-sm font-medium text-white/60 mb-1">Total Balance</p>
        <h2 className="text-4xl font-bold tracking-tight text-white mb-6">
          {walletLoading ? "—" : formatNgn(totalBalance)}
        </h2>

        <div className="flex gap-3">
          <Link href="/send" className="flex-1">
            <button className="w-full bg-white text-primary hover:bg-white/90 py-2.5 rounded-xl font-semibold text-sm transition-colors flex items-center justify-center gap-2">
              <ArrowUpRight size={16} /> Send
            </button>
          </Link>
          <Link href="/pay" className="flex-1">
            <button className="w-full bg-white/15 hover:bg-white/25 border border-white/20 text-white py-2.5 rounded-xl font-semibold text-sm transition-colors flex items-center justify-center gap-2">
              <ScanLine size={16} /> Pay
            </button>
          </Link>
          <Link href="/withdraw" className="flex-1">
            <button className="w-full bg-white/15 hover:bg-white/25 border border-white/20 text-white py-2.5 rounded-xl font-semibold text-sm transition-colors flex items-center justify-center gap-2">
              <Landmark size={16} /> Withdraw
            </button>
          </Link>
        </div>
      </motion.div>

      {/* Quick actions */}
      <div className="grid grid-cols-4 gap-3">
        <Link href="/send">
          <div className="flex flex-col items-center gap-2">
            <div className="w-13 h-13 w-12 h-12 bg-card rounded-2xl flex items-center justify-center border border-border shadow-sm">
              <ArrowUpRight className="text-primary" size={22} />
            </div>
            <span className="text-[10px] font-medium text-muted-foreground">Transfer</span>
          </div>
        </Link>
        <Link href="/withdraw">
          <div className="flex flex-col items-center gap-2">
            <div className="w-12 h-12 bg-card rounded-2xl flex items-center justify-center border border-border shadow-sm">
              <Landmark className="text-primary" size={22} />
            </div>
            <span className="text-[10px] font-medium text-muted-foreground">Withdraw</span>
          </div>
        </Link>
        <Link href="/pay">
          <div className="flex flex-col items-center gap-2">
            <div className="w-12 h-12 bg-card rounded-2xl flex items-center justify-center border border-border shadow-sm">
              <ScanLine className="text-primary" size={22} />
            </div>
            <span className="text-[10px] font-medium text-muted-foreground">Pay</span>
          </div>
        </Link>
        <div className="flex flex-col items-center gap-2 opacity-40">
          <div className="w-12 h-12 bg-card rounded-2xl flex items-center justify-center border border-border shadow-sm">
            <ArrowDownRight className="text-muted-foreground" size={22} />
          </div>
          <span className="text-[10px] font-medium text-muted-foreground">Request</span>
        </div>
      </div>

      {/* Recent contacts */}
      {contacts && contacts.length > 0 && (
        <div className="space-y-3">
          <p className="text-sm font-semibold">Recent Contacts</p>
          <div className="flex gap-4 overflow-x-auto pb-2 no-scrollbar">
            {contacts.slice(0, 5).map((contact) => (
              <div key={contact.id} className="flex flex-col items-center gap-2 min-w-[56px]">
                <Avatar className="h-12 w-12 border-2 border-border">
                  <AvatarFallback className="bg-secondary text-primary text-xs font-semibold">{contact.initials}</AvatarFallback>
                </Avatar>
                <span className="text-[10px] font-medium text-center truncate w-full">{contact.displayName.split(' ')[0]}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Recent activity */}
      <div className="space-y-3">
        <div className="flex justify-between items-end">
          <p className="text-sm font-semibold">Recent Activity</p>
          <Link href="/transactions" className="text-xs text-primary font-semibold flex items-center gap-1">
            View all <ArrowRight size={11} />
          </Link>
        </div>

        <div className="bg-card border border-border rounded-2xl overflow-hidden divide-y divide-border">
          {transactionsPage?.data && transactionsPage.data.length > 0 ? (
            transactionsPage.data.slice(0, 4).map((tx) => (
              <div key={tx.id} className="flex justify-between items-center px-4 py-3">
                <div className="flex items-center gap-3">
                  <div className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 ${
                    tx.direction === 'credit'
                      ? 'bg-green-50 text-green-600'
                      : 'bg-secondary text-foreground'
                  }`}>
                    {tx.direction === 'credit' ? <ArrowDownRight size={15} /> : <ArrowUpRight size={15} />}
                  </div>
                  <div>
                    <p className="font-medium text-sm leading-tight">{tx.counterpartyName}</p>
                    <p className="text-[11px] text-muted-foreground mt-0.5 truncate max-w-[110px]">
                      {tx.direction === 'credit' ? 'Received' : 'Sent'} · {new Date(tx.createdAt).toLocaleDateString('en-NG', { month: 'short', day: 'numeric' })}
                    </p>
                  </div>
                </div>
                <p className={`font-semibold text-sm ${tx.direction === 'credit' ? 'text-green-600' : 'text-foreground'}`}>
                  {tx.direction === 'credit' ? '+' : '-'}{formatNgn(tx.amount)}
                </p>
              </div>
            ))
          ) : (
            <div className="py-10 flex flex-col items-center gap-2">
              <p className="text-sm text-muted-foreground">No recent activity</p>
              <p className="text-xs text-muted-foreground/60">Send money to get started</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
