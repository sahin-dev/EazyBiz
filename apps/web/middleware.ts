import { NextResponse, type NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  if (request.nextUrl.pathname.startsWith("/products/") && /\.(png|jpe?g|webp|avif|gif)$/i.test(request.nextUrl.pathname)) {
    return NextResponse.next();
  }
  if (!request.cookies.get("businessos_token")?.value) {
    const login = new URL("/login", request.url);
    login.searchParams.set("next", request.nextUrl.pathname);
    return NextResponse.redirect(login);
  }
  return NextResponse.next();
}

export const config = {
  matcher: ["/access/:path*", "/dashboard/:path*", "/pos/:path*", "/orders/:path*", "/kitchen/:path*", "/tables/:path*", "/products/:path*", "/inventory/:path*", "/suppliers/:path*", "/customers/:path*", "/staff/:path*", "/users/:path*", "/audit/:path*", "/reports/:path*", "/storefront/:path*", "/subscription/:path*", "/platform-admin/:path*", "/profile/:path*", "/workspaces/:path*"],
};
