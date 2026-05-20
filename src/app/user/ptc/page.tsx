import { auth } from "@/auth";
import { TaskList } from "@/components/task-list";
import { dateKeyKarachi } from "@/lib/date";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { redirect } from "next/navigation";
import { UserPlanStatus } from "@prisma/client";

export default async function CollectEggsPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const dateKey = dateKeyKarachi();

  const activePlan = await prisma.userPlan.findFirst({
    where: { userId: session.user.id, status: UserPlanStatus.ACTIVE },
    include: { plan: true },
  });

  const adminTasks = await prisma.adminTask.findMany({
    where: { dateKey },
    orderBy: { position: "asc" },
  });

  const completions = activePlan
    ? await prisma.userTaskCompletion.findMany({
        where: { userId: session.user.id, dateKey },
        select: { taskId: true, earnedAmount: true },
      })
    : [];

  const completionMap = new Map(
    completions.map((c) => [c.taskId, c.earnedAmount.toString()])
  );

  const completedToday = completions.length;
  const taskCount = activePlan?.plan.taskCount ?? 0;
  const commission = activePlan?.plan.taskCommission.toString() ?? "0";

  const tasks = adminTasks.map((t) => ({
    id: t.id,
    title: t.title,
    videoUrl: t.videoUrl,
    completed: completionMap.has(t.id),
    earnedAmount: completionMap.get(t.id) ?? null,
  }));

  return (
    <div className="mx-auto min-h-screen max-w-3xl bg-gradient-to-b from-sky-500 to-blue-900 px-4 py-10 pb-24 text-white">
      <header className="mb-8 text-center">
        <p className="text-sm uppercase tracking-wide text-sky-100">Daily tasks</p>
        <h1 className="text-2xl font-bold">Complete today&apos;s tasks</h1>
        <p className="mt-2 text-sm text-sky-100">
          Watch each video, then mark the task complete to earn your commission.
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
        <TaskList
          tasks={tasks}
          taskCommission={commission}
          completedToday={completedToday}
          dailyCap={taskCount}
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
