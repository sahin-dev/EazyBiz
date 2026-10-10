import { NextResponse } from "next/server";
import { sameOrigin } from "@/lib/same-origin";
import { readBoundedBody } from "@/lib/request-body";

const API_URL = process.env.API_URL ?? process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";
const actions = new Set(["signup", "forgot-password", "reset-password", "verify-email", "resend-verification"]);

export async function POST(request: Request, context: { params: { action: string } }) {
  if (!sameOrigin(request)) return NextResponse.json({ message: "Invalid request origin." }, { status: 403 });
  if (!actions.has(context.params.action)) return NextResponse.json({ message: "Not found." }, { status: 404 });
  const body = await readBoundedBody(request, 16_384);
  if (body === null) return NextResponse.json({ message: "Request is too large." }, { status: 413 });
  const response = await fetch(`${API_URL}/api/auth/${context.params.action}`, { method: "POST", headers: { "content-type": "application/json" }, body, cache: "no-store" }).catch(() => null);
  if (!response) return NextResponse.json({ message: "Service is unavailable." }, { status: 503 });
  return new NextResponse(await response.text(), { status: response.status, headers: { "content-type": "application/json" } });
}
