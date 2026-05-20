import { auth } from "@/auth";
import { PlanInfoCard } from "@/components/plan-info-card";
import { WithdrawForm } from "@/components/withdraw-form";
import { prisma } from "@/lib/prisma";
import { formatPkr } from "@/lib/money";
import { getUserPlanContext } from "@/lib/user-plan";
import Link from "next/link";
import { redirect } from "next/navigation";

export default async function WithdrawPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const [user, planCtx] = await Promise.all([
    prisma.user.findUniqueOrThrow({ where: { id: session.user.id } }),
    getUserPlanContext(session.user.id),
  ]);

  return (
    <div className="mx-auto max-w-lg space-y-8 px-4 py-10 pb-24">
      <header className="text-center">
        <h1 className="text-xl font-bold text-slate-900">Withdraw</h1>
        <p className="mt-2 text-sm text-slate-600">
          Submit a request. Admin processes payouts manually.
        </p>
      </header>

      <PlanInfoCard userPlan={planCtx.display} />

      <WithdrawForm maxHint={formatPkr(user.balance)} />

      <div className="text-center">
        <Link href="/user/withdraw/history" className="text-sm font-semibold text-violet-600 underline">
          Withdraw log
        </Link>
      </div>
    </div>
  );
}
