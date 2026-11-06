// Next.js may normalize request.url to its internal hostname. The HTTP Host
// still identifies the public authority the browser actually requested.
export function isSameOriginRequest(request: Request): boolean {
  const origin = request.headers.get("origin");
  if (!origin) return false;
  try {
    const internal = new URL(request.url);
    const host = request.headers.get("host");
    if (host && /[/\\?#@\s]/.test(host)) return false;
    const expected = host
      ? new URL(`${internal.protocol}//${host}`).origin
      : internal.origin;
    return origin === expected;
  } catch {
    return false;
  }
}
