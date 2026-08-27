---
name: execute-ui
description: Dây chuyền tự động chuẩn bị tài liệu và điều phối thợ thi công UI. Có hỗ trợ bóc tách mã nguồn từ Stitch nếu có cờ --stitch.
triggers:
  - "/execute-ui"
---

# 🎨 WORKFLOW: ĐIỀU PHỐI THI CÔNG GIAO DIỆN

**Kích hoạt:** `/execute-ui [tên-tính-năng] [--stitch]`
**Hệ thống ghi nhận lệnh:** `$ARGUMENTS`

Bạn là Quản lý Phân xưởng Frontend. Nhiệm vụ của bạn là thu thập hồ sơ bản vẽ và gọi thợ chuyên trách ra thi công. TUYỆT ĐỐI KHÔNG tự tay viết mã nguồn ở bước này.

## 📥 1. GOM HỒ SƠ BẢN VẼ (PREPARATION)
BẮT BUỘC phân tích `$ARGUMENTS` để trích xuất tên tính năng, sau đó nạp vào bộ nhớ các file sau:
1. **Frontend Plan:** Đọc `.docs/frontend-plans/[tên-tính-năng]-plan.md`
2. **Design Brief:** Đọc `.docs/design-briefs/[tên-tính-năng]-brief.md`
3. **Mockup tĩnh:** Kiểm tra `.docs/ui-mockups/$ARGUMENTS.html` (Nếu có thì ưu tiên nạp vào bộ nhớ)

**🔥 QUY TẮC RẼ NHÁNH STITCH (TÙY CHỌN):**
Kiểm tra xem trong `$ARGUMENTS` có chứa từ khóa `--stitch` hoặc người dùng có đính kèm file Stitch nào không.
- **Nếu KHÔNG có:** Chuyển qua Bước 2. Thợ thi công sẽ tự thiết kế UI dựa trên Design Brief.
- **Nếu CÓ thiết kế Stitch:** BẮT BUỘC nạp file mã nguồn HTML/React do Stitch tạo ra. Đánh dấu đây là **NGUỒN CHÂN LÝ VỀ GIAO DIỆN (UI SOURCE OF TRUTH)**. 

## 🛠️ THAM CHIẾU SKILL REGISTRY
Khi thực hiện workflow này, bắt buộc tham chiếu và áp dụng các kỹ năng mở rộng được khai báo tại:
- [`.agent/skill-registry.md`](file:///d:/vibe_coding/ecommerce-platform/.agent/skill-registry.md)

## 🚀 2. GIAO VIỆC CHO THỢ THI CÔNG (EXECUTION)
Mở và đọc file kỹ năng tại [`.agent/skills/code-ui/SKILL.md`](file:///d:/vibe_coding/ecommerce-platform/.agent/skills/code-ui/SKILL.md).

Chuyển giao toàn bộ dữ liệu vừa thu thập cho kỹ năng `code-ui` kèm theo CHỈ THỊ ÉP BUỘC sau:
- Tự động triển khai mã nguồn Component tuân thủ quy tắc "Mockup Data" của `code-ui`.
- **Nếu có Stitch Source hoặc mockup tĩnh:** Cấm thợ thi công tự sáng tạo layout mới. Chỉ được phép tái cấu trúc (refactor) code Stitch hoặc mockup tĩnh, chia nhỏ thành các React Components (`Header`, `Form`, `Card`...), và lắp Mockup Data vào.

## ✅ 3. NGHIỆM THU
Sau khi thợ `code-ui` lưu file xong, in ra báo cáo:
*"🎨 Đã thi công xong UI tĩnh cho tính năng. [Nếu dùng Stitch thì ghi thêm: Đã tích hợp thành công bản vẽ từ Stitch]. Vui lòng kiểm tra trên trình duyệt!"*