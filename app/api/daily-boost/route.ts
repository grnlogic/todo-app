import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { addCorsHeaders, optionsWithCors } from "@/lib/cors";

export async function GET() {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Get today's mood
    const dailyMood = await prisma.dailyMood.findUnique({
      where: { date: today },
    });

    // Get a random active quote
    const quotes = await prisma.quote.findMany({
      where: { isActive: true },
    });

    const randomQuote =
      quotes.length > 0 ? quotes[Math.floor(Math.random() * quotes.length)] : null;

    const res = NextResponse.json({
      mood: dailyMood,
      quote: randomQuote,
    });
    return addCorsHeaders(res);
  } catch (error) {
    console.error("Error fetching daily boost:", error);
    const res = NextResponse.json(
      { error: "Failed to fetch daily boost data" },
      { status: 500 },
    );
    return addCorsHeaders(res);
  }
}

export function OPTIONS() {
  return optionsWithCors();
}

