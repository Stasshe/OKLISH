import type { InterceptorHandle, CapturedLog, CapturedRequest } from './interceptor.types';
import { interceptConsole } from './console';
import { interceptFetch } from './fetch';
import { interceptXHR } from './xhr';
import { interceptErrors } from './errors';

interface InterceptorCallbacks {
  onLog: (entry: CapturedLog) => void;
  onRequest: (entry: CapturedRequest) => void;
}

const handles: InterceptorHandle[] = [];

export function installInterceptors(callbacks: InterceptorCallbacks): void {
  handles.push(
    interceptConsole(callbacks.onLog),
    interceptFetch(callbacks.onRequest),
    interceptXHR(callbacks.onRequest),
    interceptErrors(callbacks.onLog),
  );
}

export function uninstallInterceptors(): void {
  for (const handle of handles) {
    handle.restore();
  }
  handles.length = 0;
}
