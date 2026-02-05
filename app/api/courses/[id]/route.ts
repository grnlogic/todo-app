import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { jsonWithCors, optionsWithCors } from "@/lib/cors";

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const existing = await prisma.course.findUnique({
      where: { id },
    });

    if (!existing) {
      return jsonWithCors({ error: "Course not found" }, { status: 404 });
    }

    await prisma.course.delete({
      where: { id },
    });

    return jsonWithCors({ success: true });
  } catch (error) {
    console.error("DELETE /api/courses - Error:", error);
    return jsonWithCors(
      {
        error:
          error instanceof Error ? error.message : "Failed to delete course",
      },
      { status: 500 },
    );
  }
}

export function OPTIONS() {
  return optionsWithCors();
}

