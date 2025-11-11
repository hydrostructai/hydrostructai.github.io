---
title: "SheetPileFEM: PHÂN TÍCH TƯỜNG CỪ VÁN THEO PHƯƠNG PHÁP PHẦN TỬ HỮU HẠN"
date: 2025-10-28 10:00:00 +0700
categories: 
    - Sheet Pile Wall
    - Geotechnical
tags:
  - Nền móng
  - Tường cừ ván
  - FEM
author_profile: true
author: "TS. Nguyễn Hải Hà"
read_time: true
toc: true
toc_label: "Mục lục"
toc_icon: "fas fa-clipboard-list"

---

### 1. Bài toán Địa kỹ thuật Cổ điển

Trong kỹ thuật địa kỹ thuật và công trình ngầm, **tường cừ ván (Sheet Pile Wall)** là một trong những giải pháp móng sâu và tường chắn phổ biến nhất. Chúng được sử dụng để thi công hố móng, bảo vệ bờ sông, xây dựng bến cảng, và ổn định mái dốc.

Tuy nhiên, việc phân tích và thiết kế tường cừ ván không hề đơn giản. Nó đòi hỏi sự hiểu biết sâu sắc về tương tác đất-kết cấu (Soil-Structure Interaction), áp lực đất chủ động/bị động, và áp lực nước. Các phương pháp truyền thống như Cân bằng Giới hạn (Limit Equilibrium Method - LEM) tuy đơn giản nhưng có nhiều hạn chế khi mô hình hóa các điều kiện phức tạp như đất nhiều lớp, hệ neo, hay tải trọng động.

### 2. Sự trỗi dậy của Phương pháp Phần tử Hữu hạn (FEM)

Phương pháp Phần tử Hữu hạn (FEM) cung cấp một mô hình phân tích chính xác và linh hoạt hơn nhiều. Thay vì các giả định đơn giản hóa, FEM cho phép chúng ta:

* Mô hình hóa tường cừ như một cấu kiện dầm-đàn hồi (beam-spring).
* Định nghĩa chính xác đặc tính của từng lớp đất.
* Mô phỏng chính xác sự làm việc của hệ neo (anchors) hoặc chống đỡ (struts).
* Tính toán và xuất ra biểu đồ nội lực (Moment, Shear) và biến dạng (Deflection) chi tiết dọc theo thân cừ.

Vấn đề là, các phần mềm FEM chuyên dụng (như Plaxis, GeoStudio, Midas) thường rất đắt đỏ, nặng nề và đòi hỏi cấu hình máy tính mạnh mẽ.

### 3. SheetPileFEM: Mang FEM lên Trình duyệt

Với mong muốn dân chủ hóa các công cụ phân tích kỹ thuật, chúng tôi đã phát triển **SheetPileFEM** — một ứng dụng web gọn nhẹ nhưng mạnh mẽ để phân tích tường cừ ván. Lõi tính toán được xây dựng bằng **C++** và biên dịch sang **WebAssembly (WASM)**, cho phép nó chạy trực tiếp trên trình duyệt với hiệu suất gần như ứng dụng Desktop.

**Điều này có nghĩa là gì?**
Chúng tôi đã gói gọn một lõi tính toán FEM địa kỹ thuật lên trang Web và bạn có thể chạy nó trên mọi thiết bị, từ PC đến điện thoại, mà **không cần cài đặt bất cứ thứ gì**.

### 4. Các tính năng chính (Phiên bản Miễn phí)

Phiên bản miễn phí được cung cấp ngay trên trang web này được thiết kế cho mục đích giáo dục, tra cứu nhanh, và các bài toán đơn giản. Các tính năng bao gồm:

* **Định nghĩa Hình học:** Nhập cao độ đỉnh/chân cừ, cao độ mặt đất (trước/sau), và mực nước (trước/sau).
* **Thông số Cừ:** Nhập mô-đun đàn hồi (E) và mô-men quán tính (I) của cừ.
* **Quản lý Đất nền:** Cho phép nhập nhiều lớp đất với các thông số cơ bản (Gamma, Phi, Cohesion).
* **Xuất Kết quả:** Tự động vẽ các biểu đồ Biến dạng (Deflection), Mô-men (Moment), và Lực cắt (Shear) sau khi chạy phân tích.
* **Xuất Bảng:** Cung cấp bảng kết quả chi tiết tại từng điểm nút.

### 5. Mô hình Freemium: Từ Giáo dục đến Chuyên nghiệp

**SheetPileFEM** được xây dựng theo mô hình "Freemium" để phục vụ cả cộng đồng:

1.  **Bản Miễn phí (Free):**
    * **Đối tượng:** Sinh viên, kỹ sư mới, hoặc các bài toán đơn giản.
    * **Tính năng:** Đầy đủ các tính năng cơ bản như đã nêu.
    * **Giới hạn:** Có thể bị giới hạn số lớp đất (ví dụ: tối đa 3 lớp), không hỗ trợ hệ neo (Anchors) và tải trọng phức tạp (Surcharge).
    * **Truy cập:** Ngay tại đây, trên `hydrostructai.github.io`.

2.  **Bản Chuyên nghiệp (Pro - Dạng SaaS):**
    * **Đối tượng:** Kỹ sư thiết kế, công ty tư vấn chuyên nghiệp.
    * **Tính năng:** Mở khóa toàn bộ giới hạn: số lớp đất không giới hạn, tính toán hệ neo đàn hồi, nhập tải trọng phức tạp, lưu/tải dự án, xuất báo cáo chuyên nghiệp.
    * **Truy cập:** Sẽ được cung cấp dưới dạng Dịch vụ (SaaS) có trả phí, yêu cầu License Key để xác thực.

### 6. Trải nghiệm ngay

Chúng tôi tin tưởng rằng công cụ này sẽ là một tài nguyên học tập quý giá cho sinh viên và là một công cụ hỗ trợ nhanh chóng, tiện lợi cho các kỹ sư.

Hãy tự mình trải nghiệm ngay bây giờ. Mọi phản hồi và góp ý xin vui lòng để lại trong phần bình luận bên dưới hoặc liên hệ trực tiếp với chúng tôi.

<a href="/apps/sheetpilefem/" class="button" style="padding: 10px 20px; background-color: #007bff; color: white; text-decoration: none; border-radius: 5px; font-weight: bold;">
    Chạy SheetPileFEM (Miễn phí)
</a>
