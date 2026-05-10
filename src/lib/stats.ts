import { prisma } from "@/lib/prisma";
import { WalletTxnType } from "@prisma/client";

export async function getWalletTotals(userId: string) {
  const rows = await prisma.walletTransaction.groupBy({
    by: ["type"],
    where: { userId },
    _sum: { amount: true },
  });

  const map = Object.fromEntries(
    rows.map((r) => [r.type, r._sum.amount?.toString() ?? "0"])
  ) as Record<string, string>;

  const investment = Number(map[WalletTxnType.DEPOSIT] ?? 0);
  const withdraw = Number(map[WalletTxnType.WITHDRAW] ?? 0);
  const referral = Number(map[WalletTxnType.REFERRAL] ?? 0);
  const taskEarn = Number(map[WalletTxnType.TASK_EARN] ?? 0);

  return {
    totalInvestment: investment,
    totalWithdraw: withdraw,
    totalCommissions: referral + taskEarn,
    referralOnly: referral,
    taskEarnOnly: taskEarn,
  };
}
