import { NextResponse } from "next/server";

import { clearSession } from "@/lib/session";

export async function POST(req: Request) {
  await clearSession();
  const login = new URL("/auth/login", req.url);
  return NextResponse.redirect(login);
}
