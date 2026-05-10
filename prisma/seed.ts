import { PrismaClient, Role } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

/** JOB1–JOB10 from DCMN earning plan PDF */
const PLANS: Array<{
  code: string;
  securityDeposit: number;
  taskCount: number;
  taskCommission: number;
  dailyWage: number;
  wage30: number;
  wage360: number;
  referralLevel1: number;
  referralLevel2: number;
  referralLevel3: number;
  taskGradeA: number;
  taskGradeB: number;
  taskGradeC: number;
}> = [
  {
    code: "JOB1",
    securityDeposit: 7860,
    taskCount: 5,
    taskCommission: 50,
    dailyWage: 250,
    wage30: 7500,
    wage360: 90000,
    referralLevel1: 943.2,
    referralLevel2: 314.4,
    referralLevel3: 157.2,
    taskGradeA: 12.5,
    taskGradeB: 7.5,
    taskGradeC: 2.5,
  },
  {
    code: "JOB2",
    securityDeposit: 21000,
    taskCount: 10,
    taskCommission: 70,
    dailyWage: 700,
    wage30: 21000,
    wage360: 252000,
    referralLevel1: 2520,
    referralLevel2: 840,
    referralLevel3: 420,
    taskGradeA: 35,
    taskGradeB: 21,
    taskGradeC: 7,
  },
  {
    code: "JOB3",
    securityDeposit: 53000,
    taskCount: 15,
    taskCommission: 120,
    dailyWage: 1800,
    wage30: 54000,
    wage360: 648000,
    referralLevel1: 6360,
    referralLevel2: 2120,
    referralLevel3: 1060,
    taskGradeA: 90,
    taskGradeB: 54,
    taskGradeC: 18,
  },
  {
    code: "JOB4",
    securityDeposit: 137000,
    taskCount: 30,
    taskCommission: 160,
    dailyWage: 4800,
    wage30: 144000,
    wage360: 1728000,
    referralLevel1: 16440,
    referralLevel2: 5480,
    referralLevel3: 2740,
    taskGradeA: 240,
    taskGradeB: 144,
    taskGradeC: 48,
  },
  {
    code: "JOB5",
    securityDeposit: 357000,
    taskCount: 50,
    taskCommission: 260,
    dailyWage: 13000,
    wage30: 390000,
    wage360: 4680000,
    referralLevel1: 42840,
    referralLevel2: 14280,
    referralLevel3: 7140,
    taskGradeA: 650,
    taskGradeB: 390,
    taskGradeC: 130,
  },
  {
    code: "JOB6",
    securityDeposit: 937000,
    taskCount: 80,
    taskCommission: 450,
    dailyWage: 36000,
    wage30: 1080000,
    wage360: 12960000,
    referralLevel1: 112440,
    referralLevel2: 37480,
    referralLevel3: 18740,
    taskGradeA: 1800,
    taskGradeB: 1080,
    taskGradeC: 360,
  },
  {
    code: "JOB7",
    securityDeposit: 2350000,
    taskCount: 150,
    taskCommission: 620,
    dailyWage: 93000,
    wage30: 2790000,
    wage360: 33480000,
    referralLevel1: 282000,
    referralLevel2: 94000,
    referralLevel3: 47000,
    taskGradeA: 4650,
    taskGradeB: 2790,
    taskGradeC: 930,
  },
  {
    code: "JOB8",
    securityDeposit: 5870000,
    taskCount: 250,
    taskCommission: 950,
    dailyWage: 237500,
    wage30: 7125000,
    wage360: 85500000,
    referralLevel1: 704400,
    referralLevel2: 234800,
    referralLevel3: 117400,
    taskGradeA: 11875,
    taskGradeB: 7125,
    taskGradeC: 2375,
  },
  {
    code: "JOB9",
    securityDeposit: 14500000,
    taskCount: 550,
    taskCommission: 1070,
    dailyWage: 588500,
    wage30: 17655000,
    wage360: 211860000,
    referralLevel1: 1740000,
    referralLevel2: 580000,
    referralLevel3: 290000,
    taskGradeA: 29425,
    taskGradeB: 17655,
    taskGradeC: 5885,
  },
  {
    code: "JOB10",
    securityDeposit: 34500000,
    taskCount: 850,
    taskCommission: 1700,
    dailyWage: 1445000,
    wage30: 43350000,
    wage360: 520200000,
    referralLevel1: 4140000,
    referralLevel2: 1380000,
    referralLevel3: 690000,
    taskGradeA: 72250,
    taskGradeB: 43350,
    taskGradeC: 14450,
  },
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
        wage30: p.wage30,
        wage360: p.wage360,
        referralLevel1: p.referralLevel1,
        referralLevel2: p.referralLevel2,
        referralLevel3: p.referralLevel3,
        taskGradeA: p.taskGradeA,
        taskGradeB: p.taskGradeB,
        taskGradeC: p.taskGradeC,
      },
      update: {
        securityDeposit: p.securityDeposit,
        taskCount: p.taskCount,
        taskCommission: p.taskCommission,
        dailyWage: p.dailyWage,
        wage30: p.wage30,
        wage360: p.wage360,
        referralLevel1: p.referralLevel1,
        referralLevel2: p.referralLevel2,
        referralLevel3: p.referralLevel3,
        taskGradeA: p.taskGradeA,
        taskGradeB: p.taskGradeB,
        taskGradeC: p.taskGradeC,
      },
    });
  }

  await prisma.siteSettings.upsert({
    where: { id: "singleton" },
    create: {
      id: "singleton",
      bankDisplayText:
        "Bank: Example Bank Ltd.\nAccount Title: DCMN Collections\nIBAN: PK00XXXX0000000000000\nBranch: Karachi\n\nSend the exact plan amount and put your username in the payment reference.",
    },
    update: {},
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

  console.log("Seed OK: plans, site settings, admin user (username: admin).");
  console.log("Set SEED_ADMIN_PASSWORD in env to override default admin password for seed.");
}

main()
  .then(() => prisma.$disconnect())
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
