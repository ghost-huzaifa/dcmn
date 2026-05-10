import type { Prisma, WalletTxnType } from "@prisma/client";

type Tx = Omit<
  Prisma.TransactionClient,
  "$connect" | "$disconnect" | "$on" | "$transaction" | "$extends"
>;

export async function creditUserBalance(
  tx: Tx,
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
  const user = await tx.user.findUniqueOrThrow({ where: { id: userId } });
  const next = user.balance.plus(amount);
  await tx.user.update({
    where: { id: userId },
    data: { balance: next },
  });
  await tx.walletTransaction.create({
    data: {
      userId,
      type,
      amount,
      balanceAfter: next,
      memo: opts?.memo,
      depositId: opts?.depositId ?? undefined,
      withdrawId: opts?.withdrawId ?? undefined,
      userPlanId: opts?.userPlanId ?? undefined,
    },
  });
}

export async function debitUserBalance(
  tx: Tx,
  userId: string,
  amount: Prisma.Decimal,
  type: WalletTxnType,
  opts?: { memo?: string; withdrawId?: string }
): Promise<void> {
  const user = await tx.user.findUniqueOrThrow({ where: { id: userId } });
  if (user.balance.lessThan(amount)) {
    throw new Error("Insufficient balance");
  }
  const next = user.balance.minus(amount);
  await tx.user.update({
    where: { id: userId },
    data: { balance: next },
  });
  await tx.walletTransaction.create({
    data: {
      userId,
      type,
      amount,
      balanceAfter: next,
      memo: opts?.memo,
      withdrawId: opts?.withdrawId,
    },
  });
}
