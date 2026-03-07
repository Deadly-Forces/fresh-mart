"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import {
  Star,
  TrendingUp,
  Gift,
  ArrowUpRight,
  ArrowDownRight,
  Loader2,
  Coins,
  History,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import {
  getLoyaltyDataAction,
  redeemPointsAction,
} from "@/features/profile/actions/loyaltyActions";

interface LoyaltyTransaction {
  id: string;
  points: number;
  type: string;
  description: string;
  order_id: string | null;
  created_at: string;
}

export function LoyaltyRewardsTab() {
  const [loading, setLoading] = useState(true);
  const [points, setPoints] = useState(0);
  const [transactions, setTransactions] = useState<LoyaltyTransaction[]>([]);
  const [redeemOpen, setRedeemOpen] = useState(false);
  const [redeemPoints, setRedeemPoints] = useState("");
  const [isRedeeming, setIsRedeeming] = useState(false);
  const [greeting, setGreeting] = useState("");
  const [isLoadingGreeting, setIsLoadingGreeting] = useState(false);
  const progressRef = useRef<HTMLDivElement>(null);

  const fetchGreeting = useCallback(async (currentPoints: number) => {
    setIsLoadingGreeting(true);
    try {
      const res = await fetch("/api/ai/loyalty", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: "Shopper", points: currentPoints }),
      });
      if (res.ok) {
        const data = await res.json();
        setGreeting(data.message);
      }
    } catch (e) {
      console.error("Failed to load generic greeting", e);
    } finally {
      setIsLoadingGreeting(false);
    }
  }, []);

  const loadData = useCallback(async () => {
    setLoading(true);
    const result = await getLoyaltyDataAction();
    if (!result.error) {
      setPoints(result.points ?? 0);
      setTransactions(
        (result.transactions as unknown as LoyaltyTransaction[]) ?? [],
      );
    }
    setLoading(false);
    // Fetch greeting after loading points
    if (!result.error) {
      fetchGreeting(result.points ?? 0);
    }
  }, [fetchGreeting]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleRedeem = async () => {
    const pts = parseInt(redeemPoints);
    if (isNaN(pts) || pts < 100) {
      toast.error("Minimum 100 points required.");
      return;
    }
    if (pts > points) {
      toast.error("Insufficient points balance.");
      return;
    }

    setIsRedeeming(true);
    const result = await redeemPointsAction(pts);
    if (result.error) {
      toast.error(result.error);
    } else {
      toast.success(`Redeemed! Your coupon code is ${result.code}`, {
        description: `Use code ${result.code} to get ₹${((result.discount as number) ?? 0).toFixed(2)} off`,
        duration: 10000,
        action: {
          label: "Copy Code",
          onClick: () => {
            navigator.clipboard.writeText(result.code as string);
            toast.success("Coupon code copied to clipboard!");
          },
        },
      });
      setPoints(result.newBalance ?? 0);
      setRedeemOpen(false);
      setRedeemPoints("");
      loadData();
    }
    setIsRedeeming(false);
  };

  // Tiers based on total points earned (lifetime)
  const totalEarned = transactions
    .filter((t) => t.points > 0)
    .reduce((sum, t) => sum + t.points, 0);

  const tier =
    totalEarned >= 5000
      ? {
          name: "Platinum",
          color: "from-slate-300 to-slate-500",
          textColor: "text-slate-300",
          next: null,
          progress: 100,
        }
      : totalEarned >= 2000
        ? {
            name: "Gold",
            color: "from-amber-400 to-yellow-600",
            textColor: "text-amber-400",
            next: "Platinum",
            progress: ((totalEarned - 2000) / 3000) * 100,
          }
        : totalEarned >= 500
          ? {
              name: "Silver",
              color: "from-gray-300 to-gray-500",
              textColor: "text-gray-300",
              next: "Gold",
              progress: ((totalEarned - 500) / 1500) * 100,
            }
          : {
              name: "Bronze",
              color: "from-orange-400 to-orange-600",
              textColor: "text-orange-400",
              next: "Silver",
              progress: (totalEarned / 500) * 100,
            };

  useEffect(() => {
    if (progressRef.current && tier.next) {
      progressRef.current.style.width = `${Math.min(100, tier.progress)}%`;
    }
  }, [tier.progress, tier.next]);

  if (loading) {
    return (
      <div className="p-12 text-center">
        <Loader2 className="w-6 h-6 animate-spin mx-auto text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Points Overview */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Balance Card */}
        <div className="sm:col-span-2 bg-card border border-border rounded-2xl overflow-hidden shadow-sm flex flex-col">
          <div className={`h-1.5 bg-gradient-to-r ${tier.color}`} />
          <div className="p-6 sm:p-8 flex-1 flex flex-col">
            <div className="flex items-start justify-between mb-2">
              <div>
                <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-2">
                  Available Points
                </p>
                <p className="text-4xl sm:text-5xl font-heading font-bold text-foreground">
                  {points.toLocaleString("en-IN")}
                </p>
                <p className="text-sm text-muted-foreground mt-1">
                  Worth ₹{(points / 10).toFixed(2)} in discounts
                </p>
              </div>
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-amber-500/10 to-yellow-500/10 flex items-center justify-center shrink-0">
                <Coins className="w-7 h-7 text-amber-500" />
              </div>
            </div>

            {/* AI Greeting */}
            <div className="mb-6 flex-1">
              {isLoadingGreeting ? (
                <div className="h-4 w-3/4 bg-muted animate-pulse rounded"></div>
              ) : greeting ? (
                <p className="text-sm font-medium text-foreground/80 italic">
                  &quot;{greeting}&quot;{" "}
                  <span className="text-xs text-muted-foreground ml-1">
                    - AI Assistant
                  </span>
                </p>
              ) : null}
            </div>

            <Button
              onClick={() => setRedeemOpen(true)}
              disabled={points < 100}
              className="gap-2 font-semibold h-11 px-6 rounded-full"
            >
              <Gift className="w-4 h-4" /> Redeem Points
            </Button>
          </div>
        </div>

        {/* Tier Card */}
        <div className="bg-card border border-border rounded-2xl overflow-hidden shadow-sm">
          <div className={`h-1.5 bg-gradient-to-r ${tier.color}`} />
          <div className="p-6">
            <div className="flex items-center gap-3 mb-4">
              <div
                className={`w-10 h-10 rounded-full bg-gradient-to-br ${tier.color} flex items-center justify-center`}
              >
                <Star className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className={`text-lg font-bold ${tier.textColor}`}>
                  {tier.name}
                </p>
                <p className="text-xs text-muted-foreground">Current Tier</p>
              </div>
            </div>
            {tier.next && (
              <div className="space-y-2">
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>{tier.name}</span>
                  <span>{tier.next}</span>
                </div>
                <div className="w-full h-2 bg-secondary rounded-full overflow-hidden">
                  <div
                    ref={progressRef}
                    className={`h-full bg-gradient-to-r ${tier.color} rounded-full transition-all duration-500`}
                  />
                </div>
              </div>
            )}

            <div className="mt-4 space-y-2 text-xs text-muted-foreground">
              <p className="font-semibold text-foreground text-sm">
                How to earn:
              </p>
              <p className="flex items-center gap-2">
                <TrendingUp className="w-3.5 h-3.5 text-primary" />1 point per
                ₹10 spent
              </p>
              <p className="flex items-center gap-2">
                <Gift className="w-3.5 h-3.5 text-primary" />
                100 points per referral
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Transaction History */}
      <div className="bg-card border border-border rounded-2xl overflow-hidden shadow-sm">
        <div className="h-1 bg-gradient-to-r from-primary via-emerald-400 to-primary/50" />
        <div className="p-6">
          <h3 className="text-lg font-heading font-bold mb-4 flex items-center gap-3">
            <span className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center">
              <History className="w-4.5 h-4.5 text-primary" />
            </span>
            Points History
          </h3>

          {transactions.length === 0 ? (
            <div className="py-10 text-center">
              <Coins className="w-10 h-10 text-muted-foreground/30 mx-auto mb-3" />
              <p className="text-muted-foreground">
                No transactions yet. Start shopping to earn points!
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {transactions.map((tx) => (
                <div
                  key={tx.id}
                  className="flex items-center justify-between p-4 rounded-xl bg-secondary/30 border border-border/30 hover:bg-secondary/50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-9 h-9 rounded-full flex items-center justify-center ${
                        tx.points > 0 ? "bg-emerald-500/10" : "bg-red-500/10"
                      }`}
                    >
                      {tx.points > 0 ? (
                        <ArrowUpRight className="w-4 h-4 text-emerald-600" />
                      ) : (
                        <ArrowDownRight className="w-4 h-4 text-red-500" />
                      )}
                    </div>
                    <div>
                      <p className="text-sm font-semibold">{tx.description}</p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(tx.created_at).toLocaleDateString("en-IN", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        })}
                      </p>
                    </div>
                  </div>
                  <p
                    className={`text-sm font-bold ${
                      tx.points > 0 ? "text-emerald-600" : "text-red-500"
                    }`}
                  >
                    {tx.points > 0 ? "+" : ""}
                    {tx.points}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Redeem Dialog */}
      <Dialog open={redeemOpen} onOpenChange={setRedeemOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Redeem Points</DialogTitle>
            <DialogDescription>
              Convert your points to a discount. 10 points = ₹1. Minimum 100
              points.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="text-center">
              <p className="text-sm text-muted-foreground mb-1">
                Available Balance
              </p>
              <p className="text-3xl font-bold text-primary">
                {points.toLocaleString("en-IN")} pts
              </p>
            </div>
            <div>
              <Input
                type="number"
                min={100}
                max={points}
                step={10}
                placeholder="Enter points to redeem"
                value={redeemPoints}
                onChange={(e) => setRedeemPoints(e.target.value)}
                className="text-center text-lg h-12"
              />
              {redeemPoints && parseInt(redeemPoints) >= 100 && (
                <p className="text-center text-sm text-muted-foreground mt-2">
                  You&apos;ll get{" "}
                  <span className="font-bold text-primary">
                    ₹{(parseInt(redeemPoints) / 10).toFixed(2)}
                  </span>{" "}
                  discount on your next order
                </p>
              )}
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setRedeemOpen(false)}
              disabled={isRedeeming}
            >
              Cancel
            </Button>
            <Button
              onClick={handleRedeem}
              disabled={
                isRedeeming ||
                !redeemPoints ||
                parseInt(redeemPoints) < 100 ||
                parseInt(redeemPoints) > points
              }
              className="gap-2"
            >
              {isRedeeming ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Gift className="w-4 h-4" />
              )}
              Redeem
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
