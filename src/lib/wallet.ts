import type { Prisma, WalletTxnType } from "@prisma/client";
import type { DbTx } from "@/lib/db-transaction";

export async function creditUserBalance(
  tx: DbTx,
  userId: string,
  amount: Prisma.Decimal,
  type: WalletTxnType,
  opts?: {
    memo?: string;
    depositId?: string;
    withdrawId?: string;
    userPlanId?: string;
  }
): Promise<void> {
  const updated = await tx.user.update({
    where: { id: userId },
    data: { balance: { increment: amount } },
  });
  await tx.walletTransaction.create({
    data: {
      userId,
      type,
      amount,
      balanceAfter: updated.balance,
      memo: opts?.memo,
      depositId: opts?.depositId ?? undefined,
      withdrawId: opts?.withdrawId ?? undefined,
      userPlanId: opts?.userPlanId ?? undefined,
    },
  });
}

export async function debitUserBalance(
  tx: DbTx,
  userId: string,
  amount: Prisma.Decimal,
  type: WalletTxnType,
  opts?: { memo?: string; withdrawId?: string }
): Promise<void> {
  const user = await tx.user.findUniqueOrThrow({ where: { id: userId } });
  if (user.balance.lessThan(amount)) {
    throw new Error("Insufficient balance");
  }
  const updated = await tx.user.update({
    where: { id: userId },
    data: { balance: { decrement: amount } },
  });
  await tx.walletTransaction.create({
    data: {
      userId,
      type,
      amount,
      balanceAfter: updated.balance,
      memo: opts?.memo,
      withdrawId: opts?.withdrawId,
    },
  });
}
