---
layout: post
title: "Vẽ Trái Tim Tham Số (Parametric Heart)"
description: "Một công cụ đồ họa tương tác để vẽ đường cong trái tim bằng phương trình tham số, cho phép tùy chỉnh các hệ số A, B, C, D, E."
date: 2025-11-14 10:00:00 +0700
categories: [Math, WebApp]
tags: [Visualization, Parametric Equation, Đồ họa, JavaScript]
---

### 1. Phép thuật của Phương trình Tham số

Các đường cong phức tạp và đẹp mắt thường có thể được mô tả bằng các phương trình tham số đơn giản. Đường cong hình trái tim này là một ví dụ tuyệt vời, được định nghĩa bởi một tham số `t` (thường chạy từ $0$ đến $2\pi$).

Trái tim trong ứng dụng này được vẽ bằng các phương trình:
* $x(t) = A \cdot \sin^3(t)$
* $y(t) = B \cdot \cos(t) - C \cdot \cos(2t) - D \cdot \cos(3t) - E \cdot \cos(4t)$

### 2. Ứng dụng Web Tương tác

Công cụ này cho phép bạn "chơi" với các phương trình trên:
* Thay đổi các hệ số **A, B, C, D, E** để xem hình dạng trái tim thay đổi như thế nào.
* Điều chỉnh tốc độ vẽ.
* Ứng dụng sử dụng JavaScript và HTML Canvas để vẽ quỹ đạo của điểm `(x, y)` khi `t` thay đổi, đồng thời tô màu bên trong hình.
* Hỗ trợ đa ngôn ngữ (Tiếng Việt / Tiếng Anh).

### 3. Trải nghiệm ngay

Hãy thử nghiệm các giá trị khác nhau để tạo ra hình dạng trái tim độc đáo của riêng bạn.

<a href="/tools/heartdrawing/index.html" class="button" style="padding: 10px 20px; background-color: #007bff; color: white; text-decoration: none; border-radius: 5px; font-weight: bold;">
    Vẽ Trái Tim
</a>