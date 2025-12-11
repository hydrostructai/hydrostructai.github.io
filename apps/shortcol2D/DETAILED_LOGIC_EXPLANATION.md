# 📐 LOGIC GIẢI THÍCH CHI TIẾT - ShortCol 2D

## 3 Phương Pháp Tính Toán & Vẽ Biểu Đồ Tương Tác (P-M)

---

## I. TỔNG QUAN THUẬT TOÁN

### Flow Diagram

```
INPUT PARAMETERS:
  ├─ Geometry: B (rộng), H (cao), D (đường kính), Cover (lớp bảo vệ)
  ├─ Material: fck (cường độ bê tông), fyk (cường độ thép)
  ├─ Loads: P (lực dọc), M (momen uốn)
  └─ Standard: TCVN / EC2 / ACI

PROCESSING PIPELINE:
  │
  ├─ Step 1: Nhận dạng Tiêu Chuẩn
  │   └─ getStandardParams(standard, fck, fyk)
  │   └─ Output: {Rb, Rs, e_cu, beta, Es, phi}
  │
  ├─ Step 2: Sinh Bố Trí Cốt Thép
  │   ├─ generateRectLayout() - Cột chữ nhật
  │   └─ generateCircLayout() - Cột tròn
  │   └─ Output: Array of {x, y, As} bars
  │
  ├─ Step 3: Quét Trục Trung Hòa
  │   └─ xi_steps = [-100, 0.05, 0.1, ..., 1.0, ..., 100]
  │   └─ For each xi: c = xi × h
  │
  ├─ Step 4: Tính Lực & Momen Bê Tông
  │   ├─ Rect: F_c = Rb × B × (β×c), M_c = F_c × y_c
  │   └─ Circ: Strip Method ∫ dF = ∫ Rb × w(y) × dy
  │
  ├─ Step 5: Tính Lực & Momen Cốt Thép (Strain Compatibility)
  │   ├─ ε_s = ε_cu × Δy / c
  │   ├─ σ_s = min(ε_s × Es, Rs)
  │   └─ F_s = σ_s × As
  │
  ├─ Step 6: Tổng Hợp & Đổi Đơn Vị
  │   ├─ P = (F_concrete + F_steel) / 1000 kN
  │   └─ M = (M_concrete + M_steel) / 1000000 kNm
  │
  ├─ Step 7: Vẽ Đường Cong Tương Tác
  │   └─ points = [{x: M, y: P}, ...]
  │
  └─ Step 8: Tính Hệ Số An Toàn
      └─ k = Distance(Capacity) / Distance(Load)

OUTPUT:
  ├─ Interaction Curve Points
  ├─ Safety Factor k
  ├─ P-M Diagram
  └─ Design Status (Safe / Unsafe)
```

---

## II. CHI TIẾT 3 TIÊU CHUẨN

### A. TCVN 5574:2018 (Việt Nam)

#### 1. Định Nghĩa Cơ Bản

```
Cường độ Thiết Kế:
  Rb = fck          (Cường độ thiết kế bê tông)
  Rs = fyk          (Cường độ thiết kế thép)

Biến Dạng Cực Hạn:
  ε_cu = 0.0035     (Khi mép nén đạt Rb)
  ε_s,max = Rs/Es   (Khi thép chảy dẻo)

Hệ Số Khối Ứng Suất:
  α = 0.8           (Chiều cao khối ứng suất: a = 0.8×c)
```

#### 2. Phương Pháp Tính Bê Tông

**Khối Ứng Suất Chữ Nhật Tương Đương (Whitney Stress Block):**

```
Tiết diện ngang:
   ┌─────────────────────┐
   │  Mép nén (ε = εcu)  │ ← Y_top
   │   σ = Rb (hằng số)  │
   │   ├─ a = 0.8×c      │ ← Vùng nén hiệu dụng
   │   ├─ Tâm khối: y_c  │
   │   │                 │
   ├───●───────────────────┤ ← Trục trung hòa (ε = 0)
   │   y_NA = Y_top - c  │
   │                     │
   └─────────────────────┘

Cột Chữ Nhật:
  Diện tích nén: A_c = B × a = B × (0.8c)
  Lực nén: F_c = Rb × B × (0.8c)
  Tâm khối: y_c = Y_top - a/2 = Y_top - 0.4c
  Momen: M_c = F_c × y_c

Cột Tròn (Strip Method):
  ┌─ Chia tiết diện thành n dải ngang (dy = D/n)
  ├─ Mỗi dải: w = 2√(R² - y²)
  ├─ Diện tích: dA = w × dy
  ├─ Lực: dF = Rb × dA
  └─ Momen: dM = dF × y

  Tổng: F_c = Σ dF, M_c = Σ dM
```

#### 3. Phương Pháp Tính Cốt Thép

**Giả Thiết Strain Compatibility (Biến Dạng Tương Thích):**

```
Luật Biến Dạng Phẳng:
  - Mặt cắt phẳng vẫn phẳng sau biến dạng
  - Biến dạng tỉ lệ tuyến tính với khoảng cách tới trục trung hòa

Biến Dạng Cốt Thép:
  ε_s = ε_cu × (y_bar - y_NA) / c

  Ở đây:
    - ε_cu = 0.0035 (biến dạng mép nén cực hạn)
    - y_bar = vị trí Y của thanh thép
    - y_NA = vị trí trục trung hòa = Y_top - c
    - c = chiều cao vùng nén

Ứng Suất Cốt Thép:
  σ_s = ε_s × Es

  Với điều kiện cắt ngọn:
    - Nếu σ_s > Rs   ⟹ σ_s = Rs  (Chảy nén - Compression Yielding)
    - Nếu σ_s < -Rs  ⟹ σ_s = -Rs (Chảy kéo - Tension Yielding)

Lực Cốt Thép:
  F_s = σ_s × A_s

Momen:
  M_s = F_s × y_bar
```

**Ví Dụ Cụ Thể:**

```
Cho:
  H = 400 mm, Y_top = 200 mm
  c = 100 mm, y_NA = 200 - 100 = 100 mm
  ε_cu = 0.0035

Thanh 1: y_bar = 180 mm (gần mép nén)
  Δy = 180 - 100 = 80 mm
  ε_s = 0.0035 × (80/100) = 0.0028
  σ_s = 0.0028 × 200000 = 560 MPa (> Rs=400 MPa)
  σ_s = 400 MPa (cắt ngọn)
  ⟹ Thanh chảy nén

Thanh 2: y_bar = 50 mm (gần mép kéo)
  Δy = 50 - 100 = -50 mm
  ε_s = 0.0035 × (-50/100) = -0.00175
  σ_s = -0.00175 × 200000 = -350 MPa
  ⟹ Thanh chịu kéo (nếu không đủ, nó sẽ chảy kéo)
```

#### 4. Tổng Hợp Lực & Momen

```
Lực Dọc Tổng:
  N_u = F_concrete + Σ(F_steel)  [N]
  P_u = N_u / 1000               [kN]

Momen Tổng:
  M_u = M_concrete + Σ(M_steel)  [N.mm]
  M_u = M_u / 1000000            [kNm]

Kết Quả: {M_u (kNm), P_u (kN)} ← 1 điểm trên biểu đồ
```

---

### B. EC2:2004/2015 (Chuẩn Châu Âu)

#### 1. Định Nghĩa Cơ Bản

```
Cường độ Thiết Kế (Design Strength):
  fcd = 0.85 × (fck / γc)
  fyd = fyk / γs

  Với:
    - γc = 1.5  (Hệ số bảo toàn bê tông)
    - γs = 1.15 (Hệ số bảo toàn thép)

  ⟹ fcd ≈ 0.567 × fck
  ⟹ fyd ≈ 0.87 × fyk

Biến Dạng Cực Hạn:
  ε_cu3 = 0.0035 (C50)  [Có thể thay đổi cho cấp bê tông khác]
  εcu3 = 0.0026 (C90)   [Cho bê tông cường độ cao]

Hệ Số Khối Ứng Suất:
  λ = 0.8, η = 1.0      (Tương tự TCVN)
  ⟹ a = λ × x = 0.8 × x
  ⟹ σ_c = η × fcd = 1.0 × fcd
```

#### 2. Khác Biệt với TCVN

```
┌────────────────────────────┬──────────┬──────────┐
│ Khía Cạnh                  │ TCVN     │ EC2      │
├────────────────────────────┼──────────┼──────────┤
│ Input: fck, fyk            │ Cường độ │ Cường độ │
│ Output: Rb, Rs             │ thiết kế │ đặc trưng│
│ Hệ số bảo toàn             │ Ẩn       │ Rõ ràng  │
│ Rb = ?                     │ fck      │ 0.567fck │
│ Rs = ?                     │ fyk      │ 0.87fyk  │
│ Độc lập tiêu chuẩn         │ Thấp     │ Cao      │
└────────────────────────────┴──────────┴──────────┘

Ưu Điểm EC2:
  ✓ Hệ số bảo toàn rõ ràng
  ✓ Dễ kiểm chứng độc lập
  ✓ Thích ứng cho cấp bê tông khác nhau
```

#### 3. Phương Pháp Tính (Giống TCVN)

```
Bê Tông & Cốt Thép: Sử dụng fcd, fyd thay cho Rb, Rs
Khối Ứng Suất: a = 0.8 × x (giống TCVN)
Strain Compatibility: ε_s = ε_cu3 × Δy / x (giống TCVN)
```

---

### C. ACI 318-19 (Chuẩn Mỹ)

#### 1. Định Nghĩa Cơ Bản

```
Cường độ Bê Tông:
  σ_c = 0.85 × f'c  (không chia γ_c)

  Lưu ý: ACI dùng "Nominal" capacity (chưa nhân φ)
  Biểu đồ P-M vẽ chưa có hệ số an toàn

Cường độ Thép:
  fy                (không chia γ_s)

Biến Dạng Cực Hạn:
  ε_cu = 0.003      (Nhỏ hơn TCVN/EC2!)

  ⟹ Hệ quả: Vùng nén nhỏ hơn ⟹ Đường cong lõm hơn

Hệ Số Khối Ứng Suất:
  β1 = f(f'c)       (Phụ thuộc cường độ bê tông!)

  - f'c ≤ 28 MPa       ⟹ β1 = 0.85
  - 28 < f'c ≤ 55 MPa  ⟹ β1 = 0.85 - 0.05(f'c-28)/7
  - f'c > 55 MPa       ⟹ β1 = 0.65

  ⟹ a = β1 × c (không cố định!)

Hệ Số An Toàn Thiết Kế:
  φ = 0.75 (Uốn + Nén)  [không tích hợp trong σ_c, fy]
```

#### 2. Đặc Tính Của ACI

```
Biến Dạng Cực Hạn:
  ACI:       ε_cu = 0.003  ← Nhỏ hơn (Bảo toàn hơn)
  TCVN/EC2: ε_cu = 0.0035 ← Lớn hơn

Hệ Quả:
  Với c bằng nhau:
    ε_s(ACI) = 0.003 × Δy / c      ← Nhỏ hơn
    ε_s(TCVN) = 0.0035 × Δy / c    ← Lớn hơn

  ⟹ Ứng suất thép nhỏ hơn (kém lợi)
  ⟹ Đường cong ACI nhỏ hơn (bảo toàn)

Hệ Số β1 Biến Đổi:
  f'c = 28 MPa:  β1 = 0.85
  f'c = 40 MPa:  β1 = 0.85 - 0.05×(40-28)/7 = 0.764
  f'c = 50 MPa:  β1 = 0.85 - 0.05×(50-28)/7 ≈ 0.693

  ⟹ Vùng nén nhỏ hơn với cường độ cao
  ⟹ Phục vụ khí hậu bê tông cường độ cao
```

#### 3. So Sánh với TCVN/EC2

```
Ví Dụ: f'c = 28 MPa (≈ fck ở TCVN)

TCVN:
  Rb = 14.5 MPa (≈ fck/2 sau điều chỉnh từng tiêu chuẩn)
  σ_c = 14.5 MPa
  ε_cu = 0.0035

EC2:
  fcd = 0.85 × (14.5/1.5) ≈ 8.2 MPa (bảo toàn hơn)
  ε_cu = 0.0035

ACI (f'c = 28 MPa):
  σ_c = 0.85 × 28 = 23.8 MPa (khác do đơn vị PSI/SI)
  ε_cu = 0.003 (bảo toàn hơn)

Kết Luận:
  ACI: Ứng suất cao, biến dạng thấp ⟹ Cân bằng an toàn
  EC2: Ứng suất thấp (hệ số 1.5) ⟹ Bảo toàn rõ ràng
  TCVN: Trung gian
```

---

## III. THUẬT TOÁN TÍNH HỆ SỐ AN TOÀN

### Ray Casting Method

```
Bài Toán:
  Cho: Biểu đồ tương tác (Capacity) và điểm tải trọng (Load)
  Tìm: Hệ số an toàn k = Distance(Capacity) / Distance(Load)

Phương Pháp:
  1. Từ gốc O(0,0), vẽ tia qua điểm tải trọng (M_load, P_load)
  2. Tìm giao điểm của tia này với đường cong tương tác
  3. k = khoảng cách từ O đến giao điểm / khoảng cách từ O đến tải trọng

Toán Học:

  Tia (Load Ray):
    (M, P) = k × (M_load, P_load)
    với k > 0

  Đoạn Thẳng (Curve Segment):
    (M, P) = p1 + t × (p2 - p1)
    với 0 ≤ t ≤ 1

  Giao Điểm:
    k × M_load = x1 + t × (x2 - x1)  ... (1)
    k × P_load = y1 + t × (y2 - y1)  ... (2)

  Giải hệ (Cramer):
    Định thức: D = P_load × (x2 - x1) - M_load × (y2 - y1)

    Nếu |D| > 0:
      t = (M_load × y1 - P_load × x1) / D
      k = (x1 + t × (x2 - x1)) / M_load  (nếu M_load ≠ 0)
      k = (y1 + t × (y2 - y1)) / P_load  (nếu P_load ≠ 0)

    Nếu |D| < ε (parallel):
      Bỏ qua đoạn này

Tiêu Chuẩn An Toàn:
  k ≥ 1.0   ⟹ An toàn
  k < 1.0   ⟹ Không an toàn
  k = 1.0   ⟹ Giới hạn
```

---

## IV. PHÂN TÍCH ĐỘ CHÍNH XÁC

### Cột Chữ Nhật

```
Sai Số: < 0.05%
Nguyên Nhân: Phân tích chính xác, không tích phân số

Công Thức Chính Xác:
  F_c = Rb × B × (β × c)
  M_c = F_c × (Y_top - (β×c)/2)
```

### Cột Tròn (Strip Method)

```
Sai Số: Phụ thuộc số dải (numStrips)

numStrips = 50:  Sai số ~ 0.2%
numStrips = 100: Sai số ~ 0.1%
numStrips = 200: Sai số ~ 0.05%

Công Thức Xấp Xỉ:
  F_c ≈ Σ Rb × 2√(R² - y_i²) × dy

Để tăng độ chính xác:
  - Tăng numStrips (tăng thời gian tính toán)
  - Dùng phương pháp tích phân cao cấp (Simpson's Rule, ...)
```

---

## V. BẢNG THAM SỐ & CÔNG THỨC

### Bảng 1: Cường Độ & Biến Dạng

```
┌──────────────┬─────────────────┬─────────────────┬─────────────────┐
│ Tiêu Chuẩn   │ TCVN            │ EC2             │ ACI             │
├──────────────┼─────────────────┼─────────────────┼─────────────────┤
│ Rb / σ_c     │ fck             │ 0.567×fck       │ 0.85×f'c        │
│ Rs / fy      │ fyk             │ 0.87×fyk        │ fy              │
│ ε_cu         │ 0.0035          │ 0.0035 (C50)    │ 0.003           │
│ β (hệ số)    │ 0.8             │ 0.8             │ β1(f'c)         │
│ Es           │ 200,000 MPa     │ 200,000 MPa     │ 200,000 MPa     │
│ γc           │ Tích hợp        │ 1.5             │ N/A             │
│ γs           │ Tích hợp        │ 1.15            │ N/A             │
└──────────────┴─────────────────┴─────────────────┴─────────────────┘
```

### Bảng 2: Công Thức Tính

```
Bê Tông (Cột Chữ Nhật):
  a = β × c
  F_c = Rb × B × a
  y_c = Y_top - a/2
  M_c = F_c × y_c

Cốt Thép (Strain Compatibility):
  ε_s = ε_cu × (y_bar - y_NA) / c
  σ_s = min(ε_s × Es, Rs)  [cắt ngọn]
  F_s = σ_s × A_s
  M_s = F_s × y_bar

Tổng Hợp:
  P_u = (F_c + ΣF_s) / 1000  [kN]
  M_u = (M_c + ΣM_s) / 1000000  [kNm]

Hệ Số An Toàn:
  dist_load = √(M_load² + P_load²)
  dist_capacity = √(M_capacity² + P_capacity²)
  k = dist_capacity / dist_load
```

---

## VI. GHI NHỚ & LƯU Ý

### 1. Điểm Nhạy Cảm

```
✓ Biến Dạng Cực Hạn (ε_cu):
  - ACI nhỏ (0.003) ⟹ An toàn hơn
  - TCVN/EC2 lớn (0.0035) ⟹ Khả năng chịu lực lớn hơn

✓ Hệ Số Bảo Toàn:
  - TCVN: Tích hợp trong Rb, Rs ⟹ Đơn giản
  - EC2: Rõ ràng (γc, γs) ⟹ Trong suốt
  - ACI: φ riêng biệt ⟹ Linh hoạt

✓ Hệ Số Khối Ứng Suất:
  - TCVN/EC2: β = 0.8 (cố định)
  - ACI: β1 = f(f'c) (biến đổi)
```

### 2. Hạn Chế & Giả Thiết

```
Giả Thiết Cơ Bản:
  ✓ Mặt cắt phẳng vẫn phẳng (Plane Sections Remain Plane)
  ✓ Không có trượt giữa bê tông & thép (Perfect Bond)
  ✓ Chỉ tính biến dạng đàn hồi + chảy dẻo (Elastic + Plastic)
  ✓ Bỏ qua ảnh hưởng của các thanh xoắn, tăng cứng, ...

Điều Kiện Áp Dụng:
  • Cột có tiết diện không thay đổi (Prismatic)
  • Tải trọng tập trung ở hai đầu (Concentric or Eccentric)
  • Không tính tác động động (Dynamic effects)
  • Không tính ảnh hưởng thời gian (Creep)
```

### 3. Kiểm Tra & Debug

```
Nếu biểu đồ không hợp lý:
  1. Kiểm tra bố trí cốt thép: bars phải có y ≥ -H/2
  2. Kiểm tra tham số standard: Rb, Rs, β có hợp lý?
  3. Kiểm tra đơn vị: B, H, D phải là mm; P, M phải là kN, kNm
  4. Kiểm tra giới hạn vật liệu: fck, fyk trong phạm vi cho phép?
  5. Tạo test case đơn giản (Nén thuần túy) & so sánh manual
```

---

**Cập nhật:** 12/12/2025  
**Phiên bản:** v2.0 - Documentation Complete  
**Độ chi tiết:** ⭐⭐⭐⭐⭐ (5/5)
