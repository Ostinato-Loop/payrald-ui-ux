import { useState } from "react";
import { Link } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import Logo from "../components/Logo";
import { api } from "../lib/api";
import { formatNGN } from "../lib/format";
import { useAuth } from "../lib/auth";
import { ApiError } from "../lib/api";

type Product = {
  id: string;
  name: string;
  slug: string;
  provider: string;
  category: string;
  description: string | null;
  logo_url: string | null;
  price_ngn: number;
  face_value: string;
  currency: string;
  delivery_type: string;
  instructions: string | null;
  in_stock: boolean;
  stock_count: number;
};

type PurchaseResult = {
  purchase_id: string;
  product_name: string;
  code: string | null;
  pin: string | null;
  face_value: string;
  instructions: string | null;
  status: string;
};

type PurchaseResponse = { results: PurchaseResult[]; total_spent: number };

const CATEGORY_ICONS: Record<string, string> = {
  gaming: "🎮",
  streaming: "🎬",
  social: "📱",
  productivity: "💼",
  music: "🎵",
  education: "📚",
  food: "🍔",
  travel: "✈️",
};

const CATEGORY_COLORS: Record<string, string> = {
  gaming: "#7C3AED",
  streaming: "#DC2626",
  social: "#2563EB",
  productivity: "#059669",
  music: "#DB2777",
  education: "#D97706",
  food: "#EA580C",
  travel: "#0891B2",
};

function ProductCard({ product, onBuy }: { product: Product; onBuy: (p: Product) => void }) {
  const icon = CATEGORY_ICONS[product.category] ?? "🎁";
  const color = CATEGORY_COLORS[product.category] ?? "var(--blue)";
  const initials = product.name.slice(0, 2).toUpperCase();

  return (
    <button
      onClick={() => product.in_stock && onBuy(product)}
      className="text-left w-full rounded-2xl border transition-all duration-150 overflow-hidden"
      style={{
        background: "var(--surface)",
        borderColor: "var(--border)",
        opacity: product.in_stock ? 1 : 0.5,
        cursor: product.in_stock ? "pointer" : "not-allowed",
      }}
      onMouseEnter={e => product.in_stock && ((e.currentTarget as HTMLElement).style.borderColor = "var(--border-bright)")}
      onMouseLeave={e => ((e.currentTarget as HTMLElement).style.borderColor = "var(--border)")}
    >
      <div className="p-4">
        <div className="flex items-start gap-3 mb-3">
          {product.logo_url ? (
            <img src={product.logo_url} alt={product.name} className="w-10 h-10 rounded-xl object-contain" style={{ background: "var(--surface-2)" }} />
          ) : (
            <div className="w-10 h-10 rounded-xl flex items-center justify-center text-sm font-black text-white" style={{ background: `${color}22`, border: `1px solid ${color}44` }}>
              <span>{initials}</span>
            </div>
          )}
          <div className="flex-1 min-w-0">
            <p className="font-semibold text-white text-sm leading-tight truncate">{product.name}</p>
            <p className="text-xs mt-0.5" style={{ color: "var(--text-muted)" }}>{product.provider}</p>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs mb-0.5" style={{ color: "var(--text-muted)" }}>Face value</p>
            <p className="text-xs font-semibold" style={{ color }}>{product.face_value}</p>
          </div>
          <div className="text-right">
            <p className="text-xs mb-0.5" style={{ color: "var(--text-muted)" }}>Price</p>
            <p className="font-bold text-white text-sm">{formatNGN(product.price_ngn)}</p>
          </div>
        </div>

        {!product.in_stock && (
          <div className="mt-2 text-center">
            <span className="text-xs font-semibold px-2 py-0.5 rounded-full" style={{ background: "rgba(255,75,75,0.1)", color: "var(--error)" }}>
              Out of stock
            </span>
          </div>
        )}
      </div>

      <div className="px-4 py-2 border-t flex items-center gap-1.5" style={{ borderColor: "var(--border)", background: "var(--surface-2)" }}>
        <span className="text-xs">{icon}</span>
        <span className="text-xs font-medium capitalize" style={{ color: "var(--text-muted)" }}>{product.category}</span>
        {product.delivery_type === "code" && (
          <span className="ml-auto text-xs" style={{ color: "var(--text-muted)" }}>Instant delivery</span>
        )}
      </div>
    </button>
  );
}

function PurchaseModal({
  product,
  onClose,
  walletBalance,
}: {
  product: Product;
  onClose: () => void;
  walletBalance: number;
}) {
  const [qty, setQty] = useState(1);
  const [results, setResults] = useState<PurchaseResult[] | null>(null);
  const [copied, setCopied] = useState<string | null>(null);

  const total = product.price_ngn * qty;
  const hasBalance = walletBalance >= total;

  const { mutate: purchase, isPending, error } = useMutation<PurchaseResponse, ApiError | Error>({
    mutationFn: () =>
      api.post("/vouchers/purchase", { productSlug: product.slug, quantity: qty }),
    onSuccess: data => setResults(data.results),
  });

  const copyCode = (code: string) => {
    navigator.clipboard.writeText(code).then(() => {
      setCopied(code);
      setTimeout(() => setCopied(null), 2000);
    });
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4"
      style={{ background: "rgba(2,11,23,0.88)", backdropFilter: "blur(12px)" }}
      onClick={e => e.target === e.currentTarget && onClose()}
    >
      <div
        className="w-full max-w-sm rounded-2xl border overflow-hidden"
        style={{ background: "var(--surface)", borderColor: "var(--border)" }}
      >
        {results ? (
          <>
            <div className="p-5 border-b" style={{ borderColor: "var(--border)" }}>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-green-400 text-lg">✓</span>
                <h3 className="font-bold text-white">Purchase complete!</h3>
              </div>
              <p className="text-sm" style={{ color: "var(--text-muted)" }}>
                Your {results.length > 1 ? `${results.length} codes are` : "code is"} ready to use
              </p>
            </div>
            <div className="p-4 space-y-3 max-h-80 overflow-y-auto">
              {results.map((r, i) => (
                <div key={i} className="rounded-xl border p-4" style={{ background: "var(--surface-2)", borderColor: "var(--border)" }}>
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-xs font-medium" style={{ color: "var(--text-muted)" }}>{r.face_value}</p>
                    {r.status === "fulfilled" && r.code && (
                      <button
                        onClick={() => copyCode(r.code!)}
                        className="text-xs font-semibold px-2 py-0.5 rounded-full transition-colors"
                        style={{
                          background: copied === r.code ? "rgba(0,200,150,0.15)" : "var(--blue-dim)",
                          color: copied === r.code ? "var(--success)" : "var(--blue)",
                        }}
                      >
                        {copied === r.code ? "Copied!" : "Copy"}
                      </button>
                    )}
                  </div>
                  {r.code ? (
                    <p className="font-mono text-sm font-bold text-white tracking-widest">{r.code}</p>
                  ) : (
                    <p className="text-sm" style={{ color: "var(--text-muted)" }}>
                      {r.status === "pending_fulfillment" ? "Code will be emailed to you within 24h" : "Manual fulfillment — check your email"}
                    </p>
                  )}
                  {r.pin && (
                    <p className="text-xs mt-1" style={{ color: "var(--text-muted)" }}>PIN: <span className="font-mono font-bold text-white">{r.pin}</span></p>
                  )}
                  {r.instructions && (
                    <p className="text-xs mt-2" style={{ color: "var(--text-muted)" }}>{r.instructions}</p>
                  )}
                </div>
              ))}
            </div>
            <div className="p-4 border-t" style={{ borderColor: "var(--border)" }}>
              <button onClick={onClose} className="w-full py-3 rounded-xl font-semibold text-sm text-white" style={{ background: "var(--surface-2)" }}>
                Done
              </button>
            </div>
          </>
        ) : (
          <>
            <div className="p-5 border-b" style={{ borderColor: "var(--border)" }}>
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-white">{product.name}</h3>
                  <p className="text-sm mt-0.5" style={{ color: "var(--text-muted)" }}>{product.face_value} · {product.provider}</p>
                </div>
                <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-full" style={{ background: "var(--surface-2)", color: "var(--text-muted)" }}>
                  ✕
                </button>
              </div>
            </div>

            <div className="p-5 space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm" style={{ color: "var(--text-secondary)" }}>Quantity</span>
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setQty(q => Math.max(1, q - 1))}
                    className="w-8 h-8 rounded-full font-bold text-lg flex items-center justify-center"
                    style={{ background: "var(--surface-2)", color: qty <= 1 ? "var(--text-muted)" : "var(--blue)" }}
                    disabled={qty <= 1}
                  >−</button>
                  <span className="w-6 text-center font-bold text-white">{qty}</span>
                  <button
                    onClick={() => setQty(q => Math.min(5, q + 1))}
                    className="w-8 h-8 rounded-full font-bold text-lg flex items-center justify-center"
                    style={{ background: "var(--surface-2)", color: qty >= 5 ? "var(--text-muted)" : "var(--blue)" }}
                    disabled={qty >= 5}
                  >+</button>
                </div>
              </div>

              <div className="rounded-xl p-4 space-y-2" style={{ background: "var(--surface-2)" }}>
                <div className="flex justify-between text-sm">
                  <span style={{ color: "var(--text-muted)" }}>Price × {qty}</span>
                  <span className="text-white">{formatNGN(total)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span style={{ color: "var(--text-muted)" }}>Wallet balance</span>
                  <span className={hasBalance ? "text-white" : ""} style={hasBalance ? {} : { color: "var(--error)" }}>
                    {formatNGN(walletBalance)}
                  </span>
                </div>
                {!hasBalance && (
                  <p className="text-xs pt-1 border-t" style={{ borderColor: "var(--border)", color: "var(--error)" }}>
                    Insufficient balance — top up your wallet first
                  </p>
                )}
              </div>

              {error && (
                <div className="rounded-xl p-3 text-sm" style={{ background: "var(--error-dim)", color: "var(--error)" }}>
                  {error instanceof ApiError ? error.message : "Purchase failed. Please try again."}
                </div>
              )}
            </div>

            <div className="p-4 border-t" style={{ borderColor: "var(--border)" }}>
              <button
                onClick={() => purchase()}
                disabled={isPending || !hasBalance}
                className="w-full py-3.5 rounded-xl font-bold text-sm text-white transition-all"
                style={{
                  background: isPending || !hasBalance ? "var(--surface-2)" : "var(--blue)",
                  color: isPending || !hasBalance ? "var(--text-muted)" : "white",
                  cursor: isPending || !hasBalance ? "not-allowed" : "pointer",
                }}
              >
                {isPending ? "Processing…" : `Pay ${formatNGN(total)}`}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default function Vouchers() {
  const { user } = useAuth();
  const [category, setCategory] = useState("all");
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<Product | null>(null);

  const { data: products = [], isLoading } = useQuery<Product[]>({
    queryKey: ["voucher-products"],
    queryFn: async () => {
      const r = await api.get("/vouchers/products");
      return r.data ?? r;
    },
  });

  const { data: wallet } = useQuery<{ balances: Array<{ available: number }> }>({
    queryKey: ["wallet"],
    queryFn: () => api.get("/wallet"),
  });
  const walletBalance = wallet?.balances?.[0]?.available ?? 0;

  const categories = ["all", ...Array.from(new Set(products.map(p => p.category))).sort()];

  const filtered = products.filter(p => {
    const matchCat = category === "all" || p.category === category;
    const matchSearch = !search || p.name.toLowerCase().includes(search.toLowerCase()) || p.provider.toLowerCase().includes(search.toLowerCase());
    return matchCat && matchSearch;
  });

  return (
    <div className="min-h-screen pb-24" style={{ background: "var(--bg)" }}>
      <nav className="fixed top-0 inset-x-0 z-40 border-b" style={{ borderColor: "var(--border)", background: "rgba(2,11,23,0.96)", backdropFilter: "blur(20px)" }}>
        <div className="max-w-2xl mx-auto px-4 h-14 flex items-center gap-3">
          <Link href="/dashboard">
            <button className="w-8 h-8 flex items-center justify-center rounded-full" style={{ background: "var(--surface)", color: "var(--text-secondary)" }}>
              ←
            </button>
          </Link>
          <Logo size="sm" />
          <span className="text-sm font-semibold text-white ml-1">Shop</span>
        </div>
      </nav>

      <main className="max-w-2xl mx-auto px-4 pt-20">
        <div className="mt-4 mb-4">
          <h1 className="text-xl font-black text-white mb-1">Digital Vouchers</h1>
          <p className="text-sm" style={{ color: "var(--text-muted)" }}>
            Buy Spotify, Netflix, Steam &amp; more with your wallet balance — no international card needed.
          </p>
        </div>

        <div className="relative mb-4">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm" style={{ color: "var(--text-muted)" }}>🔍</span>
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search vouchers…"
            className="w-full pl-9 pr-4 py-3 rounded-xl border text-sm bg-transparent text-white outline-none"
            style={{ borderColor: "var(--border)", background: "var(--surface)" }}
          />
        </div>

        <div className="flex gap-2 overflow-x-auto pb-2 mb-4 scrollbar-none">
          {categories.map(cat => {
            const active = category === cat;
            const icon = cat === "all" ? "✦" : (CATEGORY_ICONS[cat] ?? "🎁");
            return (
              <button
                key={cat}
                onClick={() => setCategory(cat)}
                className="flex-none px-3 py-1.5 rounded-full text-xs font-semibold capitalize transition-all border"
                style={{
                  background: active ? "var(--blue)" : "var(--surface)",
                  borderColor: active ? "var(--blue)" : "var(--border)",
                  color: active ? "white" : "var(--text-secondary)",
                }}
              >
                {icon} {cat}
              </button>
            );
          })}
        </div>

        {isLoading ? (
          <div className="grid grid-cols-2 gap-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="rounded-2xl border animate-pulse" style={{ background: "var(--surface)", borderColor: "var(--border)", height: "140px" }} />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-4xl mb-3">🎁</p>
            <p className="font-semibold text-white mb-1">
              {products.length === 0 ? "No vouchers available yet" : "No results"}
            </p>
            <p className="text-sm" style={{ color: "var(--text-muted)" }}>
              {products.length === 0 ? "Check back soon — new products are added regularly" : "Try a different search or category"}
            </p>
          </div>
        ) : (
          <>
            <p className="text-xs mb-3" style={{ color: "var(--text-muted)" }}>
              {filtered.length} product{filtered.length !== 1 ? "s" : ""}{category !== "all" ? ` in ${category}` : ""}
            </p>
            <div className="grid grid-cols-2 gap-3">
              {filtered.map(product => (
                <ProductCard key={product.id} product={product} onBuy={setSelected} />
              ))}
            </div>
          </>
        )}
      </main>

      {selected && (
        <PurchaseModal
          product={selected}
          walletBalance={walletBalance}
          onClose={() => setSelected(null)}
        />
      )}
    </div>
  );
}
