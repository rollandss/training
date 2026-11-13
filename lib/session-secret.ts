const DEV_FALLBACK = "dev-only-change-SESSION_SECRET-in-env-32chars";

let cached: Uint8Array | null = null;

/**
 * Returns the HMAC key for session JWTs.
 * In production a missing or short SESSION_SECRET is a hard error:
 * a known fallback would let anyone forge a session for any user.
 */
export function getSessionSecret(): Uint8Array {
  if (cached) return cached;

  const raw = process.env.SESSION_SECRET;
  const isProd = process.env.NODE_ENV === "production";

  if (!raw || raw.length < 32) {
    if (isProd) {
      throw new Error("SESSION_SECRET must be set and at least 32 characters long in production");
    }
    cached = new TextEncoder().encode(raw && raw.length > 0 ? raw : DEV_FALLBACK);
    return cached;
  }

  cached = new TextEncoder().encode(raw);
  return cached;
}
