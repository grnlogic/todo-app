import { NextRequest, NextResponse } from "next/server";
import {
  getFirebaseMessaging,
  getMissingFirebaseAdminEnv,
} from "@/lib/firebaseAdmin";
import { jsonWithCors, optionsWithCors } from "@/lib/cors";

export async function POST(request: NextRequest) {
  try {
    const { token, title, body, data } = await request.json();

    if (!token) {
      return jsonWithCors(
        { error: "Token is required" },
        { status: 400 },
      );
    }

    const missingEnv = getMissingFirebaseAdminEnv();
    const messaging = getFirebaseMessaging();
    if (!messaging) {
      return jsonWithCors(
        {
          error: "Firebase Admin not configured",
          missingEnv,
          hint:
            "Set FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL, FIREBASE_PRIVATE_KEY in the server environment",
        },
        { status: 500 },
      );
    }

    const message = {
      token,
      notification: {
        title: title || "🎯 Task Reminder",
        body: body || "You have a pending task",
      },
      data: data || {},
    };

    const response = await messaging.send(message);

    return jsonWithCors({
      success: true,
      messageId: response,
    });
  } catch (error) {
    console.error("Error sending FCM notification:", error);
    const err = error as { message?: string; code?: string };
    return jsonWithCors(
      {
        error: "Failed to send notification",
        message: err?.message,
        code: err?.code,
      },
      { status: 500 },
    );
  }
}

export function OPTIONS() {
  return optionsWithCors();
}

