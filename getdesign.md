# Handy Dual-Design System Specification

Hệ thống giao diện của dự án Handy được phân tách nghiêm ngặt thành 2 phân khu thiết kế riêng biệt để cân bằng giữa trải nghiệm học tập cao cấp (Learner Experience) và hiệu suất vận hành tốc độ cao của Quản trị viên (Admin Operational Velocity).

---

## PHÂN KHU 1: GIAO DIỆN HỌC VIÊN & NGƯỜI DÙNG (User & Learner Area)
**Phạm vi áp dụng:**
- Trang chủ (`/`)
- Màn hình Học từ vựng, Luyện tập thủ ngữ (`/topics/*`, `/practice/*`)
- Trang Bảng giá, Thanh toán QR SePAY (`/pricing`, `/checkout`)
- Trang Hồ sơ cá nhân (`/profile`)
- Trang Đăng nhập, Đăng ký (`/login`, `/register`)

**Triết lý thiết kế: High-End EdTech SaaS (Phong cách Planhat / Linear)**
1. **Thẻ & Khung hình khối:**
   - Bo góc lớn, hiện đại: `rounded-2xl` hoặc `rounded-3xl`.
   - Hiệu ứng kính và viền tinh tế: `bg-white/80 backdrop-blur-md border border-slate-200/80 shadow-sm`.
2. **Micro-interactions & Đổ bóng:**
   - Khi hover lên thẻ/card: Nhấc nhẹ êm ái `-translate-y-1 hover:shadow-xl` cùng `transition-all duration-300`.
   - Nút bấm chính (Primary CTA): Sử dụng dải Gradient tinh tế (ví dụ: `bg-gradient-to-r from-amber-500 to-orange-500` hoặc `from-indigo-600 to-violet-600`), đổ bóng tương ứng (`shadow-lg shadow-indigo-500/20`).
3. **Khoảng cách & Cảm quan:**
   - Không gian rộng rãi (generous whitespace), độ tương phản êm dịu, tạo cảm giác thân thiện, kích thích động lực học tập.

---

## PHÂN KHU 2: BÀN LÀM VIỆC QUẢN TRỊ VIÊN (Admin High-Performance Console)
**Phạm vi áp dụng:**
- Trang Điều hướng Quản trị (`/admin`)
- Quản trị Nội dung & Bài học (`/admin`)
- Báo cáo Thống kê Doanh thu & Người dùng (`/admin/dashboard`)
- Quản lý Tài khoản & Phân quyền VIP (`/admin/users`)

**Triết lý thiết kế: High-Performance Operational Utility (Phong cách Stripe / Vercel Dashboard)**
1. **Loại bỏ hoàn toàn các hiệu ứng nặng nề:**
   - **TUYỆT ĐỐI KHÔNG** sử dụng `backdrop-blur-*`, `blur-2xl`, hiệu ứng đốm mờ trang trí (ambient blur glows).
   - **TUYỆT ĐỐI KHÔNG** sử dụng animation kéo dài, giật lắc hoặc trễ: loại bỏ `animate-slide-up`, `animation-delay-*`, `animate-fade-in`. Mọi thao tác tải trang, lọc danh sách, mở modal phải có phản hồi tức thì (0ms latency feel).
   - **TUYỆT ĐỐI KHÔNG** dùng hover nhấc khối `-translate-y-*` trên bảng và thẻ quản trị vì gây mỏi mắt khi thao tác liên tục.
2. **Khung hình & Độ đậm đặc dữ liệu (High Data Density):**
   - Nền trang: `bg-gray-50 text-gray-900`.
   - Khung thẻ và bảng: Nền đặc `bg-white`, bo góc tiêu chuẩn `rounded-xl`, viền mảnh `border border-gray-200 shadow-xs`.
   - Header cố định: `bg-white border-b border-gray-200` (không dùng trong suốt kính mờ).
3. **Màu sắc & Tương phản:**
   - Độ tương phản cao, rõ ràng: Tiêu đề đen đậm `text-gray-900`, nhãn phụ `text-gray-500`, viền bảng `border-gray-200`.
   - Nút thao tác chính: Đơn sắc dứt khoát `bg-gray-900 hover:bg-black text-white rounded-lg shadow-xs`.
   - Nút thứ cấp: `bg-white hover:bg-gray-50 text-gray-700 border border-gray-300 rounded-lg`.
   - Huy hiệu trạng thái (Badges): Màu nền nhạt, viền tinh tế, chữ đậm rõ ràng (`bg-emerald-50 text-emerald-700 border-emerald-200`, `bg-amber-50 text-amber-900 border-amber-200`, `bg-rose-50 text-rose-700 border-rose-200`).
4. **Modal Quản trị:**
   - Lớp nền overlay: `bg-black/50` phẳng, không blur.
   - Thao tác đóng/mở tức thì, gọn gàng, focus chuẩn vào dữ liệu cần cập nhật.
