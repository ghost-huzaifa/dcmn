"use server";

import { auth } from "@/auth";
import { dateKeyKarachi } from "@/lib/date";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

async function requireAdmin() {
  const session = await auth();
  if (!session?.user?.id || session.user.role !== "ADMIN") {
    throw new Error("Unauthorized.");
  }
  return session;
}

export async function createAdminTask(
  title: string,
  videoUrl: string,
  dateKey?: string
): Promise<{ ok: boolean; error?: string }> {
  try {
    await requireAdmin();
    const t = title.trim();
    const url = videoUrl.trim();
    if (!t || t.length < 2) return { ok: false, error: "Title is required." };
    if (!url || !/^https?:\/\//i.test(url)) {
      return { ok: false, error: "Video URL must start with http:// or https://" };
    }

    const dk = dateKey?.trim() || dateKeyKarachi();
    const maxPos = await prisma.adminTask.aggregate({
      where: { dateKey: dk },
      _max: { position: true },
    });

    await prisma.adminTask.create({
      data: {
        dateKey: dk,
        title: t.slice(0, 500),
        videoUrl: url.slice(0, 2000),
        position: (maxPos._max.position ?? -1) + 1,
      },
    });

    revalidatePath("/admin/tasks");
    revalidatePath("/user/ptc");
    return { ok: true };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "Failed to create task." };
  }
}

export async function deleteAdminTask(taskId: string): Promise<{ ok: boolean; error?: string }> {
  try {
    await requireAdmin();
    await prisma.adminTask.delete({ where: { id: taskId } });
    revalidatePath("/admin/tasks");
    revalidatePath("/user/ptc");
    return { ok: true };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "Failed to delete task." };
  }
}
