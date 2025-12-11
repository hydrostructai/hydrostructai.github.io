# 📊 SHORTCOL 2D - 3 STANDARDS VISUAL COMPARISON

**Date:** 12/12/2025  
**Purpose:** Quick reference for design standards differences

---

## 1. PARAMETER COMPARISON TABLE

### Concrete Strength (Rb or fcd or σc)

```
┌────────────┬──────────────┬────────────────┬──────────────┐
│ Standard   │ Formula      │ Example (f'c=25│ Relative     │
│            │              │ or fck=25)     │              │
├────────────┼──────────────┼────────────────┼──────────────┤
│ TCVN       │ Rb = fck     │ Rb = 25 MPa    │ 100%         │
│            │              │                │              │
│ EC2        │ fcd = 0.85   │ fcd = 14.17    │ 56.7%        │
│            │ × (fck/1.5)  │ MPa            │ (33% factor) │
│            │ = 0.567×fck  │                │              │
│            │              │                │              │
│ ACI        │ σc = 0.85    │ σc = 21.25     │ 85%          │
│            │ × f'c        │ MPa            │ (15% factor) │
│            │              │                │              │
└────────────┴──────────────┴────────────────┴──────────────┘

Winner (most liberal):  TCVN
Runner-up:             ACI
Most conservative:     EC2
```

### Steel Strength (Rs or fyd or fy)

```
┌────────────┬──────────────┬────────────────┬──────────────┐
│ Standard   │ Formula      │ Example (fy=400│ Relative     │
│            │              │ or fyk=400)    │              │
├────────────┼──────────────┼────────────────┼──────────────┤
│ TCVN       │ Rs = fyk     │ Rs = 400 MPa   │ 100%         │
│            │              │                │              │
│ EC2        │ fyd = fyk/1.15│ fyd = 348 MPa │ 87%          │
│            │ = 0.87×fyk   │ (13% factor)   │ (slightly)   │
│            │              │                │              │
│ ACI        │ fy = fyk     │ fy = 400 MPa   │ 100%         │
│            │ (no factor)  │ (nominal)      │              │
│            │              │                │              │
└────────────┴──────────────┴────────────────┴──────────────┘

Most liberal (tie):  TCVN = ACI
Most conservative:   EC2
```

### Concrete Strain at Ultimate

```
┌────────────┬──────────────┬──────────────────────────┐
│ Standard   │ ε_cu         │ Implication              │
├────────────┼──────────────┼──────────────────────────┤
│ TCVN       │ 0.0035       │ Higher strain            │
│            │ (3.5‰)       │ → More curvature         │
│            │              │ → Larger neutral axis    │
│            │              │ → Higher capacity        │
│            │              │                          │
│ EC2        │ 0.0035       │ Same as TCVN             │
│            │ (3.5‰)       │                          │
│            │              │                          │
│ ACI        │ 0.003        │ LOWER strain             │
│            │ (3.0‰)       │ → More bending           │
│            │              │ → Smaller neutral axis   │
│            │              │ → LOWER capacity         │
│            │              │ → More CONSERVATIVE      │
│            │              │                          │
└────────────┴──────────────┴──────────────────────────┘

Most liberal:    TCVN & EC2
Most conservative: ACI (0.003 < 0.0035)
```

---

## 2. STRESS BLOCK COMPARISON

### Rectangular Stress Block

```
TCVN & EC2: Constant β = 0.8
┌───────────────────────────────────┐
│ Mép nén (ε = ε_cu)                │
│ ┌─────────────────────────────────┤
│ │ σ = Rb (hằng số)                │
│ │ a = 0.8c (cố định)              │
│ │ ├─ Không phụ thuộc Rb           │
│ │ ├─ Không phụ thuộc fck          │
│ │ └─ Đơn giản, nhất quán          │
│ ├─────────────────────────────────┤
│ │ Trục trung hòa                  │ ← y_NA = Y_top - c
│ └─────────────────────────────────┘
│
└───────────────────────────────────┘

ACI: Variable β1 = f(f'c)
┌───────────────────────────────────┐
│ Mép nén (ε = 0.003)               │
│ ┌─────────────────────────────────┤
│ │ σ = 0.85×f'c (hằng số)          │
│ │ a = β1×c (BIẾN ĐỘNG!)           │
│ │                                 │
│ │ f'c ≤ 28 MPa:   β1 = 0.85       │
│ │ 28 < f'c ≤ 55:  β1 = 0.85-...   │
│ │ f'c > 55 MPa:   β1 = 0.65       │
│ │                                 │
│ │ ├─ Phụ thuộc cường độ bê tông    │
│ │ ├─ Cao cấp hơn                  │
│ │ └─ Phản ánh hành vi thực tế      │
│ ├─────────────────────────────────┤
│ │ Trục trung hòa                  │ ← y_NA = Y_top - c
│ └─────────────────────────────────┘
│
└───────────────────────────────────┘
```

### Impact on Diagram Size

```
                P (kN)
                  ▲
            TCVN│╱╲
                │╱ ╲
              B │╱   ╲ (Baseline)
                │╱     ╲
                │╱       ╲
            EC2 │╱────────╲ (37% smaller)
              A │╱         ╲
                │╱           ╲
                │             ╲
            ACI │╱──────────────╲ (50% smaller)
              C │╱               ╲
                │╱                 ╲
                └──────────────────► M (kNm)

Result:
  Capacity: C < A < B
  Safety:   k(TCVN) < k(EC2) < k(ACI)
```

---

## 3. SAMPLE CALCULATION EXAMPLE

### Given Data

```
Column: B × H = 300 × 400 mm
Concrete: fck = 25 MPa (all standards use same input)
Steel: fyk = 400 MPa (all standards use same input)
Reinforcement: 6 bars Φ18 (As = 1527 mm²)
Neutral Axis: c = 100 mm (assume)
Load Point: Pu = 1000 kN, Mu = 100 kNm
```

### TCVN Calculation

```
Step 1: Get Parameters
  Rb = fck = 25 MPa
  Rs = fyk = 400 MPa
  e_cu = 0.0035
  beta = 0.8

Step 2: Concrete Stress Block
  a = 0.8 × c = 0.8 × 100 = 80 mm
  F_c = Rb × B × a = 25 × 300 × 80 = 600,000 N = 600 kN

Step 3: Steel (at y = 150 mm from top)
  y_NA = 200 - 100 = 100 mm
  e_s = 0.0035 × (150 - 100) / 100 = 0.00175
  σ_s = 0.00175 × 200,000 = 350 MPa
  F_s = 350 × 1527 = 534,450 N ≈ 534 kN

Step 4: Total Capacity
  P_u = 600 + 534 = 1134 kN

Step 5: Safety
  Distance = 1134 kN
  Load distance = 1000 kN
  k = 1134 / 1000 = 1.134 ✓ SAFE
```

### EC2 Calculation

```
Step 1: Get Parameters
  γc = 1.5, γs = 1.15
  Rb = 0.85 × (25 / 1.5) = 14.17 MPa (56.7% of TCVN)
  Rs = 400 / 1.15 = 348 MPa
  e_cu = 0.0035
  beta = 0.8

Step 2: Concrete Stress Block
  a = 0.8 × c = 0.8 × 100 = 80 mm
  F_c = 14.17 × 300 × 80 = 340,080 N = 340 kN (57% of TCVN)

Step 3: Steel
  σ_s = 350 MPa (same ε_s, different Rs limit)
  σ_s = min(350, 348) = 348 MPa
  F_s = 348 × 1527 = 531,396 N ≈ 531 kN

Step 4: Total Capacity
  P_u = 340 + 531 = 871 kN

Step 5: Safety
  k = 871 / 1000 = 0.871 ✗ NOT SAFE!

Comparison: EC2 is 23% more conservative than TCVN
```

### ACI Calculation

```
Step 1: Get Parameters
  f'c = 25 MPa (input as same)
  Rb = 0.85 × 25 = 21.25 MPa
  Rs = 400 MPa (no factor)
  e_cu = 0.003 (SMALLER!)
  β1 = 0.85 (for f'c ≤ 28)

Step 2: Concrete Stress Block
  a = β1 × c = 0.85 × 100 = 85 mm (vs 80 for TCVN/EC2)
  F_c = 21.25 × 300 × 85 = 541,875 N ≈ 542 kN

Step 3: Steel
  e_s = 0.003 × (150 - 100) / 100 = 0.0015 (vs 0.00175!)
  σ_s = 0.0015 × 200,000 = 300 MPa
  F_s = 300 × 1527 = 458,100 N ≈ 458 kN

Step 4: Total Capacity
  P_u = 542 + 458 = 1000 kN

Step 5: Safety
  k = 1000 / 1000 = 1.0 (MARGINAL!)

Comparison:
  ACI εcu=0.003 effect:  -40% strain → -80 kN steel contribution
  ACI σc effect:         +15% concrete → +50 kN increase
  Net result: ACI ≈ TCVN but with smaller εcu safety margin
```

---

## 4. COMPARISON SUMMARY TABLE

```
┌─────────────┬────────────┬────────────┬────────────┐
│ Aspect      │ TCVN       │ EC2        │ ACI        │
├─────────────┼────────────┼────────────┼────────────┤
│ Rb (fck=25) │ 25 MPa     │ 14.17 MPa  │ 21.25 MPa  │
│ Rs (fyk=400)│ 400 MPa    │ 348 MPa    │ 400 MPa    │
│ β/β1        │ 0.8 const  │ 0.8 const  │ 0.85 var   │
│ ε_cu        │ 0.0035     │ 0.0035     │ 0.003      │
│ Safety      │ Baseline   │ +23%       │ Marginal   │
│ Popularity  │ Vietnam    │ EU/UK      │ USA/Canada │
│ Design Ease │ Direct     │ Explicit γ │ Factors φ  │
│ Conserv.    │ Moderate   │ High       │ Medium     │
└─────────────┴────────────┴────────────┴────────────┘
```

---

## 5. WHEN TO USE EACH STANDARD

### TCVN 5574:2018 ✅ Use When:

```
✓ Project location: Vietnam
✓ Client requirement: Vietnamese standard
✓ Regulatory: Required by local authorities
✓ Practice: Most common in Vietnam
✓ Cost: Direct strength values, no γ factors
```

### EC2:2004/2015 ✅ Use When:

```
✓ Project location: EU, UK, Middle East
✓ Client requirement: Eurocode 2
✓ Regulatory: Required by local code
✓ Practice: Most common in Europe
✓ Transparency: Want to see γ factors explicitly
✓ Safety: Need higher conservative margin
```

### ACI 318-19 ✅ Use When:

```
✓ Project location: USA, Canada, some others
✓ Client requirement: ACI standard
✓ Regulatory: Required by local authorities
✓ Software: Using ACI-based tools
✓ Flexibility: Variable β1 for different strengths
✓ High-strength: Working with f'c > 55 MPa
```

---

## 6. DESIGN DECISION CHART

```
START: Which standard should I use?
   │
   ├─ Yes ► Location in Vietnam?
   │  │       TCVN 5574:2018 ✅
   │  │
   │  No
   │   │
   │   ├─ Yes ► Location in EU/UK?
   │   │  │       EC2:2004/2015 ✅
   │   │  │
   │   │  No
   │   │   │
   │   │   ├─ Yes ► Location in USA/Canada?
   │   │   │  │       ACI 318-19 ✅
   │   │   │  │
   │   │   │  No
   │   │   │   │
   │   │   │   └─ Ask client/engineer
   │   │   │       for preferred standard
   │   │   │
   │   │   └─ Comparing standards?
   │   │       Run all 3 in ShortCol!
   │   │       Compare results
   │   │
   │   └─ Comparing conservatism?
   │       TCVN (least) → EC2 → ACI (most)
   │
   └─ Want explicit safety factors?
      Choose EC2 (shows γc, γs)
```

---

## 7. KEY TAKEAWAYS

### Structural Capacity Results

```
For same section with same materials:

  TCVN Capacity:  100% (baseline)
  EC2 Capacity:   ~60-65% (more conservative)
  ACI Capacity:   ~70-80% (variable)

Why different?
  - Different Rb/Rs ratios
  - Different ε_cu values (ACI smaller)
  - Different safety factor philosophy
```

### Design Safety

```
Acceptance Criterion: k ≥ 1.0 (Safe)

If design fails in TCVN → Check EC2
  (Very likely to pass)

If design fails in EC2 → Check TCVN
  (May pass with lower safety)

If design marginal in ACI → Increase section
  (ACI is most conservative)
```

### For Engineers

```
Use TCVN or ACI for normal projects
Use EC2 if client specifically requests it

When comparing:
  "Which standard is safest?"
  Answer: "They're all safe, but with
           different safety margins.
           EC2 is most explicit about
           the safety factors."
```

---

**Document Version:** 1.0  
**Last Updated:** 12/12/2025  
**Status:** Ready for distribution to engineers
