import { NextResponse } from "next/server";
import { branchCookieName } from "@/lib/workspace-branch";
import { cookies } from "next/headers";
import { sameOrigin } from "@/lib/same-origin";
import { readBoundedBody } from "@/lib/request-body";

const API_URL = process.env.API_URL ?? process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";

export async function POST(request: Request) {
  if (!sameOrigin(request)) return NextResponse.json({ message: "Invalid request origin." }, { status: 403 });
  const body = await readBoundedBody(request, 4096);
  if (body === null) return NextResponse.json({ message: "Request is too large." }, { status: 413 });
  let payload: { branchId?: unknown } | null = null;
  try { payload = body ? JSON.parse(body) as { branchId?: unknown } : null; }
  catch { return NextResponse.json({ message: "Invalid branch selection." }, { status: 400 }); }
  if (typeof payload?.branchId !== "string" || (payload.branchId !== "all" && !/^[a-z0-9]{20,40}$/.test(payload.branchId))) {
    return NextResponse.json({ message: "Invalid branch selection." }, { status: 400 });
  }
  const token = cookies().get("businessos_token")?.value;
  if (!token) return NextResponse.json({ message: "Authentication required." }, { status: 401 });
  const sessionResponse = await fetch(`${API_URL}/api/auth/me`, { headers: { authorization: `Bearer ${token}` }, cache: "no-store" }).catch(() => null);
  if (!sessionResponse) return NextResponse.json({ message: "Service is temporarily unavailable." }, { status: 503 });
  if (!sessionResponse.ok) return NextResponse.json({ message: "Session expired." }, { status: 401 });
  const session = await sessionResponse.json() as { user: { branchId: string | null }; tenant: { branches: { id: string }[] } | null };
  if (!session.tenant || (payload.branchId !== "all" && !session.tenant.branches.some((branch) => branch.id === payload.branchId)) || (session.user.branchId && session.user.branchId !== payload.branchId)) {
    return NextResponse.json({ message: "Branch is not available in this workspace." }, { status: 403 });
  }
  const response = NextResponse.json({ ok: true });
  if (payload.branchId === "all") response.cookies.delete(branchCookieName);
  else response.cookies.set(branchCookieName, payload.branchId, { httpOnly: true, secure: process.env.NODE_ENV === "production", sameSite: "lax", path: "/", maxAge: 60 * 60 * 24 * 30 });
  return response;
}
