/**
 * =============================================================================
 * CLOUDFLARE WORKER ROUTER (REVERSE PROXY) - TECHBITE ECOMMERCE
 * =============================================================================
 * Mục đích: Gom cả 3 service Render về 1 tên miền duy nhất (ví dụ: https://tenmien.com)
 * 
 * Quy tắc định tuyến:
 * - https://tenmien.com/api/*     -> https://techbite-backend.onrender.com/api/*
 * - https://tenmien.com/admin/*   -> https://techbite-dash.onrender.com/admin/*
 * - https://tenmien.com/*         -> https://techbite-frontend.onrender.com/*
 * 
 * Chi phí: MIỄN PHÍ 100% (Gói Cloudflare Free cho phép 100,000 requests/ngày).
 * =============================================================================
 */

const BACKEND_HOST = 'techbite-backend.onrender.com';
const DASH_HOST = 'techbite-dash.onrender.com';
const FRONTEND_HOST = 'techbite-frontend.onrender.com';

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);

    // Xác định service đích dựa trên URL path
    let targetHost = FRONTEND_HOST;

    if (url.pathname.startsWith('/api/') || url.pathname === '/api') {
      targetHost = BACKEND_HOST;
    } else if (url.pathname.startsWith('/admin/') || url.pathname === '/admin') {
      targetHost = DASH_HOST;
    } else {
      targetHost = FRONTEND_HOST;
    }

    // Tạo URL đích
    const targetUrl = new URL(request.url);
    targetUrl.protocol = 'https:';
    targetUrl.hostname = targetHost;
    targetUrl.port = '';

    // Sao chép headers và cập nhật Host header chuẩn cho Render
    const newHeaders = new Headers(request.headers);
    newHeaders.set('host', targetHost);
    newHeaders.set('x-forwarded-host', url.hostname);
    newHeaders.set('x-forwarded-proto', 'https');

    // Chuyển tiếp request đến Render
    const newRequest = new Request(targetUrl.toString(), {
      method: request.method,
      headers: newHeaders,
      body: request.body,
      redirect: 'manual',
    });

    try {
      const response = await fetch(newRequest);

      // Clone response để cho phép điều chỉnh header nếu cần
      const responseHeaders = new Headers(response.headers);

      // Nếu backend hoặc dash trả về redirect (301, 302, 307, 308) có chứa hostname render,
      // rewrite Location header về tên miền gốc
      const location = responseHeaders.get('location');
      if (location) {
        try {
          const locUrl = new URL(location, targetUrl);
          if (locUrl.hostname === targetHost) {
            locUrl.hostname = url.hostname;
            locUrl.protocol = url.protocol;
            responseHeaders.set('location', locUrl.toString());
          }
        } catch {
          // ignore invalid location
        }
      }

      return new Response(response.body, {
        status: response.status,
        statusText: response.statusText,
        headers: responseHeaders,
      });
    } catch (err) {
      return new Response(`Lỗi kết nối tới origin (${targetHost}): ${err.message}`, {
        status: 502,
        headers: { 'content-type': 'text/plain; charset=utf-8' },
      });
    }
  },
};
