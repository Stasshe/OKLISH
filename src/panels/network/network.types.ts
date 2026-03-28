export interface TimingPhase {
  blocked: number;
  dns: number;
  connect: number;
  send: number;
  wait: number;
  receive: number;
  ssl: number;
}

export interface Cookie {
  name: string;
  value: string;
  domain?: string;
  path?: string;
  secure?: boolean;
  httpOnly?: boolean;
  sameSite?: "Strict" | "Lax" | "None";
  expires?: string;
}

export interface NetworkRequest {
  id: string;
  method: string;
  url: string;
  status: number;
  statusText: string;
  requestHeaders: Record<string, string>;
  responseHeaders: Record<string, string>;
  requestBody: unknown;
  responseBody: unknown;
  responseType: string;
  startTime: number;
  endTime: number;
  duration: number;
  size: number;
  type: "fetch" | "xhr";
  error?: string;

  // New fields
  priority: "low" | "medium" | "high" | "critical";
  protocol: string; // HTTP/1.1, HTTP/2, HTTP/3, etc.
  domain: string; // parsed from URL
  timingPhases: TimingPhase;
  cookies: Cookie[];
  ipAddress?: string;
  resourceSize: number; // response body size
}
