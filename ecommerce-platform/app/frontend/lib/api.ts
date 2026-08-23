// lib/api.ts
// Base fetch wrapper cho backend NestJS (http://localhost:3001)

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001';

interface ApiResponse<T> {
  statusCode: number;
  message: string;
  data: T;
}

interface ApiResponseWithPagination<T> extends ApiResponse<T> {
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

async function apiFetch<T>(
  path: string,
  options?: RequestInit,
): Promise<T> {
  const url = `${API_BASE}${path}`;
  const res = await fetch(url, {
    ...options,
    // Next.js: revalidate mỗi 60 giây (ISR)
    next: { revalidate: 60 },
  });

  if (!res.ok) {
    throw new Error(`API error ${res.status}: ${url}`);
  }

  return res.json() as Promise<T>;
}

export { apiFetch };
export type { ApiResponse, ApiResponseWithPagination };

