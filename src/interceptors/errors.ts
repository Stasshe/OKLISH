import type { CapturedLog, InterceptorHandle } from "./interceptor.types";

type LogCallback = (entry: CapturedLog) => void;

let idCounter = 0;

export function interceptErrors(callback: LogCallback): InterceptorHandle {
  const onError = (event: ErrorEvent) => {
    const entry: CapturedLog = {
      id: `err_${idCounter++}`,
      level: "error",
      args: [event.message],
      timestamp: Date.now(),
      stack: event.error?.stack ?? `at ${event.filename}:${event.lineno}:${event.colno}`,
    };
    callback(entry);
  };

  const onUnhandledRejection = (event: PromiseRejectionEvent) => {
    const message = event.reason instanceof Error ? event.reason.message : String(event.reason);

    const entry: CapturedLog = {
      id: `err_${idCounter++}`,
      level: "error",
      args: [`Unhandled Promise Rejection: ${message}`],
      timestamp: Date.now(),
      stack: event.reason instanceof Error ? event.reason.stack : undefined,
    };
    callback(entry);
  };

  window.addEventListener("error", onError);
  window.addEventListener("unhandledrejection", onUnhandledRejection);

  return {
    restore() {
      window.removeEventListener("error", onError);
      window.removeEventListener("unhandledrejection", onUnhandledRejection);
    },
  };
}
