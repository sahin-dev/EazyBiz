import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { sameOrigin } from "@/lib/same-origin";

const API_URL = process.env.API_URL ?? process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";

export async function POST(request: Request) {
  if (!sameOrigin(request)) return NextResponse.json({ message: "Invalid request origin." }, { status: 403 });
  const token = cookies().get("businessos_token")?.value;
  if (token) {
    const revoked = await fetch(`${API_URL}/api/auth/logout`, { method: "POST", headers: { authorization: `Bearer ${token}` }, cache: "no-store" }).catch(() => null);
    if (!revoked || (!revoked.ok && revoked.status !== 401)) return NextResponse.json({ message: "Unable to sign out. Try again." }, { status: 503 });
  }
  const response = NextResponse.json({ success: true });
  response.cookies.set("businessos_token", "", { httpOnly: true, expires: new Date(0), path: "/" });
  return response;
}
