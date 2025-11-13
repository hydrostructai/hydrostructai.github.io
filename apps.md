---
layout: pages
title: "Ứng dụng Web (Web Apps)"
permalink: /apps/
author_profile: true
author_name: "Nguyễn Hải Hà"
---

Trang này tổng hợp các ứng dụng web và công cụ tính toán được phát triển bởi HydroStructAI.

## Ứng dụng Kỹ thuật Xây dựng

Đây là các ứng dụng chuyên sâu, sử dụng lõi tính toán WebAssembly (Wasm), dành cho kỹ sư thiết kế và sinh viên.

<div class="feature__wrapper">
{% assign eng_apps = site.posts | where_exp: "post", "post.categories contains 'Geotechnical' or post.categories contains 'Pile Foundation' or post.categories contains 'Sheet Pile Wall'" %}
{% for post in eng_apps %}
  {% include archive-single.html type="grid" %}
{% endfor %}
</div>


---

## Công cụ Toán học & Trực quan hóa

Đây là các công cụ tương tác, gọn nhẹ được viết bằng JavaScript, dùng để khám phá các khái niệm toán học và hình học.

<div class="feature__wrapper">
{% assign entries = site.posts | where: "categories", "WebApp" %}
{% for post in entries %}
  {% include archive-single.html type="grid" %}
{% endfor %}
</div>