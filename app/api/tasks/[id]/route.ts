import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    console.log(`PATCH /api/tasks/${id} - Received:`, body);
    
    // Check if task exists
    const existingTask = await prisma.task.findUnique({
      where: { id },
    });
    
    if (!existingTask) {
      console.log(`PATCH /api/tasks/${id} - Task not found`);
      return NextResponse.json(
        { error: 'Task not found' },
        { status: 404 }
      );
    }
    
    // Update task in Supabase
    const updatedTask = await prisma.task.update({
      where: { id },
      data: {
        ...body,
        updatedAt: new Date(),
      },
    });
    
    console.log(`PATCH /api/tasks/${id} - Updated in Supabase:`, updatedTask);
    return NextResponse.json(updatedTask);
  } catch (error) {
    console.error(`PATCH /api/tasks - Error:`, error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to update task' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    console.log(`DELETE /api/tasks/${id}`);
    
    // Check if task exists
    const existingTask = await prisma.task.findUnique({
      where: { id },
    });
    
    if (!existingTask) {
      console.log(`DELETE /api/tasks/${id} - Task not found`);
      return NextResponse.json(
        { error: 'Task not found' },
        { status: 404 }
      );
    }
    
    // Delete from Supabase
    await prisma.task.delete({
      where: { id },
    });
    
    console.log(`DELETE /api/tasks/${id} - Deleted from Supabase`);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error(`DELETE /api/tasks - Error:`, error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to delete task' },
      { status: 500 }
    );
  }
}
