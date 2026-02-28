export interface InterceptorHandle {
  restore(): void;
}

export type LogLevel = 'log' | 'warn' | 'error' | 'info' | 'debug';

export interface CapturedLog {
  id: string;
  level: LogLevel;
  args: unknown[];
  timestamp: number;
  stack?: string;
}

export interface CapturedRequest {
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
  type: 'fetch' | 'xhr';
  error?: string;
}
