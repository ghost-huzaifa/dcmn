-- AlterTable Plan: drop legacy columns
ALTER TABLE "Plan" DROP COLUMN IF EXISTS "wage30";
ALTER TABLE "Plan" DROP COLUMN IF EXISTS "wage360";
ALTER TABLE "Plan" DROP COLUMN IF EXISTS "referralLevel1";
ALTER TABLE "Plan" DROP COLUMN IF EXISTS "referralLevel2";
ALTER TABLE "Plan" DROP COLUMN IF EXISTS "referralLevel3";
ALTER TABLE "Plan" DROP COLUMN IF EXISTS "taskGradeA";
ALTER TABLE "Plan" DROP COLUMN IF EXISTS "taskGradeB";
ALTER TABLE "Plan" DROP COLUMN IF EXISTS "taskGradeC";

-- AlterTable DepositRequest
ALTER TABLE "DepositRequest" ADD COLUMN IF NOT EXISTS "screenshotData" TEXT;
ALTER TABLE "DepositRequest" ADD COLUMN IF NOT EXISTS "screenshotMime" TEXT;

-- AlterTable SiteSettings
ALTER TABLE "SiteSettings" ADD COLUMN IF NOT EXISTS "whatsappNumber" TEXT NOT NULL DEFAULT '+447836532206';
ALTER TABLE "SiteSettings" ADD COLUMN IF NOT EXISTS "welcomeBonusPct" DECIMAL(5,2) NOT NULL DEFAULT 7;
ALTER TABLE "SiteSettings" ADD COLUMN IF NOT EXISTS "refLevel1Pct" DECIMAL(5,2) NOT NULL DEFAULT 12;
ALTER TABLE "SiteSettings" ADD COLUMN IF NOT EXISTS "refLevel2Pct" DECIMAL(5,2) NOT NULL DEFAULT 4;
ALTER TABLE "SiteSettings" ADD COLUMN IF NOT EXISTS "refLevel3Pct" DECIMAL(5,2) NOT NULL DEFAULT 1;
ALTER TABLE "SiteSettings" ADD COLUMN IF NOT EXISTS "taskOverrideLevel1Pct" DECIMAL(5,2) NOT NULL DEFAULT 5;
ALTER TABLE "SiteSettings" ADD COLUMN IF NOT EXISTS "taskOverrideLevel2Pct" DECIMAL(5,2) NOT NULL DEFAULT 2;
ALTER TABLE "SiteSettings" ADD COLUMN IF NOT EXISTS "taskOverrideLevel3Pct" DECIMAL(5,2) NOT NULL DEFAULT 1;

-- CreateTable AdminTask
CREATE TABLE IF NOT EXISTS "AdminTask" (
    "id" TEXT NOT NULL,
    "dateKey" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "videoUrl" TEXT NOT NULL,
    "position" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AdminTask_pkey" PRIMARY KEY ("id")
);

-- CreateTable UserTaskCompletion
CREATE TABLE IF NOT EXISTS "UserTaskCompletion" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "userPlanId" TEXT NOT NULL,
    "taskId" TEXT NOT NULL,
    "dateKey" TEXT NOT NULL,
    "earnedAmount" DECIMAL(18,2) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "UserTaskCompletion_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX IF NOT EXISTS "AdminTask_dateKey_position_idx" ON "AdminTask"("dateKey", "position");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "UserTaskCompletion_userId_dateKey_idx" ON "UserTaskCompletion"("userId", "dateKey");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "UserTaskCompletion_userPlanId_idx" ON "UserTaskCompletion"("userPlanId");

-- CreateIndex
CREATE UNIQUE INDEX IF NOT EXISTS "UserTaskCompletion_userId_taskId_key" ON "UserTaskCompletion"("userId", "taskId");

-- AddForeignKey
DO $$ BEGIN
  ALTER TABLE "UserTaskCompletion" ADD CONSTRAINT "UserTaskCompletion_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  ALTER TABLE "UserTaskCompletion" ADD CONSTRAINT "UserTaskCompletion_userPlanId_fkey" FOREIGN KEY ("userPlanId") REFERENCES "UserPlan"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  ALTER TABLE "UserTaskCompletion" ADD CONSTRAINT "UserTaskCompletion_taskId_fkey" FOREIGN KEY ("taskId") REFERENCES "AdminTask"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;
