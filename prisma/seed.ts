import { PrismaClient, Role } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

/** Omnicom Media Group UK — Plans 1–6 + higher tiers */
const PLANS: Array<{
  code: string;
  securityDeposit: number;
  taskCount: number;
  taskCommission: number;
  dailyWage: number;
}> = [
  { code: "PLAN1", securityDeposit: 5250, taskCount: 3, taskCommission: 50, dailyWage: 150 },
  { code: "PLAN2", securityDeposit: 10500, taskCount: 5, taskCommission: 60, dailyWage: 300 },
  { code: "PLAN3", securityDeposit: 24500, taskCount: 10, taskCommission: 80, dailyWage: 800 },
  { code: "PLAN4", securityDeposit: 45000, taskCount: 12, taskCommission: 125, dailyWage: 1500 },
  { code: "PLAN5", securityDeposit: 105000, taskCount: 14, taskCommission: 250, dailyWage: 3500 },
  { code: "PLAN6", securityDeposit: 192000, taskCount: 16, taskCommission: 400, dailyWage: 6400 },
  { code: "PLAN7", securityDeposit: 300000, taskCount: 20, taskCommission: 500, dailyWage: 10000 },
  { code: "PLAN8", securityDeposit: 450000, taskCount: 25, taskCommission: 600, dailyWage: 15000 },
  { code: "PLAN9", securityDeposit: 720000, taskCount: 30, taskCommission: 800, dailyWage: 24000 },
];

async function main() {
  for (const p of PLANS) {
    if (p.taskCommission * p.taskCount !== p.dailyWage) {
      throw new Error(`Invariant failed for ${p.code}: commission × count ≠ daily wage`);
    }
    await prisma.plan.upsert({
      where: { code: p.code },
      create: {
        code: p.code,
        securityDeposit: p.securityDeposit,
        taskCount: p.taskCount,
        taskCommission: p.taskCommission,
        dailyWage: p.dailyWage,
      },
      update: {
        securityDeposit: p.securityDeposit,
        taskCount: p.taskCount,
        taskCommission: p.taskCommission,
        dailyWage: p.dailyWage,
      },
    });
  }

  await prisma.siteSettings.upsert({
    where: { id: "singleton" },
    create: {
      id: "singleton",
      bankDisplayText:
        "Bank: Example Bank Ltd.\nAccount Title: Omnicom Media Group UK\nIBAN: PK00XXXX0000000000000\nBranch: Karachi\n\nSend the exact plan amount and put your username in the payment reference.",
      whatsappNumber: "+447836532206",
      welcomeBonusPct: 7,
      refLevel1Pct: 12,
      refLevel2Pct: 4,
      refLevel3Pct: 1,
      taskOverrideLevel1Pct: 5,
      taskOverrideLevel2Pct: 2,
      taskOverrideLevel3Pct: 1,
    },
    update: {
      whatsappNumber: "+447836532206",
    },
  });

  const adminPass = process.env.SEED_ADMIN_PASSWORD ?? "admin123";
  const hash = await bcrypt.hash(adminPass, 10);
  await prisma.user.upsert({
    where: { username: "admin" },
    create: {
      username: "admin",
      email: "admin@example.com",
      passwordHash: hash,
      role: Role.ADMIN,
      referenceCode: "ADMINROOT",
      balance: 0,
    },
    update: {
      passwordHash: hash,
      role: Role.ADMIN,
    },
  });

  console.log("Seed OK: PLAN1–PLAN9, site settings, admin user (username: admin).");
  console.log("Set SEED_ADMIN_PASSWORD in env to override default admin password for seed.");
}

main()
  .then(() => prisma.$disconnect())
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
