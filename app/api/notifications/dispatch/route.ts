import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getFirebaseMessaging, getMissingFirebaseAdminEnv } from '@/lib/firebaseAdmin';

export async function POST(request: NextRequest) {
  try {
    const prismaAny = prisma as any;
    const { limit = 25 } = await request.json().catch(() => ({}));

    const missingEnv = getMissingFirebaseAdminEnv();
    const messaging = getFirebaseMessaging();
    if (!messaging) {
      return NextResponse.json(
        {
          error: 'Firebase Admin not configured',
          missingEnv,
        },
        { status: 500 }
      );
    }

    const now = new Date();

    const dueSchedules = await prismaAny.notificationSchedule.findMany({
      where: {
        status: 'Pending',
        scheduledAt: { lte: now },
      },
      orderBy: { scheduledAt: 'asc' },
      take: Math.min(100, Math.max(1, Number(limit) || 25)),
    });

    if (dueSchedules.length === 0) {
      return NextResponse.json({ success: true, processed: 0 });
    }

    const results = [] as Array<{ id: string; status: 'Sent' | 'Failed'; error?: string }>;

    for (const schedule of dueSchedules) {
      try {
        const token = schedule.token
          ? schedule.token
          : await prismaAny.fcmToken
              .findFirst({
                where: { userId: schedule.userId },
                orderBy: { lastSeenAt: 'desc' },
              })
              .then((t: { token?: string | null } | null) => t?.token ?? null);

        if (!token) {
          await prismaAny.notificationSchedule.update({
            where: { id: schedule.id },
            data: {
              status: 'Failed',
              error: 'Missing FCM token',
            },
          });
          results.push({ id: schedule.id, status: 'Failed', error: 'Missing FCM token' });
          continue;
        }

        await messaging.send({
          token,
          notification: {
            title: schedule.title,
            body: schedule.body || 'You have a pending task',
          },
          data: (schedule.data as Record<string, string>) || {},
        });

        await prismaAny.notificationSchedule.update({
          where: { id: schedule.id },
          data: {
            status: 'Sent',
            sentAt: new Date(),
            error: null,
          },
        });

        results.push({ id: schedule.id, status: 'Sent' });
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to send notification';
        await prismaAny.notificationSchedule.update({
          where: { id: schedule.id },
          data: {
            status: 'Failed',
            error: message,
          },
        });
        results.push({ id: schedule.id, status: 'Failed', error: message });
      }
    }

    return NextResponse.json({ success: true, processed: results.length, results });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to dispatch notifications' },
      { status: 500 }
    );
  }
}
