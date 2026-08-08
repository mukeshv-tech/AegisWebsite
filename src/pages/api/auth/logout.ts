export const prerender = false;

import type { APIRoute } from "astro";
import { SESSION_COOKIE_NAME } from "../../../lib/auth";

export const POST: APIRoute = async () => {
  const response = new Response(JSON.stringify({ success: true, message: "Logged out" }), {
    status: 200,
    headers: {
      "Content-Type": "application/json",
      "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0",
      "Pragma": "no-cache",
      "Expires": "0",
    },
  });

  // Explicit cookie destruction across all browsers
  response.headers.append(
    "Set-Cookie",
    `${SESSION_COOKIE_NAME}=; Path=/; HttpOnly; SameSite=Strict; Max-Age=0; Expires=Thu, 01 Jan 1970 00:00:00 GMT`
  );

  return response;
};
