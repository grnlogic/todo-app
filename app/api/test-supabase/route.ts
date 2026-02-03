import { NextResponse } from 'next/server';
import { randomUUID } from 'crypto';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    // Test connection by fetching tasks
    const tasks = await prisma.task.findMany({
      take: 10,
      orderBy: {
        createdAt: 'desc',
      },
    });

    return NextResponse.json({
      success: true,
      message: 'Connected to Supabase successfully!',
      data: tasks,
      count: tasks.length,
    });
  } catch (error) {
    console.error('Database connection error:', error);
    return NextResponse.json(
      {
        success: false,
        message: 'Failed to connect to database',
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { title, description, date, time, priority, category } = body;

    const task = await prisma.task.create({
      data: {
        id: randomUUID(),
        title,
        description,
        date: new Date(date),
        time,
        priority: priority || 'Medium',
        category: category || 'Other',
        updatedAt: new Date(),
      },
    });

    return NextResponse.json({
      success: true,
      message: 'Task created successfully',
      data: task,
    });
  } catch (error) {
    console.error('Create task error:', error);
    return NextResponse.json(
      {
        success: false,
        message: 'Failed to create task',
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
