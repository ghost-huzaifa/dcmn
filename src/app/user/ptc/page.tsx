import { auth } from "@/auth";
import { EggGrid } from "@/components/egg-grid";
import { dateKeyKarachi } from "@/lib/date";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { redirect } from "next/navigation";
import { UserPlanStatus } from "@prisma/client";

export default async function CollectEggsPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const activePlan = await prisma.userPlan.findFirst({
    where: { userId: session.user.id, status: UserPlanStatus.ACTIVE },
    include: { plan: true },
  });

  const dateKey = dateKeyKarachi();
  let completed = 0;
  if (activePlan) {
    const state = await prisma.dailyTaskState.findUnique({
      where: {
        userPlanId_dateKey: { userPlanId: activePlan.id, dateKey },
      },
    });
    completed = state?.completedCount ?? 0;
  }

  const taskCount = activePlan?.plan.taskCount ?? 0;
  const remaining = activePlan
    ? Math.max(0, taskCount - completed)
    : 0;
  const commission = activePlan?.plan.taskCommission.toString() ?? "0";

  return (
    <div className="mx-auto min-h-screen max-w-3xl bg-gradient-to-b from-sky-500 to-blue-900 px-4 py-10 pb-24 text-white">
      <header className="mb-8 text-center">
        <p className="text-sm uppercase tracking-wide text-sky-100">Blue Egg Tasks</p>
        <h1 className="text-2xl font-bold">Collect rewards</h1>
        <p className="mt-2 text-sm text-sky-100">
          Tap an egg to earn your task commission for today.
        </p>
      </header>

      {!activePlan && (
        <div className="mx-auto max-w-md rounded-3xl bg-white/10 px-4 py-6 text-center">
          <p className="font-medium">You need to activate a plan first.</p>
          <Link
            href="/plans"
            className="mt-4 inline-block rounded-2xl bg-white px-4 py-2 text-sm font-semibold text-blue-800"
          >
            Buy a plan
          </Link>
        </div>
      )}

      {activePlan && (
        <EggGrid
          taskCommission={commission}
          remaining={remaining}
          taskCount={taskCount}
        />
      )}

      <div className="mt-10 text-center">
        <Link href="/user/dashboard" className="text-sm text-sky-100 underline">
          Back to dashboard
        </Link>
      </div>
    </div>
  );
}
