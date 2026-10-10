import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest, { params }: { params: { slug: string } }) {
  const apiUrl = process.env.API_URL || "http://localhost:4000";
  const idempotencyKey = request.headers.get("idempotency-key");
  const response = await fetch(`${apiUrl}/api/storefronts/${encodeURIComponent(params.slug)}/orders`, { method: "POST", headers: { "content-type": "application/json", ...(idempotencyKey ? { "idempotency-key": idempotencyKey } : {}) }, body: await request.text(), cache: "no-store" });
  const result = await response.json().catch(() => ({ message: "Order service is unavailable." }));
  return NextResponse.json(result, { status: response.status });
}
