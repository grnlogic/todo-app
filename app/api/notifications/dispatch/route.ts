import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import {
  getFirebaseMessaging,
  getMissingFirebaseAdminEnv,
} from "@/lib/firebaseAdmin";
import { jsonWithCors, optionsWithCors } from "@/lib/cors";

const isValidFcmToken = (t: string | null | undefined): boolean =>
  typeof t === "string" &&
  t.length > 50 &&
  t !== "permission-granted";

async function processDueNotifications(limit = 25) {
  const prismaAny = prisma as any;
  const missingEnv = getMissingFirebaseAdminEnv();
  const messaging = getFirebaseMessaging();
  if (!messaging) {
    return { success: false as const, error: "Firebase Admin not configured", missingEnv, processed: 0, results: [] };
  }

  const now = new Date();
  const dueSchedules = await prismaAny.notificationSchedule.findMany({
    where: {
      status: "Pending",
      scheduledAt: { lte: now },
    },
    orderBy: { scheduledAt: "asc" },
    take: Math.min(100, Math.max(1, Number(limit) || 25)),
  });

  if (dueSchedules.length === 0) {
    return { success: true as const, processed: 0, results: [] };
  }

  const results: Array<{ id: string; status: "Sent" | "Failed"; error?: string }> = [];

  for (const schedule of dueSchedules) {
    try {
      let token: string | null = isValidFcmToken(schedule.token)
        ? schedule.token
        : null;
      if (!token) {
        const row = await prismaAny.fcmToken.findFirst({
          where: { userId: schedule.userId },
          orderBy: { lastSeenAt: "desc" },
        });
        token = row?.token ?? null;
      }
      if (!token || !isValidFcmToken(token)) {
        await prismaAny.notificationSchedule.update({
          where: { id: schedule.id },
          data: {
            status: "Failed",
            error: "Missing FCM token",
          },
        });
        results.push({
          id: schedule.id,
          status: "Failed",
          error: "Missing FCM token",
        });
        continue;
      }

      await messaging.send({
        token,
        notification: {
          title: schedule.title,
          body: schedule.body || "You have a pending task",
        },
        data: (schedule.data as Record<string, string>) || {},
      });

      await prismaAny.notificationSchedule.update({
        where: { id: schedule.id },
        data: {
          status: "Sent",
          sentAt: new Date(),
          error: null,
        },
      });

      results.push({ id: schedule.id, status: "Sent" });
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Failed to send notification";
      await prismaAny.notificationSchedule.update({
        where: { id: schedule.id },
        data: {
          status: "Failed",
          error: message,
        },
      });
      results.push({ id: schedule.id, status: "Failed", error: message });
    }
  }

  return { success: true as const, processed: results.length, results };
}

export async function GET(request: NextRequest) {
  const authHeader = request.headers.get("authorization");
  const cronSecret = process.env.CRON_SECRET;
  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    return new NextResponse("Unauthorized", { status: 401 });
  }
  try {
    const out = await processDueNotifications(25);
    if (!out.success && out.error) {
      return jsonWithCors(
        { error: out.error, missingEnv: out.missingEnv },
        { status: 500 },
      );
    }
    return jsonWithCors({
      success: true,
      processed: out.processed,
      results: out.results,
    });
  } catch (error) {
    return jsonWithCors(
      {
        error:
          error instanceof Error
            ? error.message
            : "Failed to dispatch notifications",
      },
      { status: 500 },
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const { limit = 25 } = await request.json().catch(() => ({}));
    const out = await processDueNotifications(limit);
    if (!out.success && out.error) {
      return jsonWithCors(
        { error: out.error, missingEnv: out.missingEnv },
        { status: 500 },
      );
    }
    return jsonWithCors({
      success: true,
      processed: out.processed,
      results: out.results,
    });
  } catch (error) {
    return jsonWithCors(
      {
        error:
          error instanceof Error
            ? error.message
            : "Failed to dispatch notifications",
      },
      { status: 500 },
    );
  }
}

export function OPTIONS() {
  return optionsWithCors();
}

