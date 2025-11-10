---
# SỬ DỤNG LAYOUT "SPLASH" (TRANG ĐÍCH)
# Bố cục này cho phép tùy chỉnh trang chủ để trưng bày cả App và Bài viết.
layout: splash
author_profile: true

# --- VÙNG "HERO" (GIỚI THIỆU CHÍNH) ---
header:
  overlay_color: "#333"
  overlay_filter: "0.5"
  # Bạn CẦN tạo file ảnh này và đặt vào /assets/images/
  overlay_image: "/assets/images/hero-engineering.jpg" 
  caption: "Ảnh: Unsplash"
  
  # Nút kêu gọi hành động (CTA)
  cta_label: "Khám phá Tất cả Web App"
  cta_url: "/apps/" # Link tới trang apps.md
  
excerpt: "Blog chuyên môn và Các Ứng dụng Web (WASM, FEM, AI) cho Kỹ thuật Xây dựng."
---

## 🚀 Các Ứng dụng Web Nổi bật

<div class="feature__wrapper">
<div class="feature__item--center"> <h3 class="archive__item-title">Các Ứng dụng Web Nổi bật</h3>
</div>
</div>

<div class="feature__wrapper">
{% assign apps = site.pages | where: "path", "apps.md" | first %}
{% if apps %}
  <div class="feature__item">
    <div class="archive__item">
      <div class="archive__item-teaser">
        <img src="/assets/images/app-icons/sheetpile-icon.png" alt="SheetPileFEM-WASM icon">
      </div>
      <div class="archive__item-body">
        <h3 class="archive__item-title">SheetPileFEM-WASM</h3>
        <div class="archive__item-excerpt">
          <p>Phân tích Cừ Ván (FEM) mạnh mẽ bằng WebAssembly. Chạy ngay trên trình duyệt với các tính năng Freemium (dùng thử).</p>
        </div>
        <a href="/apps/sheetpilefem/" class="btn btn--success">Mở Ứng dụng</a>
      </div>
    </div>
  </div>

  <div class="feature__item">
    <div class="archive__item">
      <div class="archive__item-teaser">
        <img src="/assets/images/app-icons/taylor-icon.png" alt="Taylor Series icon">
      </div>
      <div class="archive__item-body">
        <h3 class="archive__item-title">Trực quan hóa Chuỗi Taylor</h3>
        <div class="archive__item-excerpt">
          <p>Công cụ tương tác minh họa cách chuỗi Taylor xấp xỉ hàm <code>sin(x)</code> khi bậc <code>n</code> thay đổi.</p>
        </div>
        <a href="/apps/taylor-series/" class="btn btn--info">Mở Ứng dụng</a>
      </div>
    </div>
  </div>

  <div class="feature__item">
    <div class="archive__item">
      <div class="archive__item-teaser">
        <img src="/assets/images/app-icons/hypocycloid-icon.png" alt="Hypocycloid icon">
      </div>
      <div class="archive__item-body">
        <h3 class="archive__item-title">Vẽ đường Hypocycloid</h3>
        <div class="archive__item-excerpt">
          <p>Một canvas sáng tạo để vẽ các đường cong hình học phức tạp và đẹp mắt (như đồ chơi Spirograph).</p>
        </div>
        <a href="/apps/hypocycloid/" class="btn btn--info">Mở Ứng dụng</a>
      </div>
    </div>
  </div>
  
  <div class="feature__item">
    <div class="archive__item">
      <div class="archive__item-teaser">
        <img src="/assets/images/app-icons/pep3-icon.png" alt="PEP3 icon">
      </div>
      <div class="archive__item-body">
        <h3 class="archive__item-title">PEP3 - Đánh giá Phát triển</h3>
        <div class="archive__item-excerpt">
          <p>Biểu mẫu kỹ thuật số dựa trên quy trình PEP3, chuẩn hóa việc đánh giá và ghi lại các giai đoạn phát triển.</p>
        </div>
        <a href="/apps/pep3/" class="btn btn--info">Mở Ứng dụng</a>
      </div>
    </div>
  </div>
{% endif %}
</div>

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
