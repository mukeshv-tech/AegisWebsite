export const prerender = false;

import type { APIRoute } from "astro";
import { generateSessionToken, DEFAULT_ADMIN_PASSWORD, SESSION_COOKIE_NAME } from "../../../lib/auth";

export const POST: APIRoute = async ({ request }) => {
  try {
    const body = await request.json();
    const { password } = body;

    const envPassword = process.env.ADMIN_PASSWORD || DEFAULT_ADMIN_PASSWORD;

    if (!password || password !== envPassword) {
      return new Response(JSON.stringify({ error: "Invalid admin password" }), {
        status: 401,
        headers: { "Content-Type": "application/json" },
      });
    }

    const sessionToken = await generateSessionToken(password, envPassword);

    const response = new Response(JSON.stringify({ success: true, message: "Authenticated successfully" }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });

    // Set secure HTTP-Only session cookie
    response.headers.append(
      "Set-Cookie",
      `${SESSION_COOKIE_NAME}=${encodeURIComponent(sessionToken)}; Path=/; HttpOnly; SameSite=Strict; Max-Age=86400`
    );

    return response;
  } catch (err: any) {
    return new Response(JSON.stringify({ error: err.message || "Authentication error" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
};
