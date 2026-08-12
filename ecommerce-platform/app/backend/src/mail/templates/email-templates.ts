import * as Handlebars from 'handlebars';

function getFrontendUrl(): string {
  return (process.env.FRONTEND_URL || 'http://localhost:3000').replace(/\/$/, '');
}

const BASE_TEMPLATE = `
<!DOCTYPE html>
<html lang="vi">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>{{subject}}</title>
  <style>
    body {
      margin: 0;
      padding: 0;
      background-color: #f1f5f9;
      font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
      color: #334155;
    }
    .wrapper {
      width: 100%;
      background-color: #f1f5f9;
      padding: 40px 16px;
      box-sizing: border-box;
    }
    .container {
      max-width: 600px;
      margin: 0 auto;
      background-color: #ffffff;
      border-radius: 20px;
      overflow: hidden;
      box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.05);
    }
    .header {
      background: linear-gradient(135deg, #1e293b 0%, #0f172a 100%);
      padding: 32px;
      text-align: center;
    }
    .brand-logo {
      color: #ff8c42;
      font-size: 28px;
      font-weight: 800;
      letter-spacing: -0.5px;
      margin: 0;
      text-transform: uppercase;
    }
    .brand-tagline {
      color: #94a3b8;
      font-size: 13px;
      margin-top: 4px;
      margin-bottom: 0;
    }
    .content {
      padding: 36px 32px;
    }
    .greeting {
      font-size: 20px;
      font-weight: 700;
      color: #0f172a;
      margin-bottom: 16px;
    }
    .message {
      font-size: 15px;
      line-height: 1.6;
      color: #475569;
      margin-bottom: 24px;
    }
    .card-box {
      background-color: #f8fafc;
      border: 1px solid #e2e8f0;
      border-radius: 16px;
      padding: 20px;
      margin-bottom: 24px;
    }
    .alert-box {
      background-color: #fff1f2;
      border: 1px solid #fecdd3;
      border-left: 5px solid #A63D40;
      border-radius: 12px;
      padding: 16px 20px;
      margin-bottom: 24px;
      color: #881337;
    }
    .cta-container {
      text-align: center;
      margin-top: 32px;
    }
    .cta-btn {
      display: inline-block;
      background-color: #ff8c42;
      color: #ffffff !important;
      text-decoration: none;
      font-weight: 700;
      font-size: 15px;
      padding: 14px 28px;
      border-radius: 12px;
      text-align: center;
      box-shadow: 0 4px 12px rgba(255, 140, 66, 0.3);
      margin: 4px;
    }
    .cta-btn-secondary {
      display: inline-block;
      background-color: #ffffff;
      color: #475569 !important;
      text-decoration: none;
      font-weight: 600;
      font-size: 14px;
      padding: 13px 24px;
      border: 1px solid #cbd5e1;
      border-radius: 12px;
      text-align: center;
      margin: 4px;
    }
    .footer {
      background-color: #f8fafc;
      padding: 24px 32px;
      text-align: center;
      border-top: 1px solid #f1f5f9;
      font-size: 13px;
      color: #94a3b8;
    }
    .table-order {
      width: 100%;
      border-collapse: collapse;
      margin-top: 12px;
    }
    .table-order th {
      text-align: left;
      font-size: 12px;
      text-transform: uppercase;
      color: #64748b;
      padding-bottom: 8px;
      border-bottom: 1px solid #e2e8f0;
    }
    .table-order td {
      padding: 12px 0;
      font-size: 14px;
      border-bottom: 1px solid #f1f5f9;
      color: #334155;
    }
  </style>
</head>
<body>
  <div class="wrapper">
    <div class="container">
      <div class="header">
        <h1 class="brand-logo">TECHBITE ⚡</h1>
        <p class="brand-tagline">Thương mại điện tử & Trải nghiệm công nghệ chuẩn mực</p>
      </div>
      <div class="content">
        {{{bodyContent}}}
      </div>
      <div class="footer">
        <p style="margin: 0 0 8px 0;">Nếu có bất kỳ thắc mắc nào, vui lòng liên hệ <strong>support@techbite.vn</strong> hoặc Hotline <strong>1900-TECHBITE</strong>.</p>
        <p style="margin: 0;">© 2026 TechBite Inc. Tất cả quyền được bảo lưu.</p>
      </div>
    </div>
  </div>
</body>
</html>
`;

export function renderRegisterWelcomeEmail(fullName: string): { subject: string; html: string } {
  const frontendUrl = getFrontendUrl();
  const subject = 'Chào mừng bạn đến với TechBite 🚀';
  const bodyContent = `
    <div class="greeting">Xin chào ${fullName}!</div>
    <div class="message">
      Cảm ơn bạn đã đăng ký tài khoản tại <strong>TechBite</strong>. Chúng tôi rất vinh hạnh được đồng hành cùng bạn trên hành trình trải nghiệm các dịch vụ và sản phẩm công nghệ hàng đầu.
    </div>
    <div class="card-box">
      <div style="font-weight: 700; color: #0f172a; margin-bottom: 8px;">🎁 Đặc quyền tài khoản mới:</div>
      <ul style="margin: 0; padding-left: 20px; color: #475569; font-size: 14px; line-height: 1.6;">
        <li>Theo dõi hành trình đơn hàng thời gian thực</li>
        <li>Lưu nhiều địa chỉ giao hàng tiện lợi</li>
        <li>Nhận ưu đãi voucher dành riêng cho thành viên</li>
      </ul>
    </div>
    <div class="cta-container">
      <a href="${frontendUrl}/products" class="cta-btn">Khám phá Thực đơn ngay ⚡</a>
      <a href="${frontendUrl}/login" class="cta-btn-secondary">Đăng nhập tài khoản</a>
    </div>
  `;

  const template = Handlebars.compile(BASE_TEMPLATE);
  return { subject, html: template({ subject, bodyContent }) };
}

export function renderOrderConfirmationEmail(data: {
  customerName: string;
  orderCode: string;
  totalAmount: number;
  paymentMethod: string;
  shippingAddress: string;
  items: Array<{ productName: string; quantity: number; price: number; itemTotal: number }>;
}): { subject: string; html: string } {
  const frontendUrl = getFrontendUrl();
  const subject = `Xác nhận đơn hàng #${data.orderCode} - TechBite`;
  const itemsHtml = data.items
    .map(
      (item) => `
    <tr>
      <td style="font-weight: 600;">${item.productName}</td>
      <td style="text-align: center;">x${item.quantity}</td>
      <td style="text-align: right; font-weight: 600;">${item.itemTotal.toLocaleString('vi-VN')} đ</td>
    </tr>
  `,
    )
    .join('');

  const bodyContent = `
    <div class="greeting">Xin chào ${data.customerName}!</div>
    <div class="message">
      Đơn hàng <strong>#${data.orderCode}</strong> của bạn đã được hệ thống ghi nhận thành công và đang được xử lý chuẩn bị giao.
    </div>
    <div class="card-box">
      <div style="font-size: 16px; font-weight: 700; color: #0f172a; margin-bottom: 12px;">📦 Chi tiết đơn hàng #${data.orderCode}</div>
      <p style="margin: 4px 0; font-size: 14px;"><strong>Địa chỉ giao hàng:</strong> ${data.shippingAddress}</p>
      <p style="margin: 4px 0; font-size: 14px;"><strong>Phương thức thanh toán:</strong> ${data.paymentMethod === 'QR_CODE' ? 'Chuyển khoản VietQR' : 'Thanh toán khi nhận hàng (COD)'}</p>
      <table class="table-order">
        <thead>
          <tr>
            <th>Sản phẩm</th>
            <th style="text-align: center;">SL</th>
            <th style="text-align: right;">Thành tiền</th>
          </tr>
        </thead>
        <tbody>
          ${itemsHtml}
        </tbody>
      </table>
      <div style="margin-top: 16px; pt-16px; border-top: 2px dashed #cbd5e1; text-align: right;">
        <span style="font-size: 15px; color: #475569;">Tổng thanh toán: </span>
        <span style="font-size: 20px; font-weight: 800; color: #ff8c42; margin-left: 8px;">${data.totalAmount.toLocaleString('vi-VN')} đ</span>
      </div>
    </div>
    <div class="cta-container">
      <a href="${frontendUrl}/orders/${data.orderCode}" class="cta-btn">Theo dõi đơn hàng 🚚</a>
      <a href="${frontendUrl}/profile" class="cta-btn-secondary">Lịch sử đơn hàng</a>
    </div>
  `;

  const template = Handlebars.compile(BASE_TEMPLATE);
  return { subject, html: template({ subject, bodyContent }) };
}

export function renderPasswordChangedEmail(fullName: string, ipAddress?: string): { subject: string; html: string } {
  const frontendUrl = getFrontendUrl();
  const subject = 'Cảnh báo bảo mật: Mật khẩu của bạn đã được thay đổi - TechBite';
  const bodyContent = `
    <div class="greeting">Xin chào ${fullName}!</div>
    <div class="message">
      Mật khẩu tài khoản TechBite của bạn vừa được thay đổi thành công vào lúc <strong>${new Date().toLocaleString('vi-VN')}</strong>.
    </div>
    <div class="card-box">
      <div style="font-weight: 700; color: #0f172a; margin-bottom: 8px;">🔒 Thông tin phiên thay đổi:</div>
      <p style="margin: 4px 0; font-size: 14px;"><strong>Địa chỉ IP:</strong> ${ipAddress || 'Không xác định'}</p>
      <p style="margin: 4px 0; font-size: 14px;"><strong>Hành động đã thực hiện:</strong> Thu hồi toàn bộ Refresh Token cũ trên tất cả các thiết bị khác.</p>
    </div>
    <div class="alert-box">
      ⚠️ <strong>Lưu ý:</strong> Nếu bạn KHÔNG thực hiện thao tác đổi mật khẩu này, hãy nhanh chóng liên hệ với đội ngũ CSKH của chúng tôi hoặc truy cập trang cá nhân để bảo vệ tài khoản ngay.
    </div>
    <div class="cta-container">
      <a href="${frontendUrl}/login" class="cta-btn">Đăng nhập lại tài khoản 🔒</a>
      <a href="${frontendUrl}/profile" class="cta-btn-secondary">Kiểm tra thông tin cá nhân</a>
    </div>
  `;

  const template = Handlebars.compile(BASE_TEMPLATE);
  return { subject, html: template({ subject, bodyContent }) };
}

export function renderSecurityAlertEmail(fullName: string, ipAddress?: string): { subject: string; html: string } {
  const frontendUrl = getFrontendUrl();
  const subject = '🚨 CẢNH BÁO BẢO MẬT KHẨN CẤP: Phát hiện dấu hiệu xâm nhập tài khoản';
  const bodyContent = `
    <div class="greeting" style="color: #A63D40;">CẢNH BÁO BẢO MẬT THÔNG TIN!</div>
    <div class="message">
      Xin chào <strong>${fullName}</strong>,<br>
      Hệ thống bảo mật TechBite vừa phát hiện hành vi sử dụng lại mã xác thực không hợp lệ (Replay Attack) nghi vấn từ địa chỉ IP: <strong>${ipAddress || 'Không xác định'}</strong>.
    </div>
    <div class="alert-box" style="background-color: #fff1f2; border-color: #A63D40;">
      <div style="font-size: 16px; font-weight: 800; color: #A63D40; margin-bottom: 8px;">🛡️ Hành động bảo vệ tự động từ Hệ thống:</div>
      <ul style="margin: 0; padding-left: 20px; color: #881337; font-size: 14px; line-height: 1.6;">
        <li>Đã khóa và vô hiệu hóa TOÀN BỘ phiên đăng nhập hiện tại trên tất cả thiết bị.</li>
        <li>Đã đưa các Access Token liên quan vào danh sách cấm (Blacklist).</li>
      </ul>
    </div>
    <div class="cta-container">
      <a href="${frontendUrl}/login" class="cta-btn" style="background-color: #A63D40;">Đăng nhập & Đổi mật khẩu ngay 🔒</a>
      <a href="${frontendUrl}/profile" class="cta-btn-secondary" style="border-color: #A63D40; color: #A63D40 !important;">Kiểm tra tài khoản</a>
    </div>
  `;

  const template = Handlebars.compile(BASE_TEMPLATE);
  return { subject, html: template({ subject, bodyContent }) };
}

export function renderOrderStatusUpdatedByAdminEmail(data: {
  customerName: string;
  orderCode: string;
  orderStatus: string;
  totalAmount: number;
  cancelReason?: string;
}): { subject: string; html: string } {
  const frontendUrl = getFrontendUrl();

  const statusConfig: Record<string, { label: string; color: string; bg: string }> = {
    PENDING: { label: 'CHỜ XÁC NHẬN ⏳', color: '#d97706', bg: '#fef3c7' },
    CONFIRMED: { label: 'ĐÃ XÁC NHẬN 🎉', color: '#2563eb', bg: '#dbeafe' },
    PROCESSING: { label: 'ĐANG XỬ LÝ / CHẾ BIẾN 🍳', color: '#7c3aed', bg: '#f3e8ff' },
    SHIPPING: { label: 'ĐANG GIAO HÀNG 🚚', color: '#0284c7', bg: '#e0f2fe' },
    DELIVERED: { label: 'ĐÃ GIAO HÀNG HOÀN TẤT ✅', color: '#059669', bg: '#d1fae5' },
    CANCELLED: { label: 'ĐÃ HỦY ❌', color: '#dc2626', bg: '#fee2e2' },
    REFUNDED: { label: 'ĐÃ HOÀN TIỀN 💸', color: '#4b5563', bg: '#f3f4f6' },
  };

  const config = statusConfig[data.orderStatus] || {
    label: data.orderStatus,
    color: '#2563eb',
    bg: '#dbeafe',
  };

  const subject = `📦 Đơn hàng #${data.orderCode} cập nhật trạng thái: ${config.label} - TechBite`;

  const reasonHtml =
    data.orderStatus === 'CANCELLED' && data.cancelReason
      ? `<p style="margin: 4px 0; font-size: 14px; color: #dc2626;"><strong>Lý do hủy đơn:</strong> ${data.cancelReason}</p>`
      : '';

  const bodyContent = `
    <div class="greeting">Xin chào ${data.customerName}!</div>
    <div class="message">
      Cập nhật mới nhất! Đơn hàng <strong>#${data.orderCode}</strong> của bạn vừa được cập nhật trạng thái mới.
    </div>
    <div class="card-box" style="border-color: ${config.color}; background-color: ${config.bg};">
      <div style="font-size: 16px; font-weight: 700; color: ${config.color}; margin-bottom: 8px;">
        📦 Trạng thái mới: <span>${config.label}</span>
      </div>
      <p style="margin: 4px 0; font-size: 14px; color: #0f172a;"><strong>Mã đơn hàng:</strong> #${data.orderCode}</p>
      <p style="margin: 4px 0; font-size: 14px; color: #0f172a;"><strong>Tổng tiền đơn hàng:</strong> <span style="font-weight: 800; color: #ff8c42;">${data.totalAmount.toLocaleString('vi-VN')} đ</span></p>
      ${reasonHtml}
    </div>
    <div class="cta-container">
      <a href="${frontendUrl}/orders/${data.orderCode}" class="cta-btn" style="background-color: ${config.color};">Theo dõi chi tiết đơn hàng 🚚</a>
    </div>
  `;

  const template = Handlebars.compile(BASE_TEMPLATE);
  return { subject, html: template({ subject, bodyContent }) };
}

export function renderPaymentConfirmedByAdminEmail(data: {
  customerName: string;
  orderCode: string;
  totalAmount: number;
  paymentMethod: string;
}): { subject: string; html: string } {
  const frontendUrl = getFrontendUrl();
  const subject = `💳 Xác nhận thanh toán thành công cho đơn hàng #${data.orderCode} - TechBite`;
  const bodyContent = `
    <div class="greeting">Xin chào ${data.customerName}!</div>
    <div class="message">
      Hệ thống xác nhận giao dịch thanh toán cho đơn hàng <strong>#${data.orderCode}</strong> đã được ghi nhận thành công vào lúc <strong>${new Date().toLocaleString('vi-VN')}</strong>.
    </div>
    <div class="card-box" style="border-color: #10b981; background-color: #f0fdf4;">
      <div style="font-size: 16px; font-weight: 700; color: #065f46; margin-bottom: 8px;">✅ Trạng thái thanh toán: <span style="color: #059669;">ĐÃ THANH TOÁN (PAID)</span></div>
      <p style="margin: 4px 0; font-size: 14px;"><strong>Mã đơn hàng:</strong> #${data.orderCode}</p>
      <p style="margin: 4px 0; font-size: 14px;"><strong>Số tiền đã thanh toán:</strong> <span style="font-weight: 800; color: #059669;">${data.totalAmount.toLocaleString('vi-VN')} đ</span></p>
      <p style="margin: 4px 0; font-size: 14px;"><strong>Phương thức thanh toán:</strong> ${data.paymentMethod === 'QR_CODE' || data.paymentMethod === 'VIETQR' ? 'Chuyển khoản VietQR Code' : 'Thanh toán khi nhận hàng (COD)'}</p>
    </div>
    <div class="cta-container">
      <a href="${frontendUrl}/orders/${data.orderCode}" class="cta-btn" style="background-color: #10b981;">Xem chi tiết hóa đơn 📄</a>
    </div>
  `;

  const template = Handlebars.compile(BASE_TEMPLATE);
  return { subject, html: template({ subject, bodyContent }) };
}

