import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// Schedule a notification for a task
export async function POST(request: NextRequest) {
  try {
    const prismaAny = prisma as any;
    const {
      taskId,
      title,
      scheduleTime,
      userId = 'default-user',
      body,
      data,
      token,
    } = await request.json();
    
    if (!taskId || !title || !scheduleTime) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const scheduledDate = new Date(scheduleTime);
    const now = new Date();
    
    if (scheduledDate <= now) {
      return NextResponse.json(
        { error: 'Schedule time must be in the future' },
        { status: 400 }
      );
    }

    const resolvedToken = token
      ? token
      : await prismaAny.fcmToken
          .findFirst({
            where: { userId },
            orderBy: { lastSeenAt: 'desc' },
          })
          .then((t: { token?: string | null } | null) => t?.token ?? null);

    const schedule = await prismaAny.notificationSchedule.create({
      data: {
        id: crypto.randomUUID(),
        taskId,
        userId,
        token: resolvedToken,
        title,
        body: body || `Don't forget: ${title}`,
        data: data || { taskId, url: '/' },
        scheduledAt: scheduledDate,
      },
    });

    return NextResponse.json({
      success: true,
      message: 'Notification scheduled',
      scheduledFor: scheduledDate.toISOString(),
      id: schedule.id,
      hasToken: Boolean(resolvedToken),
    });
  } catch (error) {
    console.error('Error scheduling notification:', error);
    return NextResponse.json(
      { error: 'Failed to schedule notification' },
      { status: 500 }
    );
  }
}

// Get scheduled notifications
export async function GET(request: NextRequest) {
  try {
    const prismaAny = prisma as any;
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId') || 'default-user';
    const status = searchParams.get('status');

    const notifications = await prismaAny.notificationSchedule.findMany({
      where: {
        userId,
        ...(status ? { status: status as any } : {}),
      },
      orderBy: { scheduledAt: 'asc' },
      take: 50,
    });

    return NextResponse.json({
      success: true,
      notifications,
    });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch notifications' },
      { status: 500 }
    );
  }
}
