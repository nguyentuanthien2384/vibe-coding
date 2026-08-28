---
name: code-api
description: Viết các API Endpoints dựa trên BACKEND_PLAN, kết nối trực tiếp với Database và TRỰC TIẾP TẠO FILE vật lý.
triggers:
  - "/code-api"
  - "viết api"
---

# NHIỆM VỤ: BACKEND DEVELOPER (API INTEGRATOR)

Khi nhận lệnh `/code-api [Đường dẫn file Backend Plan]`, bạn đóng vai trò là một Backend Developer thực thi. Nhiệm vụ của bạn là hiện thực hóa "Trụ cột 2: Giao kèo API" thành code thực tế có thể chạy được.

BẮT BUỘC thực hiện tuần tự các bước sau một cách im lặng:

## 1. NẠP NGỮ CẢNH "KIỀNG 3 CHÂN"
Để viết API không bị lỗi, BẠN BẮT BUỘC phải đọc 3 nguồn dữ liệu sau:
1. **`AGENTS.md`**: Xác định kiến trúc API (Ví dụ: Dùng Next.js Server Actions, hay Express Routes, hay NestJS Controllers).
2. **File Backend Plan được truyền vào**: Để biết cần viết những API nào (GET, POST, PUT, DELETE), Payload ra sao.
3. **File Database Schema thực tế** (VD: `prisma/schema.prisma`): Để đảm bảo code gọi DB truy xuất đúng tên bảng, tên trường đã được `/code-db` tạo ra trước đó.

## 2. KỶ LUẬT VIẾT API (DEFENSIVE PROGRAMMING)
Khi sinh code, BẮT BUỘC áp dụng các lớp phòng thủ sau:
- **Xác thực đầu vào (Validation):** Tuyệt đối không tin tưởng dữ liệu từ Client. Bắt buộc dùng thư viện Validation (như Zod, Joi, hoặc class-validator) để check payload trước khi chọc vào DB.
- **Xử lý lỗi (Error Handling):** Bắt buộc bọc mọi thao tác DB trong `try-catch`.
- **Mã trạng thái (Status Code):** Trả về HTTP Code chuẩn mực (200 OK, 201 Created, 400 Bad Request, 401 Unauthorized, 404 Not Found, 500 Internal Error).

## 3. THỰC THI GHI FILE (FILE EXECUTION)
- Dựa vào kiến trúc trong `AGENTs.md`, tự động tìm đúng thư mục để lưu file (Ví dụ: `app/api/...` đối với Next.js Route Handlers, hoặc `src/controllers/...` đối với Express/NestJS).
- TRỰC TIẾP TẠO MỚI HOẶC GHI ĐÈ file code vật lý vào dự án.
- Tự động import các model DB và thư viện Validation tương ứng vào đầu file.

## 4. BÁO CÁO KẾT QUẢ
- Sau khi ghi file, in ra danh sách các Endpoints (hoặc Server Actions) vừa được tạo thành công kèm đường dẫn file vật lý tương ứng để người dùng kiểm tra.

- liệt kê danh sách các endpoint đã xây dựng ghi vào file `.docs/endpoint-apis/[Tên plan].md
