import { AutoRefresh } from "@/components/admin/AutoRefresh";
import { getAdminReferralsDataAction } from "@/features/admin/actions/referralActions";
import { ReferralsClient } from "./ReferralsClient";

export const dynamic = "force-dynamic";

export default async function AdminReferralsPage() {
  const result = await getAdminReferralsDataAction();

  if (result.error) {
    return (
      <div className="p-6 text-center text-destructive">
        Error loading referrals data: {result.error}
      </div>
    );
  }

  const { referrals, stats } = result;

  return (
    <div className="space-y-6">
      <div className="flex justify-end mb-2">
        <AutoRefresh intervalMs={30000} tables={["referrals"]} />
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-card border border-border rounded-card p-4 text-center">
          <p className="text-2xl font-bold">{stats!.total}</p>
          <p className="text-xs text-muted-foreground">Total Referrals</p>
        </div>
        <div className="bg-card border border-amber-200 dark:border-amber-800 rounded-card p-4 text-center">
          <p className="text-2xl font-bold text-amber-600 dark:text-amber-400">
            {stats!.pending}
          </p>
          <p className="text-xs text-muted-foreground">Pending</p>
        </div>
        <div className="bg-card border border-emerald-200 dark:border-emerald-800 rounded-card p-4 text-center">
          <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
            {stats!.completed}
          </p>
          <p className="text-xs text-muted-foreground">Completed</p>
        </div>
        <div className="bg-card border border-blue-200 dark:border-blue-800 rounded-card p-4 text-center">
          <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
            {stats!.totalRewardPoints.toLocaleString()}
          </p>
          <p className="text-xs text-muted-foreground">Total Reward Points</p>
        </div>
      </div>

      <ReferralsClient referrals={referrals!} />
    </div>
  );
}
