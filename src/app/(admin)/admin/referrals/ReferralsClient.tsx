"use client";

import { useState } from "react";
import { StatusBadge } from "@/components/ui/StatusBadge";

interface Referral {
  id: string;
  referrerId: string;
  referrerName: string;
  referrerEmail: string;
  referredId: string | null;
  referredName: string | null;
  referredEmail: string | null;
  referralCode: string;
  status: string;
  rewardPoints: number;
  createdAt: string;
}

export function ReferralsClient({ referrals }: { referrals: Referral[] }) {
  const [filter, setFilter] = useState("all");

  const filtered =
    filter === "all" ? referrals : referrals.filter((r) => r.status === filter);

  return (
    <div className="bg-card border border-border rounded-card overflow-hidden">
      {/* Filter tabs */}
      <div className="border-b border-border px-4 py-3 flex gap-2 flex-wrap">
        {["all", "pending", "completed"].map((s) => (
          <button
            key={s}
            onClick={() => setFilter(s)}
            className={`px-3 py-1.5 text-xs font-medium rounded-full border transition-colors capitalize ${
              filter === s
                ? "bg-primary text-primary-foreground border-primary"
                : "bg-secondary/50 text-muted-foreground border-border hover:border-primary/40"
            }`}
          >
            {s}
          </button>
        ))}
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-secondary/30 text-muted-foreground border-b border-border text-xs">
              <th className="px-4 py-3 text-left font-medium">Referrer</th>
              <th className="px-4 py-3 text-left font-medium">Referred</th>
              <th className="px-4 py-3 text-left font-medium">Code</th>
              <th className="px-4 py-3 text-center font-medium">Status</th>
              <th className="px-4 py-3 text-right font-medium">Reward Pts</th>
              <th className="px-4 py-3 text-right font-medium">Date</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {filtered.length === 0 ? (
              <tr>
                <td
                  colSpan={6}
                  className="px-4 py-10 text-center text-muted-foreground"
                >
                  No referrals found.
                </td>
              </tr>
            ) : (
              filtered.map((r) => (
                <tr
                  key={r.id}
                  className="hover:bg-secondary/10 transition-colors"
                >
                  <td className="px-4 py-3">
                    <p className="font-medium text-foreground">
                      {r.referrerName}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {r.referrerEmail}
                    </p>
                  </td>
                  <td className="px-4 py-3">
                    {r.referredName ? (
                      <>
                        <p className="font-medium text-foreground">
                          {r.referredName}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {r.referredEmail}
                        </p>
                      </>
                    ) : (
                      <span className="text-xs text-muted-foreground italic">
                        Not yet used
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <span className="font-mono text-xs font-medium bg-secondary px-2 py-0.5 rounded">
                      {r.referralCode}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <StatusBadge status={r.status} />
                  </td>
                  <td className="px-4 py-3 text-right">
                    {r.rewardPoints > 0 ? (
                      <span className="font-semibold text-emerald-600">
                        +{r.rewardPoints}
                      </span>
                    ) : (
                      <span className="text-muted-foreground text-xs">—</span>
                    )}
                  </td>
                  <td
                    className="px-4 py-3 text-right text-xs text-muted-foreground"
                    suppressHydrationWarning
                  >
                    {new Date(r.createdAt).toLocaleDateString("en-IN", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    })}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
