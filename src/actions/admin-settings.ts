"use server";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function updateBankDisplayText(text: string): Promise<{ ok: boolean; error?: string }> {
  const session = await auth();
  if (!session?.user?.id || session.user.role !== "ADMIN") {
    return { ok: false, error: "Unauthorized." };
  }

  await prisma.siteSettings.upsert({
    where: { id: "singleton" },
    create: { id: "singleton", bankDisplayText: text.slice(0, 8000) },
    update: { bankDisplayText: text.slice(0, 8000) },
  });

  revalidatePath("/admin/settings");
  revalidatePath("/user/deposit");

  return { ok: true };
}
