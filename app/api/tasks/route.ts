import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET all tasks from Supabase
export async function GET() {
  try {
    const tasks = await prisma.task.findMany({
      orderBy: {
        createdAt: 'desc',
      },
    });
    
    console.log('GET /api/tasks - Returning tasks from Supabase:', tasks.length);
    return NextResponse.json(tasks);
  } catch (error) {
    console.error('GET /api/tasks - Error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to fetch tasks' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    console.log('POST /api/tasks - Received:', body);
    
    const task = await prisma.task.create({
      data: {
        id: crypto.randomUUID(),
        title: body.title,
        description: body.description || null,
        date: new Date(body.date),
        time: body.time || null,
        priority: body.priority || 'Medium',
        category: body.category || 'Other',
        completed: false,
        updatedAt: new Date(),
      },
    });
    
    console.log('POST /api/tasks - Created task in Supabase:', task);
    return NextResponse.json(task, { status: 201 });
  } catch (error) {
    console.error('POST /api/tasks - Error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to create task' },
      { status: 400 }
    );
  }
}
