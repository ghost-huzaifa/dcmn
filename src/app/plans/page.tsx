import { auth } from "@/auth";
import { BuyPlanButton } from "@/components/buy-plan-button";
import { prisma } from "@/lib/prisma";
import { formatPkr } from "@/lib/money";
import { redirect } from "next/navigation";

export default async function PlansPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const plans = await prisma.plan.findMany({
    where: { code: { startsWith: "PLAN" } },
    orderBy: { securityDeposit: "asc" },
  });

  return (
    <div className="mx-auto min-h-screen max-w-lg bg-gradient-to-b from-emerald-50 to-slate-50 px-4 py-10 pb-24">
      <h1 className="mb-6 text-center text-xl font-bold text-slate-900">Purchase Hens</h1>
      <div className="space-y-4">
        {plans.map((p) => (
          <article
            key={p.id}
            className="overflow-hidden rounded-3xl border border-sky-100 bg-gradient-to-br from-sky-600 to-blue-700 p-4 text-white shadow-lg"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex gap-3">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white/10 text-2xl">
                  🐔
                </div>
                <div>
                  <p className="text-lg font-bold">{p.code}</p>
                  <p className="text-sm text-sky-100">Daily tasks × deposit tier</p>
                </div>
              </div>
              <p className="text-lg font-bold">{formatPkr(p.securityDeposit)}</p>
            </div>
            <div className="mt-4 grid grid-cols-3 gap-2 text-center text-xs">
              <div className="rounded-xl bg-white/10 py-2">
                <p className="font-semibold">{p.taskCount}</p>
                <p className="text-sky-100">Daily eggs</p>
              </div>
              <div className="rounded-xl bg-white/10 py-2">
                <p className="font-semibold">{formatPkr(p.dailyWage)}</p>
                <p className="text-sky-100">Daily wage</p>
              </div>
              <div className="rounded-xl bg-white/10 py-2">
                <p className="font-semibold">{formatPkr(p.taskCommission)}</p>
                <p className="text-sky-100">Per egg</p>
              </div>
            </div>
            <div className="mt-4">
              <BuyPlanButton planId={p.id} />
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
