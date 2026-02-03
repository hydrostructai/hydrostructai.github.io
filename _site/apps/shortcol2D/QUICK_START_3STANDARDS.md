# 📋 SHORTCOL 2D - 3 STANDARDS QUICK START

## ✅ What Was Fixed

### Error: `Cannot read properties of undefined (reading 'forEach')`

**Cause:** Function signature mismatch

```
OLD: calculateInteractionCurve(type, B, H, D, ...)
NEW: calculateInteractionCurve(standard, type, B, H, D, ...)
                                 ↑ NEW parameter added
```

**Solution:**

- Added `standard` parameter to function call ✅
- Added standard dropdown to UI ✅
- Integrated standard selection with state management ✅

---

## 🎯 How to Use

### 1. Select Design Standard

In the left sidebar, choose your standard:

```
📌 TIÊU CHUẨN TÍNH TOÁN
├─ TCVN 5574:2018 (Việt Nam)     ← Default
├─ EC2:2004/2015 (Châu Âu)
└─ ACI 318-19 (Mỹ)
```

### 2. Enter Column Data

- **Geometry:** B, H (hoặc D cho cột tròn)
- **Materials:** fck, fyk (cường độ đặc trưng)
- **Reinforcement:** Nb, d (số thanh, đường kính)

### 3. Input Loads

Add load cases in Tab "3. Nội lực"

### 4. Calculate

Click **TÍNH TOÁN** button

### 5. View Results

- **Chart:** P-M interaction diagram
- **Table:** Safety factor k for each load case

---

## 📊 Standard Comparison

| Aspect     | TCVN     | EC2               | ACI               |
| ---------- | -------- | ----------------- | ----------------- |
| **Rb**     | fck      | 0.567×fck         | 0.85×f'c          |
| **Rs**     | fyk      | 0.87×fyk          | fyk               |
| **β**      | 0.8      | 0.8               | β1(f'c)           |
| **εcu**    | 0.0035   | 0.0035            | 0.003             |
| **Result** | Baseline | More conservative | Most conservative |

---

## 🔍 Key Features

✅ **3 International Standards**

- TCVN 5574:2018 (Vietnam)
- EC2:2004/2015 (Eurocode)
- ACI 318-19 (USA)

✅ **Interaction Diagram (P-M Curve)**

- Strain Compatibility Method
- Whitney Stress Block
- Strip Method for circular sections

✅ **Safety Factor Calculation**

- Ray Casting Method
- k ≥ 1.0 = SAFE
- k < 1.0 = UNSAFE

✅ **File Management**

- Save analysis as JSON
- Load previous calculations
- Export results to CSV

---

## 🧪 Test Cases

### Quick Test (TCVN)

```
Geometry:  B=300, H=400, Cover=30
Material:  fck=14.5, fyk=280
Reinf:     Nb=6, d=18
Load:      Pu=1000 kN, Mu=50 kNm
Expected:  k ≈ 1.5 (Safe)
```

### Comparison Test

```
Run same case with TCVN → EC2 → ACI
Observe: TCVN diagram > EC2 diagram > ACI diagram
(Different capacity due to different Rb values)
```

---

## 📁 Files Updated

| File          | Changes                                         |
| ------------- | ----------------------------------------------- |
| `index.html`  | Added standard selector dropdown                |
| `shortcol.js` | Updated function call, state management, events |
| `app-cal.js`  | No changes (already correct)                    |

---

## ✨ New UI Element

**Location:** Left Sidebar, Below File Management Buttons

```
┌─────────────────────────────┐
│ TIÊU CHUẨN TÍNH TOÁN        │
├─────────────────────────────┤
│ [▼ TCVN 5574:2018 (Việt Nam)]
├─────────────────────────────┤
│ ℹ️ Chọn chuẩn thiết kế      │
│    để tính toán biểu đồ      │
│    tương tác                 │
└─────────────────────────────┘
```

---

## 🚀 Status

✅ **Fixed:** forEach error
✅ **Added:** Standard selection dropdown
✅ **Verified:** No syntax errors
✅ **Ready:** For testing

---

## 💡 Tips

1. **Default standard is TCVN** - Most apps in Vietnam use this
2. **Change standard before clicking TÍNH TOÁN** - Standard selection updates state dynamically
3. **Compare standards** - Run same case with 3 standards to see differences
4. **File operations** - Standard is saved in JSON, loaded automatically

---

**Last Updated:** 12/12/2025  
**Version:** v2.0 - 3 Standards Complete Integration
