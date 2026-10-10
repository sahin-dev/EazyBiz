export function sameOrigin(request: Request) {
  const origin = request.headers.get("origin");
  return origin === (process.env.WEB_ORIGIN ?? new URL(request.url).origin);
}
