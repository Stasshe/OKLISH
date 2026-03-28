import type { NetworkRequest } from '../network.types';

interface HAR {
  log: {
    version: string;
    creator: { name: string; version: string };
    entries: HAREntry[];
  };
}

interface HAREntry {
  cache: Record<string, unknown>;
  request: HARRequest;
  response: HARResponse;
  timings: HARTimings;
  time: number;
  startedDateTime: string;
}

interface HARRequest {
  method: string;
  url: string;
  httpVersion: string;
  headers: HARHeader[];
  queryString: HARQueryString[];
  postData?: { mimeType: string; text: string };
  headersSize: number;
  bodySize: number;
}

interface HARResponse {
  status: number;
  statusText: string;
  httpVersion: string;
  headers: HARHeader[];
  cookies: HARCookie[];
  content: {
    size: number;
    mimeType: string;
    text?: string;
  };
  redirectURL: string;
  headersSize: number;
  bodySize: number;
}

interface HARHeader {
  name: string;
  value: string;
}

interface HARQueryString {
  name: string;
  value: string;
}

interface HARCookie {
  name: string;
  value: string;
  path?: string;
  domain?: string;
  expires?: string;
  httpOnly?: boolean;
  secure?: boolean;
  sameSite?: string;
}

interface HARTimings {
  blocked?: number;
  dns?: number;
  connect?: number;
  send?: number;
  wait?: number;
  receive?: number;
  ssl?: number;
}

function parseQueryString(url: string): HARQueryString[] {
  try {
    const u = new URL(url);
    const params: HARQueryString[] = [];
    u.searchParams.forEach((value, name) => {
      params.push({ name, value });
    });
    return params;
  } catch {
    return [];
  }
}

function headersToArray(headers: Record<string, string>): HARHeader[] {
  return Object.entries(headers).map(([name, value]) => ({
    name,
    value,
  }));
}

function generateHAR(requests: NetworkRequest[]): HAR {
  const entries: HAREntry[] = requests.map(req => {
    const startTime = new Date(req.startTime);

    return {
      cache: {},
      request: {
        method: req.method,
        url: req.url,
        httpVersion: req.protocol || 'HTTP/1.1',
        headers: headersToArray(req.requestHeaders),
        queryString: parseQueryString(req.url),
        postData: req.requestBody
          ? {
              mimeType: req.responseHeaders['content-type'] || 'application/x-www-form-urlencoded',
              text: typeof req.requestBody === 'string'
                ? req.requestBody
                : JSON.stringify(req.requestBody),
            }
          : undefined,
        headersSize: 0,
        bodySize: req.requestBody
          ? (typeof req.requestBody === 'string'
              ? req.requestBody.length
              : JSON.stringify(req.requestBody).length)
          : 0,
      },
      response: {
        status: req.status,
        statusText: req.statusText,
        httpVersion: req.protocol || 'HTTP/1.1',
        headers: headersToArray(req.responseHeaders),
        cookies: req.cookies.map(c => ({
          name: c.name,
          value: c.value,
          path: c.path,
          domain: c.domain,
          expires: c.expires,
          httpOnly: c.httpOnly,
          secure: c.secure,
          sameSite: c.sameSite,
        })),
        content: {
          size: req.resourceSize,
          mimeType: req.responseHeaders['content-type'] || 'text/plain',
          text: typeof req.responseBody === 'string'
            ? req.responseBody
            : req.responseBody
              ? JSON.stringify(req.responseBody)
              : undefined,
        },
        redirectURL: req.responseHeaders['location'] || '',
        headersSize: 0,
        bodySize: req.resourceSize,
      },
      timings: {
        blocked: req.timingPhases.blocked,
        dns: req.timingPhases.dns,
        connect: req.timingPhases.connect,
        send: req.timingPhases.send,
        wait: req.timingPhases.wait,
        receive: req.timingPhases.receive,
        ssl: req.timingPhases.ssl,
      },
      time: req.duration,
      startedDateTime: startTime.toISOString(),
    };
  });

  return {
    log: {
      version: '1.2',
      creator: {
        name: 'OKLISH',
        version: '1.0.0',
      },
      entries,
    },
  };
}

export function exportHAR(requests: NetworkRequest[]): void {
  const har = generateHAR(requests);
  const json = JSON.stringify(har, null, 2);
  const blob = new Blob([json], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `network-${new Date().toISOString().replace(/[:.]/g, '-')}.har`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
