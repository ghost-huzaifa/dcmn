import { AdminWithdrawActions } from "@/components/admin-withdraw-actions";
import { prisma } from "@/lib/prisma";
import { formatPkr } from "@/lib/money";

export default async function AdminWithdrawalsPage() {
  const pending = await prisma.withdrawRequest.findMany({
    where: { status: "PENDING" },
    include: { user: true },
    orderBy: { createdAt: "asc" },
  });

  const recent = await prisma.withdrawRequest.findMany({
    where: { status: { not: "PENDING" } },
    include: { user: true },
    orderBy: { updatedAt: "desc" },
    take: 30,
  });

  return (
    <div className="space-y-10">
      <div>
        <h1 className="text-2xl font-bold text-white">Withdrawals</h1>
        <p className="text-sm text-slate-400">
          Approve after sending funds manually; balance debits on approval.
        </p>
      </div>

      <section className="space-y-4">
        <h2 className="font-semibold text-white">Pending</h2>
        {pending.length === 0 ? (
          <p className="text-sm text-slate-500">No pending withdrawals.</p>
        ) : (
          <div className="space-y-3">
            {pending.map((w) => (
              <div
                key={w.id}
                className="flex flex-col gap-3 rounded-2xl border border-slate-800 bg-slate-900 p-4 md:flex-row md:items-start md:justify-between"
              >
                <div className="text-sm">
                  <p className="font-semibold text-white">{w.user.username}</p>
                  <p className="text-slate-300">{formatPkr(w.amount)}</p>
                  <p className="mt-2 whitespace-pre-wrap text-xs text-slate-500">
                    {w.bankDetails}
                  </p>
                </div>
                <AdminWithdrawActions withdrawId={w.id} />
              </div>
            ))}
          </div>
        )}
      </section>

      <section className="space-y-4">
        <h2 className="font-semibold text-white">Recent decisions</h2>
        <div className="overflow-x-auto rounded-xl border border-slate-800">
          <table className="min-w-full text-left text-xs">
            <thead className="bg-slate-900 text-slate-400">
              <tr>
                <th className="px-3 py-2">User</th>
                <th className="px-3 py-2">Amount</th>
                <th className="px-3 py-2">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {recent.map((w) => (
                <tr key={w.id}>
                  <td className="px-3 py-2">{w.user.username}</td>
                  <td className="px-3 py-2">{formatPkr(w.amount)}</td>
                  <td className="px-3 py-2">{w.status}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
