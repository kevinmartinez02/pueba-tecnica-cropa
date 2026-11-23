import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import {
  isUserSession,
  SESSION_COOKIE,
  type SessionResponse,
} from "@/lib/auth/session";

export async function GET() {
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get(SESSION_COOKIE)?.value;

  if (!sessionCookie) {
    return NextResponse.json<SessionResponse>({ user: null });
  }

  try {
    const user: unknown = JSON.parse(sessionCookie);
    if (isUserSession(user)) {
      return NextResponse.json<SessionResponse>({ user });
    }
  } catch {
    // Clear an unreadable cookie below.
  }

  cookieStore.delete(SESSION_COOKIE);
  return NextResponse.json<SessionResponse>({ user: null });
}

export async function DELETE() {
  const cookieStore = await cookies();
  cookieStore.delete(SESSION_COOKIE);
  return NextResponse.json({ ok: true });
}
