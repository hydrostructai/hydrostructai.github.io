---
title: "Bài toán Hình tròn Tiếp tuyến 3 đường cong"
author_profile: true
author_name: "HST.AI"
date: 2025-09-13 10:00:00 +0700
layout: single
# QUAN TRỌNG: Bật MathJax để hiển thị công thức
mathjax: true

categories: 
    - Tools
tags: [Visualization, Geometry, JavaScript, p5js, numericjs, Giải tích]
# Gợi ý: Bạn nên tạo một ảnh xem trước cho bài viết này
#image: /assets/images/posts/circleare-hero.png 

---

### 1. Bài toán Hình học Giải tích Thú vị

Đây là một bài toán cổ điển trong hình học giải tích, thường được biết đến là một biến thể của **Bài toán Apollonius**: Làm thế nào để tìm một hình tròn tiếp xúc với ba đối tượng cho trước?

Trong trường hợp này, chúng ta nâng cấp bài toán bằng cách tìm một hình tròn tiếp xúc với ba đường cong hàm số phức tạp:
1.  $$y = -x^3 + x$$ (Đa thức)
2.  $$y = e^x$$ (Hàm mũ)
3.  $$y = -\sin(x) + 3$$ (Hàm lượng giác)

### 2. Ứng dụng Web Giải thuật

Công cụ này trực quan hóa bài toán và cung cấp lời giải số học chính xác bằng cách sử dụng các thư viện JavaScript.

* **Đồ họa:** Sử dụng **p5.js** để vẽ biểu đồ các hàm số, trục tọa độ, và hình tròn kết quả một cách mượt mà.
* **Lõi Tính toán:** Sử dụng thư viện **numeric.js** để giải một hệ 6 phương trình phi tuyến.
* **Logic:** Thuật toán `numeric.uncmin` tìm cách tối thiểu hóa hàm lỗi (tổng bình phương của 6 phương trình) để tìm ra 6 ẩn số: tọa độ tâm $$(x_c, y_c)$$, bán kính $$R$$, và 3 hoành độ tiếp điểm ($$x_f, x_g, x_h$$).

### 3. Trải nghiệm ngay

Công cụ hiển thị các đường gióng đến các điểm tiếp xúc, tọa độ tâm và tính toán diện tích hình tròn tìm được.

<a href="/tools/circlearea/index.html" class="button" style="padding: 10px 20px; background-color: #007bff; color: white; text-decoration: none; border-radius: 5px; font-weight: bold;">
    Chạy Công cụ Hình tròn Tiếp tuyến
</a>