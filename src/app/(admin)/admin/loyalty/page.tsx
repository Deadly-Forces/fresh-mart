import { AutoRefresh } from "@/components/admin/AutoRefresh";
import { getAdminLoyaltyDataAction } from "@/features/admin/actions/loyaltyActions";
import { LoyaltyClient } from "./LoyaltyClient";

export const dynamic = "force-dynamic";

export default async function AdminLoyaltyPage() {
  const result = await getAdminLoyaltyDataAction();

  if (result.error) {
    return (
      <div className="p-6 text-center text-destructive">
        Error loading loyalty data: {result.error}
      </div>
    );
  }

  const { transactions, stats } = result;

  return (
    <div className="space-y-6">
      <div className="flex justify-end mb-2">
        <AutoRefresh intervalMs={30000} tables={["loyalty_transactions"]} />
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-card border border-border rounded-card p-4 text-center">
          <p className="text-2xl font-bold">{stats!.totalTransactions}</p>
          <p className="text-xs text-muted-foreground">Total Transactions</p>
        </div>
        <div className="bg-card border border-emerald-200 dark:border-emerald-800 rounded-card p-4 text-center">
          <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
            {stats!.totalEarned.toLocaleString()}
          </p>
          <p className="text-xs text-muted-foreground">Points Earned</p>
        </div>
        <div className="bg-card border border-red-200 dark:border-red-800 rounded-card p-4 text-center">
          <p className="text-2xl font-bold text-red-600 dark:text-red-400">
            {stats!.totalRedeemed.toLocaleString()}
          </p>
          <p className="text-xs text-muted-foreground">Points Redeemed</p>
        </div>
        <div className="bg-card border border-blue-200 dark:border-blue-800 rounded-card p-4 text-center">
          <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
            {stats!.uniqueUsers}
          </p>
          <p className="text-xs text-muted-foreground">Active Members</p>
        </div>
      </div>

      <LoyaltyClient transactions={transactions!} />
    </div>
  );
}
