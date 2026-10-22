// lib/api.ts
// Base fetch wrapper cho backend NestJS (http://localhost:3001)

import { API_BASE } from './env';

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
    next: { revalidate: 60 },
    ...options,
  });

  if (!res.ok) {
    throw new Error(`API error ${res.status}: ${url}`);
  }

  return res.json() as Promise<T>;
}

export { apiFetch };
export type { ApiResponse, ApiResponseWithPagination };

