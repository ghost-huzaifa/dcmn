"use server";

import { auth } from "@/auth";
import { runInTransaction } from "@/lib/db-transaction";
import { prisma } from "@/lib/prisma";
import { creditUserBalance } from "@/lib/wallet";
import { creditWelcomeBonus, payDepositReferrals } from "@/lib/bonuses";
import { RequestStatus, UserPlanStatus, WalletTxnType } from "@prisma/client";
import { revalidatePath } from "next/cache";

export async function approveDeposit(depositId: string): Promise<{ ok: boolean; error?: string }> {
  const session = await auth();
  if (!session?.user?.id || session.user.role !== "ADMIN") {
    return { ok: false, error: "Unauthorized." };
  }

  try {
    await runInTransaction(async (tx) => {
      const dep = await tx.depositRequest.findUnique({
        where: { id: depositId },
        include: { plan: true },
      });
      if (!dep || dep.status !== RequestStatus.PENDING) {
        throw new Error("Deposit not pending.");
      }

      await tx.depositRequest.update({
        where: { id: depositId },
        data: {
          status: RequestStatus.APPROVED,
          reviewedById: session.user.id,
          reviewedAt: new Date(),
        },
      });

      await creditUserBalance(tx, dep.userId, dep.amount, WalletTxnType.DEPOSIT, {
        memo: dep.plan ? `Approved deposit — ${dep.plan.code}` : "Approved deposit",
        depositId: dep.id,
      });

      const userPlan = await tx.userPlan.findFirst({
        where: { depositRequestId: dep.id },
      });

      if (
        userPlan &&
        dep.planId &&
        userPlan.status === UserPlanStatus.PENDING_DEPOSIT
      ) {
        await tx.userPlan.update({
          where: { id: userPlan.id },
          data: {
            status: UserPlanStatus.ACTIVE,
            startedAt: new Date(),
          },
        });

        if (!userPlan.referralPaidAt && dep.plan) {
          await creditWelcomeBonus(tx, dep.userId, dep.amount, dep.plan.code);
          await payDepositReferrals(tx, dep.userId, dep.amount, dep.plan.code);
          await tx.userPlan.update({
            where: { id: userPlan.id },
            data: { referralPaidAt: new Date() },
          });
        }
      }
    });

    revalidatePath("/admin/deposits");
    revalidatePath("/admin/users");
    revalidatePath("/user/deposit");
    revalidatePath("/user/dashboard");

    return { ok: true };
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Failed to approve.";
    return { ok: false, error: msg };
  }
}

export async function rejectDeposit(depositId: string): Promise<{ ok: boolean; error?: string }> {
  const session = await auth();
  if (!session?.user?.id || session.user.role !== "ADMIN") {
    return { ok: false, error: "Unauthorized." };
  }

  try {
    await runInTransaction(async (tx) => {
      const dep = await tx.depositRequest.findUnique({ where: { id: depositId } });
      if (!dep || dep.status !== RequestStatus.PENDING) {
        throw new Error("Deposit not pending.");
      }

      await tx.userPlan.deleteMany({
        where: { depositRequestId: depositId },
      });

      await tx.depositRequest.update({
        where: { id: depositId },
        data: {
          status: RequestStatus.REJECTED,
          reviewedById: session.user.id,
          reviewedAt: new Date(),
        },
      });
    });

    revalidatePath("/admin/deposits");
    revalidatePath("/user/deposit");

    return { ok: true };
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Failed to reject.";
    return { ok: false, error: msg };
  }
}
