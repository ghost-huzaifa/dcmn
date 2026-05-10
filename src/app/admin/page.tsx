import { prisma } from "@/lib/prisma";
import { isPrismaConnectionError } from "@/lib/db-errors";

export default async function AdminHomePage() {
  let users = 0;
  let pendingDeposits = 0;
  let pendingWithdrawals = 0;
  let errorMessage: string | null = null;

  try {
    [users, pendingDeposits, pendingWithdrawals] = await Promise.all([
      prisma.user.count(),
      prisma.depositRequest.count({ where: { status: "PENDING" } }),
      prisma.withdrawRequest.count({ where: { status: "PENDING" } }),
    ]);
  } catch (e) {
    console.error("[admin] dashboard stats failed", e);
    errorMessage = isPrismaConnectionError(e)
      ? "Could not connect to the database. For preview deployments, add DATABASE_URL under Project → Settings → Environment Variables and enable it for Preview (or use the same secret as Production)."
      : "Something went wrong loading stats. Check the server logs for this deployment.";
  }

  if (errorMessage) {
    return (
      <div className="space-y-4">
        <h1 className="text-2xl font-bold text-white">Dashboard</h1>
        <div className="rounded-2xl border border-amber-800/80 bg-amber-950/40 p-5 text-amber-100">
          <p className="font-medium">Unable to load dashboard</p>
          <p className="mt-2 text-sm text-amber-200/90">{errorMessage}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-white">Dashboard</h1>
      <div className="grid gap-4 sm:grid-cols-3">
        <Stat title="Users" value={users} />
        <Stat title="Pending deposits" value={pendingDeposits} />
        <Stat title="Pending withdrawals" value={pendingWithdrawals} />
      </div>
    </div>
  );
}

function Stat({ title, value }: { title: string; value: number }) {
  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900 p-5">
      <p className="text-xs uppercase tracking-wide text-slate-400">{title}</p>
      <p className="mt-2 text-3xl font-bold text-white">{value}</p>
    </div>
  );
}
