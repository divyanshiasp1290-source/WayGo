import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import {
  ArrowDownCircle,
  ArrowUpCircle,
  BadgePercent,
  CreditCard,
  Plus,
  Wallet as WalletIcon,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { useAuth } from "@/hooks/use-auth";
import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/types";

export const Route = createFileRoute("/wallet")({
  head: () => ({
    meta: [
      { title: "Wallet — WayGo" },
      { name: "description", content: "Manage your WayGo wallet balance and transactions." },
    ],
  }),
  component: WalletPage,
});

type WalletRow = Database["public"]["Tables"]["wallets"]["Row"];
type WalletTxRow = Database["public"]["Tables"]["wallet_transactions"]["Row"];
type CouponRow = Database["public"]["Tables"]["coupons"]["Row"];

function WalletPage() {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [amt, setAmt] = useState(500);

  const [wallet, setWallet] = useState<WalletRow | null>(null);
  const [transactions, setTransactions] = useState<WalletTxRow[]>([]);
  const [coupons, setCoupons] = useState<CouponRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && !user) {
      navigate({ to: "/auth", search: { redirect: "/wallet" } });
      return;
    }

    const userId = user?.id;
    if (!userId) return;

    let cancelled = false;

    async function load(currentUserId: string) {
      setLoading(true);

      const [{ data: walletData, error: walletError }, { data: txData, error: txError }, { data: couponsData, error: couponsError }] =
        await Promise.all([
          supabase.from("wallets").select("*").eq("user_id", currentUserId).single(),
          supabase
            .from("wallet_transactions")
            .select("*")
            .eq("user_id", currentUserId)
            .order("created_at", { ascending: false })
            .limit(50),
          supabase
            .from("coupons")
            .select("*")
            .order("created_at", { ascending: false }),
        ]);

      if (cancelled) return;
      if (walletError) throw walletError;
      if (txError) throw txError;
      if (couponsError) throw couponsError;

      setWallet(walletData ?? null);
      setTransactions(txData ?? []);
      setCoupons(couponsData ?? []);
      setLoading(false);
    }

    load(userId).catch((e) => {
      if (cancelled) return;
      setLoading(false);
      toast.error(e instanceof Error ? e.message : "Failed to load wallet");
    });

    return () => {
      cancelled = true;
    };
  }, [authLoading, user, navigate]);

  const { totalIn, totalOut } = useMemo(() => {
    const inTypes = new Set(["credit", "topup", "refund"]);

    const totalIn = transactions
      .filter((t) => inTypes.has((t.type ?? "").toLowerCase()))
      .reduce((sum, t) => sum + Number(t.amount ?? 0), 0);

    const totalOut = transactions
      .filter((t) => !inTypes.has((t.type ?? "").toLowerCase()))
      .reduce((sum, t) => sum + Number(t.amount ?? 0), 0);

    return { totalIn, totalOut };
  }, [transactions]);

  const cashback = useMemo(() => {
    const cashbackTypes = new Set(["cashback"]);
    return transactions
      .filter((t) => cashbackTypes.has((t.type ?? "").toLowerCase()))
      .reduce((sum, t) => sum + Number(t.amount ?? 0), 0);
  }, [transactions]);

  const availableOffers = useMemo(() => {
    const now = Date.now();
    return coupons.filter((coupon) => {
      const validUntil = coupon.valid_until ? new Date(coupon.valid_until).getTime() : Infinity;
      const notExpired = validUntil >= now;
      const hasUses = coupon.max_uses == null || coupon.used_count < coupon.max_uses;
      return coupon.active && notExpired && hasUses;
    });
  }, [coupons]);

  if (authLoading || loading) {
    return (
      <div className="bg-muted/30 pb-16">
        <div className="container mx-auto max-w-4xl px-4 py-16 text-center text-muted-foreground">
          Loading…
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="bg-muted/30 pb-16">
      <div className="container mx-auto max-w-4xl px-4 py-8">
        <h1 className="text-2xl font-bold tracking-tight md:text-3xl">Wallet</h1>
        <p className="text-sm text-muted-foreground">Top up once and book in a tap.</p>

        <div className="mt-6 grid gap-4 md:grid-cols-[1fr_320px]">
          <Card className="overflow-hidden p-0">
            <div className="bg-gradient-hero p-6 text-primary-foreground">
              <div className="flex items-center gap-2 text-white/80">
                <WalletIcon className="h-4 w-4" /> Available balance
              </div>
              <div className="mt-2 text-4xl font-bold tabular-nums">
                ₹{wallet?.balance?.toLocaleString("en-IN") ?? "0"}
              </div>
              <p className="mt-1 text-sm text-white/75">
                {wallet?.updated_at
                  ? `Last updated ${new Date(wallet.updated_at).toLocaleDateString("en-IN", {
                      day: "2-digit",
                      month: "short",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}`
                  : ""}
              </p>
            </div>
            <div className="grid grid-cols-3 divide-x text-center">
              {[
                { label: "Total in", value: `₹${totalIn.toLocaleString("en-IN")}` },
                { label: "Total out", value: `₹${totalOut.toLocaleString("en-IN")}` },
                { label: "Cashback", value: `₹${cashback.toLocaleString("en-IN")}` },
              ].map((s) => (
                <div key={s.label} className="p-4">
                  <p className="text-xs text-muted-foreground">{s.label}</p>
                  <p className="mt-1 text-base font-semibold">{s.value}</p>
                </div>
              ))}
            </div>
          </Card>

          <Card className="p-5">
            <p className="text-sm font-semibold">Add money</p>
            <div className="mt-3 flex gap-2">
              {[500, 1000, 2000].map((v) => (
                <Button
                  key={v}
                  variant={amt === v ? "default" : "outline"}
                  size="sm"
                  onClick={() => setAmt(v)}
                >
                  ₹{v}
                </Button>
              ))}
            </div>
            <Input
              type="number"
              className="mt-3"
              value={amt}
              onChange={(e) => setAmt(Math.max(0, Number(e.target.value) || 0))}
            />
            <Button
              className="mt-3 w-full gap-2 bg-gradient-primary shadow-glow"
              onClick={() => toast.info("Top up is not wired yet.")}
            >
              <Plus className="h-4 w-4" /> Top up
            </Button>

            <div className="mt-3 flex items-center gap-2 text-xs text-muted-foreground">
              <CreditCard className="h-3.5 w-3.5" /> UPI · Cards · Netbanking
            </div>
          </Card>
        </div>

        <div className="mt-8 grid gap-4 md:grid-cols-[1fr_300px]">
          <div>
            <div className="flex items-center justify-between gap-3">
              <div>
                <h2 className="text-lg font-semibold">Offers</h2>
                <p className="text-sm text-muted-foreground">Coupons you can apply at checkout.</p>
              </div>
              <Badge variant="secondary" className="text-xs uppercase">
                {availableOffers.length} active
              </Badge>
            </div>
            <div className="mt-4 grid gap-3">
              {availableOffers.length ? (
                availableOffers.map((coupon) => {
                  const discount =
                    coupon.discount_type === "percent"
                      ? `${coupon.discount_value}% off`
                      : `₹${Number(coupon.discount_value).toLocaleString("en-IN")} off`;
                  return (
                    <Card key={coupon.id} className="border border-green-200 bg-green-50 p-4 shadow-soft transition-shadow hover:shadow-md dark:border-green-900 dark:bg-green-950/30">
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <p className="text-sm font-semibold text-green-800 dark:text-green-200">{coupon.code}</p>
                          <p className="text-xs text-green-700/80 dark:text-green-300/80">{coupon.description || discount}</p>
                          <p className="mt-2 text-xs text-muted-foreground">
                            Expires {coupon.valid_until ? new Date(coupon.valid_until).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }) : "never"}
                          </p>
                        </div>
                        <Badge className="h-8 bg-green-700 px-3 text-xs font-medium text-white hover:bg-green-800">
                          {discount}
                        </Badge>
                      </div>
                    </Card>
                  );
                })
              ) : (
                <Card className="p-6 text-center text-sm text-muted-foreground">No wallet offers available right now.</Card>
              )}
            </div>
          </div>
          <Card className="p-5">
            <p className="text-sm font-semibold">How to use</p>
            <p className="mt-3 text-sm leading-6 text-muted-foreground">
              Apply coupon codes during checkout to save on rides. Active offers are updated from the promotions dashboard.
            </p>
          </Card>
        </div>

        <h2 className="mt-8 text-lg font-semibold">Transactions</h2>
        <div className="mt-3 rounded-2xl border bg-card shadow-soft">
          {transactions.length ? (
            transactions.map((t, i) => {
              const type = (t.type ?? "").toLowerCase();
              const isCredit = ["credit", "topup", "refund", "cashback"].includes(type);
              const kind = isCredit ? "credit" : "debit";
              return (
                <div
                  key={t.id}
                  className={`flex items-center justify-between p-4 ${
                    i < transactions.length - 1 ? "border-b" : ""
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`flex h-9 w-9 items-center justify-center rounded-full ${
                        isCredit
                          ? "bg-success/10 text-success"
                          : "bg-destructive/10 text-destructive"
                      }`}
                    >
                      {isCredit ? (
                        <ArrowDownCircle className="h-5 w-5" />
                      ) : (
                        <ArrowUpCircle className="h-5 w-5" />
                      )}
                    </div>
                    <div>
                      <p className="text-sm font-medium">{t.type ?? "transaction"}</p>
                      <p className="text-xs text-muted-foreground">
                        {t.created_at
                          ? new Date(t.created_at).toLocaleDateString("en-IN", {
                              day: "2-digit",
                              month: "short",
                              year: "numeric",
                            })
                          : "-"}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span
                      className={`text-sm font-semibold tabular-nums ${
                        isCredit ? "text-success" : ""
                      }`}
                    >
                      {isCredit ? "+" : "-"}₹{Number(t.amount ?? 0).toLocaleString("en-IN")}
                    </span>
                    <Badge variant="secondary" className="capitalize">
                      {kind}
                    </Badge>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="p-6 text-center text-sm text-muted-foreground">
              No transactions yet.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
