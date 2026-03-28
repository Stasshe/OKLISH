import { interceptConsole } from "./console";
import { interceptErrors } from "./errors";
import { interceptFetch } from "./fetch";
import type { CapturedLog, CapturedRequest, InterceptorHandle } from "./interceptor.types";
import { interceptXHR } from "./xhr";

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
