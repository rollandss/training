import { jwtVerify } from "jose";
import { NextResponse, type NextRequest } from "next/server";

const COOKIE = "session";

function secret() {
  return new TextEncoder().encode(
    process.env.SESSION_SECRET ?? "dev-only-change-SESSION_SECRET-in-env-32chars",
  );
}

export async function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;
  if (!pathname.startsWith("/app") && !pathname.startsWith("/admin")) {
    return NextResponse.next();
  }

  const token = req.cookies.get(COOKIE)?.value;
  if (!token) {
    const login = new URL("/auth/login", req.url);
    login.searchParams.set("next", pathname);
    return NextResponse.redirect(login);
  }

  try {
    const { payload } = await jwtVerify(token, secret());
    if (pathname.startsWith("/admin") && payload.role !== "ADMIN") {
      return NextResponse.redirect(new URL("/app", req.url));
    }
    return NextResponse.next();
  } catch {
    const login = new URL("/auth/login", req.url);
    login.searchParams.set("next", pathname);
    return NextResponse.redirect(login);
  }
}

export const config = {
  matcher: ["/app/:path*", "/admin/:path*"],
};

export default proxy;
