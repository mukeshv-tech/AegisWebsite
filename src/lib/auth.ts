// Authentication Helper for Aegis Admin CMS

export const DEFAULT_ADMIN_PASSWORD = "AegisAdmin2026!"; // Can be overridden via env ADMIN_PASSWORD
export const SESSION_COOKIE_NAME = "aegis_admin_session";

// Hash string using Web Crypto SHA-256
export async function hashPassword(password: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(password);
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
}

// Generate session token hash
export async function generateSessionToken(password: string, envPassword?: string): Promise<string> {
  const targetPassword = envPassword || DEFAULT_ADMIN_PASSWORD;
  return await hashPassword(`${password}_aegis_session_salt_2026`);
}

// Verify request cookie for admin session
export async function verifyAdminSession(request: Request, envPassword?: string): Promise<boolean> {
  const cookieHeader = request.headers.get("Cookie") || "";
  const cookies = Object.fromEntries(
    cookieHeader.split(";").map((c) => {
      const [k, v] = c.trim().split("=");
      return [k, decodeURIComponent(v || "")];
    })
  );

  const sessionToken = cookies[SESSION_COOKIE_NAME];
  if (!sessionToken) return false;

  const targetPassword = envPassword || DEFAULT_ADMIN_PASSWORD;
  const expectedToken = await generateSessionToken(targetPassword, targetPassword);
  return sessionToken === expectedToken;
}
