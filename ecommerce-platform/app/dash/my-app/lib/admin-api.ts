/**
 * Dashboard API client. Requests pass through the local BFF proxy so access
 * tokens remain in HttpOnly cookies and are never exposed to browser storage.
 */

let isRefreshing = false;
let failedQueue: Array<{ resolve: () => void; reject: (reason: Error) => void }> = [];

function processQueue(error: Error | null): void {
  failedQueue.forEach((request) => {
    if (error) request.reject(error);
    else request.resolve();
  });
  failedQueue = [];
}

function getMessage(errorBody: unknown, fallback: string): string {
  if (!errorBody || typeof errorBody !== 'object' || !('message' in errorBody)) return fallback;
  const message = (errorBody as { message?: string | string[] }).message;
  return Array.isArray(message) ? message.join(', ') : message ?? fallback;
}

function toProxyUrl(path: string): string {
  if (path.startsWith('http://') || path.startsWith('https://')) return path;
  return `/api/admin${path.startsWith('/') ? path : `/${path}`}`;
}

async function refreshSession(): Promise<void> {
  const refreshResponse = await fetch('/api/auth/refresh', {
    method: 'POST',
    credentials: 'include',
  });
  if (!refreshResponse.ok) {
    const body: unknown = await refreshResponse.json().catch(() => null);
    throw new Error(getMessage(body, 'Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.'));
  }
}

export async function adminFetchResponse(path: string, options: RequestInit = {}): Promise<Response> {
  const response = await fetch(toProxyUrl(path), { ...options, credentials: 'include' });
  if (response.status !== 401 || path.includes('/auth/refresh')) return response;

  if (isRefreshing) {
    await new Promise<void>((resolve, reject) => failedQueue.push({ resolve, reject }));
    return adminFetchResponse(path, options);
  }

  isRefreshing = true;
  try {
    await refreshSession();
    processQueue(null);
    return await adminFetchResponse(path, options);
  } catch (cause: unknown) {
    const error = cause instanceof Error ? cause : new Error('Không thể làm mới phiên đăng nhập.');
    processQueue(error);
    if (typeof window !== 'undefined') window.location.assign('/login?expired=1');
    throw error;
  } finally {
    isRefreshing = false;
  }
}

export async function adminFetch<T>(path: string, options: RequestInit = {}): Promise<T> {
  const headers = new Headers(options.headers);
  if (!(options.body instanceof FormData) && !headers.has('content-type')) {
    headers.set('content-type', 'application/json');
  }

  const response = await adminFetchResponse(path, { ...options, headers });
  if (!response.ok) {
    const body: unknown = await response.json().catch(() => null);
    throw new Error(getMessage(body, `HTTP ${response.status}`));
  }
  return response.json() as Promise<T>;
}
