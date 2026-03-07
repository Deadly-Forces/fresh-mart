"use client";

import { useState } from "react";

interface LoyaltyTransaction {
  id: string;
  userId: string;
  userName: string;
  userEmail: string;
  points: number;
  type: string;
  description: string;
  createdAt: string;
}

export function LoyaltyClient({
  transactions,
}: {
  transactions: LoyaltyTransaction[];
}) {
  const [filter, setFilter] = useState("all");

  const typeFilters = [
    "all",
    "order_reward",
    "referral_bonus",
    "refund_credit",
    "redemption",
  ];
  const filtered =
    filter === "all"
      ? transactions
      : transactions.filter((t) => t.type === filter);

  return (
    <div className="bg-card border border-border rounded-card overflow-hidden">
      {/* Filter tabs */}
      <div className="border-b border-border px-4 py-3 flex gap-2 flex-wrap">
        {typeFilters.map((s) => (
          <button
            key={s}
            onClick={() => setFilter(s)}
            className={`px-3 py-1.5 text-xs font-medium rounded-full border transition-colors capitalize ${
              filter === s
                ? "bg-primary text-primary-foreground border-primary"
                : "bg-secondary/50 text-muted-foreground border-border hover:border-primary/40"
            }`}
          >
            {s.replace(/_/g, " ")}
          </button>
        ))}
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-secondary/30 text-muted-foreground border-b border-border text-xs">
              <th className="px-4 py-3 text-left font-medium">Customer</th>
              <th className="px-4 py-3 text-left font-medium">Type</th>
              <th className="px-4 py-3 text-left font-medium">Description</th>
              <th className="px-4 py-3 text-right font-medium">Points</th>
              <th className="px-4 py-3 text-right font-medium">Date</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {filtered.length === 0 ? (
              <tr>
                <td
                  colSpan={5}
                  className="px-4 py-10 text-center text-muted-foreground"
                >
                  No loyalty transactions found.
                </td>
              </tr>
            ) : (
              filtered.map((t) => (
                <tr
                  key={t.id}
                  className="hover:bg-secondary/10 transition-colors"
                >
                  <td className="px-4 py-3">
                    <p className="font-medium text-foreground">{t.userName}</p>
                    <p className="text-xs text-muted-foreground">
                      {t.userEmail}
                    </p>
                  </td>
                  <td className="px-4 py-3">
                    <span className="inline-block px-2 py-0.5 text-xs font-medium rounded-full bg-secondary capitalize">
                      {t.type.replace(/_/g, " ")}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground text-xs max-w-[200px] truncate">
                    {t.description}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <span
                      className={`font-semibold ${
                        t.points > 0 ? "text-emerald-600" : "text-destructive"
                      }`}
                    >
                      {t.points > 0 ? "+" : ""}
                      {t.points}
                    </span>
                  </td>
                  <td
                    className="px-4 py-3 text-right text-xs text-muted-foreground"
                    suppressHydrationWarning
                  >
                    {new Date(t.createdAt).toLocaleDateString("en-IN", {
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
