import type { InterceptorHandle, CapturedRequest } from './interceptor.types';

type RequestCallback = (entry: CapturedRequest) => void;

let idCounter = 0;

export function interceptFetch(callback: RequestCallback): InterceptorHandle {
  const originalFetch = window.fetch.bind(window);

  window.fetch = async (input: RequestInfo | URL, init?: RequestInit) => {
    const id = `fetch_${idCounter++}`;
    const startTime = performance.now();

    const url = typeof input === 'string'
      ? input
      : input instanceof URL
        ? input.href
        : input.url;

    const method = init?.method ?? 'GET';

    const requestHeaders: Record<string, string> = {};
    if (init?.headers) {
      const h = new Headers(init.headers);
      h.forEach((value, key) => { requestHeaders[key] = value; });
    }

    try {
      const response = await originalFetch(input, init);
      const endTime = performance.now();

      const responseHeaders: Record<string, string> = {};
      response.headers.forEach((value, key) => { responseHeaders[key] = value; });

      const clone = response.clone();
      let responseBody: unknown = null;
      let size = 0;

      try {
        const text = await clone.text();
        size = new Blob([text]).size;
        try { responseBody = JSON.parse(text); } catch { responseBody = text; }
      } catch { /* empty */ }

      const entry: CapturedRequest = {
        id,
        method: method.toUpperCase(),
        url,
        status: response.status,
        statusText: response.statusText,
        requestHeaders,
        responseHeaders,
        requestBody: init?.body ?? null,
        responseBody,
        responseType: responseHeaders['content-type'] ?? '',
        startTime,
        endTime,
        duration: endTime - startTime,
        size,
        type: 'fetch',
      };

      callback(entry);
      return response;
    } catch (error) {
      const endTime = performance.now();
      const entry: CapturedRequest = {
        id,
        method: method.toUpperCase(),
        url,
        status: 0,
        statusText: 'Network Error',
        requestHeaders,
        responseHeaders: {},
        requestBody: init?.body ?? null,
        responseBody: null,
        responseType: '',
        startTime,
        endTime,
        duration: endTime - startTime,
        size: 0,
        type: 'fetch',
        error: error instanceof Error ? error.message : String(error),
      };

      callback(entry);
      throw error;
    }
  };

  return {
    restore() {
      window.fetch = originalFetch;
    },
  };
}
