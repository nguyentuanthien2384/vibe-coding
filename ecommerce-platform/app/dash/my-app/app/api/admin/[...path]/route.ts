import { NextRequest, NextResponse } from 'next/server';

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001';

const FORWARDED_RESPONSE_HEADERS = [
  'content-type',
  'content-disposition',
  'cache-control',
] as const;

async function proxyAdminRequest(request: NextRequest, context: { params: Promise<{ path: string[] }> }) {
  const { path } = await context.params;
  const accessToken =
    request.cookies.get('admin_access_token')?.value ?? request.cookies.get('accessToken')?.value;

  const headers = new Headers();
  const contentType = request.headers.get('content-type');
  if (contentType) headers.set('content-type', contentType);
  if (accessToken) headers.set('authorization', `Bearer ${accessToken}`);

  const method = request.method;
  const body = method === 'GET' || method === 'HEAD' ? undefined : await request.arrayBuffer();
  const upstream = await fetch(`${API_BASE}/api/v1/${path.join('/')}${request.nextUrl.search}`, {
    method,
    headers,
    body,
    cache: 'no-store',
  });

  const responseHeaders = new Headers();
  for (const header of FORWARDED_RESPONSE_HEADERS) {
    const value = upstream.headers.get(header);
    if (value) responseHeaders.set(header, value);
  }

  return new NextResponse(upstream.body, {
    status: upstream.status,
    headers: responseHeaders,
  });
}

export const GET = proxyAdminRequest;
export const POST = proxyAdminRequest;
export const PUT = proxyAdminRequest;
export const PATCH = proxyAdminRequest;
export const DELETE = proxyAdminRequest;
