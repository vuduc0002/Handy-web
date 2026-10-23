# Handy Design System Guidelines (Planhat / Modern Luxury SaaS Style)

Quy chuẩn thiết kế giao diện cao cấp dành cho hệ thống Handy EdTech & Admin Console:

## 1. Triết Lý Thiết Kế (Design Philosophy)
- **Tối giản & Sang trọng**: Phong cách Modern SaaS (Planhat / Linear / Vercel), ưu tiên khoảng trắng (Whitespace), cấu trúc lưới phân cấp mạch lạc.
- **Hiệu ứng Kính (Glassmorphism)**: Kết hợp `backdrop-blur-md` với nền bán trong suốt `bg-white/80` (hoặc `bg-slate-900/90`), viền siêu mỏng tinh tế `border-slate-200/80` hoặc `border-slate-800/80`.
- **Bo góc mềm mại**: Thống nhất dùng `rounded-2xl` cho Cards / Modals và `rounded-xl` cho Buttons / Badges / Input fields.

## 2. Micro-interactions & Hiệu Ứng Chuyển Động
- **Card Hover Elevation**: Mọi Card thống kê, danh mục khi rê chuột vào phải có hiệu ứng nhấc nhẹ và sáng viền:
  ```css
  transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:border-indigo-300/70
  ```
- **Primary CTA Buttons**: Tuyệt đối không dùng nút đơn sắc thô cứng; sử dụng dải màu Gradient tinh tế:
  ```css
  bg-gradient-to-r from-indigo-600 via-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white shadow-md shadow-indigo-500/20 hover:shadow-lg hover:shadow-indigo-500/30 transition-all duration-300 hover:-translate-y-0.5 active:translate-y-0
  ```
- **Stagger Entrance Animations**: Các khối nội dung khi tải trang sử dụng animation fade-in và slide-up có độ trễ:
  - Khối 1: `animate-slide-up`
  - Khối 2: `animate-slide-up animation-delay-100`
  - Khối 3: `animate-slide-up animation-delay-200`
  - Khối 4: `animate-slide-up animation-delay-300`

## 3. Màu Sắc & Nhận Diện 4 Gói VIP
- **VIP 3 Tháng (`3m`)**: Xanh dương `#3B82F6` (Sky Blue)
- **VIP 6 Tháng (`6m`)**: Xanh lục `#10B981` (Emerald)
- **VIP 1 Năm (`1y`)**: Hổ phách `#F59E0B` (Amber)
- **VIP Trọn Đời (`lifetime`)**: Tím `#8B5CF6` (Violet / Purple)
- **Số liệu tài chính / Doanh thu**: Điểm nhấn Xanh lá `#10B981` hoặc Indigo `#6366F1` kết hợp font chữ monospace (`font-mono`).
