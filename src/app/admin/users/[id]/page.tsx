import { prisma } from "@/lib/prisma";
import { formatPkr } from "@/lib/money";
import Link from "next/link";
import { notFound } from "next/navigation";

export default async function AdminUserDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const user = await prisma.user.findUnique({
    where: { id },
    include: {
      walletTransactions: { orderBy: { createdAt: "desc" }, take: 50 },
      userPlans: { include: { plan: true }, orderBy: { createdAt: "desc" } },
      depositRequests: { orderBy: { createdAt: "desc" }, take: 20 },
      withdrawRequests: { orderBy: { createdAt: "desc" }, take: 20 },
    },
  });

  if (!user) notFound();

  return (
    <div className="space-y-8">
      <div className="flex items-center gap-4">
        <Link href="/admin/users" className="text-sm text-sky-400 hover:underline">
          ← Users
        </Link>
      </div>
      <header>
        <h1 className="text-2xl font-bold text-white">{user.username}</h1>
        <p className="text-sm text-slate-400">
          {user.email ?? "no email"} · {user.referenceCode} · Balance{" "}
          <strong className="text-white">{formatPkr(user.balance)}</strong>
        </p>
      </header>

      <section>
        <h2 className="mb-2 font-semibold text-white">Plans</h2>
        <ul className="space-y-2 text-sm text-slate-300">
          {user.userPlans.length === 0 ? (
            <li>No plans.</li>
          ) : (
            user.userPlans.map((up) => (
              <li key={up.id}>
                {up.plan.code} — {up.status} — started{" "}
                {up.startedAt?.toLocaleString() ?? "—"}
              </li>
            ))
          )}
        </ul>
      </section>

      <section>
        <h2 className="mb-2 font-semibold text-white">Recent ledger</h2>
        <div className="overflow-x-auto rounded-xl border border-slate-800">
          <table className="min-w-full text-left text-xs">
            <thead className="bg-slate-900 text-slate-400">
              <tr>
                <th className="px-3 py-2">Type</th>
                <th className="px-3 py-2">Amount</th>
                <th className="px-3 py-2">Balance after</th>
                <th className="px-3 py-2">When</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {user.walletTransactions.map((w) => (
                <tr key={w.id}>
                  <td className="px-3 py-2">{w.type}</td>
                  <td className="px-3 py-2">{formatPkr(w.amount)}</td>
                  <td className="px-3 py-2">{formatPkr(w.balanceAfter)}</td>
                  <td className="px-3 py-2">{w.createdAt.toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="grid gap-6 md:grid-cols-2">
        <div>
          <h2 className="mb-2 font-semibold text-white">Deposits</h2>
          <ul className="space-y-1 text-xs text-slate-400">
            {user.depositRequests.map((d) => (
              <li key={d.id}>
                {formatPkr(d.amount)} — {d.status} — {d.createdAt.toLocaleDateString()}
              </li>
            ))}
          </ul>
        </div>
        <div>
          <h2 className="mb-2 font-semibold text-white">Withdrawals</h2>
          <ul className="space-y-1 text-xs text-slate-400">
            {user.withdrawRequests.map((w) => (
              <li key={w.id}>
                {formatPkr(w.amount)} — {w.status} — {w.createdAt.toLocaleDateString()}
              </li>
            ))}
          </ul>
        </div>
      </section>
    </div>
  );
}
