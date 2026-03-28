import type { NetworkRequest } from './network.types';
import type { CapturedRequest } from '../../interceptors/interceptor.types';
import { parseDomain, parseProtocol, parseCookies, calculateTimingPhases, inferPriority, extractIpAddress } from './utils/parseHeaders';

function enrichRequest(captured: CapturedRequest): NetworkRequest {
  const domain = parseDomain(captured.url);
  const protocol = parseProtocol(captured.responseHeaders, captured.responseType);
  const priority = inferPriority(captured.method, captured.size, captured.duration, captured.type);
  const cookies = parseCookies(captured.responseHeaders);
  const timingPhases = calculateTimingPhases(captured.duration, captured.responseHeaders);
  const ipAddress = extractIpAddress(captured.responseHeaders);

  return {
    ...captured,
    domain,
    protocol,
    priority,
    cookies,
    timingPhases,
    ipAddress,
    resourceSize: captured.size,
  };
}

let requests = $state<NetworkRequest[]>([]);
let selectedId = $state<string | null>(null);
let searchQuery = $state('');
let typeFilter = $state<string>('all');
let statusFilter = $state<string>('all'); // all, 2xx, 3xx, 4xx, 5xx, failed
let methodFilter = $state<string>('all');
let sizeRange = $state<[number, number]>([0, Infinity]); // min, max in bytes
let durationRange = $state<[number, number]>([0, Infinity]); // min, max in ms
let groupBy = $state<'none' | 'domain'>('none');
let sortBy = $state<'time' | 'size' | 'duration' | 'name'>('time');

function matchesStatusFilter(status: number, filter: string): boolean {
  if (filter === 'all') return true;
  if (filter === 'failed') return status === 0;
  if (filter === '2xx') return status >= 200 && status < 300;
  if (filter === '3xx') return status >= 300 && status < 400;
  if (filter === '4xx') return status >= 400 && status < 500;
  if (filter === '5xx') return status >= 500;
  return true;
}

const filteredRequests = $derived.by(() => {
  let filtered = requests.filter((req) => {
    // Type filter (fetch vs xhr)
    if (typeFilter !== 'all' && req.type !== typeFilter) return false;

    // Status filter
    if (!matchesStatusFilter(req.status, statusFilter)) return false;

    // Method filter
    if (methodFilter !== 'all' && req.method !== methodFilter) return false;

    // Size range filter
    if (req.size < sizeRange[0] || req.size > sizeRange[1]) return false;

    // Duration range filter
    if (req.duration < durationRange[0] || req.duration > durationRange[1]) return false;

    // Search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      return (
        req.url.toLowerCase().includes(query) ||
        req.domain.toLowerCase().includes(query) ||
        req.method.toLowerCase().includes(query)
      );
    }

    return true;
  });

  // Apply sorting
  const sorted = [...filtered].sort((a, b) => {
    if (sortBy === 'size') return b.size - a.size;
    if (sortBy === 'duration') return b.duration - a.duration;
    if (sortBy === 'name') return a.url.localeCompare(b.url);
    // Default 'time': maintain insertion order (original order)
    return 0;
  });

  return sorted;
});

const groupedRequests = $derived.by(() => {
  if (groupBy === 'none') {
    return filteredRequests;
  }

  if (groupBy === 'domain') {
    // Create a flat array with group headers injected
    // This is a simple approach: we'll mark group headers with a special property
    const grouped: any[] = [];
    const domainMap = new Map<string, NetworkRequest[]>();

    for (const req of filteredRequests) {
      if (!domainMap.has(req.domain)) {
        domainMap.set(req.domain, []);
      }
      domainMap.get(req.domain)!.push(req);
    }

    // Sort domains alphabetically
    const sortedDomains = Array.from(domainMap.keys()).sort();

    for (const domain of sortedDomains) {
      grouped.push({ __groupHeader: true, domain });
      grouped.push(...domainMap.get(domain)!);
    }

    return grouped;
  }

  return filteredRequests;
});

export const networkState = {
  get requests(): (NetworkRequest | { __groupHeader: true; domain: string })[] {
    return groupedRequests;
  },
  get allRequests(): NetworkRequest[] {
    return requests;
  },
  get filteredRequests(): NetworkRequest[] {
    return filteredRequests;
  },
  get selectedId(): string | null {
    return selectedId;
  },
  get selectedRequest(): NetworkRequest | undefined {
    return requests.find(r => r.id === selectedId);
  },
  get searchQuery(): string {
    return searchQuery;
  },
  get typeFilter(): string {
    return typeFilter;
  },
  get statusFilter(): string {
    return statusFilter;
  },
  get methodFilter(): string {
    return methodFilter;
  },
  get sizeRange(): [number, number] {
    return sizeRange;
  },
  get durationRange(): [number, number] {
    return durationRange;
  },
  get groupBy(): 'none' | 'domain' {
    return groupBy;
  },
  get sortBy(): 'time' | 'size' | 'duration' | 'name' {
    return sortBy;
  },
  addRequest(captured: CapturedRequest): void {
    const enriched = enrichRequest(captured);
    requests = [...requests, enriched];
  },
  select(id: string | null): void {
    selectedId = id;
  },
  setSearch(q: string): void {
    searchQuery = q;
  },
  setTypeFilter(t: string): void {
    typeFilter = t;
  },
  setStatusFilter(s: string): void {
    statusFilter = s;
  },
  setMethodFilter(m: string): void {
    methodFilter = m;
  },
  setSizeRange(range: [number, number]): void {
    sizeRange = range;
  },
  setDurationRange(range: [number, number]): void {
    durationRange = range;
  },
  setGroupBy(g: 'none' | 'domain'): void {
    groupBy = g;
  },
  setSortBy(s: 'time' | 'size' | 'duration' | 'name'): void {
    sortBy = s;
  },
  clear(): void {
    requests = [];
    selectedId = null;
  },
};
