---
name: execute-backend
description: Dây chuyền tự động thi công lõi hệ thống. Điều phối tuần tự các kỹ năng /code-db, /code-api và /integrate để hoàn thiện Full-stack.
triggers:
  - "/execute-backend"
  - "code backend"
  - "thi công lõi"
---

# ⚙️ WORKFLOW: TỔNG THẦU THI CÔNG BACKEND & TÍCH HỢP

**Kích hoạt:** `/execute-backend [tên-tính-năng]`
**Hệ thống ghi nhận yêu cầu thi công lõi cho:** `$ARGUMENTS`

Bạn là Điều phối viên Backend (Backend Orchestrator). Nhiệm vụ của bạn là gom bản vẽ và điều phối 3 đội thợ chuyên trách (`code-db`, `code-api`, `integrate`) làm việc theo một trình tự nghiêm ngặt.

**🔥 NGUYÊN TẮC SINH TỬ (ANTI-TRUNCATION):** Bạn tuyệt đối KHÔNG ĐƯỢC làm nhiều bước cùng một lúc. Sau khi gọi một đội thợ hoàn thành công việc của họ, **BẠN PHẢI DỪNG LẠI** và yêu cầu người dùng gõ chữ *"Tiếp tục"* rồi mới được phép chuyển sang bước tiếp theo.

---

## 📥 1. GOM HỒ SƠ BẢN VẼ (PREPARATION)
BẮT BUỘC đọc ngầm các file sau để nắm toàn bộ bức tranh kiến trúc:
1. **Backend Plan:** Đọc `.docs/backend-plans/$ARGUMENTS-plan.md`
2. **Frontend Plan:** Đọc `.docs/frontend-plans/$ARGUMENTS-plan.md` (Để đối chiếu cấu trúc JSON mà API cần trả về).
3. **Hiến pháp:** Đọc `ARCHITECTURE.md` để tuân thủ cách viết Database và Route API của dự án.

## 🛠️ THAM CHIẾU SKILL REGISTRY
Khi thực hiện workflow này, có thể tham chiếu các kỹ năng bổ trợ được khai báo tại:
- `.agent/skill-registry.md`

---


## 🗄️ BƯỚC 1: ĐIỀU PHỐI THI CÔNG DATABASE
1. **Đọc luật:** Mở file `.agent/skills/code-db/SKILL.md`.
2. **Hành động:** Kích hoạt kỹ năng `code-db` để viết/cập nhật `prisma/schema.prisma` dựa trên Backend Plan.
3. **Nghiệm thu Bước 1:** Sau khi ghi file, dừng lại và in ra thông báo:
   > *"✅ [1/3] Đã hoàn thiện Prisma Schema. Vui lòng chạy lệnh `npx prisma db push` ở Terminal. Chạy xong, hãy gõ **'Tiếp tục'** để tôi điều phối code API."*
4. **[DỪNG LẠI VÀ CHỜ LỆNH]**

---

## 🔌 BƯỚC 2: ĐIỀU PHỐI THI CÔNG API
*(Chỉ được phép chạy khi người dùng đã ra lệnh Tiếp tục)*
1. **Đọc luật:** Mở file `.agent/skills/code-api/SKILL.md`.
2. **Hành động:** Kích hoạt kỹ năng `code-api` để tạo các file code tương ứng với Backend Techstack chuẩn RESTful.
3. **Nghiệm thu Bước 2:** Sau khi ghi file, dừng lại và in ra thông báo:
   > *"✅ [2/3] Đã xây xong đường ống API Endpoints. Hãy dùng Postman/ThunderClient test thử API nếu muốn, sau đó gõ **'Tiếp tục'** để chúng ta nối dây vào UI."*
4. **[DỪNG LẠI VÀ CHỜ LỆNH]**

---

## ⚡ BƯỚC 3: ĐIỀU PHỐI TÍCH HỢP (INTEGRATION)
*(Chỉ được phép chạy khi người dùng đã ra lệnh Tiếp tục)*
1. **Đọc luật:** Mở file `.agent/skills/integrate-api/SKILL.md`.
2. **Hành động:** Kích hoạt kỹ năng `integrate-api`. Quét các UI Components liên quan đến `$ARGUMENTS` đã được dựng sẵn (bằng Mockup Data), gỡ bỏ Mockup Data và gắn hàm `fetch/axios` để gọi vào đường dẫn API vừa tạo ở Bước 2. Bắt buộc xử lý kỹ state Loading/Error.
3. **Nghiệm thu Bước 3:** In ra thông báo chốt hạ cuối cùng:

> **🎉 HOÀN TẤT VÀ BÀN GIAO TOÀN DIỆN: `$ARGUMENTS`**
> 
> Dây chuyền Backend đã vận hành xong 100%:
> - 🗄️ **Database:** Đã setup xong Model.
> - 🔌 **API:** Đã mở route giao tiếp.
> - ⚡ **UI:** Đã được bơm data thật, gỡ bỏ Mockup.
> 
> **Kiểm tra:** Hãy ra trình duyệt test ngay luồng nghiệp vụ thực tế!