import type { InterceptorHandle, CapturedRequest } from './interceptor.types';

type RequestCallback = (entry: CapturedRequest) => void;

let idCounter = 0;

export function interceptXHR(callback: RequestCallback): InterceptorHandle {
  const OriginalXHR = window.XMLHttpRequest;
  const originalOpen = OriginalXHR.prototype.open;
  const originalSend = OriginalXHR.prototype.send;
  const originalSetHeader = OriginalXHR.prototype.setRequestHeader;

  XMLHttpRequest.prototype.open = function (
    method: string,
    url: string | URL,
    ...rest: unknown[]
  ) {
    (this as any).__oklish = {
      id: `xhr_${idCounter++}`,
      method: method.toUpperCase(),
      url: String(url),
      requestHeaders: {} as Record<string, string>,
      startTime: 0,
      requestBody: null as unknown,
    };
    return originalOpen.apply(this, [method, url, ...rest] as any);
  };

  XMLHttpRequest.prototype.setRequestHeader = function (name: string, value: string) {
    if ((this as any).__oklish) {
      (this as any).__oklish.requestHeaders[name] = value;
    }
    return originalSetHeader.call(this, name, value);
  };

  XMLHttpRequest.prototype.send = function (body?: Document | XMLHttpRequestBodyInit | null) {
    const meta = (this as any).__oklish;
    if (!meta) {
      return originalSend.call(this, body);
    }

    meta.startTime = performance.now();
    meta.requestBody = body;

    this.addEventListener('loadend', () => {
      const endTime = performance.now();
      const responseHeaders: Record<string, string> = {};
      const rawHeaders = this.getAllResponseHeaders();
      rawHeaders.split('\r\n').forEach((line) => {
        const idx = line.indexOf(': ');
        if (idx > 0) {
          responseHeaders[line.slice(0, idx).toLowerCase()] = line.slice(idx + 2);
        }
      });

      let responseBody: unknown = null;
      let size = 0;
      try {
        const text = this.responseText;
        size = new Blob([text]).size;
        try { responseBody = JSON.parse(text); } catch { responseBody = text; }
      } catch { /* empty */ }

      const entry: CapturedRequest = {
        id: meta.id,
        method: meta.method,
        url: meta.url,
        status: this.status,
        statusText: this.statusText,
        requestHeaders: meta.requestHeaders,
        responseHeaders,
        requestBody: meta.requestBody,
        responseBody,
        responseType: responseHeaders['content-type'] ?? '',
        startTime: meta.startTime,
        endTime,
        duration: endTime - meta.startTime,
        size,
        type: 'xhr',
        error: this.status === 0 ? 'Network Error' : undefined,
      };

      callback(entry);
    });

    return originalSend.call(this, body);
  };

  return {
    restore() {
      XMLHttpRequest.prototype.open = originalOpen;
      XMLHttpRequest.prototype.send = originalSend;
      XMLHttpRequest.prototype.setRequestHeader = originalSetHeader;
    },
  };
}
