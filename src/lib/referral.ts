import type { Prisma } from "@prisma/client";
import { WalletTxnType } from "@prisma/client";
import { creditUserBalance } from "@/lib/wallet";

type Tx = Omit<
  Prisma.TransactionClient,
  "$connect" | "$disconnect" | "$on" | "$transaction" | "$extends"
>;

export async function payReferralBonuses(
  tx: Tx,
  buyerUserId: string,
  planId: string
): Promise<void> {
  const plan = await tx.plan.findUniqueOrThrow({ where: { id: planId } });

  const amounts = [plan.referralLevel1, plan.referralLevel2, plan.referralLevel3];
  let current = await tx.user.findUnique({
    where: { id: buyerUserId },
    select: { referrerId: true },
  });

  for (let i = 0; i < 3; i++) {
    const rid = current?.referrerId;
    if (!rid) break;
    const amt = amounts[i];
    if (amt.gt(0)) {
      await creditUserBalance(tx, rid, amt, WalletTxnType.REFERRAL, {
        memo: `Referral reward — ${plan.code} (level ${i + 1})`,
      });
    }
    current = await tx.user.findUnique({
      where: { id: rid },
      select: { referrerId: true },
    });
  }
}
