const API_URL = process.env.API_URL ?? process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";

export async function POST(request: Request) {
  const response = await fetch(`${API_URL}/api/auth/invitations/accept`, {
    method: "POST", headers: { "content-type": "application/json" }, body: await request.text(), cache: "no-store",
  });
  return new Response(await response.arrayBuffer(), {
    status: response.status, headers: { "content-type": response.headers.get("content-type") ?? "application/json" },
  });
}
