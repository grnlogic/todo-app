-- CreateEnum
CREATE TYPE "Category" AS ENUM ('Work', 'Personal', 'Health', 'Learning', 'Social', 'Finance', 'Other');

-- CreateEnum
CREATE TYPE "MoodType" AS ENUM ('VeryHappy', 'Happy', 'Neutral', 'Sad', 'Stressed');

-- CreateEnum
CREATE TYPE "Priority" AS ENUM ('High', 'Medium', 'Low');

-- CreateEnum
CREATE TYPE "NotificationStatus" AS ENUM ('Pending', 'Sent', 'Failed');

-- CreateTable
CREATE TABLE "DailyMood" (
    "id" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "mood" "MoodType" NOT NULL,
    "note" TEXT,
    "energy" INTEGER NOT NULL DEFAULT 5,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "DailyMood_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Quote" (
    "id" TEXT NOT NULL,
    "text" TEXT NOT NULL,
    "author" TEXT,
    "category" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Quote_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Task" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "time" TEXT,
    "completed" BOOLEAN NOT NULL DEFAULT false,
    "priority" "Priority" NOT NULL DEFAULT 'Medium',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "description" TEXT,
    "category" "Category" DEFAULT 'Other',
    "moodBefore" "MoodType",
    "moodAfter" "MoodType",
    "estimatedMinutes" INTEGER,
    "actualMinutes" INTEGER,
    "tags" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "points" INTEGER DEFAULT 0,
    "streak" INTEGER DEFAULT 0,
    "reminderSent" BOOLEAN DEFAULT false,
    "isRecurring" BOOLEAN DEFAULT false,
    "recurrence" TEXT,
    "notes" TEXT,
    "completedAt" TIMESTAMP(3),

    CONSTRAINT "Task_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FcmToken" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "deviceName" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "lastSeenAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "FcmToken_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "NotificationSchedule" (
    "id" TEXT NOT NULL,
    "taskId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "token" TEXT,
    "title" TEXT NOT NULL,
    "body" TEXT,
    "data" JSONB,
    "scheduledAt" TIMESTAMP(3) NOT NULL,
    "status" "NotificationStatus" NOT NULL DEFAULT 'Pending',
    "sentAt" TIMESTAMP(3),
    "error" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "NotificationSchedule_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "DailyMood_date_key" ON "DailyMood"("date");

-- CreateIndex
CREATE INDEX "DailyMood_date_idx" ON "DailyMood"("date");

-- CreateIndex
CREATE INDEX "Task_category_idx" ON "Task"("category");

-- CreateIndex
CREATE INDEX "Task_completed_idx" ON "Task"("completed");

-- CreateIndex
CREATE INDEX "Task_date_idx" ON "Task"("date");

-- CreateIndex
CREATE INDEX "Task_priority_idx" ON "Task"("priority");

-- CreateIndex
CREATE INDEX "FcmToken_userId_idx" ON "FcmToken"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "FcmToken_userId_token_key" ON "FcmToken"("userId", "token");

-- CreateIndex
CREATE INDEX "NotificationSchedule_taskId_idx" ON "NotificationSchedule"("taskId");

-- CreateIndex
CREATE INDEX "NotificationSchedule_userId_idx" ON "NotificationSchedule"("userId");

-- CreateIndex
CREATE INDEX "NotificationSchedule_scheduledAt_idx" ON "NotificationSchedule"("scheduledAt");

-- CreateIndex
CREATE INDEX "NotificationSchedule_status_idx" ON "NotificationSchedule"("status");
