export const prerender = false;

import type { APIRoute } from "astro";
import { SESSION_COOKIE_NAME } from "../../../lib/auth";

export const POST: APIRoute = async () => {
  const response = new Response(JSON.stringify({ success: true, message: "Logged out" }), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });

  response.headers.append(
    "Set-Cookie",
    `${SESSION_COOKIE_NAME}=; Path=/; HttpOnly; SameSite=Strict; Max-Age=0`
  );

  return response;
};
