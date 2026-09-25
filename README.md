# 🛡️ shrimpAI • Central Operations & Admin Portal

<p align="center">
  <img src="https://img.shields.io/badge/Module-Admin%20Console-8b5cf6?style=for-the-badge&logo=shield&logoColor=white" alt="Admin Console" />
  <img src="https://img.shields.io/badge/Port-5175-06b6d4?style=for-the-badge&logo=googlechrome&logoColor=white" alt="Port 5175" />
  <img src="https://img.shields.io/badge/React-19.2-61dafb?style=for-the-badge&logo=react&logoColor=black" alt="React 19" />
  <img src="https://img.shields.io/badge/Theme-Dark%20%7C%20Light-f59e0b?style=for-the-badge&logo=affinitydesigner&logoColor=white" alt="Dual Theme" />
  <img src="https://img.shields.io/badge/i18n-VI%20%7C%20EN-10b981?style=for-the-badge&logo=googletranslate&logoColor=white" alt="Multilingual" />
  <img src="https://img.shields.io/badge/Vite-8.3-646cff?style=for-the-badge&logo=vite&logoColor=white" alt="Vite 8" />
</p>

---

## 📌 Tổng Quan (Overview)

**`admin`** là Cổng Điều Hành & Quản Trị Hệ Thống Toàn Diện (Enterprise Command Center) của nền tảng **shrimpAI**. Được thiết kế và vận hành trên một cổng mạng tách biệt hoàn toàn (**Port 5175**), trang quản trị cung cấp cho Ban Giám Đốc và Quản Trị Viên bộ công cụ kiểm soát dữ liệu, giám sát phiên người dùng theo thời gian thực, điều phối phân quyền, chẩn đoán độ trễ mô hình AI và kiểm toán an toàn thông tin.

Mặc định chạy tại địa chỉ: **`http://localhost:5175`**.

---

## ✨ Điểm Nhấn Kiến Trúc & Thiết Kế (Key Highlights)

### 1. 🌓 Hệ Thống Giao Diện Kép (Dark & Light Theme)
- **Tối ưu hóa thị giác chuyên sâu**:
  - **Chế độ Tối (Dark Mode)**: Giao diện Trung tâm Chỉ huy hiện đại, hiệu ứng kính mờ (glassmorphism) tương phản cao, dịu mắt khi làm việc ban đêm.
  - **Chế độ Sáng (Light Mode)**: Bảng màu thanh lịch, rõ nét, tối ưu cho môi trường làm việc ngoài trời hoặc văn phòng nhiều ánh sáng tự nhiên.
- **Tự động lưu trạng thái (Persistence)**: Lựa chọn giao diện được ghi nhớ trong `localStorage` (`admin.theme`), giữ nguyên trạng thái khi tải lại trang hoặc mở trình duyệt mới.
- **Nút chuyển đổi linh hoạt**: Bố trí ở cả thanh Header trên cùng lẫn màn hình Đăng nhập (`/login`).

### 2. 🌐 Hỗ Trợ Đa Ngôn Ngữ Song Ngữ (Vietnamese 🇻🇳 ↔ English 🇬🇧)
- **Chuyển đổi tức thì (Zero-reload)**: Chuyển đổi toàn bộ ngôn ngữ trên màn hình trong tích tắc mà không làm tải lại trang hay gián đoạn phiên làm việc.
- **Bản địa hóa 100% các phân hệ**: Toàn bộ nhãn bảng, nút bấm, modal cảnh báo, trạng thái kết nối mạng, báo cáo kỹ thuật đều có phiên bản Tiếng Việt và Tiếng Anh chuẩn Type-Safe qua `zustand` (`i18n.store.ts`).
- **Ghi nhớ ngôn ngữ**: Tự động lưu lựa chọn vào `localStorage` (`admin.lang`).

### 3. 🔒 Tách Biệt Cổng Mạng & An Toàn Production (Port Isolation)
- **Môi trường Dev Cục bộ**: Phân tách cổng `5175` (Admin) và `5174` (Client) giúp lập trình viên mở song song cả hai giao diện mà không bị đè cookie hay cache.
- **Môi trường Production Thực tế**: Toàn bộ cổng nội bộ (4000, 5433, 8000) được đóng hoàn toàn sau Firewall; Client và Admin được định tuyến qua hai Subdomain riêng biệt (`https://shrimp.ai` và `https://admin.shrimp.ai`) qua Nginx Reverse Proxy với chứng chỉ bảo mật SSL 443.
- **Không lộ thông tin nhạy cảm**: Không xuất hiện số port thô trên tiêu đề trình duyệt hay giao diện người dùng.

---

## 🎛️ Các Phân Hệ Quản Trị Nghiệp Vụ (Admin Modules)

| Phân hệ | Màn hình | Tính năng chính |
| :--- | :--- | :--- |
| **📊 Tổng Quan** | `/` | Giám sát KPI thời gian thực: Tổng người dùng, tài khoản kích hoạt 2FA, số phiên live, độ trễ DB (ms), trạng thái AI Vision Engine, bộ nhớ RAM Backend. |
| **👥 Quản Lý Người Dùng** | `/users` | Danh mục tài khoản, tìm kiếm, lọc theo vai trò/trạng thái; tạo người dùng mới; thăng hạng `USER` ↔ `ADMIN`; khóa/mở khóa; đổi mật khẩu bắt buộc đăng xuất; xóa vĩnh viễn. |
| **🛡️ Phiên & Bảo Mật** | `/sessions` | Giám sát trực tiếp các thiết bị, trình duyệt, IP đang kết nối; nút **Thu hồi phiên khẩn cấp** để ngắt kết nối phiên đáng ngờ ngay lập tức. |
| **🦐 Trung Tâm AI** | `/ai-center` | Danh mục giống tôm trọng điểm (Tôm thẻ, Tôm sú, Tôm càng) + **Bàn chẩn đoán AI Testbench** (tải ảnh mẫu kiểm tra độ tin cậy và đo độ trễ suy luận toàn trình). |
| **💬 Giám Sát Chat AI** | `/chat-monitor` | Theo dõi tương tác hội thoại giữa nông dân và trợ lý ảo chuyên gia tôm, tìm kiếm theo người dùng và xóa các đoạn chat spam/vi phạm. |
| **⚙️ Cấu Hình Mạng** | `/settings` | Bản đồ Topo mạng Dev vs Prod, thông tin cổng kết nối và công cụ **Ping Test** kiểm tra sức khỏe hệ thống toàn diện. |
| **🛑 Trang Cấm Truy Cập** | `/forbidden` | Trang chặn phân quyền (403 Forbidden) thân thiện khi tài khoản người dùng thường cố tình đăng nhập vào Admin Portal. |

---

## 📁 Cấu Trúc Thư Mục (Directory Layout)

```text
admin/
├── public/                 # Favicon tôm 🦐 và static assets
├── src/
│   ├── api/
│   │   └── admin.api.ts    # REST Client tích hợp đầy đủ endpoint /api/admin/*
│   │
│   ├── components/
│   │   ├── layout/
│   │   │   └── AdminLayout.tsx   # Sidebar, Topbar, Theme & Language Toggles, Mobile Drawer
│   │   └── ui/
│   │       ├── Alert.tsx         # Thông báo thành công, lỗi, cảnh báo
│   │       ├── Modal.tsx         # Hộp thoại xác nhận tác vụ nguy hiểm
│   │       ├── StatusBadge.tsx   # Nhãn trạng thái tài khoản & vai trò
│   │       └── TwoFactorBadge.tsx# Nhãn trạng thái bảo mật 2FA
│   │
│   ├── lib/
│   │   └── api.ts          # Axios Instance với Bearer Token & Interceptor xử lý lỗi
│   │
│   ├── pages/
│   │   ├── OverviewPage.tsx      # Dashboard tổng quan & đo lường hạ tầng
│   │   ├── UsersPage.tsx         # Quản trị người dùng & phân quyền RBAC
│   │   ├── SessionsPage.tsx      # Kiểm toán phiên đăng nhập & thu hồi phiên
│   │   ├── AiCenterPage.tsx      # Danh mục giống tôm & Bàn kiểm tra AI Testbench
│   │   ├── ChatMonitorPage.tsx   # Giám sát hội thoại AI Assistant
│   │   ├── SettingsPage.tsx      # Cấu hình mạng, Topo triển khai & Ping test
│   │   ├── AdminLoginPage.tsx    # Đăng nhập dành riêng cho Quản trị viên
│   │   └── ForbiddenPage.tsx     # Trang thông báo 403 khi thiếu quyền ADMIN
│   │
│   ├── store/
│   │   ├── admin-auth.store.ts   # Quản lý xác thực JWT & quyền ADMIN
│   │   ├── theme.store.ts        # Quản lý giao diện Sáng / Tối (Dark / Light)
│   │   └── i18n.store.ts         # Quản lý đa ngôn ngữ Song ngữ (VI / EN)
│   │
│   ├── App.tsx             # Bộ định tuyến trung tâm có bảo vệ quyền Admin
│   ├── main.tsx            # Entrypoint khởi tạo React
│   └── index.css           # Bảng màu Design System Glassmorphism & Token CSS
│
├── .env.example            # Mẫu biến môi trường
├── package.json
├── tsconfig.json
└── vite.config.ts          # Cấu hình cổng độc lập 5175
```

---

## ⚙️ Biến Môi Trường (.env)

Tạo file `admin/.env`:

```env
# Địa chỉ máy chủ Backend API Gateway
VITE_API_URL="http://localhost:4000"

# Đường dẫn chuyển tiếp sang Cổng Người Dùng Khách
VITE_MAIN_APP_URL="http://localhost:5174"

# Đường dẫn Cổng Quản trị hiện tại
VITE_ADMIN_PORTAL_URL="http://localhost:5175"
```

---

## 🚀 Hướng Dẫn Cài Đặt & Chạy Cục Bộ

```bash
# 1. Di chuyển vào thư mục admin
cd admin

# 2. Cài đặt các gói phụ thuộc
npm install

# 3. Khởi chạy máy chủ phát triển
npm run dev
```

Truy cập trình duyệt tại: **`http://localhost:5175`**

### Tài khoản đăng nhập mẫu:
- **Email**: `admin@shrimp.ai`
- **Mật khẩu**: `Admin@123456`

### Các lệnh kiểm tra:
- `npm run build`: Kiểm tra kiểu dữ liệu TypeScript và build bundle sản xuất (chỉ mất ~200ms, bundle gzip ~120kB).
- `npm run preview`: Chạy thử bản build thành phẩm tại cổng 5175.
