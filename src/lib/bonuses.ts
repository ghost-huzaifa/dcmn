import type { Prisma } from "@prisma/client";
import { WalletTxnType } from "@prisma/client";
import { creditUserBalance } from "@/lib/wallet";

type Tx = Omit<
  Prisma.TransactionClient,
  "$connect" | "$disconnect" | "$on" | "$transaction" | "$extends"
>;

type BonusSettings = {
  welcomeBonusPct: Prisma.Decimal;
  refLevel1Pct: Prisma.Decimal;
  refLevel2Pct: Prisma.Decimal;
  refLevel3Pct: Prisma.Decimal;
  taskOverrideLevel1Pct: Prisma.Decimal;
  taskOverrideLevel2Pct: Prisma.Decimal;
  taskOverrideLevel3Pct: Prisma.Decimal;
};

async function getBonusSettings(tx: Tx): Promise<BonusSettings> {
  const s = await tx.siteSettings.findUniqueOrThrow({ where: { id: "singleton" } });
  return {
    welcomeBonusPct: s.welcomeBonusPct,
    refLevel1Pct: s.refLevel1Pct,
    refLevel2Pct: s.refLevel2Pct,
    refLevel3Pct: s.refLevel3Pct,
    taskOverrideLevel1Pct: s.taskOverrideLevel1Pct,
    taskOverrideLevel2Pct: s.taskOverrideLevel2Pct,
    taskOverrideLevel3Pct: s.taskOverrideLevel3Pct,
  };
}

function pctOf(base: Prisma.Decimal, pct: Prisma.Decimal): Prisma.Decimal {
  return base.mul(pct).div(100);
}

/** 7% welcome bonus to the buyer on plan activation */
export async function creditWelcomeBonus(
  tx: Tx,
  userId: string,
  depositAmount: Prisma.Decimal,
  planCode: string
): Promise<void> {
  const settings = await getBonusSettings(tx);
  const amount = pctOf(depositAmount, settings.welcomeBonusPct);
  if (amount.lte(0)) return;

  await creditUserBalance(tx, userId, amount, WalletTxnType.REFERRAL, {
    memo: `Welcome bonus ${settings.welcomeBonusPct}% — ${planCode}`,
  });
}

/** 12% / 4% / 1% of deposit to up-line referrers */
export async function payDepositReferrals(
  tx: Tx,
  buyerUserId: string,
  depositAmount: Prisma.Decimal,
  planCode: string
): Promise<void> {
  const settings = await getBonusSettings(tx);
  const pcts = [settings.refLevel1Pct, settings.refLevel2Pct, settings.refLevel3Pct];
  const labels = ["A", "B", "C"];

  let current = await tx.user.findUnique({
    where: { id: buyerUserId },
    select: { referrerId: true },
  });

  for (let i = 0; i < 3; i++) {
    const rid = current?.referrerId;
    if (!rid) break;

    const amount = pctOf(depositAmount, pcts[i]);
    if (amount.gt(0)) {
      await creditUserBalance(tx, rid, amount, WalletTxnType.REFERRAL, {
        memo: `Referral ${labels[i]} level ${pcts[i]}% — ${planCode}`,
      });
    }

    current = await tx.user.findUnique({
      where: { id: rid },
      select: { referrerId: true },
    });
  }
}

/** 5% / 2% / 1% of per-task commission to up-line on each task completion */
export async function payTaskOverrides(
  tx: Tx,
  doerUserId: string,
  taskCommission: Prisma.Decimal,
  planCode: string
): Promise<void> {
  const settings = await getBonusSettings(tx);
  const pcts = [
    settings.taskOverrideLevel1Pct,
    settings.taskOverrideLevel2Pct,
    settings.taskOverrideLevel3Pct,
  ];
  const labels = ["A", "B", "C"];

  let current = await tx.user.findUnique({
    where: { id: doerUserId },
    select: { referrerId: true },
  });

  for (let i = 0; i < 3; i++) {
    const rid = current?.referrerId;
    if (!rid) break;

    const amount = pctOf(taskCommission, pcts[i]);
    if (amount.gt(0)) {
      await creditUserBalance(tx, rid, amount, WalletTxnType.REFERRAL, {
        memo: `Task override ${labels[i]} level ${pcts[i]}% — ${planCode}`,
      });
    }

    current = await tx.user.findUnique({
      where: { id: rid },
      select: { referrerId: true },
    });
  }
}
