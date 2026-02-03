import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// Save FCM token for a user
export async function POST(request: NextRequest) {
  try {
    const { token, userId = 'default-user' } = await request.json();
    
    if (!token) {
      return NextResponse.json(
        { error: 'Token is required' },
        { status: 400 }
      );
    }

    // TODO: Save token to database
    // For now, just log it
    console.log('FCM Token saved:', { userId, token });
    
    // In production, you would save this to a database
    // await prisma.fcmToken.upsert({
    //   where: { userId },
    //   update: { token, updatedAt: new Date() },
    //   create: { userId, token }
    // });

    return NextResponse.json({
      success: true,
      message: 'Token saved successfully'
    });
  } catch (error) {
    console.error('Error saving FCM token:', error);
    return NextResponse.json(
      { error: 'Failed to save token' },
      { status: 500 }
    );
  }
}
