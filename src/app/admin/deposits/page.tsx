import { AdminDepositActions } from "@/components/admin-deposit-actions";
import { prisma } from "@/lib/prisma";
import { formatPkr } from "@/lib/money";

export default async function AdminDepositsPage() {
  const pending = await prisma.depositRequest.findMany({
    where: { status: "PENDING" },
    include: { user: true, plan: true },
    orderBy: { createdAt: "asc" },
  });

  const recent = await prisma.depositRequest.findMany({
    where: { status: { not: "PENDING" } },
    include: { user: true, plan: true },
    orderBy: { updatedAt: "desc" },
    take: 30,
  });

  return (
    <div className="space-y-10">
      <div>
        <h1 className="text-2xl font-bold text-white">Deposit queue</h1>
        <p className="text-sm text-slate-400">Approve after verifying bank receipt.</p>
      </div>

      <section className="space-y-4">
        <h2 className="font-semibold text-white">Pending</h2>
        {pending.length === 0 ? (
          <p className="text-sm text-slate-500">No pending deposits.</p>
        ) : (
          <div className="space-y-3">
            {pending.map((d) => (
              <div
                key={d.id}
                className="flex flex-col gap-3 rounded-2xl border border-slate-800 bg-slate-900 p-4 md:flex-row md:items-center md:justify-between"
              >
                <div className="text-sm">
                  <p className="font-semibold text-white">{d.user.username}</p>
                  <p className="text-slate-400">
                    {d.plan?.code ?? "Deposit"} · {formatPkr(d.amount)}
                  </p>
                  <p className="mt-2 whitespace-pre-wrap text-xs text-slate-500">
                    {d.note || "No note yet."}
                  </p>
                  {d.screenshotData && d.screenshotMime && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={`data:${d.screenshotMime};base64,${d.screenshotData}`}
                      alt="Payment screenshot"
                      className="mt-3 max-h-64 rounded-xl border border-slate-700 object-contain"
                    />
                  )}
                </div>
                <AdminDepositActions depositId={d.id} />
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
                <th className="px-3 py-2">Plan</th>
                <th className="px-3 py-2">Amount</th>
                <th className="px-3 py-2">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {recent.map((d) => (
                <tr key={d.id}>
                  <td className="px-3 py-2">{d.user.username}</td>
                  <td className="px-3 py-2">{d.plan?.code ?? "—"}</td>
                  <td className="px-3 py-2">{formatPkr(d.amount)}</td>
                  <td className="px-3 py-2">{d.status}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
