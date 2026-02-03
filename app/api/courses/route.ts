import { NextRequest, NextResponse } from 'next/server';
import { randomUUID } from 'crypto';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const courses = await prisma.course.findMany({
      orderBy: [{ day: 'asc' }, { startTime: 'asc' }],
    });
    return NextResponse.json(courses);
  } catch (error) {
    console.error('GET /api/courses - Error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to fetch courses' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, lecturer, room, day, startTime, endTime, userId } = body;

    if (!name || !lecturer || !room || !day || !startTime || !endTime) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const course = await prisma.course.create({
      data: {
        id: randomUUID(),
        name,
        lecturer,
        room,
        day,
        startTime,
        endTime,
        userId: userId || 'default-user',
      },
    });

    return NextResponse.json(course, { status: 201 });
  } catch (error) {
    console.error('POST /api/courses - Error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to create course' },
      { status: 400 }
    );
  }
}
