import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

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
      return NextResponse.json({ error: 'Course not found' }, { status: 404 });
    }

    await prisma.course.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('DELETE /api/courses - Error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to delete course' },
      { status: 500 }
    );
  }
}
