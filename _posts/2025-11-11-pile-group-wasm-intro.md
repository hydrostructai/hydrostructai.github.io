---
title: "PILE GROUP 3D: TÍNH TOÁN MÓNG CỌC ĐÀI CAO THEO ZAVRIEV - SPIRO"
categories:
  - Engineering
  - WASM
tags:
  - Nền móng
  - Móng Cọc
  - Turbo Pascal
  - C++
  - WebAssembly
  - FEM
author_profile: "TS. Nguyễn Hải Hà"
read_time: true
toc: true
toc_label: "Mục lục"
toc_icon: "fas fa-clipboard-list"
---

Trong chuỗi dự án hồi sinh các công cụ kỹ thuật cổ điển, chúng tôi vui mừng giới thiệu ứng dụng **Pile Group 3D** (Bệ cọc đài cao). Ứng dụng này đã được chuyển đổi thành công từ mã nguồn **Turbo Pascal 7.0** kinh điển sang lõi tính toán **WebAssembly (Wasm)** hiệu năng cao.

## Nguồn gốc: Di sản kỹ thuật từ Turbo Pascal

Chương trình gốc được viết bởi cố PGS.TS Nguyễn Viết Trung (Đại học Giao thông Vận tải), dựa trên **Phương pháp Ma trận Độ cứng** theo lý thuyết của Zavriev-Spiro. Đây là một công cụ thiết yếu để phân tích các hệ thống móng cọc chịu tải trọng không gian (6 bậc tự do), đặc biệt là móng cọc xiên và móng đài cao (thường gặp trong công trình thủy lợi, cảng biển).

Logic cốt lõi của nó bao gồm:
1.  Tính toán ma trận độ cứng riêng của cọc (A3) bằng cách nội suy từ các bảng tra (phụ thuộc vào điều kiện mũi cọc: tựa đất, tựa đá, ngàm đá).
2.  Sử dụng các ma trận chuyển đổi tọa độ (A1, A2) để tổng hợp ma trận độ cứng tổng thể của bệ.
3.  Giải hệ phương trình tuyến tính để tìm chuyển vị và nội lực.

## Hiện đại hóa với WebAssembly (Wasm)

Việc sử dụng Turbo Pascal, dù mạnh mẽ về logic, gây ra rào cản về giao diện (DOS) và khả năng phân phối. Chúng tôi đã thực hiện các bước sau:

1.  **Chuyển đổi ngôn ngữ:** Toàn bộ logic Pascal đã được chuyển sang **C++** (`pilegroup.cpp`).
2.  **Biên dịch tối ưu:** Sử dụng **Emscripten** để biên dịch C++ thành mô-đun Wasm (`pilegroup.wasm`).
3.  **Tích hợp Web:** Xây dựng một giao diện web hiện đại (HTML/JS/Bootstrap) cho phép nhập liệu dễ dàng (kể cả từ CSV/Excel) và hiển thị kết quả trực quan (bảng, biểu đồ).

**Lợi ích của Wasm:** Tốc độ tính toán ma trận, vốn đòi hỏi nhiều tài nguyên, được duy trì ở mức native C++, đảm bảo độ tin cậy và hiệu suất ngay trong trình duyệt.

## Cơ chế License cho Công cụ Chuyên nghiệp

Để bảo vệ và hỗ trợ việc phát triển bền vững, ứng dụng Pile Group 3D được tích hợp cơ chế bản quyền:

* **Bản dùng thử (Unlicensed):** Giới hạn phân tích móng có **tối đa 10 cọc**.
* **Bản Đăng ký (Licensed):** Mở khóa giới hạn, cho phép phân tích các móng phức tạp với số lượng cọc lớn (hàng trăm cọc).

## Sử dụng Ứng dụng

Bạn có thể nhập liệu bằng tay qua giao diện multi-tab hoặc tải dữ liệu bố trí cọc từ tệp CSV/Excel. Kết quả bao gồm: chuyển vị bệ, nội lực chi tiết từng cọc (N, Q, M) và kiểm toán móng khối quy ước (USmax, USmin).

**[Mở Ứng dụng Bệ cọc đài cao ngay]**
