"use client";

import { useState, useEffect } from "react";
import {
  Users,
  Copy,
  Check,
  Gift,
  Loader2,
  UserPlus,
  PartyPopper,
  ArrowRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import {
  getReferralDataAction,
  applyReferralCodeAction,
} from "@/features/profile/actions/referralActions";

interface Referral {
  id: string;
  status: string;
  reward_points: number;
  created_at: string;
  referred: { name: string | null; email: string | null } | null;
}

export function ReferralTab() {
  const [loading, setLoading] = useState(true);
  const [referralCode, setReferralCode] = useState("");
  const [referrals, setReferrals] = useState<Referral[]>([]);
  const [totalEarned, setTotalEarned] = useState(0);
  const [copied, setCopied] = useState(false);
  const [applyCode, setApplyCode] = useState("");
  const [isApplying, setIsApplying] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    const result = await getReferralDataAction();
    if (!result.error) {
      setReferralCode(result.referralCode ?? "");
      setReferrals((result.referrals as unknown as Referral[]) ?? []);
      setTotalEarned((result.totalEarned as number) ?? 0);
    }
    setLoading(false);
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(referralCode);
      setCopied(true);
      toast.success("Referral code copied!");
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error("Failed to copy code.");
    }
  };

  const handleShareLink = async () => {
    const shareUrl = `${window.location.origin}?ref=${referralCode}`;
    if (navigator.share) {
      try {
        await navigator.share({
          title: "Join FreshMart!",
          text: `Use my referral code ${referralCode} to get 100 bonus points on FreshMart!`,
          url: shareUrl,
        });
      } catch {
        // User cancelled share
      }
    } else {
      await navigator.clipboard.writeText(shareUrl);
      toast.success("Share link copied!");
    }
  };

  const handleApplyCode = async () => {
    if (!applyCode.trim()) {
      toast.error("Please enter a referral code.");
      return;
    }

    setIsApplying(true);
    const result = await applyReferralCodeAction(applyCode.trim());
    if (result.error) {
      toast.error(result.error);
    } else {
      toast.success(
        `Referral applied! You earned ${result.pointsEarned} bonus points!`,
      );
      setApplyCode("");
      loadData();
    }
    setIsApplying(false);
  };

  if (loading) {
    return (
      <div className="p-12 text-center">
        <Loader2 className="w-6 h-6 animate-spin mx-auto text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Referral Code Card */}
      <div className="bg-card border border-border rounded-2xl overflow-hidden shadow-sm">
        <div className="h-1.5 bg-gradient-to-r from-violet-500 via-purple-500 to-fuchsia-500" />
        <div className="p-6 sm:p-8">
          <div className="flex items-start justify-between mb-6">
            <div>
              <h3 className="text-lg font-heading font-bold flex items-center gap-3 mb-2">
                <span className="w-9 h-9 rounded-lg bg-violet-500/10 flex items-center justify-center">
                  <Gift className="w-4.5 h-4.5 text-violet-500" />
                </span>
                Your Referral Code
              </h3>
              <p className="text-sm text-muted-foreground">
                Share your code with friends. You both earn 100 bonus loyalty
                points!
              </p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 mb-6">
            <div className="flex-1 relative">
              <Input
                readOnly
                value={referralCode}
                className="text-center text-2xl font-mono font-bold h-14 bg-secondary/50 border-2 border-dashed border-primary/30 tracking-[0.3em]"
              />
            </div>
            <div className="flex gap-2">
              <Button
                onClick={handleCopy}
                variant="outline"
                className="gap-2 h-14 px-5 font-semibold"
              >
                {copied ? (
                  <Check className="w-4 h-4 text-emerald-500" />
                ) : (
                  <Copy className="w-4 h-4" />
                )}
                {copied ? "Copied!" : "Copy"}
              </Button>
              <Button
                onClick={handleShareLink}
                className="gap-2 h-14 px-5 font-semibold bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700"
              >
                <UserPlus className="w-4 h-4" />
                <span className="hidden sm:inline">Share</span>
              </Button>
            </div>
          </div>

          {/* How it works */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 p-5 rounded-xl bg-secondary/30 border border-border/30">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-violet-500/10 flex items-center justify-center shrink-0 text-sm font-bold text-violet-500">
                1
              </div>
              <p className="text-sm text-muted-foreground">
                Share your code with a friend
              </p>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-violet-500/10 flex items-center justify-center shrink-0 text-sm font-bold text-violet-500">
                2
              </div>
              <p className="text-sm text-muted-foreground">
                They sign up and apply your code
              </p>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-violet-500/10 flex items-center justify-center shrink-0 text-sm font-bold text-violet-500">
                3
              </div>
              <p className="text-sm text-muted-foreground">
                You both earn 100 bonus points!
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Apply a Referral Code */}
      <div className="bg-card border border-border rounded-2xl overflow-hidden shadow-sm">
        <div className="h-1 bg-gradient-to-r from-emerald-400 via-primary to-emerald-600/50" />
        <div className="p-6">
          <h3 className="text-lg font-heading font-bold mb-4 flex items-center gap-3">
            <span className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center">
              <PartyPopper className="w-4.5 h-4.5 text-primary" />
            </span>
            Have a Referral Code?
          </h3>
          <div className="flex gap-3">
            <Input
              placeholder="Enter referral code"
              value={applyCode}
              onChange={(e) => setApplyCode(e.target.value.toUpperCase())}
              className="font-mono uppercase tracking-widest h-11"
              maxLength={20}
            />
            <Button
              onClick={handleApplyCode}
              disabled={isApplying || !applyCode.trim()}
              className="gap-2 h-11 px-6 font-semibold shrink-0"
            >
              {isApplying ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <ArrowRight className="w-4 h-4" />
              )}
              Apply
            </Button>
          </div>
        </div>
      </div>

      {/* Referrals Stats & History */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-card border border-border rounded-xl p-5 text-center">
          <div className="w-10 h-10 rounded-lg bg-violet-500/10 flex items-center justify-center mx-auto mb-3">
            <Users className="w-5 h-5 text-violet-500" />
          </div>
          <p className="text-2xl font-heading font-bold text-foreground">
            {referrals.length}
          </p>
          <p className="text-xs text-muted-foreground font-medium">
            Friends Referred
          </p>
        </div>
        <div className="bg-card border border-border rounded-xl p-5 text-center">
          <div className="w-10 h-10 rounded-lg bg-emerald-500/10 flex items-center justify-center mx-auto mb-3">
            <Check className="w-5 h-5 text-emerald-500" />
          </div>
          <p className="text-2xl font-heading font-bold text-emerald-600">
            {
              referrals.filter(
                (r) => r.status === "rewarded" || r.status === "completed",
              ).length
            }
          </p>
          <p className="text-xs text-muted-foreground font-medium">Completed</p>
        </div>
        <div className="bg-card border border-border rounded-xl p-5 text-center">
          <div className="w-10 h-10 rounded-lg bg-amber-500/10 flex items-center justify-center mx-auto mb-3">
            <Gift className="w-5 h-5 text-amber-500" />
          </div>
          <p className="text-2xl font-heading font-bold text-amber-600">
            {totalEarned}
          </p>
          <p className="text-xs text-muted-foreground font-medium">
            Points Earned
          </p>
        </div>
      </div>

      {/* Referral History */}
      {referrals.length > 0 && (
        <div className="bg-card border border-border rounded-2xl overflow-hidden shadow-sm">
          <div className="h-1 bg-gradient-to-r from-violet-500/50 via-purple-500/50 to-fuchsia-500/50" />
          <div className="p-6">
            <h3 className="text-lg font-heading font-bold mb-4">
              Referral History
            </h3>
            <div className="space-y-3">
              {referrals.map((ref) => (
                <div
                  key={ref.id}
                  className="flex items-center justify-between p-4 rounded-xl bg-secondary/30 border border-border/30"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-violet-500/10 flex items-center justify-center">
                      <UserPlus className="w-4 h-4 text-violet-500" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold">
                        {(ref.referred as { name: string | null } | null)
                          ?.name || "Friend"}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(ref.created_at).toLocaleDateString("en-IN", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        })}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span
                      className={`inline-block text-xs font-bold px-2.5 py-1 rounded-full ${
                        ref.status === "rewarded" || ref.status === "completed"
                          ? "bg-emerald-500/10 text-emerald-600"
                          : "bg-amber-500/10 text-amber-600"
                      }`}
                    >
                      {ref.status === "rewarded" || ref.status === "completed"
                        ? `+${ref.reward_points} pts`
                        : "Pending"}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
