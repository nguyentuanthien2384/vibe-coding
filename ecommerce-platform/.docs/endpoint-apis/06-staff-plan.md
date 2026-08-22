# DANH SÁCH ENDPOINT APIS: MODULE QUẢN LÝ NHÂN VIÊN & PHÂN QUYỀN

> **Nguồn thiết kế:** `.docs/backend-plans/dashboard/06-staff-plan.md`  
> **Base URL:** `/api/v1`  
> **Auth:** `Bearer Token` (Cookie / Authorization Header)  
> **Quyền truy cập:** `ADMIN`  

---

## 1. Module Role Groups (Nhóm Quyền)

| STT | Method | Endpoint | Mô tả | Quyền |
|:---:|:---:|:---|:---|:---:|
| 1 | `GET` | `/api/v1/admin/permissions` | Lấy danh mục tất cả quyền hạn có sẵn trong hệ thống | `ADMIN` |
| 2 | `GET` | `/api/v1/admin/role-groups` | Lấy danh sách nhóm quyền kèm thống kê tổng số nhóm & nhân sự đã gán | `ADMIN` |
| 3 | `GET` | `/api/v1/admin/role-groups/:id` | Xem chi tiết 1 nhóm quyền | `ADMIN` |
| 4 | `POST` | `/api/v1/admin/role-groups` | Tạo mới nhóm quyền (Auto-slug, lưu mảng permissions) | `ADMIN` |
| 5 | `PATCH` | `/api/v1/admin/role-groups/:id` | Cập nhật nhóm quyền & xóa cache Redis của các thành viên | `ADMIN` |
| 6 | `DELETE` | `/api/v1/admin/role-groups/:id` | Xóa nhóm quyền (Chặn xóa System role hoặc khi còn thành viên) | `ADMIN` |

---

## 2. Module Staffs (Nhân Viên)

| STT | Method | Endpoint | Mô tả | Quyền |
|:---:|:---:|:---|:---|:---:|
| 7 | `GET` | `/api/v1/admin/staffs` | Lấy danh sách nhân viên (Lọc role, status, roleGroupId, search, phân trang) | `ADMIN` |
| 8 | `GET` | `/api/v1/admin/staffs/:id` | Xem thông tin chi tiết nhân viên (Quyền kế thừa + Đặc quyền bổ sung) | `ADMIN` |
| 9 | `POST` | `/api/v1/admin/staffs` | Tạo tài khoản nhân viên mới (Mã hóa bcrypt salt 12) | `ADMIN` |
| 10 | `PATCH` | `/api/v1/admin/staffs/:id/status` | Khóa/Mở khóa tài khoản (Thu hồi token & phiên đăng nhập tức thì) | `ADMIN` |
| 11 | `PATCH` | `/api/v1/admin/staffs/:id/role-group` | Gán hoặc thay đổi nhóm quyền cho nhân viên | `ADMIN` |
| 12 | `PATCH` | `/api/v1/admin/staffs/:id/custom-permissions` | Thiết lập danh sách đặc quyền bổ sung cấp riêng | `ADMIN` |
| 13 | `PATCH` | `/api/v1/admin/staffs/:id` | Chỉnh sửa thông tin cơ bản nhân viên (Tên, SĐT, Ghi chú) | `ADMIN` |
