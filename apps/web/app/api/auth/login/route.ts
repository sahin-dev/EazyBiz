import { NextResponse } from "next/server";
import { sameOrigin } from "@/lib/same-origin";
import { readBoundedBody } from "@/lib/request-body";

const API_URL = process.env.API_URL ?? process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";

export async function POST(request: Request) {
  if (!sameOrigin(request)) return NextResponse.json({ message: "Invalid request origin." }, { status: 403 });
  const body = await readBoundedBody(request, 16_384);
  if (body === null) return NextResponse.json({ message: "Request is too large." }, { status: 413 });
  const response = await fetch(`${API_URL}/api/auth/login`, { method: "POST", headers: { "content-type": "application/json", "user-agent": request.headers.get("user-agent") ?? "BusinessOS Web" }, body }).catch(() => null);
  if (!response) return NextResponse.json({ message: "Sign in is temporarily unavailable. Try again." }, { status: 503 });
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
