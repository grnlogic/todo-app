import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { jsonWithCors, optionsWithCors } from "@/lib/cors";

// Save FCM token for a user
export async function POST(request: NextRequest) {
  try {
    const { token, userId = 'default-user', deviceName } = await request.json();
    
    if (!token) {
      return jsonWithCors(
        { error: "Token is required" },
        { status: 400 },
      );
    }

    await prisma.fcmToken.upsert({
      where: {
        userId_token: {
          userId,
          token,
        },
      },
      update: {
        deviceName: deviceName || null,
        lastSeenAt: new Date(),
      },
      create: {
        id: crypto.randomUUID(),
        userId,
        token,
        deviceName: deviceName || null,
        lastSeenAt: new Date(),
      },
    });

    return jsonWithCors({
      success: true,
      message: "Token saved successfully",
    });
  } catch (error) {
    console.error("Error saving FCM token:", error);
    return jsonWithCors(
      { error: "Failed to save token" },
      { status: 500 },
    );
  }
}

export function OPTIONS() {
  return optionsWithCors();
}

