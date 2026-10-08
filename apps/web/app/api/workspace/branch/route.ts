import { NextResponse } from "next/server";
import { branchCookieName } from "@/lib/workspace-branch";

export async function POST(request: Request) {
  const payload = (await request.json().catch(() => null)) as { branchId?: unknown } | null;
  if (typeof payload?.branchId !== "string" || (payload.branchId !== "all" && !/^[a-z0-9]{20,40}$/.test(payload.branchId))) {
    return NextResponse.json({ message: "Invalid branch selection." }, { status: 400 });
  }
  const response = NextResponse.json({ ok: true });
  if (payload.branchId === "all") response.cookies.delete(branchCookieName);
  else response.cookies.set(branchCookieName, payload.branchId, { httpOnly: true, secure: process.env.NODE_ENV === "production", sameSite: "lax", path: "/", maxAge: 60 * 60 * 24 * 30 });
  return response;
}
