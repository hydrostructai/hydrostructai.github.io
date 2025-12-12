---
title: "Xây dựng Biểu đồ Tương tác Cột (P-M) theo 3 Tiêu chuẩn: TCVN, EC2 và ACI"
author_profile: true
author_name: "HST.AI"
date: 2025-12-12 10:00:00 +0700
layout: single
mathjax: true
toc: true
toc_sticky: true
toc_label: "📑 Mục Lục"

categories:
  - Structural Engineering
  - Algorithms
tags: [ShortCol, Interaction Diagram, TCVN 5574, Eurocode 2, ACI 318]
image: /assets/images/app-icons/shortcol2D.png
---

## Bài toán Cột Chịu Nén Lệch Tâm

Trong thiết kế kết cấu, **cột chịu nén lệch tâm ** là một trong những tình huống phức tạp nhất. Khác với nén đúng tâm (tải trọng dọc tác dụng ở tâm), nén lệch tâm có momen uốn phụ kèm theo, dẫn đến phân bố ứng suất không đều trên tiết diện.

Để kiểm chứng an toàn của cột dưới tác dụng kết hợp nén + uốn, kỹ sư sử dụng **biểu đồ tương tác P-M** (Interaction Diagram). Đây là biểu đồ biểu thị quan hệ giữa:

- **Trục tung (P)**: Sức chịu nén dọc (kN)
- **Trục hoành (M)**: Sức chịu momen uốn (kNm)

Biểu đồ giới hạn vùng **an toàn** (dưới đường cong) và vùng **không an toàn** (trên đường cong).

### Tại sao phải so sánh 3 tiêu chuẩn?

Thế giới hiện nay có nhiều tiêu chuẩn thiết kế khác nhau, mỗi tiêu chuẩn có **cách định nghĩa cường độ và hệ số bảo toàn riêng**:

| Tiêu chuẩn         | Áp dụng    | Đặc điểm                                             |
| ------------------ | ---------- | ---------------------------------------------------- |
| **TCVN 5574:2018** | Việt Nam   | Chuẩn quốc gia, đơn giản, cường độ trực tiếp         |
| **EC2:2004/2015**  | EU, UK     | Chuẩn châu Âu, hệ số bảo toàn rõ ràng (γ = 1.5/1.15) |
| **ACI 318-19**     | Mỹ, Canada | Chuẩn Mỹ, hệ số biến đổi theo cường độ, ε_cu thấp    |

**Vấn đề thực tế**: Một cột được thiết kế an toàn theo TCVN có thể **không đạt** tiêu chuẩn EC2 vì EC2 bảo toàn hơn. Ngược lại, cột an toàn theo ACI có thể có biên độ an toàn khác so với TCVN.

Công cụ **ShortCol** được phát triển để so sánh tự động các tiêu chuẩn, giúp kỹ sư lựa chọn phương án thiết kế phù hợp nhất.

---

## Phương Pháp Tính Toán: Tương Thích Biến Dạng

### Khái Niệm Cơ Bản

Phương pháp **Strain Compatibility** (Tương thích biến dạng) dựa trên giả thiết:

$$\text{"Mặt cắt phẳng vẫn giữ nguyên phẳng sau biến dạng"}$$

Điều này có nghĩa là biến dạng ở bất kỳ vị trí nào trên tiết diện tỉ lệ thuận với khoảng cách tới **trục trung hòa** (neutral axis).

### Quy Trình 5 Bước

#### Bước 1: Xác Định Hình Học Tiết Diện

Xác định kích thước và vị trí:

- Cột chữ nhật: $B$ (chiều rộng), $H$ (chiều cao)
- Cột tròn: $D$ (đường kính)
- Lớp bảo vệ: $d_c$ (cover)

#### Bước 2: Bố Trí Cốt Thép

Xác định vị trí của từng thanh thép:

- **Cột chữ nhật**: Thanh thép phân bố dọc theo chu vi tiết diện
- **Cột tròn**: Thanh thép phân bố trong đường tròn

Công thức bố trí cho cột chữ nhật với $N_b$ thanh:

$$\text{Chu vi lõi} = 2(B + H) - 4 \cdot d_c$$

$$\text{Khoảng cách} = \frac{\text{Chu vi lõi}}{N_b}$$

#### Bước 3: Quét Vị Trí Trục Trung Hòa

Thực hiện vòng lặp trên vị trí của trục trung hòa từ $c = -\infty$ đến $c = +\infty$:

$$c \in [-100 \text{ mm}, -50 \text{ mm}, ..., 0, ..., 50 \text{ mm}, 100 \text{ mm}]$$

Mỗi vị trí $c$ sẽ sinh ra **một điểm** trên biểu đồ P-M.

#### Bước 4: Tích Phân Lực & Momen

**Lực Bê Tông** ($F_c$):

Ứng suất bê tông phân bố trên vùng nén với cường độ thiết kế $R_b$ (hay $f_{cd}$ hay $0.85f'_c$):

$$F_c = R_b \times \text{Area}_{nén}$$

$$M_c = F_c \times \text{khoảng cách tới tâm}$$

**Lực Cốt Thép** ($F_s$):

Sử dụng **Strain Compatibility** để tính ứng suất mỗi thanh:

$$\varepsilon_s = \varepsilon_{cu} \times \frac{y_{bar} - y_{NA}}{c}$$

Trong đó:

- $\varepsilon_{cu}$ = biến dạng cực hạn bê tông (0.0035 cho TCVN/EC2; 0.003 cho ACI)
- $y_{bar}$ = vị trí Y của thanh thép
- $y_{NA}$ = vị trí trục trung hòa

Ứng suất thép với cắt ngọn:

$$\sigma_s = \min(|\varepsilon_s \times E_s|, R_s)$$

Lực thép:

$$F_s = \sigma_s \times A_s$$

#### Bước 5: Sinh Đường Cong Tương Tác

Tổng hợp lực dọc và momen:

$$P_u = \frac{F_c + \sum F_s}{1000} \text{ [kN]}$$

$$M_u = \frac{M_c + \sum M_s}{1,000,000} \text{ [kNm]}$$

Tập hợp tất cả các cặp $(M_u, P_u)$ từ các vị trí $c$ khác nhau tạo thành **đường cong tương tác**.

---

## So Sánh Sâu 3 Tiêu Chuẩn

### 1. TCVN 5574:2018 (Việt Nam)

#### Định Nghĩa Cường Độ

TCVN sử dụng **cường độ thiết kế trực tiếp** mà không chia hệ số bảo toàn:

$$R_b = f_{ck} \quad \text{(Không chia hệ số)}$$

$$R_s = f_{yk} \quad \text{(Không chia hệ số)}$$

Ví dụ: $f_{ck} = 25$ MPa $\Rightarrow R_b = 25$ MPa

#### Biến Dạng Cực Hạn

$$\varepsilon_{cu} = 0.0035 \quad \text{(cố định)}$$

#### Hệ Số Khối Ứng Suất

$$\alpha = 0.8 \quad \Rightarrow \quad a = 0.8 \times c$$

#### Độc Lập Tiêu Chuẩn

Giá trị $R_b$ và $R_s$ **đã tích hợp** hệ số bảo toàn, nên tiêu chuẩn này độc lập hơn với các tiêu chuẩn khác.

### 2. EC2:2004/2015 (Châu Âu)

#### Định Nghĩa Cường Độ

EC2 sử dụng **cường độ đặc trưng** chia cho **hệ số bảo toàn riêng**:

$$f_{cd} = 0.85 \times \frac{f_{ck}}{\gamma_c} = 0.85 \times \frac{f_{ck}}{1.5} \approx 0.567 \times f_{ck}$$

$$f_{yd} = \frac{f_{yk}}{\gamma_s} = \frac{f_{yk}}{1.15} \approx 0.87 \times f_{yk}$$

Ví dụ: $f_{ck} = 25$ MPa $\Rightarrow f_{cd} \approx 8.24$ MPa

**Hệ số bảo toàn rõ ràng:**

- $\gamma_c = 1.5$ (bê tông)
- $\gamma_s = 1.15$ (thép)

#### Ưu Điểm

✓ **Minh bạch**: Kỹ sư có thể thấy rõ hệ số bảo toàn  
✓ **Kiểm chứng độc lập**: Dễ dàng audit lại tính toán  
✓ **Bảo toàn hơn**: Chia 1.5 cho bê tông là rất thận trọng

#### Hệ Lệnh

| Khía Cạnh          | Giá Trị |
| ------------------ | ------- |
| $\varepsilon_{cu}$ | 0.0035  |
| $\alpha$           | 0.8     |
| $\gamma_c$         | 1.5     |
| $\gamma_s$         | 1.15    |

### 3. ACI 318-19 (Mỹ/Canada)

#### Định Nghĩa Cường Độ

ACI sử dụng **cường độ danh định** nhân với hệ số độc lập:

$$f_c'' = 0.85 \times f'_c \quad \text{(không chia hệ số)}$$

$$f_y = f_y \quad \text{(sử dụng trực tiếp)}$$

Ví dụ: $f'_c = 28$ MPa $\Rightarrow f_c'' = 23.8$ MPa

#### Biến Dạng Cực Hạn - **Điểm Khác Biệt Chính**

$$\varepsilon_{cu} = 0.003 \quad \text{(NHỎ HƠN EC2 & TCVN!)}$$

**Hệ quả quan trọng:**

Với biến dạng cực hạn nhỏ hơn, vùng nén bê tông cần phải lớn hơn để đạt được khả năng chịu lực tương tự. Điều này dẫn đến:

- Trục trung hòa **cao hơn**
- Đòn bẩy kháng lực **nhỏ hơn**
- Biểu đồ P-M **nhỏ hơn** (bảo toàn hơn)

#### Hệ Số Khối Ứng Suất - **Biến Đổi**

Khác với TCVN/EC2 ($\alpha = 0.8$ cố định), ACI có:

$$
\beta_1 = f(f'_c) = \begin{cases}
0.85 & \text{nếu } f'_c \leq 28 \text{ MPa} \\
0.85 - 0.05 \times \frac{f'_c - 28}{7} & \text{nếu } 28 < f'_c \leq 55 \\
0.65 & \text{nếu } f'_c > 55 \text{ MPa}
\end{cases}
$$

**Ý nghĩa**: Khi cường độ bê tông cao, vùng nén cần nhỏ lại để ngăn chặn sự thất bại spalling (nứt gọn).

#### Hệ Số An Toàn

ACI áp dụng hệ số giảm riêng biệt:

$$\phi = 0.75 \quad \text{(cho uốn + nén)}$$

Điều này **không tích hợp** vào $f_c''$, mà áp dụng sau tính toán.

### Bảng So Sánh Tổng Hợp

| Tiêu Chuẩn | Rb / fcd / σc        | εcu       | β / β1             | Đặc Điểm                     |
| ---------- | -------------------- | --------- | ------------------ | ---------------------------- |
| **TCVN**   | $f_{ck}$ (100%)      | 0.0035    | 0.8 (cố định)      | Đơn giản, trực tiếp          |
| **EC2**    | $0.567 f_{ck}$ (57%) | 0.0035    | 0.8 (cố định)      | Bảo toàn rõ ràng, γ=1.5/1.15 |
| **ACI**    | $0.85 f'_c$ (85%)    | **0.003** | Biến đổi 0.65-0.85 | Bảo toàn hơn (εcu nhỏ)       |

### Ví Dụ Tính Toán Cụ Thể

**Cho**: Cột $300 \times 400$ mm, $f_{ck} = 25$ MPa, $f_{yk} = 400$ MPa, 6 thanh $\Phi 18$

**Giả sử**: Trục trung hòa $c = 100$ mm (nén không quá cao)

#### TCVN

$$F_c = 25 \text{ MPa} \times 300 \text{ mm} \times 80 \text{ mm} = 600,000 \text{ N} = 600 \text{ kN}$$

$$\varepsilon_s = 0.0035 \times \frac{150 - 100}{100} = 0.00175$$

$$\sigma_s = 0.00175 \times 200,000 = 350 \text{ MPa} < 400 \text{ MPa (không chảy dẻo)}$$

$$F_s = 350 \times 1527 = 534.5 \text{ kN}$$

$$P_u = (600 + 534.5) = 1134.5 \text{ kN}$$

#### EC2

$$F_c = 8.24 \text{ MPa} \times 300 \times 80 = 197,760 \text{ N} \approx 198 \text{ kN}$$

$$\varepsilon_s = 0.0035 \times \frac{50}{100} = 0.00175$$

$$\sigma_s = 350 \text{ MPa} \Rightarrow F_s \approx 534 \text{ kN}$$

$$P_u \approx (198 + 534) = 732 \text{ kN} \quad (\approx 65\% \text{ của TCVN})$$

#### ACI (f'c ≈ 28 MPa)

$$F_c = 0.85 \times 28 \times 300 \times 0.85 \times 100 = 642.9 \text{ kN}$$

$$\varepsilon_s = 0.003 \times \frac{50}{100} = 0.0015 \quad \text{(NHỎ HƠN!)}$$

$$\sigma_s = 0.0015 \times 200,000 = 300 \text{ MPa}$$

$$F_s = 300 \times 1527 = 458.1 \text{ kN}$$

$$P_u \approx (643 + 458) = 1101 \text{ kN}$$

**Kết Luận**:

- **TCVN**: 1134.5 kN (100%, baseline)
- **ACI**: 1101 kN (97%, gần TCVN)
- **EC2**: 732 kN (65%, bảo toàn nhất)

**EC2 yêu cầu tiết diện lớn hơn** để đạt được cùng khả năng chịu lực vì hệ số bảo toàn 1.5 rất cao.

---

## Tính Hệ Số An Toàn: Phương Pháp Ray Casting

### Bài Toán

Cho:

- Điểm tải trọng thực tế: $(M_{load}, P_{load})$
- Đường cong sức chịu: Tập hợp điểm $(M_{cap}, P_{cap})$

Tìm: Hệ số an toàn $k$ sao cho:

$$k = \frac{\text{Khoảng cách từ gốc O đến điểm sức chịu}}{\text{Khoảng cách từ gốc O đến điểm tải trọng}}$$

### Ray Casting Method

**Bước 1**: Vẽ tia từ gốc O(0,0) qua điểm tải trọng

Tia tham số hóa:

$$(M, P) = t \cdot (M_{load}, P_{load}), \quad t > 0$$

**Bước 2**: Tìm giao điểm với đường cong

Mỗi đoạn thẳng trên đường cong:

$$(M, P) = (M_1, P_1) + s \cdot [(M_2, P_2) - (M_1, P_1)], \quad 0 \leq s \leq 1$$

**Bước 3**: Giải hệ phương trình

$$t \cdot M_{load} = M_1 + s \cdot (M_2 - M_1)$$

$$t \cdot P_{load} = P_1 + s \cdot (P_2 - P_1)$$

**Bước 4**: Tính hệ số

Giá trị $t$ chính là **hệ số an toàn**:

$$k = t = \frac{\text{Sức chịu}}{\text{Tải trọng}}$$

### Tiêu Chuẩn An Toàn

$$k \geq 1.0 \quad \Rightarrow \quad \text{An toàn}$$

$$k < 1.0 \quad \Rightarrow \quad \text{Không an toàn}$$

$$k = 1.0 \quad \Rightarrow \quad \text{Giới hạn}$$

---

## Những Sự Khác Biệt Chính & Ảnh Hưởng Thực Tế

### 1. Biến Dạng Cực Hạn Khác Nhau

| Tiêu Chuẩn | εcu    | Ảnh Hưởng                                               |
| ---------- | ------ | ------------------------------------------------------- |
| TCVN/EC2   | 0.0035 | Vùng nén **lớn hơn** ⟹ Sức chịu **cao hơn**             |
| ACI        | 0.003  | Vùng nén **nhỏ hơn** ⟹ Sức chịu **thấp hơn** (bảo toàn) |

**Hệ quả**: Cột có thể an toàn theo TCVN nhưng không an toàn theo ACI.

### 2. Hệ Số Bảo Toàn Tích Hợp vs Rõ Ràng

| Tiêu Chuẩn | Phương Pháp                             | Ưu Điểm   | Nhược Điểm             |
| ---------- | --------------------------------------- | --------- | ---------------------- |
| **TCVN**   | Tích hợp vào $R_b, R_s$                 | Đơn giản  | Khó kiểm chứng độc lập |
| **EC2**    | Rõ ràng ($\gamma_c=1.5, \gamma_s=1.15$) | Minh bạch | Phức tạp hơn           |
| **ACI**    | Riêng biệt ($\phi = 0.75$)              | Linh hoạt | Dễ bỏ sót $\phi$       |

### 3. Sự Thích Ứng với Cường Độ Cao (f'c > 50 MPa)

- **TCVN**: Không đề cập, $\alpha = 0.8$ vẫn cố định
- **EC2**: Có công thức điều chỉnh cho bê tông C90
- **ACI**: β1 giảm từ 0.85 xuống 0.65 khi $f'_c > 55$ MPa

**ACI phù hợp hơn** với các dự án dùng bê tông cường độ cao (như cầu, tòa nhà chọc trời).

---

## Tại Sao Cần Công Cụ Tự Động như ShortCol?

Xét đến những sự phức tạp trên:

1. **3 tiêu chuẩn khác nhau** ⟹ Cần tính 3 lần riêng biệt
2. **Phương pháp tính phức tạp**: Tương thích biến dạng, tích phân lực, ray casting
3. **Dễ sai sót** nếu tính bằng tay, đặc biệt ở các bước lặp vòng
4. **Cần so sánh nhanh** để lựa chọn tiêu chuẩn phù hợp

**ShortCol** giải quyết vấn đề bằng cách:

✅ Tự động quét trục trung hòa  
✅ Tích hợp lực & momen chính xác  
✅ Tính hệ số an toàn bằng ray casting  
✅ Vẽ biểu đồ so sánh 3 tiêu chuẩn  
✅ Xuất kết quả để kiểm chứng

Nhờ vậy, kỹ sư tiết kiệm **hàng giờ tính toán** và **giảm thiểu sai sót**.

---

## Kết Luận

Biểu đồ tương tác P-M là công cụ không thể thiếu trong thiết kế cột chịu nén lệch tâm. Tuy nhiên, mỗi tiêu chuẩn thiết kế (TCVN, EC2, ACI) có cách định nghĩa cường độ, biến dạng, và hệ số bảo toàn khác nhau, dẫn đến kết quả **có thể khác biệt đáng kể**.

### Những Điểm Chính:

1. **TCVN**: Đơn giản, trực tiếp, bảo toàn vừa phải
2. **EC2**: Bảo toàn rõ ràng (γ=1.5), phù hợp với tiêu chuẩn quốc tế
3. **ACI**: Bảo toàn nhất (εcu=0.003), phù hợp bê tông cường độ cao

### Lời Khuyên Thực Tế:

- Chọn tiêu chuẩn theo **yêu cầu dự án** và **quy định địa phương**
- Khi có sự **lựa chọn**, hãy **so sánh tất cả 3 tiêu chuẩn** để hiểu rõ ảnh hưởng
- Sử dụng **công cụ tự động** để giảm sai sót và tiết kiệm thời gian
- **Luôn xác nhận** kết quả bằng cách kiểm tra một vài điểm tay

Công cụ **ShortCol** hỗ trợ điều này một cách hoàn hảo, cho phép kỹ sư **so sánh trực tiếp**, **hiểu rõ sự khác biệt**, và **lựa chọn giải pháp tối ưu** cho từng dự án.

---

**Tham khảo thêm:**

- TCVN 5574:2018 - Tiêu chuẩn thiết kế kết cấu bê tông cốt thép
- EN 1992-1-1:2004 - Eurocode 2: Design of Concrete Structures
- ACI 318-19 - Building Code Requirements for Structural Concrete
- ShortCol - Web-based tool for interaction diagram calculation

---

_Bài viết này là một phần của dự án ShortCol - công cụ tính toán biểu đồ tương tác cột theo 3 tiêu chuẩn quốc tế._
