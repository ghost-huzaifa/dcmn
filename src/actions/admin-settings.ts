"use server";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { Prisma } from "@prisma/client";
import { revalidatePath } from "next/cache";

export async function updateSiteSettings(formData: FormData): Promise<{ ok: boolean; error?: string }> {
  const session = await auth();
  if (!session?.user?.id || session.user.role !== "ADMIN") {
    return { ok: false, error: "Unauthorized." };
  }

  const bankDisplayText = String(formData.get("bankDisplayText") ?? "").slice(0, 8000);
  const whatsappNumber = String(formData.get("whatsappNumber") ?? "+447836532206").slice(0, 32);

  const pct = (name: string) => {
    const v = Number(formData.get(name));
    if (Number.isNaN(v) || v < 0 || v > 100) {
      throw new Error(`Invalid percentage for ${name}`);
    }
    return new Prisma.Decimal(v);
  };

  try {
    await prisma.siteSettings.upsert({
      where: { id: "singleton" },
      create: {
        id: "singleton",
        bankDisplayText,
        whatsappNumber,
        welcomeBonusPct: pct("welcomeBonusPct"),
        refLevel1Pct: pct("refLevel1Pct"),
        refLevel2Pct: pct("refLevel2Pct"),
        refLevel3Pct: pct("refLevel3Pct"),
        taskOverrideLevel1Pct: pct("taskOverrideLevel1Pct"),
        taskOverrideLevel2Pct: pct("taskOverrideLevel2Pct"),
        taskOverrideLevel3Pct: pct("taskOverrideLevel3Pct"),
      },
      update: {
        bankDisplayText,
        whatsappNumber,
        welcomeBonusPct: pct("welcomeBonusPct"),
        refLevel1Pct: pct("refLevel1Pct"),
        refLevel2Pct: pct("refLevel2Pct"),
        refLevel3Pct: pct("refLevel3Pct"),
        taskOverrideLevel1Pct: pct("taskOverrideLevel1Pct"),
        taskOverrideLevel2Pct: pct("taskOverrideLevel2Pct"),
        taskOverrideLevel3Pct: pct("taskOverrideLevel3Pct"),
      },
    });

    revalidatePath("/admin/settings");
    revalidatePath("/user/deposit");
    revalidatePath("/user/dashboard");
    return { ok: true };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "Failed to save." };
  }
}

