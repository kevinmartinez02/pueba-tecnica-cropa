import { NextResponse } from "next/server";

type RouteContext = {
  params: Promise<{ segments?: string[] }>;
};

async function proxyTaskRequest(request: Request, context: RouteContext) {
  const { segments } = await context.params;
  const apiUrl = (process.env.API_URL ?? "http://localhost:8000").replace(
    /\/+$/,
    "",
  );
  const path = segments?.map(encodeURIComponent).join("/");
  const query = new URL(request.url).search;

  try {
    const upstream = await fetch(`${apiUrl}/tasks${path ? `/${path}` : ""}${query}`, {
      method: request.method,
      headers: request.headers.get("content-type")
        ? { "Content-Type": request.headers.get("content-type")! }
        : undefined,
      body: request.method === "GET" ? undefined : await request.text(),
      cache: "no-store",
    });

    return new Response(await upstream.arrayBuffer(), {
      status: upstream.status,
      headers: {
        "Content-Type":
          upstream.headers.get("content-type") ?? "application/json",
      },
    });
  } catch {
    return NextResponse.json(
      { message: "Could not connect to the API. Please try again." },
      { status: 502 },
    );
  }
}

export const GET = proxyTaskRequest;
export const POST = proxyTaskRequest;
export const PATCH = proxyTaskRequest;
