import { NextRequest, NextResponse } from "next/server";

const CORS_HEADERS: Record<string, string> = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET,POST,PUT,PATCH,DELETE,OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

export function jsonWithCors<T>(
  body: T,
  init: ResponseInit = {},
): NextResponse<T> {
  const res = NextResponse.json(body, init);
  for (const [key, value] of Object.entries(CORS_HEADERS)) {
    res.headers.set(key, value);
  }
  return res;
}

export function optionsWithCors(): NextResponse<null> {
  const res = new NextResponse<null>(null, { status: 204 });
  for (const [key, value] of Object.entries(CORS_HEADERS)) {
    res.headers.set(key, value);
  }
  return res;
}

export function addCorsHeaders(
  res: NextResponse,
  _req?: NextRequest,
): NextResponse {
  for (const [key, value] of Object.entries(CORS_HEADERS)) {
    res.headers.set(key, value);
  }
  return res;
}

