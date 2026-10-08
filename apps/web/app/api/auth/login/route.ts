import { NextResponse } from "next/server";

const API_URL = process.env.API_URL ?? process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";

export async function POST(request: Request) {
  const body = await request.text();
  const response = await fetch(`${API_URL}/api/auth/login`, { method: "POST", headers: { "content-type": "application/json" }, body });
  const payload = await response.json();
  if (!response.ok) return NextResponse.json(payload, { status: response.status });
  const result = NextResponse.json({ user: payload.user, tenant: payload.tenant });
  result.cookies.set("businessos_token", payload.accessToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: payload.expiresIn,
  });
  return result;
}
