import { prisma } from "@/lib/prisma";

export default async function AdminHomePage() {
  const [users, pendingDeposits, pendingWithdrawals] = await Promise.all([
    prisma.user.count(),
    prisma.depositRequest.count({ where: { status: "PENDING" } }),
    prisma.withdrawRequest.count({ where: { status: "PENDING" } }),
  ]);

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
