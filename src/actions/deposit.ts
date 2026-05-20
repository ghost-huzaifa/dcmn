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

const MAX_SCREENSHOT_BYTES = 2 * 1024 * 1024;
const ALLOWED_MIMES = new Set(["image/jpeg", "image/png", "image/webp", "image/gif"]);

export async function uploadDepositScreenshot(
  depositId: string,
  dataUrl: string
): Promise<{ ok: boolean; error?: string }> {
  const session = await auth();
  if (!session?.user?.id) return { ok: false, error: "Unauthorized." };

  const dep = await prisma.depositRequest.findFirst({
    where: { id: depositId, userId: session.user.id },
  });
  if (!dep) return { ok: false, error: "Deposit not found." };
  if (dep.status !== "PENDING") return { ok: false, error: "Deposit is no longer pending." };

  const match = dataUrl.match(/^data:(image\/[a-z+]+);base64,(.+)$/i);
  if (!match) {
    return { ok: false, error: "Invalid image format. Use JPEG, PNG, WebP, or GIF." };
  }

  const mime = match[1].toLowerCase();
  if (!ALLOWED_MIMES.has(mime)) {
    return { ok: false, error: "Unsupported image type." };
  }

  const base64 = match[2];
  const byteLen = Math.ceil((base64.length * 3) / 4);
  if (byteLen > MAX_SCREENSHOT_BYTES) {
    return { ok: false, error: "Image must be 2 MB or smaller." };
  }

  await prisma.depositRequest.update({
    where: { id: depositId },
    data: { screenshotData: base64, screenshotMime: mime },
  });

  revalidatePath("/user/deposit");
  revalidatePath("/admin/deposits");
  return { ok: true };
}
