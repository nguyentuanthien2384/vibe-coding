import { SearchSuggestApiResponse } from "../types/search.types";

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001";

/**
 * Gọi API backend NestJS GET /api/v1/products/search-suggest?q=...&limit=5
 */
export async function fetchSearchSuggest(
  query: string,
  limit = 5,
  signal?: AbortSignal
): Promise<SearchSuggestApiResponse> {
  const trimmed = query.trim();
  if (trimmed.length < 2) {
    return {
      statusCode: 200,
      message: "OK",
      data: { query: trimmed, totalFound: 0, items: [] },
    };
  }

  const url = `${API_BASE}/api/v1/products/search-suggest?q=${encodeURIComponent(trimmed)}&limit=${limit}`;
  const res = await fetch(url, {
    cache: "no-store",
    signal,
  });

  if (!res.ok) {
    throw new Error(`API search-suggest error ${res.status}: ${res.statusText}`);
  }

  return res.json() as Promise<SearchSuggestApiResponse>;
}
