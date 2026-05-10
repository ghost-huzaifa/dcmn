import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { formatPkr } from "@/lib/money";
import Link from "next/link";
import { redirect } from "next/navigation";

export default async function WithdrawHistoryPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const rows = await prisma.withdrawRequest.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: "desc" },
    take: 100,
  });

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 via-blue-950 to-slate-950">
      <div className="mx-auto max-w-lg space-y-6 px-4 py-10 pb-24">
      <header className="text-center">
        <h1 className="text-xl font-bold text-white">Withdraw Log</h1>
      </header>

      <Link
        href="/user/dashboard"
        className="inline-flex rounded-full bg-blue-600 px-4 py-2 text-sm font-semibold text-white"
      >
        ← Back Now
      </Link>

      <div className="rounded-3xl border border-slate-800 bg-slate-900/80 p-4 text-white shadow-inner">
        {rows.length === 0 ? (
          <p className="py-8 text-center text-sm italic text-slate-400">
            Data not found.
          </p>
        ) : (
          <ul className="divide-y divide-slate-700">
            {rows.map((r) => (
              <li key={r.id} className="py-3 text-sm">
                <div className="flex justify-between font-medium">
                  <span>{formatPkr(r.amount)}</span>
                  <span className="text-xs uppercase">{r.status}</span>
                </div>
                <p className="mt-1 text-xs text-slate-400">
                  {r.createdAt.toLocaleString()}
                </p>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
    </div>
  );
}
