"use server";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function updateDepositNote(
  depositId: string,
  note: string
): Promise<{ ok: boolean; error?: string }> {
  const session = await auth();
  if (!session?.user?.id) return { ok: false, error: "Unauthorized." };

  const dep = await prisma.depositRequest.findFirst({
    where: { id: depositId, userId: session.user.id },
  });
  if (!dep) return { ok: false, error: "Deposit not found." };
  if (dep.status !== "PENDING") return { ok: false, error: "Deposit is no longer pending." };

  await prisma.depositRequest.update({
    where: { id: depositId },
    data: { note: note.slice(0, 2000) },
  });

  revalidatePath("/user/deposit");
  return { ok: true };
}
