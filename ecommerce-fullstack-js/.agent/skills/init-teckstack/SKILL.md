---
name: init-techstack
description: Khởi tạo và chuẩn hóa Tech Stack cho dự án hiện tại. Tự động thiết lập cấu hình Next.js, Prisma, Tailwind và bộ khung AI Agent.
triggers:
  - "/init-stack"
  - "khởi tạo dự án"
  - "setup techstack"
---

# 🛠️ KỸ NĂNG: KHỞI TẠO VÀ CHUẨN HÓA DỰ ÁN (PROJECT INITIALIZER)

**Nhiệm vụ:** Bạn là một Senior DevOps kiêm Solution Architect. Nhiệm vụ của bạn là đưa dự án hiện tại về đúng bộ tiêu chuẩn kỹ thuật của Unicode Academy.

## 🔍 BƯỚC 1: QUÉT HỆ THỐNG (SYSTEM SCAN)
BẮT BUỘC thực hiện các hành động quét sau trước khi đưa ra thay đổi:
1. Đọc file `package.json` để xác định các thư viện đang dùng (Next.js version, UI library, ORM...).
2. Kiểm tra sự tồn tại của các file cấu hình: `.env.example`, `tsconfig.json`, `tailwind.config.js`, `prisma/schema.prisma`.
3. Kiểm tra xem thư mục `.agent/` và các file `AGENTS.md`, `ARCHITECTURE.md` đã có chưa.

## 🏗️ BƯỚC 2: TRIỂN KHAI CHUẨN HÓA (STANDARDIZATION)
Dựa trên kết quả quét, hãy thực hiện các tác vụ sau (chỉ tạo mới hoặc cập nhật nếu thiếu hoặc sai lệch):

### 1. Thiết lập Hiến pháp AI (AI Governance)
- Nếu chưa có `.agent/`, hãy tạo toàn bộ cấu trúc thư mục như đã quy hoạch (workflows, skills).
- Tạo file `.agent/AGENTS.md` và `.docs/ARCHITECTURE.md` ở thư mục gốc. Tự động điền thông tin Tech Stack đã quét được vào các file này để AI Agent có nguồn chân lý để làm việc. Tham khảo file mẫu để chuẩn hóa cấu trúc tại: `.agent/templates/ARCHITECTURE.md` và `.agent/templates/AGENTS.md`
- Tạo file `.docs/STYLEGUIDE.md` định nghĩa rõ
+ *Typography:* Font chữ chủ đạo (VD: Inter, Roboto).
+ *Color Palette:* Các biến màu Primary, Secondary, Accent, Error, Success.
+ *Components Standard:* Quy tắc bo góc (rounded), đổ bóng (shadow), và khoảng cách (spacing).
+ *UX Constraints:* Quy ước về trải nghiệm người dùng. Ví dụ: Drawer, Toast message
+ Tham khảo cấu trúc file mẫu: `.agent/templates/STYLEGUIDE.md`

### 2. Chuẩn hóa Backend & Database
- Nếu dự án dùng Prisma nhưng thiếu file schema, hãy khởi tạo `prisma/schema.prisma` với cấu hình Database (PostgreSQL/MySQL) và các folder chuẩn.
- Tạo file `.env.example` chứa các biến môi trường cần thiết (DATABASE_URL, NEXTAUTH_SECRET...).

### 3. Chuẩn hóa Frontend & UI
- Cập nhật `tailwind.config.js` để hỗ trợ các components trong `app/` và `components/`.
- Đảm bảo `tsconfig.json` có cấu hình `@/*` path alias để việc code sau này sạch sẽ hơn.

## ✅ BƯỚC 3: BÁO CÁO KẾT QUẢ
Sau khi hoàn tất, in ra một bảng tổng hợp:
- 📦 **Tech Stack nhận diện được:** (Ví dụ: Next.js 14, TypeScript, Tailwind).
- 🛠️ **Các file đã khởi tạo/cập nhật:** (Liệt kê danh sách file).
- 💡 **Gợi ý:** "Dự án đã sẵn sàng cho quy trình AI. Bạn có thể bắt đầu bằng lệnh `/brainstorm` cho tính năng mới!"