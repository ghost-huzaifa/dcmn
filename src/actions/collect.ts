"use server";

import { auth } from "@/auth";
import { dateKeyKarachi } from "@/lib/date";
import { payTaskOverrides } from "@/lib/bonuses";
import { runInTransaction } from "@/lib/db-transaction";
import { formatActionError } from "@/lib/db-errors";
import { prisma } from "@/lib/prisma";
import { creditUserBalance } from "@/lib/wallet";
import { UserPlanStatus, WalletTxnType } from "@prisma/client";
import { revalidatePath } from "next/cache";

export async function markTaskComplete(
  taskId: string
): Promise<{ ok: boolean; error?: string; earned?: string }> {
  const session = await auth();
  if (!session?.user?.id) {
    return { ok: false, error: "Unauthorized." };
  }

  const userPlan = await prisma.userPlan.findFirst({
    where: { userId: session.user.id, status: UserPlanStatus.ACTIVE },
    include: { plan: true },
  });

  if (!userPlan) {
    return { ok: false, error: "You need to activate a plan first." };
  }

  const dateKey = dateKeyKarachi();
  const commission = userPlan.plan.taskCommission;

  try {
    const result = await runInTransaction(async (tx) => {
      const task = await tx.adminTask.findUnique({ where: { id: taskId } });
      if (!task || task.dateKey !== dateKey) {
        throw new Error("This task is not available today.");
      }

      const existing = await tx.userTaskCompletion.findUnique({
        where: { userId_taskId: { userId: session.user!.id, taskId } },
      });
      if (existing) {
        throw new Error("You already completed this task.");
      }

      const completedToday = await tx.userTaskCompletion.count({
        where: { userId: session.user!.id, dateKey },
      });

      if (completedToday >= userPlan.plan.taskCount) {
        throw new Error("Daily limit reached. Come back tomorrow.");
      }

      await tx.userTaskCompletion.create({
        data: {
          userId: session.user!.id,
          userPlanId: userPlan.id,
          taskId,
          dateKey,
          earnedAmount: commission,
        },
      });

      await creditUserBalance(tx, session.user!.id, commission, WalletTxnType.TASK_EARN, {
        memo: `Task complete (${userPlan.plan.code}) — ${task.title}`,
        userPlanId: userPlan.id,
      });

      await payTaskOverrides(tx, session.user!.id, commission, userPlan.plan.code);

      return commission.toString();
    });

    revalidatePath("/user/ptc");
    revalidatePath("/user/dashboard");

    return { ok: true, earned: result };
  } catch (e) {
    const msg = formatActionError(e, "Could not complete task.");
    return { ok: false, error: msg };
  }
}
