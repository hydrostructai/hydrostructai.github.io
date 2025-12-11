# 📐 ShortCol 2D: Logic Tính Toán & Vẽ Biểu Đồ Tương Tác (P-M)

## 3 Tiêu Chuẩn: TCVN, EC2, ACI

---

## 1. TỔNG QUAN QUY TRÌNH

```
INPUT:
  └─ Geometry (B, H, D, Cover)
     Material (Rb, Rs)
     Reinforcement (Nb, d_bar)
     Loads (P, M)

PROCESSING:
  ├─ Step 1: Sinh bố trí cốt thép (generateRectLayout / generateCircLayout)
  ├─ Step 2: Quét chiều cao vùng nén (xi_steps = [0.05, 0.1, ..., 1.0])
  ├─ Step 3: Tính khả năng chịu lực bê tông & cốt thép (Strain Compatibility)
  ├─ Step 4: Xây dựng đường bao tương tác (Interaction Curve)
  └─ Step 5: Tính hệ số an toàn (Ray Casting Method)

OUTPUT:
  └─ Curve Points {M, P}
     Safety Factor k
     Plot P-M Diagram
```

---

## 2. CHI TIẾT 3 TIÊU CHUẨN

### **A. TCVN 5574:2018 (Chuẩn Việt Nam)**

#### 2A.1 Định Nghĩa

| Tham Số                        | Ký Hiệu   | Giá Trị          | Ghi Chú                           |
| ------------------------------ | --------- | ---------------- | --------------------------------- |
| **Cường độ bê tông (Nén)**     | Rb        | f'c/1.3 (C18)    | Cường độ thiết kế                 |
| **Cường độ thép (Chảy)**       | Rs        | fy/1.15 (HRB400) | Cường độ thiết kế                 |
| **Biến dạng giới hạn bê tông** | εcu       | 0.0035           | Khi mép nén đạt 0.85Rb            |
| **Hệ số khối ứng suất**        | α (alpha) | 0.8              | a = 0.8c (hoặc a = c tùy cấp bền) |
| **Modul đàn hồi thép**         | Es        | 200,000 MPa      | Không đổi                         |

#### 2A.2 Phương Pháp Tính

**Bước 1: Xác định trục trung hòa**

```
Tại vị trí xi = c/h:
  - Biến dạng cực hạn ở mép nén: ε_cu = 0.0035
  - Biến dạng tại trục trung hòa: ε = 0
  - Trục trung hòa: y_NA = Y_top - c
```

**Bước 2: Tính ứng suất bê tông**

```
Khối ứng suất chữ nhật tương đương (Whitney Stress Block):
  - Cường độ: σ_c = Rb (hằng số trong vùng nén)
  - Vùng nén hiệu dụng: a = α*c = 0.8*c
  - Tâm khối nén: y_c = Y_top - a/2 = Y_top - 0.4*c

Cột chữ nhật:
  - Diện tích nén: A_c = B × a
  - Lực nén: F_c = Rb × B × a

Cột tròn (Strip Method):
  - Chia nhỏ thành 100 dải ngang (dy = D/100)
  - Tại mỗi dải: w = 2√(R² - y²)
  - Diện tích dải: dA = w × dy
  - Lực: dF = Rb × dA
```

**Bước 3: Tính ứng suất cốt thép (Strain Compatibility)**

```
Biến dạng thép tại thanh:
  ε_s = ε_cu × (y_bar - y_NA) / c

Ứng suất thép:
  σ_s = ε_s × Es  (với điều kiện cắt ngọn)

  Nếu σ_s > Rs  ⟹  σ_s = Rs  (Chảy nén)
  Nếu σ_s < -Rs ⟹  σ_s = -Rs (Chảy kéo)

Lực thép:
  F_s = σ_s × A_s
```

**Bước 4: Tổng hợp**

```
Lực dọc tổng: N_u = Σ(F_c) + Σ(F_s)  [N → kN ÷1000]
Momen tổng:  M_u = Σ(F_c × y_c) + Σ(F_s × y_bar)  [N.mm → kNm ÷1000000]
```

---

### **B. EUROCODE 2 (EC2:2004/2015)**

#### 2B.1 Định Nghĩa

| Tham Số                        | Ký Hiệu | Giá Trị                     | Ghi Chú                           |
| ------------------------------ | ------- | --------------------------- | --------------------------------- |
| **Cường độ bê tông (Nén)**     | fcd     | 0.85 × fck / γc             | Thường γc = 1.5 → fcd = 0.567×fck |
| **Cường độ thép (Chảy)**       | fyd     | fyk / γs                    | γs = 1.15 → fyd = 0.87×fyk        |
| **Biến dạng giới hạn bê tông** | εcu3    | 0.0035 (C50) / 0.0026 (C90) | Phụ thuộc cấp bê tông             |
| **Hệ số khối ứng suất**        | λ, η    | λ=0.8, η=1.0                | a = λ×x, σ = η×fcd                |
| **Modul đàn hồi thép**         | Es      | 200,000 MPa                 | Không đổi                         |

#### 2B.2 Phương Pháp Tính

**Khác biệt so với TCVN:**

```
1. Hệ số giảm ứng suất:
   - TCVN: Dùng Rb (cường độ thiết kế sẵn)
   - EC2: Dùng fcd = 0.85 × (fck / 1.5) cho bê tông
           fyd = fyk / 1.15 cho thép

2. Khối ứng suất:
   - TCVN: a = 0.8×c (cố định)
   - EC2: a = 0.8×x (cố định) ← Giống nhau
         σ = 1.0×fcd (cố định)

3. Biến dạng giới hạn:
   - TCVN: εcu = 0.0035 (cố định)
   - EC2: εcu = 0.0035 (C50) ← Thay đổi theo cấp bê tông
           εcu = 0.0026 (C90)

4. Kiểm tra Strain Compatibility:
   - Bê tông: εc ≤ εcu3
   - Thép: εs ≤ εyd = fyd / Es = (fyk/1.15) / 200000
```

**Công thức tính toán (giống TCVN về cơ bản):**

```
ε_s = ε_cu × (d - x) / x
σ_s = ε_s × Es  (cắt ngọn tại fyd)
F_c = η × fcd × b × a  (với a = λ × x)
M_u = Σ(F_c × y_c) + Σ(F_s × y_bar)
```

---

### **C. ACI 318-19 (Chuẩn Mỹ)**

#### 2C.1 Định Nghĩa

| Tham Số                        | Ký Hiệu | Giá Trị             | Ghi Chú                 |
| ------------------------------ | ------- | ------------------- | ----------------------- |
| **Cường độ bê tông (Nén)**     | f'c     | 28 MPa (4000 psi)   | Cường độ đặc trưng      |
| **Cường độ thép (Chảy)**       | fy      | 400 MPa (60 ksi)    | Cường độ đặc trưng      |
| **Hệ số strength reduction**   | φ (phi) | 0.65-0.9            | Tùy dạng phá hoại       |
| **Biến dạng giới hạn bê tông** | εcu     | 0.003               | Khi ứng suất = 0.85×f'c |
| **Hệ số khối ứng suất**        | β1      | 0.85 (f'c ≤ 28 MPa) | a = β1 × c              |
| **Hệ số hiệu chỉnh**           | 0.85    | Ngoài cùng          | σ_c = 0.85×f'c          |

#### 2C.2 Phương Pháp Tính

**Quy trình ACI:**

```
1. Cường độ thiết kế:
   - Bê tông: f'c (giá trị đặc trưng, không chia γc)
   - Thép: fy (giá trị đặc trưng, không chia γs)

   ⟹ Nhưng Moment thiết kế: Mu = φ × Mn (Nominal)
   ⟹ Lực thiết kế: Pu = φ × Pn (Nominal)

2. Khối ứng suất:
   - Cường độ đẳng thứ: σ_c = 0.85 × f'c (không phải Rb)
   - Chiều cao vùng nén: a = β1 × c
   - β1 = 0.85 (nếu f'c ≤ 28 MPa)
   - β1 = 0.85 - 0.05×(f'c - 28)/7 (nếu 28 < f'c ≤ 55 MPa)

3. Strain Compatibility:
   - ε_cu = 0.003 (ACI quy định)
   - ε_s = ε_cu × (d - c) / c
   - σ_s = min(ε_s × Es, fy)

4. Biểu đồ tương tác:
   - ACI: Vẽ với "Nominal" capacity (chưa nhân φ)
   - Có thể thêm "Design" capacity (sau nhân φ)
```

**So sánh:** ACI dùng 0.003 trong khi TCVN/EC2 dùng 0.0035

---

## 3. SO SÁNH 3 TIÊU CHUẨN

```
┌──────────────────┬──────────────┬──────────────┬──────────────┐
│ Tham Số          │ TCVN 5574    │ EC2          │ ACI 318-19   │
├──────────────────┼──────────────┼──────────────┼──────────────┤
│ Cường độ bê tông  │ Rb (thiết kế)│ fcd = 0.567f│ 0.85 f'c     │
│ Cường độ thép     │ Rs (thiết kế)│ fyd = 0.87f │ fy           │
│ Biến dạng giới   │ 0.0035       │ 0.0035*     │ 0.003        │
│ hạn bê tông (εcu)│              │ *tùy cấp    │              │
│ Hệ số khối ứng   │ 0.8×c        │ 0.8×x       │ β1×c         │
│ suất             │              │             │ (β1 ≈ 0.85)  │
│ Hệ số strength   │ N/A (dùng Rb,│ Ngầm (trong │ φ = 0.65-0.9 │
│ reduction (φ)    │ Rs)          │ fcd, fyd)   │              │
│ Áp dụng bao       │ Việt Nam     │ EU, UK, ...│ Mỹ, Canada   │
└──────────────────┴──────────────┴──────────────┴──────────────┘
```

---

## 4. LOGIC TÍNH TOÁN CHI TIẾT (PSEUDOCODE)

```javascript
/**
 * CORE CALCULATION FUNCTION
 * Input: standard (TCVN, EC2, ACI), geometry, material, reinforcement
 * Output: Array of {M, P} points forming interaction curve
 */
function calculateInteractionCurve(standard, geom, mat, bars) {

  const points = [];
  const params = getStandardParams(standard, mat);
  // params = {
  //   fcd_or_Rb: cường độ thiết kế bê tông,
  //   fyd_or_Rs: cường độ thiết kế thép,
  //   εcu: biến dạng cực hạn,
  //   β: hệ số khối ứng suất,
  //   Es: modul thép (thường 200000),
  //   description: "TCVN / EC2 / ACI"
  // }

  // Quét vị trí trục trung hòa
  const xi_steps = [0, 0.05, 0.1, ..., 1.0, ...];

  for (let xi of xi_steps) {
    const c = xi × h_section;  // Chiều cao vùng nén

    // ============================================
    // TÍNH LỰC & MOMEN BÊ TÔNG
    // ============================================
    let F_concrete = 0, M_concrete = 0;

    if (c > 0) {
      const a_eff = params.β × c;  // Chiều cao khối ứng suất

      if (type === 'rect') {
        F_concrete = params.fcd_or_Rb × B × a_eff;
        const y_c = Y_top - a_eff/2;
        M_concrete = F_concrete × y_c;
      } else {
        // Strip method: ∫ dF × dy
        for each strip in circular section {
          if strip is in compression {
            dF = params.fcd_or_Rb × width(y) × dy;
            F_concrete += dF;
            M_concrete += dF × y;
          }
        }
      }
    }

    // ============================================
    // TÍNH LỰC & MOMEN CỐT THÉP (Strain Compatibility)
    // ============================================
    let F_steel = 0, M_steel = 0;

    for each bar {
      // Biến dạng theo luật biến dạng phẳng
      ε_s = params.εcu × (bar.y - y_NA) / c;

      // Ứng suất: σ = E × ε (giới hạn bằng fyd_or_Rs)
      σ_s = ε_s × params.Es;
      if (σ_s > params.fyd_or_Rs)  σ_s = params.fyd_or_Rs;
      if (σ_s < -params.fyd_or_Rs) σ_s = -params.fyd_or_Rs;

      // Lực & momen của thanh
      F_steel += σ_s × bar.As;
      M_steel += σ_s × bar.As × bar.y;
    }

    // ============================================
    // TỔNG HỢP
    // ============================================
    const P_u = (F_concrete + F_steel) / 1000;      // kN
    const M_u = (M_concrete + M_steel) / 1000000;   // kNm

    points.push({ x: M_u, y: P_u });
  }

  return points;
}

/**
 * HỆ SỐ AN TOÀN (Ray Casting)
 * k = Distance to Capacity / Distance to Load
 */
function calculateSafetyFactor(P_load, M_load, curvePoints) {

  const dist_load = √(M_load² + P_load²);
  if (dist_load < 1e-3) return 999;  // Tải trọng = 0

  let bestK = null;

  // Duyệt từng đoạn thẳng của biểu đồ
  for (let i = 0; i < curvePoints.length - 1; i++) {
    const p1 = curvePoints[i];
    const p2 = curvePoints[i+1];

    // Tìm giao điểm: Tia từ O qua (M_load, P_load) cắt đoạn p1-p2
    // Tia: (M, P) = k × (M_load, P_load)
    // Đoạn: (M, P) = p1 + t × (p2 - p1), 0 ≤ t ≤ 1

    const k = solveRaySegmentIntersection(
      M_load, P_load,  // Tia từ O
      p1, p2,          // Đoạn trên biểu đồ
      0, 1             // Giới hạn t
    );

    if (k > 0 && (bestK === null || k < bestK)) {
      bestK = k;
    }
  }

  return bestK;
}
```

---

## 5. FLOW DIAGRAM

```
START
  │
  ├─ Input: B, H, D, Rb, Rs, Nb, d_bar, P_load, M_load
  │
  ├─ Select Standard (TCVN / EC2 / ACI)
  │
  ├─ generateBarLayout()
  │   └─ Cột chữ nhật: 4 góc + thanh bụng
  │   └─ Cột tròn: Rải tròn đều
  │
  ├─ calculateInteractionCurve()
  │   ├─ xi_steps = [0.05, 0.1, ..., 1.0]
  │   │
  │   └─ for each xi:
  │       ├─ c = xi × h
  │       │
  │       ├─ Tính bê tông:
  │       │   ├─ Rect: F_c = fcd × B × a
  │       │   └─ Circ: Strip method → ∫ dF
  │       │
  │       ├─ Tính thép (Strain Compatibility):
  │       │   ├─ ε_s = εcu × Δy / c
  │       │   ├─ σ_s = min(ε_s × Es, fyd)
  │       │   └─ F_s = σ_s × As
  │       │
  │       └─ points.push({M: Mu, P: Pu})
  │
  ├─ PlotDiagram(points)
  │   └─ Vẽ đường cong P-M
  │
  ├─ calculateSafetyFactor(P_load, M_load)
  │   └─ Ray casting: k = dist(Capacity) / dist(Load)
  │
  ├─ Output: k, M-P curve, Diagram
  │
  └─ END
```

---

## 6. ĐẶC TÍNH TỪI VÀ LƯỚI ĐIỂM

```
Để vẽ biểu đồ chính xác, quét một số lượng điểm đủ lớn:

xi_steps (Normalized height of compression zone c/h):
  -100      (Kéo thuần túy - giả định)
  0.05, 0.1, 0.15, ..., 0.95, 1.0  (Quá cảnh uốn-nén)
  1.1, 1.2, 1.5, 2.0  (Nén gia tăng)
  100       (Nén thuần túy - giả định)

Cột tròn (Strip method):
  numStrips = 100  (Chia tiết diện thành 100 dải)
  dy = D / numStrips

  Với numStrips = 100, sai số < 0.1%
```

---

## 7. BẢNG CÀI ĐẶT STANDARD

```javascript
const STANDARD_PARAMS = {
  TCVN: {
    fcd: mat.fck, // Lấy trực tiếp từ input
    fyd: mat.fyk, // Lấy trực tiếp từ input
    εcu: 0.0035,
    β: 0.8,
    Es: 200000,
    name: "TCVN 5574:2018",
    colorCurve: "#0d6efd", // Bootstrap blue
  },
  EC2: {
    fcd: 0.85 * (mat.fck / 1.5),
    fyd: mat.fyk / 1.15,
    εcu: 0.0035, // Có thể điều chỉnh theo cấp bê tông
    β: 0.8,
    Es: 200000,
    name: "Eurocode 2",
    colorCurve: "#6f42c1", // Bootstrap purple
  },
  ACI: {
    fcd: 0.85 * mat.fck,
    fyd: mat.fyk,
    εcu: 0.003, // ACI dùng 0.003
    β: calculateBeta1(mat.fck), // β1 phụ thuộc f'c
    Es: 200000,
    name: "ACI 318-19",
    colorCurve: "#dc3545", // Bootstrap red
  },
};

function calculateBeta1(fck) {
  if (fck <= 28) return 0.85;
  if (fck <= 55) return 0.85 - (0.05 * (fck - 28)) / 7;
  return 0.65;
}
```

---

## 8. LƯU Ý QUAN TRỌNG

1. **Đơn vị**:

   - Input: mm, MPa
   - Tính toán: N, N.mm
   - Output: kN, kNm

2. **Hệ tọa độ**:

   - Gốc O tại tâm tiết diện
   - Y hướng lên, X hướng phải

3. **Strip Method (Cột tròn)**:

   - Độ chính xác phụ thuộc số dải
   - 100 dải ≈ sai số < 0.1%

4. **Strain Compatibility**:

   - Giả thiết mặt cắt phẳng vẫn phẳng
   - Luật: ε tỉ lệ tuyến tính với khoảng cách tới trục trung hòa

5. **Safety Factor**:
   - k > 1: An toàn
   - k = 1: Giới hạn
   - k < 1: Không an toàn

---

**Cập nhật:** 12/12/2025  
**Phiên bản:** v2.0 - 3 Standards Support
