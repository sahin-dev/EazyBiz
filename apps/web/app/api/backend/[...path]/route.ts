import { cookies } from "next/headers";

const API_URL = process.env.API_URL ?? process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";

async function proxy(request: Request, context: { params: { path: string[] } }) {
  const token = cookies().get("businessos_token")?.value;
  if (!token) return Response.json({ message: "Authentication required." }, { status: 401 });
  const sourceUrl = new URL(request.url);
  const target = `${API_URL}/api/${context.params.path.join("/")}${sourceUrl.search}`;
  const method = request.method;
  const response = await fetch(target, {
    method,
    headers: { authorization: `Bearer ${token}`, "content-type": request.headers.get("content-type") ?? "application/json" },
    body: method === "GET" || method === "HEAD" ? undefined : await request.text(),
    cache: "no-store",
  });
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
