"use server";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { UserPlanStatus } from "@prisma/client";
import { revalidatePath } from "next/cache";

export async function purchasePlan(planId: string): Promise<{ ok: boolean; error?: string }> {
  const session = await auth();
  if (!session?.user?.id || session.user.role !== "USER") {
    return { ok: false, error: "Unauthorized." };
  }

  const plan = await prisma.plan.findUnique({ where: { id: planId } });
  if (!plan) return { ok: false, error: "Plan not found." };

  const active = await prisma.userPlan.findFirst({
    where: { userId: session.user.id, status: UserPlanStatus.ACTIVE },
  });
  if (active) {
    return { ok: false, error: "You already have an active plan. Contact support to change tier." };
  }

  const pendingPlan = await prisma.userPlan.findFirst({
    where: { userId: session.user.id, status: UserPlanStatus.PENDING_DEPOSIT },
  });
  if (pendingPlan) {
    return { ok: false, error: "You already have a pending purchase. Complete or cancel deposit first." };
  }

  const deposit = await prisma.depositRequest.create({
    data: {
      userId: session.user.id,
      planId: plan.id,
      amount: plan.securityDeposit,
      status: "PENDING",
    },
  });

  await prisma.userPlan.create({
    data: {
      userId: session.user.id,
      planId: plan.id,
      status: UserPlanStatus.PENDING_DEPOSIT,
      depositRequestId: deposit.id,
    },
  });

  revalidatePath("/plans");
  revalidatePath("/user/dashboard");
  revalidatePath("/user/deposit");
  return { ok: true };
}
