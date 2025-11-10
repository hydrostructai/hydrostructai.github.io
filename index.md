---
# SỬ DỤNG LAYOUT "SPLASH" (TRANG ĐÍCH) THAY VÌ "HOME"
# Layout này cho phép chúng ta tùy chỉnh trang chủ một cách linh hoạt
layout: splash
author_profile: true

# --- VÙNG "HERO" (GIỚI THIỆU CHÍNH) ---
# ĐÃ SỬA LỖI: Cú pháp YAML đúng phải thụt lề (indented)
header:
  overlay_color: "#333"
  overlay_filter: "0.5"
  # Bạn CẦN tạo file ảnh này và đặt vào assets/images/
  overlay_image: "/assets/images/hero-engineering.jpg" 
  caption: "Ảnh: Unsplash"
  
  # --- NÚT KÊU GỌI HÀNH ĐỘNG (CTA) ---
  # Các mục này cũng là con của 'header' và phải thụt lề
  cta_label: "Khám phá Tất cả Web App"
  # Liên kết này sẽ trỏ đến trang "apps.md" (danh mục app)
  cta_url: "/apps/"
  
excerpt: "Blog chuyên môn và Các Ứng dụng Web (WASM, FEM) cho Kỹ thuật Xây dựng."

# --- LOGIC 1: TRƯNG BÀY CÁC WEB APP NỔI BẬT ---
# Sử dụng tính năng "feature_row" của theme Minimal Mistakes
# để hiển thị trực quan 3 ứng dụng quan trọng nhất của bạn.
#
# ĐÃ SỬA LỖI: Cú pháp YAML đúng dùng dấu gạch ngang (-) cho danh sách
feature_row:
  # App 1: SheetPileFEM-WASM
  - image_path: /assets/images/app-icons/sheetpile-icon.png # CẦN TẠO ẢNH ICON CHO APP
    alt: "SheetPileFEM-WASM"
    title: "SheetPileFEM-WASM"
    excerpt: "Phân tích Cừ Ván (FEM) mạnh mẽ bằng WebAssembly. Chạy ngay trên trình duyệt với các tính năng Freemium (dùng thử)."
    # Đây là link trực tiếp đến app SheetPileFEM
    url: "/apps/sheetpilefem/"
    btn_label: "Mở Ứng dụng"
    btn_class: "btn--success" # Nút màu xanh lá

  # App 2: Taylor Series
  - image_path: /assets/images/app-icons/taylor-icon.png # CẦN TẠO ẢNH ICON CHO APP
    alt: "Taylor Series Visualization"
    title: "Trực quan hóa Chuỗi Taylor"
    excerpt: "Công cụ tương tác minh họa cách chuỗi Taylor xấp xỉ hàm `sin(x)` khi bậc `n` thay đổi."
    # Đây là link trực tiếp đến app Taylor
    url: "/apps/taylor-series/"
    btn_label: "Mở Ứng dụng"
    btn_class: "btn--info" # Nút màu xanh dương

  # App 3: Hypocycloid
  - image_path: /assets/images/app-icons/hypocycloid-icon.png # CẦN TẠO ẢNH ICON CHO APP
    alt: "Hypocycloid Art Canvas"
    title: "Vẽ đường Hypocycloid"
    excerpt: "Một canvas sáng tạo để vẽ các đường cong hình học phức tạp và đẹp mắt (như đồ chơi Spirograph)."
    # Đây là link trực tiếp đến app Hypocycloid
    url: "/apps/hypocycloid/"
    btn_label: "Mở Ứng dụng"
    btn_class: "btn--info" # Nút màu xanh dương
---

## Chào mừng đến với HydroStructAI

Nơi Kỹ thuật Xây dựng (Civil Engineering) gặp gỡ Công nghệ Web Hiện đại.

Trang web này là một dự án cá nhân nhằm chia sẻ các kiến thức, bài viết chuyên môn về Địa kỹ thuật, Kết cấu, và các công cụ lập trình ứng dụng (AI, FEM). Các Web App nổi bật được trưng bày ngay bên trên.

---

## ✍️ Bài viết Kỹ thuật Mới nhất

Dưới đây là các bài viết, hướng dẫn, và phân tích mới nhất từ blog.

<div class="feature__wrapper">
{% for post in site.posts limit:5 %}
  {% include archive-single.html type="list" %}
{% endfor %}
</div>

<a href="/posts/" class="btn btn--primary" style="margin-top: 20px;">
  Xem tất cả Bài viết
</a>
