import { NextResponse } from "next/server";
import { isUserSession, SESSION_COOKIE } from "@/lib/auth/session";

type LoginBody = {
  username: string;
  password: string;
};

export async function POST(request: Request) {
  const credentials = (await request
    .json()
    .catch(() => null)) as Partial<LoginBody> | null;

  if (
    !credentials ||
    typeof credentials.username !== "string" ||
    typeof credentials.password !== "string"
  ) {
    return NextResponse.json(
      { message: "Enter a username and password." },
      { status: 400 },
    );
  }

  const apiUrl = (process.env.API_URL ?? "http://localhost:8000").replace(
    /\/+$/,
    "",
  );

  try {
    const apiResponse = await fetch(`${apiUrl}/tasks/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(credentials),
      cache: "no-store",
    });
    const responseBody: unknown = await apiResponse.json().catch(() => null);

    if (!apiResponse.ok) {
      return NextResponse.json(
        responseBody ?? { message: "Unable to sign in." },
        { status: apiResponse.status },
      );
    }

    if (!isUserSession(responseBody)) {
      return NextResponse.json(
        { message: "The API returned an invalid user profile." },
        { status: 502 },
      );
    }

    const response = NextResponse.json(responseBody);
    response.cookies.set(SESSION_COOKIE, JSON.stringify(responseBody), {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 7,
    });

    return response;
  } catch {
    return NextResponse.json(
      { message: "Could not connect to the API. Please try again." },
      { status: 502 },
    );
  }
}
