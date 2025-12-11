---
layout: single
title: "Tính Toán Thủy Lực Dốc Nước và Bể Tiêu Năng"
date: 2025-12-11
lang: vi
categories: [Hydraulics]
tags: [Spillway, Tiêu năng, Nước nhảy, Thủy lực]
toc: true
toc_label: "Nội dung"
toc_sticky: true
mathjax: true
header:
  overlay_color: "#0073e6"
  overlay_filter: "0.5"
  teaser: /assets/images/spillway-design.jpg
excerpt: "Phân tích chi tiết tính toán thủy lực dốc nước và thiết kế bể tiêu năng dựa trên lý thuyết nước nhảy thủy lực, áp dụng cho công trình thực tế."
---

## 1. Giới thiệu

Dốc nước (spillway chute) là một trong những công trình quan trọng trong hệ thống xả lũ của đập. Khi nước chảy xuống dốc với vận tốc cao, năng lượng động của dòng chảy tăng lên đáng kể, có thể gây xói lở nghiêm trọng cho kênh hạ lưu nếu không được tiêu tán đúng cách. Bể tiêu năng (stilling basin) được thiết kế để tạo ra hiện tượng nước nhảy thủy lực (hydraulic jump), chuyển hóa năng lượng động thành năng lượng rối và nhiệt, bảo vệ kênh hạ lưu khỏi xói lở.

### 1.1. Thông số thiết kế

Dự án được phân tích với các thông số sau:

**Thông số công trình:**
- Cấp công trình: **Cấp II**
- Tần suất thiết kế: **P = 1%**, lưu lượng \\( Q_{P=1\%} = 171.94 \, \text{m}^3/\text{s} \\)
- Tần suất kiểm tra: **P = 0.2%**, lưu lượng \\( Q_{P=0.2\%} = 258.48 \, \text{m}^3/\text{s} \\)
- Bề rộng dốc nước: **B = 14.5 m**

**Cao trình:**
- Mực nước thượng lưu (thiết kế): \\( Z_{tl} = 625.99 \, \text{m} \\)
- Cao trình ngưỡng tràn: \\( Z_{ng} = 625.00 \, \text{m} \\)
- Cao trình đáy kênh hạ lưu: \\( Z_{dk} = 617.00 \, \text{m} \\)
- Độ sâu dòng chảy hạ lưu: \\( h_h = 3.28 \, \text{m} \\) (thiết kế)

**Đặc tính dốc nước:**
- Đoạn 1 (thu hẹp): Độ dốc \\( i_1 = 20\% \\), chiều dài \\( L_1 = 20 \, \text{m} \\)
- Đoạn 2 (không đổi): Độ dốc \\( i_2 = 20\% \\), chiều dài \\( L_2 = 45 \, \text{m} \\)
- Hệ số nhám bê tông: \\( n = 0.017 \\)

**Hệ số an toàn:**
- Tổ hợp cơ bản: \\( [K] = 1.15 \\)
- Tổ hợp đặc biệt: \\( [K] = 1.04 \\)
- Hệ số an toàn ngập: \\( \sigma = 1.05 \\)

### 1.2. Sự cần thiết của bể tiêu năng

Với độ chênh cao gần 8m từ ngưỡng tràn xuống đáy kênh hạ lưu, kết hợp với lưu lượng lớn, dòng chảy sẽ đạt vận tốc rất cao tại chân dốc (>15 m/s). Điều này tạo ra:

- **Số Froude cao** (Fr > 4), đặc trưng cho dòng chảy siêu tới hạn
- **Năng lượng động lớn**, tiềm ẩn nguy cơ xói lở
- **Cần thiết phải nối tiếp** với dòng chảy hạ lưu (Fr < 1)

Bể tiêu năng được thiết kế để:
1. Tạo điều kiện cho nước nhảy hình thành ổn định
2. Tiêu tán 60-70% năng lượng dòng chảy
3. Bảo vệ kênh hạ lưu khỏi xói lở

## 2. Phân tích thủy lực dốc nước

### 2.1. Phương pháp tính toán

Tính toán đường mặt nước trên dốc thu hẹp sử dụng phương pháp cộng trực tiếp, xem như kênh phi lăng trụ:

$$
\Delta L = \frac{\Delta \mathscr{E}}{i - \bar{j}}
$$

Trong đó:
- \\( \Delta L \\): Khoảng cách giữa hai mặt cắt liên tiếp
- \\( \Delta \mathscr{E} \\): Chênh lệch năng lượng riêng
- \\( i \\): Độ dốc đáy
- \\( \bar{j} \\): Độ dốc thủy lực trung bình

Năng lượng riêng tại mỗi mặt cắt:

$$
\mathscr{E} = h + \frac{\alpha \cdot V^2}{2g}
$$

Độ dốc thủy lực:

$$
j = \frac{V^2}{C^2 \cdot R} \quad ; \quad C = \frac{1}{n} \cdot R^{1/6}
$$

Với \\( R = \frac{\omega}{\chi} \\) là bán kính thủy lực, \\( \omega = b \cdot h \\) là diện tích mặt cắt ướt, \\( \chi = b + 2h \\) là chu vi ướt.

### 2.2. Kết quả tính toán cho các trường hợp

#### 2.2.1. Trường hợp thiết kế (Q = 171.94 m³/s)

Từ tính toán đường mặt nước trên dốc, tại **cuối dốc (chân dốc)** thu được:

| Thông số | Ký hiệu | Giá trị | Đơn vị |
|----------|---------|---------|---------|
| Độ sâu dòng chảy | \\( h_c \\) | 0.745 | m |
| Vận tốc dòng chảy | \\( V_c \\) | 15.91 | m/s |
| Lưu lượng đơn vị | \\( q \\) | 11.86 | m³/s/m |
| Số Froude | \\( Fr_1 \\) | 5.88 | - |
| Năng lượng riêng | \\( \mathscr{E} \\) | 13.64 | m |

**Phân tích:**
- Số Froude **Fr = 5.88 >> 1**: Dòng chảy siêu tới hạn, năng lượng động chiếm ưu thế
- Vận tốc **V = 15.91 m/s**: Rất cao, có khả năng gây xói lở nghiêm trọng
- Cần bể tiêu năng để chuyển sang dòng chảy dưới tới hạn (Fr < 1)

#### 2.2.2. Trường hợp kiểm tra (Q = 258.48 m³/s)

Tại cuối dốc với lưu lượng kiểm tra:

| Thông số | Ký hiệu | Giá trị | Đơn vị |
|----------|---------|---------|---------|
| Độ sâu dòng chảy | \\( h_c \\) | 1.114 | m |
| Vận tốc dòng chảy | \\( V_c \\) | 16.00 | m/s |
| Lưu lượng đơn vị | \\( q \\) | 17.83 | m³/s/m |
| Số Froude | \\( Fr_1 \\) | 4.85 | - |
| Năng lượng riêng | \\( \mathscr{E} \\) | 14.16 | m |

### 2.3. Bảng so sánh tổng hợp

| Trường hợp | Q (m³/s) | h (m) | V (m/s) | Fr | Nhận xét |
|------------|----------|-------|---------|-----|-----------|
| **Thiết kế (P=1%)** | 171.94 | 0.745 | 15.91 | 5.88 | Siêu tới hạn |
| **Kiểm tra (P=0.2%)** | 258.48 | 1.114 | 16.00 | 4.85 | Siêu tới hạn |

**Nhận xét chung:**
- Cả hai trường hợp đều có **Fr > 4**: Dòng chảy siêu tới hạn mạnh
- Vận tốc xấp xỉ **16 m/s**: Rất nguy hiểm cho kênh hạ lưu
- **Bắt buộc phải có bể tiêu năng** để chuyển tiếp an toàn

## 3. Tính toán nối tiếp và bể tiêu năng

### 3.1. Lý thuyết nước nhảy thủy lực

Nước nhảy thủy lực là hiện tượng chuyển đột ngột từ dòng chảy siêu tới hạn (Fr > 1) sang dòng chảy dưới tới hạn (Fr < 1), kèm theo tiêu tán mạnh mẽ năng lượng do rối động.

#### 3.1.1. Độ sâu liên hiệp (Conjugate Depth)

Phương trình động lượng cho nước nhảy trên đáy ngang:

$$
\frac{h_2}{h_1} = \frac{1}{2} \left( \sqrt{1 + 8Fr_1^2} - 1 \right)
$$

Hay:

$$
h_2 = \frac{h_1}{2} \left( \sqrt{1 + 8Fr_1^2} - 1 \right)
$$

Trong đó:
- \\( h_1 \\): Độ sâu trước nước nhảy (tại chân dốc)
- \\( h_2 \\): Độ sâu liên hiệp sau nước nhảy
- \\( Fr_1 = \frac{V_1}{\sqrt{g h_1}} \\): Số Froude trước nước nhảy

#### 3.1.2. Hiệu suất tiêu năng

Năng lượng bị tiêu tán trong nước nhảy:

$$
\Delta E = E_1 - E_2 = \frac{(h_2 - h_1)^3}{4 h_1 h_2}
$$

Hiệu suất tiêu năng:

$$
\eta = \frac{\Delta E}{E_1} \times 100\%
$$

Đối với nước nhảy có Fr > 4.5, hiệu suất tiêu năng đạt **60-70%**.

### 3.2. Thiết kế bể tiêu năng

#### 3.2.1. Điều kiện nối tiếp

Để nước nhảy hình thành ổn định trong bể, cần đảm bảo:

$$
h_h + \Delta h \geq \sigma \cdot h_2
$$

Trong đó:
- \\( h_h \\): Độ sâu dòng chảy hạ lưu
- \\( \Delta h \\): Độ nâng mực nước (nếu cần)
- \\( \sigma \\): Hệ số an toàn ngập (thường lấy 1.05 - 1.10)
- \\( h_2 \\): Độ sâu liên hiệp tính toán

#### 3.2.2. Chiều sâu bể tiêu năng

Chiều sâu bể \\( d_b \\) được xác định qua phương trình cân bằng năng lượng và động lượng. Phương pháp lặp:

**Bước 1:** Giả thiết chiều sâu bể \\( d_0 \\)

**Bước 2:** Tính cột nước toàn phần với bể:

$$
E_0 = Z_{tl} - (Z_{dk} - d_0)
$$

**Bước 3:** Giải phương trình năng lượng tại đáy bể để tìm \\( h_1 \\):

$$
E_0 = h_1 + \frac{\varphi^2 V_1^2}{2g} = h_1 + \frac{\varphi^2 q^2}{2g h_1^2}
$$

**Bước 4:** Tính độ sâu liên hiệp \\( h_2 \\) từ công thức nước nhảy

**Bước 5:** Tính chênh lệch cột nước:

$$
\Delta Z = \sigma h_2 - h_h
$$

**Bước 6:** Tính lại chiều sâu bể:

$$
d_1 = h_2 - h_h - \Delta Z
$$

**Bước 7:** Kiểm tra \\( |d_1 - d_0| < \epsilon \\). Nếu không, lặp lại từ Bước 2.

#### 3.2.3. Chiều dài bể tiêu năng

Theo công thức M.Đ. Chertousov:

$$
L_b = \beta \cdot L_n
$$

Với:
- \\( L_n = 4.5 \cdot h_2 \\): Chiều dài nước nhảy lý thuyết
- \\( \beta = 0.7 \div 0.8 \\): Hệ số an toàn

### 3.3. Kết quả tính toán bể tiêu năng

#### 3.3.1. Trường hợp thiết kế (Q = 171.94 m³/s)

| Thông số | Ký hiệu | Giá trị | Đơn vị |
|----------|---------|---------|---------|
| **Nối tiếp (không có bể)** | | | |
| Cột nước toàn phần | \\( E_0 \\) | 15.16 | m |
| Độ sâu tại co hẹp | \\( h_c \\) | 0.74 | m |
| Độ sâu liên hiệp | \\( h_c'' \\) | 5.85 | m |
| **Bể tiêu năng** | | | |
| Chiều sâu bể | \\( d_b \\) | 2.73 | m |
| Cột nước toàn phần | \\( E_0 \\) | 17.88 | m |
| Độ sâu tại đáy bể | \\( h_c \\) | 0.67 | m |
| Độ sâu liên hiệp | \\( h_c'' \\) | 6.23 | m |
| Chênh lệch cột nước | \\( \Delta Z \\) | 0.53 | m |
| Chiều dài bể | \\( L_b \\) | 17.53 | m |
| **Kiểm tra** | | | |
| Hệ số ngập | \\( K \\) | 1.05 | - |
| Kết luận | | ✅ Đạt yêu cầu | |

**Thiết kế đề xuất:**
- Chiều sâu bể: **\\( d_b = 3.0 \, \text{m} \\)** (làm tròn lên)
- Chiều dài bể: **\\( L_b = 18.0 \, \text{m} \\)** (làm tròn lên)

#### 3.3.2. Trường hợp kiểm tra (Q = 258.48 m³/s)

| Thông số | Ký hiệu | Giá trị | Đơn vị |
|----------|---------|---------|---------|
| **Nối tiếp (không có bể)** | | | |
| Cột nước toàn phần | \\( E_0 \\) | 15.56 | m |
| Độ sâu tại co hẹp | \\( h_c \\) | 1.11 | m |
| Độ sâu liên hiệp | \\( h_c'' \\) | 7.09 | m |
| **Bể tiêu năng** | | | |
| Chiều sâu bể | \\( d_b \\) | 3.40 | m |
| Cột nước toàn phần | \\( E_0 \\) | 18.96 | m |
| Độ sâu tại đáy bể | \\( h_c \\) | 0.97 | m |
| Độ sâu liên hiệp | \\( h_c'' \\) | 7.68 | m |
| Chênh lệch cột nước | \\( \Delta Z \\) | 1.07 | m |
| Chiều dài bể | \\( L_b \\) | 24.20 | m |
| **Kiểm tra** | | | |
| Hệ số ngập | \\( K \\) | 1.05 | - |
| Kết luận | | ✅ Đạt yêu cầu | |

**Thiết kế đề xuất:**
- Chiều sâu bể: **\\( d_b = 3.5 \, \text{m} \\)** (làm tròn lên)
- Chiều dài bể: **\\( L_b = 25.0 \, \text{m} \\)** (làm tròn lên)

### 3.4. Thiết kế cuối cùng

Lấy giá trị bao trùm cho cả hai trường hợp:

- **Chiều sâu bể tiêu năng: \\( d_b = 3.5 \, \text{m} \\)**
- **Chiều dài bể tiêu năng: \\( L_b = 25.0 \, \text{m} \\)**
- **Hệ số ngập: \\( K = 1.05 \\)** (đạt yêu cầu an toàn)

## 4. Ứng dụng Web App

Để hỗ trợ tính toán nhanh và kiểm tra các phương án thiết kế khác nhau, tôi đã phát triển một ứng dụng web:

**🔗 [Hydraulic Spillway Calculator](/apps/hydraulicspillway/)**

Ứng dụng cung cấp:
- Tính toán tự động các thông số thủy lực
- Thiết kế bể tiêu năng
- Kiểm tra hệ số an toàn
- Giao diện trực quan, dễ sử dụng

## 5. Kết luận

Bài viết đã trình bày chi tiết phương pháp tính toán thủy lực dốc nước và thiết kế bể tiêu năng dựa trên:

1. **Tính toán dòng chảy biến đổi dần** trên dốc thu hẹp
2. **Lý thuyết nước nhảy thủy lực** để xác định độ sâu liên hiệp
3. **Phương pháp lặp** để tính chiều sâu bể tiêu năng tối ưu
4. **Kiểm tra điều kiện nối tiếp** với hệ số an toàn

Kết quả thiết kế cho thấy:
- Bể tiêu năng có khả năng tiêu tán hiệu quả năng lượng (60-70%)
- Đảm bảo nối tiếp ổn định với dòng chảy hạ lưu
- Bảo vệ kênh hạ lưu khỏi xói lở

### Tài liệu tham khảo

1. TCVN 8216:2009 - Công trình thủy lợi - Yêu cầu thiết kế đập tràn
2. M.Đ. Chertousov - "Thủy lực các công trình xây dựng"
3. Phạm Ngọc Trần - "Thủy lực công trình thủy lợi"
4. USBR - "Design of Small Dams", Chapter on Spillways

---

*Bài viết này là phần của loạt bài về thiết kế công trình thủy lợi. Nếu bạn quan tâm đến các chủ đề khác như móng cọc, tường vây, hay phân tích kết cấu, hãy xem thêm các bài viết khác trên blog.*

