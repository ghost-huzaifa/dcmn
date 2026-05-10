"use server";

import { auth } from "@/auth";
import { dateKeyKarachi } from "@/lib/date";
import { prisma } from "@/lib/prisma";
import { creditUserBalance } from "@/lib/wallet";
import { UserPlanStatus, WalletTxnType } from "@prisma/client";
import { revalidatePath } from "next/cache";

export async function collectEgg(): Promise<{ ok: boolean; error?: string; earned?: string }> {
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
    const result = await prisma.$transaction(async (tx) => {
      const state = await tx.dailyTaskState.upsert({
        where: {
          userPlanId_dateKey: { userPlanId: userPlan.id, dateKey },
        },
        create: {
          userId: session.user!.id,
          userPlanId: userPlan.id,
          dateKey,
          completedCount: 0,
        },
        update: {},
      });

      if (state.completedCount >= userPlan.plan.taskCount) {
        throw new Error("Daily limit reached. Come back tomorrow.");
      }

      await tx.dailyTaskState.update({
        where: { id: state.id },
        data: { completedCount: { increment: 1 } },
      });

      await creditUserBalance(
        tx,
        session.user!.id,
        commission,
        WalletTxnType.TASK_EARN,
        {
          memo: `Egg collect (${userPlan.plan.code})`,
          userPlanId: userPlan.id,
        }
      );

      return commission.toString();
    });

    revalidatePath("/user/ptc");
    revalidatePath("/user/dashboard");

    return { ok: true, earned: result };
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Could not collect.";
    return { ok: false, error: msg };
  }
}
