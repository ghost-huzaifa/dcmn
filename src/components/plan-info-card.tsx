import { formatPkr } from "@/lib/money";
import type { Plan, UserPlan, UserPlanStatus } from "@prisma/client";

export function PlanInfoCard({
  userPlan,
}: {
  userPlan: (UserPlan & { plan: Plan }) | null;
}) {
  if (!userPlan) {
    return (
      <section className="rounded-3xl border border-amber-100 bg-amber-50 px-4 py-4 text-sm text-amber-800">
        No plan selected yet. Purchase a plan from the Plans page to see deposit details here.
      </section>
    );
  }

  const { plan, status } = userPlan;
  const statusLabel =
    status === "ACTIVE"
      ? "Active"
      : status === "PENDING_DEPOSIT"
        ? "Pending deposit"
        : "Ended";

  return (
    <section className="rounded-3xl border border-violet-100 bg-white p-5 shadow-lg">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-medium uppercase tracking-wide text-violet-600">Your plan</p>
          <p className="text-xl font-bold text-slate-900">{plan.code}</p>
          <p className="mt-1 text-xs text-slate-500">{statusLabel}</p>
        </div>
        <p className="text-lg font-bold text-violet-700">{formatPkr(plan.securityDeposit)}</p>
      </div>
      <div className="mt-4 grid grid-cols-3 gap-2 text-center text-xs">
        <div className="rounded-xl bg-violet-50 py-2">
          <p className="font-semibold text-slate-900">{plan.taskCount}</p>
          <p className="text-slate-500">Daily tasks</p>
        </div>
        <div className="rounded-xl bg-violet-50 py-2">
          <p className="font-semibold text-slate-900">{formatPkr(plan.taskCommission)}</p>
          <p className="text-slate-500">Per task</p>
        </div>
        <div className="rounded-xl bg-violet-50 py-2">
          <p className="font-semibold text-slate-900">{formatPkr(plan.dailyWage)}</p>
          <p className="text-slate-500">Daily income</p>
        </div>
      </div>
    </section>
  );
}
