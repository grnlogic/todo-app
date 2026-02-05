import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { jsonWithCors, optionsWithCors } from "@/lib/cors";

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
      return jsonWithCors(
        { error: "Task not found" },
        { status: 404 },
      );
    }

    // When toggling completed, set or clear completedAt
    const now = new Date();
    const data: Record<string, unknown> = {
      ...body,
      updatedAt: now,
    };
    if (typeof body.completed === "boolean") {
      data.completedAt = body.completed ? now : null;
    }

    const updatedTask = await prisma.task.update({
      where: { id },
      data: data as Parameters<typeof prisma.task.update>[0]["data"],
    });

    console.log(`PATCH /api/tasks/${id} - Updated in Supabase:`, updatedTask);
    return jsonWithCors(updatedTask);
  } catch (error) {
    console.error(`PATCH /api/tasks - Error:`, error);
    return jsonWithCors(
      {
        error:
          error instanceof Error ? error.message : "Failed to update task",
      },
      { status: 500 },
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
      return jsonWithCors(
        { error: "Task not found" },
        { status: 404 },
      );
    }

    // Delete from Supabase
    await prisma.task.delete({
      where: { id },
    });

    console.log(`DELETE /api/tasks/${id} - Deleted from Supabase`);
    return jsonWithCors({ success: true });
  } catch (error) {
    console.error(`DELETE /api/tasks - Error:`, error);
    return jsonWithCors(
      {
        error:
          error instanceof Error ? error.message : "Failed to delete task",
      },
      { status: 500 },
    );
  }
}

export function OPTIONS() {
  return optionsWithCors();
}

