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

interface NextFetchOptions {
  revalidate?: number;
}

type NextRequestInit = RequestInit & {
  next?: NextFetchOptions;
};

async function apiFetch<T>(
  path: string,
  options?: NextRequestInit,
): Promise<T> {
  const url = `${API_BASE}${path}`;
  const { next, ...requestOptions } = options ?? {};
  const fetchOptions: NextRequestInit = {
    ...requestOptions,
    ...(requestOptions.cache === 'no-store' ? {} : { next: next ?? { revalidate: 60 } }),
  };
  const res = await fetch(url, {
    ...fetchOptions,
    // Next.js: revalidate mỗi 60 giây (ISR)
  });

  if (!res.ok) {
    throw new Error(`API error ${res.status}: ${url}`);
  }

  return res.json() as Promise<T>;
}

import { clientApiFetch } from './client-api';
import { serverApiFetch } from './server-api';

export { apiFetch, clientApiFetch, serverApiFetch };
export type { ApiResponse, ApiResponseWithPagination };
