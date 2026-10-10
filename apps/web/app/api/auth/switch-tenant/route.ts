import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { branchCookieName } from "@/lib/workspace-branch";
import { sameOrigin } from "@/lib/same-origin";
import { readBoundedBody } from "@/lib/request-body";

const API_URL = process.env.API_URL ?? process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";

export async function POST(request: Request) {
  if (!sameOrigin(request)) return NextResponse.json({ message: "Invalid request origin." }, { status: 403 });
  const token = cookies().get("businessos_token")?.value;
  if (!token) return NextResponse.json({ message: "Authentication required." }, { status: 401 });
  const body = await readBoundedBody(request, 4096);
  if (body === null) return NextResponse.json({ message: "Request is too large." }, { status: 413 });
  const upstream = await fetch(`${API_URL}/api/auth/switch-tenant`, { method: "POST", headers: { authorization: `Bearer ${token}`, "content-type": "application/json" }, body, cache: "no-store" }).catch(() => null);
  if (!upstream) return NextResponse.json({ message: "Service is unavailable." }, { status: 503 });
  const payload = await upstream.json();
  if (!upstream.ok) return NextResponse.json(payload, { status: upstream.status });
  const result = NextResponse.json({ user: payload.user, tenant: payload.tenant });
  result.cookies.set("businessos_token", payload.accessToken, { httpOnly: true, secure: process.env.NODE_ENV === "production", sameSite: "lax", path: "/", maxAge: payload.expiresIn });
  result.cookies.delete(branchCookieName);
  return result;
}
