"use server";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { Prisma } from "@prisma/client";
import { revalidatePath } from "next/cache";

export async function requestWithdraw(
  amountRaw: string,
  bankDetails: string
): Promise<{ ok: boolean; error?: string }> {
  const session = await auth();
  if (!session?.user?.id || session.user.role !== "USER") {
    return { ok: false, error: "Unauthorized." };
  }

  const amount = new Prisma.Decimal(amountRaw);
  if (amount.lte(0)) return { ok: false, error: "Invalid amount." };

  const details = bankDetails.trim();
  if (details.length < 10) return { ok: false, error: "Please enter full bank / wallet details." };

  const user = await prisma.user.findUniqueOrThrow({ where: { id: session.user.id } });
  if (user.balance.lessThan(amount)) {
    return { ok: false, error: "Insufficient balance." };
  }

  await prisma.withdrawRequest.create({
    data: {
      userId: session.user.id,
      amount,
      bankDetails: details.slice(0, 4000),
      status: "PENDING",
    },
  });

  revalidatePath("/user/withdraw");

  return { ok: true };
}
