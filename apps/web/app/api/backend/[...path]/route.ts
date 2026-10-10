import { cookies } from "next/headers";
import { sameOrigin } from "@/lib/same-origin";
import { readBoundedBody } from "@/lib/request-body";

const API_URL = process.env.API_URL ?? process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";

async function proxy(request: Request, context: { params: { path: string[] } }) {
  const token = cookies().get("businessos_token")?.value;
  if (!token) return Response.json({ message: "Authentication required." }, { status: 401 });
  const sourceUrl = new URL(request.url);
  const target = `${API_URL}/api/${context.params.path.join("/")}${sourceUrl.search}`;
  const method = request.method;
  if (method !== "GET" && method !== "HEAD" && !sameOrigin(request)) return Response.json({ message: "Invalid request origin." }, { status: 403 });
  const idempotencyKey = request.headers.get("idempotency-key");
  const body = method === "GET" || method === "HEAD" ? undefined : await readBoundedBody(request, 1_048_576);
  if (body === null) return Response.json({ message: "Request is too large." }, { status: 413 });
  const response = await fetch(target, {
    method,
    headers: { authorization: `Bearer ${token}`, "content-type": request.headers.get("content-type") ?? "application/json", ...(idempotencyKey ? { "idempotency-key": idempotencyKey } : {}) },
    body,
    cache: "no-store",
  }).catch(() => null);
  if (!response) return Response.json({ message: "Service is temporarily unavailable." }, { status: 503 });
  return new Response(await response.arrayBuffer(), {
    status: response.status,
    headers: { "content-type": response.headers.get("content-type") ?? "application/json" },
  });
}

export const GET = proxy;
export const POST = proxy;
export const PUT = proxy;
export const PATCH = proxy;
export const DELETE = proxy;
