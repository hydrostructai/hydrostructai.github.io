# hydrostructai.github.io
# Blog Kỹ thuật & Portfolio Web App 🚀

Chào mừng bạn đến với kho chứa mã nguồn cho trang web **hydrostructai.github.io**. Đây là nơi tôi phát triển và chia sẻ các bài viết chuyên môn, cũng như các ứng dụng web (Web App) về Kỹ thuật Xây dựng (Địa kỹ thuật, Kết cấu) và Khoa học Dữ liệu.

**🚀 Xem trang web trực tiếp tại: [https://hydrostructai.github.io/](https://hydrostructai.github.io/)**

---

## 🛠️ Công nghệ Sử dụng

Trang web này được xây dựng trên nền tảng **Jekyll**, một trình tạo trang web tĩnh (SSG), và được tăng cường bởi các công nghệ sau:

* **Jekyll:** Nền tảng chính để biên dịch các file Markdown thành website HTML tĩnh.
* **Theme "Minimal Mistakes":** Giao diện chuyên nghiệp được cài đặt thông qua `remote_theme` trong `_config.yml` để dễ bảo trì.
* **Markdown (Kramdown):** Ngôn ngữ soạn thảo chính cho tất cả các bài blog và các trang nội dung (như `about.md`, `apps.md`).
* **WebAssembly (WASM):** Được sử dụng cho các lõi tính toán hiệu suất cao (ví dụ: lõi C++ FEM của `SheetPileFEM`) để chạy trực tiếp trên trình duyệt.
* **HTML5 / CSS3 / JavaScript (ES6+):** Cung cấp giao diện và logic cho các Web App tùy chỉnh nằm trong thư mục `/apps`.

---

## 💡 Logic Hoạt động & Cấu trúc Thư mục

Trang web này là một kiến trúc "lai" (hybrid):

1.  **Phần Blog (Quản lý bởi Jekyll):**
    * `_config.yml`: "Bộ não" cấu hình toàn bộ trang web, theme, và các plugin.
    * `index.md`: Trang chủ, sử dụng `layout: home` của theme để tự động liệt kê các bài viết mới nhất.
    * `_posts/`: Nơi chứa tất cả các bài viết kỹ thuật.
    * `_data/`: Chứa dữ liệu có cấu trúc (như `navigation.yml` cho thanh menu).
    * `about.md`, `apps.md`: Các trang tĩnh (ví dụ: trang giới thiệu, trang danh mục app).

2.  **Phần Web Apps (Tĩnh, Jekyll bỏ qua):**
    * `/apps/`: Thư mục này chứa tất cả các ứng dụng độc lập. Jekyll được cấu hình để sao chép thư mục này nguyên trạng mà không xử lý nó.
    * `/apps/sheetpilefem/`: Chứa các file `index.html`, `app.js`, `sheetpilefem.js`, `sheetpilefem.wasm`.
    * `/apps/taylor-series/`: Chứa file `index.html` (app Taylor)
    * ...(các app khác)

---

## ✍️ Quy trình Thêm Nội dung Mới

**TUYỆT ĐỐI KHÔNG** sửa `index.html` ở thư mục gốc để thêm bài viết. Quy trình làm việc chuyên nghiệp như sau:

### 1. Để thêm một Bài viết / Hướng dẫn mới:

1.  Tạo một file Markdown mới (ví dụ: `2025-11-10-my-new-analysis.md`) với "Front Matter" (phần `--- ... ---`) ở trên đầu.
2.  Đặt file này vào thư mục `_posts/`.
3.  Đẩy (push) lên GitHub. Trang chủ (`index.md`) sẽ tự động cập nhật và hiển thị bài viết mới của bạn.

### 2. Để thêm một Web App mới:

1.  Tạo một thư mục con mới bên trong thư mục `/apps/` (ví dụ: `/apps/new-tool/`).
2.  Đặt tất cả các file của ứng dụng đó (ví dụ: `index.html`, `app.js`, `style.css`) vào thư mục con này.
3.  Mở file `apps.md` (ở thư mục gốc) và thêm một mục mới để mô tả và liên kết đến app của bạn (`/apps/new-tool/`).
