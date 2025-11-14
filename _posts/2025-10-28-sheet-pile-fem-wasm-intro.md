---
title: "SheetPileFEM: Phân tích tường cừ ván theo phương pháp phần tử hữu hạn"
date: 2025-10-28 10:00:00 +0700
categories: 
    - Sheet Pile Wall
tags:
  - Nền móng
  - Tường cừ ván
  - FEM
  - WebAssembly
  - C++
  - SaaS
author_profile: true
author: "TS. Nguyễn Hải Hà"
layout: single
read_time: true
toc: true
toc_label: "Mục lục"
toc_icon: "fas fa-clipboard-list"
image: /assets/images/app-icons/sheetpile-icon.png
---

### 1. Bài toán tường cừ

Trong kỹ thuật địa kỹ thuật và công trình ngầm, **tường cừ ván (Sheet Pile Wall)** là một trong những giải pháp móng sâu và tường chắn phổ biến nhất. Chúng được sử dụng để thi công hố móng, bảo vệ bờ sông, xây dựng bến cảng, và ổn định mái dốc.

Tuy nhiên, việc phân tích và thiết kế tường cừ ván không hề đơn giản. Nó đòi hỏi sự hiểu biết sâu sắc về tương tác đất-kết cấu (Soil-Structure Interaction), áp lực đất chủ động/bị động, và áp lực nước. Các phương pháp truyền thống như Cân bằng Giới hạn (Limit Equilibrium Method - LEM) tuy đơn giản nhưng có nhiều hạn chế khi mô hình hóa các điều kiện phức tạp như đất nhiều lớp, hệ neo, hay tải trọng động.

### 2. Phương pháp Phần tử Hữu hạn (FEM)

**Phương pháp Phần tử Hữu hạn (FEM)** là một công cụ mạnh mẽ để giải quyết bài toán này. Nó mô hình hóa tường cừ như một dầm liên tục (dầm Timoshenko) được đỡ bởi các gối tựa đàn hồi (các lò xo phi tuyến) đại diện cho nền đất.

Mô hình này cho phép:
* Mô phỏng chính xác sự phân bố lại ứng suất.
* Tính toán nội lực (Mô-men, Lực cắt) và chuyển vị tại bất kỳ điểm nào dọc thân tường.
* Xem xét ảnh hưởng của các lớp đất khác nhau, mực nước ngầm, và các hệ neo (anchors) hoặc thanh chống (struts).

### 3. Thách thức: Tốc độ và Khả năng Truy cập

Các phần mềm FEM thương mại (như Plaxis, GeoStudio) rất mạnh mẽ nhưng cũng đắt đỏ, phức tạp và yêu cầu cài đặt nặng nề. Các công cụ tính toán dựa trên Excel/VBA tuy tiện lợi nhưng chậm chạp và khó mở rộng.

Đây là lúc **WebAssembly (Wasm)** phát huy sức mạnh.

### 4. Giải pháp: SheetPileFEM (C++ lõi Wasm)

Chúng tôi đã phát triển **SheetPileFEM**, một ứng dụng web-app, với lõi tính toán được viết hoàn toàn bằng **C++** và biên dịch sang **WebAssembly**.

* **Giao diện (Frontend):** Người dùng nhập liệu (thông số đất, tường, neo, tải trọng) trên giao diện web (HTML/JS) trực quan.
* **Lõi tính (Backend):** Dữ liệu được gửi đến mô-đun Wasm. Lõi C++ thực hiện toàn bộ các bước tính toán FEM tốc độ cao:
    1.  Xây dựng ma trận độ cứng tổng thể.
    2.  Áp dụng điều kiện biên và tải trọng.
    3.  Giải hệ phương trình tuyến tính để tìm chuyển vị tại các nút.
    4.  Tính toán nội lực (Mô-men, Lực cắt) từ chuyển vị.
* **Kết quả (Output):** Wasm trả kết quả về cho JavaScript để vẽ biểu đồ nội lực, chuyển vị và hiển thị bảng kết quả chi tiết tại từng điểm nút.

### 5. Mô hình Freemium: Từ Giáo dục đến Chuyên nghiệp

**SheetPileFEM** được xây dựng theo mô hình "Freemium" để phục vụ cả cộng đồng:

1.  **Bản Miễn phí (Free):**
    * **Đối tượng:** Sinh viên, kỹ sư mới, hoặc các bài toán đơn giản.
    * **Tính năng:** Đầy đủ các tính năng cơ bản như đã nêu.
    * **Giới hạn:** Có thể bị giới hạn số lớp đất (ví dụ: tối đa 2 lớp), không hỗ trợ hệ neo (Anchors) và tải trọng phức tạp (Surcharge).
    * **Truy cập:** Ngay tại đây, trên `hydrostructai.github.io`.

2.  **Bản Chuyên nghiệp (Pro - Dạng SaaS):**
    * **Đối tượng:** Kỹ sư thiết kế, công ty tư vấn chuyên nghiệp.
    * **Tính năng:** Mở khóa toàn bộ giới hạn: số lớp đất không giới hạn, tính toán hệ neo đàn hồi, nhập tải trọng phức tạp, lưu/tải dự án, xuất báo cáo chuyên nghiệp.
    * **TruyCập:** Sẽ được cung cấp dưới dạng Dịch vụ (SaaS) có trả phí, yêu cầu License Key để xác thực.

### 6. Trải nghiệm ngay

Chúng tôi tin tưởng rằng công cụ này sẽ là một tài nguyên học tập quý giá cho sinh viên và là một công cụ hỗ trợ nhanh chóng, tiện lợi cho các kỹ sư.

Hãy tự mình trải nghiệm ngay bây giờ. Mọi phản hồi đều được hoan nghênh.

[**Khám phá Sheet Pile FEM**](/apps/sheetpilefem/)