"use server";

import { auth } from "@/auth";
import { runInTransaction } from "@/lib/db-transaction";
import { prisma } from "@/lib/prisma";
import { debitUserBalance } from "@/lib/wallet";
import { RequestStatus, WalletTxnType } from "@prisma/client";
import { revalidatePath } from "next/cache";

export async function approveWithdraw(withdrawId: string): Promise<{ ok: boolean; error?: string }> {
  const session = await auth();
  if (!session?.user?.id || session.user.role !== "ADMIN") {
    return { ok: false, error: "Unauthorized." };
  }

  try {
    await runInTransaction(async (tx) => {
      const w = await tx.withdrawRequest.findUnique({ where: { id: withdrawId } });
      if (!w || w.status !== RequestStatus.PENDING) {
        throw new Error("Withdrawal not pending.");
      }

      await debitUserBalance(tx, w.userId, w.amount, WalletTxnType.WITHDRAW, {
        memo: "Withdrawal approved",
        withdrawId: w.id,
      });

      await tx.withdrawRequest.update({
        where: { id: withdrawId },
        data: {
          status: RequestStatus.APPROVED,
          reviewedById: session.user.id,
          reviewedAt: new Date(),
        },
      });
    });

    revalidatePath("/admin/withdrawals");
    revalidatePath("/user/withdraw");

    return { ok: true };
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Failed to approve.";
    return { ok: false, error: msg };
  }
}

export async function rejectWithdraw(withdrawId: string): Promise<{ ok: boolean; error?: string }> {
  const session = await auth();
  if (!session?.user?.id || session.user.role !== "ADMIN") {
    return { ok: false, error: "Unauthorized." };
  }

  const w = await prisma.withdrawRequest.findUnique({ where: { id: withdrawId } });
  if (!w || w.status !== RequestStatus.PENDING) {
    return { ok: false, error: "Withdrawal not pending." };
  }

  await prisma.withdrawRequest.update({
    where: { id: withdrawId },
    data: {
      status: RequestStatus.REJECTED,
      reviewedById: session.user.id,
      reviewedAt: new Date(),
    },
  });

  revalidatePath("/admin/withdrawals");

  return { ok: true };
}
