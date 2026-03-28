import type { Cookie, TimingPhase } from "../network.types";

export function parseDomain(url: string): string {
  try {
    const u = new URL(url);
    return u.hostname;
  } catch {
    return "<unknown>";
  }
}

export function parseProtocol(
  responseHeaders: Record<string, string>,
  _responseType: string,
): string {
  // Try to get from response headers first (some servers include it)
  const serverHeader = responseHeaders["server"];
  if (serverHeader?.includes("HTTP/2")) return "HTTP/2";
  if (serverHeader?.includes("HTTP/3")) return "HTTP/3";

  // Default to HTTP/1.1 (common for fetch/xhr in browser)
  return "HTTP/1.1";
}

export function parseCookies(responseHeaders: Record<string, string>): Cookie[] {
  const cookies: Cookie[] = [];
  const setCookieHeader = responseHeaders["set-cookie"];

  if (!setCookieHeader) return cookies;

  // set-cookie can be a string or array
  const setCookies = Array.isArray(setCookieHeader) ? setCookieHeader : [setCookieHeader];

  for (const cookieStr of setCookies) {
    const parts = cookieStr.split(";");
    if (!parts[0]) continue;

    const [name, value] = parts[0].split("=").map((s: string) => s.trim());
    if (!name) continue;

    const cookie: Cookie = {
      name,
      value,
    };

    for (let i = 1; i < parts.length; i++) {
      const part = parts[i].trim();
      const [attrName, attrValue] = part.split("=").map((s: string) => s.trim());

      if (attrName.toLowerCase() === "domain") {
        cookie.domain = attrValue;
      } else if (attrName.toLowerCase() === "path") {
        cookie.path = attrValue;
      } else if (attrName.toLowerCase() === "secure") {
        cookie.secure = true;
      } else if (attrName.toLowerCase() === "httponly") {
        cookie.httpOnly = true;
      } else if (attrName.toLowerCase() === "samesite") {
        cookie.sameSite = (attrValue as "Strict" | "Lax" | "None") || "Lax";
      } else if (attrName.toLowerCase() === "expires") {
        cookie.expires = attrValue;
      }
    }

    cookies.push(cookie);
  }

  return cookies;
}

export function calculateTimingPhases(
  duration: number,
  _responseHeaders: Record<string, string>,
): TimingPhase {
  // In web APIs, we don't have granular breakdown, so we approximate
  // For Fetch/XHR: most time is in send + wait + receive
  // We distribute roughly:
  // - blocked: ~5% (DNS cache lookup)
  // - dns: 0 (cached)
  // - connect: ~10% (connection overhead)
  // - send: ~15% (request upload)
  // - wait: ~40% (server processing)
  // - receive: ~30% (response download)
  // - ssl: 0 (included in connect for HTTPS)

  const blocked = duration * 0.05;
  const connect = duration * 0.1;
  const send = duration * 0.15;
  const wait = duration * 0.4;
  const receive = duration * 0.3;

  return {
    blocked: Math.round(blocked),
    dns: 0,
    connect: Math.round(connect),
    send: Math.round(send),
    wait: Math.round(wait),
    receive: Math.round(receive),
    ssl: 0,
  };
}

export function inferPriority(
  method: string,
  size: number,
  duration: number,
  type: "fetch" | "xhr",
): "low" | "medium" | "high" | "critical" {
  // Critical: GET requests, small size, fast
  if (method === "GET" && size < 100000 && duration < 500) {
    return "critical";
  }

  // High: GET requests or fast requests
  if (method === "GET" || duration < 1000) {
    return "high";
  }

  // Medium: POST/PUT/DELETE, moderate size/duration
  if ((method === "POST" || method === "PUT" || method === "DELETE") && size < 1000000) {
    return "medium";
  }

  // Low: Large or slow requests
  return "low";
}

export function extractIpAddress(responseHeaders: Record<string, string>): string | undefined {
  // Some servers include this info, but it's not standard
  const cfHeaders = responseHeaders["cf-connecting-ip"];
  if (cfHeaders) return cfHeaders;

  const xForwardedFor = responseHeaders["x-forwarded-for"];
  if (xForwardedFor) return xForwardedFor.split(",")[0].trim();

  return undefined;
}
