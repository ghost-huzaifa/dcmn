import { prisma } from "@/lib/prisma";
import { UserPlanStatus } from "@prisma/client";

export async function getUserPlanContext(userId: string) {
  const [active, pending] = await Promise.all([
    prisma.userPlan.findFirst({
      where: { userId, status: UserPlanStatus.ACTIVE },
      include: { plan: true },
    }),
    prisma.userPlan.findFirst({
      where: { userId, status: UserPlanStatus.PENDING_DEPOSIT },
      include: { plan: true },
      orderBy: { createdAt: "desc" },
    }),
  ]);

  return { active, pending, display: active ?? pending };
}
