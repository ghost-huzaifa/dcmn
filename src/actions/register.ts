"use server";

import bcrypt from "bcryptjs";
import { randomBytes } from "crypto";
import { prisma } from "@/lib/prisma";
import { Role } from "@prisma/client";

function uniqueRefSuffix(): string {
  return randomBytes(3).toString("hex").toUpperCase();
}

export async function registerUser(formData: FormData): Promise<{ ok: boolean; error?: string }> {
  const usernameRaw = (formData.get("username") as string)?.trim().toLowerCase();
  const password = formData.get("password") as string;
  const email = (formData.get("email") as string)?.trim() || undefined;
  const phone = (formData.get("phone") as string)?.trim() || undefined;
  const ref = (formData.get("reference") as string)?.trim();

  if (!usernameRaw || usernameRaw.length < 3) {
    return { ok: false, error: "Username must be at least 3 characters." };
  }
  if (!password || password.length < 6) {
    return { ok: false, error: "Password must be at least 6 characters." };
  }

  const exists = await prisma.user.findUnique({ where: { username: usernameRaw } });
  if (exists) {
    return { ok: false, error: "Username already taken." };
  }

  let referrerId: string | undefined;
  if (ref) {
    const refUser = await prisma.user.findFirst({
      where: { referenceCode: { equals: ref, mode: "insensitive" } },
    });
    if (refUser) referrerId = refUser.id;
  }

  const hash = await bcrypt.hash(password, 10);

  let referenceCode = `${usernameRaw.slice(0, 6).toUpperCase()}${uniqueRefSuffix()}`;
  for (let i = 0; i < 5; i++) {
    const clash = await prisma.user.findUnique({ where: { referenceCode } });
    if (!clash) break;
    referenceCode = `${usernameRaw.slice(0, 6).toUpperCase()}${uniqueRefSuffix()}`;
  }

  await prisma.user.create({
    data: {
      username: usernameRaw,
      email,
      phone,
      passwordHash: hash,
      role: Role.USER,
      referrerId,
      referenceCode,
      balance: 0,
    },
  });

  return { ok: true };
}
