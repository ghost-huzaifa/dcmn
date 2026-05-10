import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { formatPkr } from "@/lib/money";
import Link from "next/link";
import { redirect } from "next/navigation";

export default async function DepositHistoryPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const rows = await prisma.depositRequest.findMany({
    where: { userId: session.user.id },
    include: { plan: true },
    orderBy: { createdAt: "desc" },
    take: 100,
  });

  return (
    <div className="mx-auto max-w-lg space-y-6 px-4 py-10 pb-24">
      <header className="text-center">
        <p className="text-2xl">💵</p>
        <h1 className="text-xl font-bold text-slate-900">Deposit History</h1>
        <p className="text-sm text-slate-600">
          Track your deposit requests and statuses.
        </p>
      </header>

      <Link
        href="/user/dashboard"
        className="inline-flex rounded-full bg-blue-600 px-4 py-2 text-sm font-semibold text-white"
      >
        ← Back
      </Link>

      <div className="rounded-3xl border border-slate-100 bg-white p-4 shadow-sm">
        {rows.length === 0 ? (
          <p className="py-8 text-center text-sm italic text-slate-500">
            No deposits found.
          </p>
        ) : (
          <ul className="divide-y divide-slate-100">
            {rows.map((r) => (
              <li key={r.id} className="py-3 text-sm">
                <div className="flex justify-between font-medium">
                  <span>{r.plan?.code ?? "Deposit"}</span>
                  <span>{formatPkr(r.amount)}</span>
                </div>
                <div className="mt-1 flex justify-between text-xs text-slate-500">
                  <span>{r.status}</span>
                  <span>{r.createdAt.toLocaleString()}</span>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
