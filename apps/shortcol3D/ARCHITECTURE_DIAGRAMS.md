# ShortCol 3D v3.0 - Architecture & Design Overview

## System Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                      HTML / React UI (index.html)               │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌──────────────────────┐              ┌──────────────────────┐ │
│  │   AppInp Component   │              │  AppOut Component    │ │
│  │  (app-inp.js)        │              │  (app-out.js)        │ │
│  │                      │              │                      │ │
│  │ • Section input      │              │ • 2D slice chart     │ │
│  │ • Material input     │              │ • 3D surface plot    │ │
│  │ • Reinforcement      │              │ • Safety factor      │ │
│  │ • Load cases         │              │ • Results table      │ │
│  │ • Section preview    │              │                      │ │
│  └──────────────────────┘              └──────────────────────┘ │
│            ↓                                      ↑               │
│            │                                      │               │
│    onCalculate()                           Results display       │
│            │                                      ↑               │
└────────────┼──────────────────────────────────────┼───────────────┘
             │                                      │
             ↓ inputData                             │
┌─────────────────────────────────────────────────────────────────┐
│        CalculationEngine (app-cal.js) v3.0                      │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │ performAnalysis(inputData)                              │   │
│  │ {colType, geo, mat, steel, standard, loads}             │   │
│  └──────────────────────────┬──────────────────────────────┘   │
│                             │                                   │
│                 ┌───────────┴────────────┐                     │
│                 │                        │                      │
│     ┌───────────▼────────┐   ┌──────────▼──────────┐           │
│     │ Material Models    │   │ Geometry Setup      │           │
│     │                    │   │                     │           │
│     │ • ConcreteModel    │   │ • generateFiberMesh │           │
│     │   - Whitney (ACI)  │   │ • generateBarPos    │           │
│     │   - Parabola (EC2) │   │                     │           │
│     │                    │   │ Rectangular:        │           │
│     │ • SteelModel       │   │   25×25 = 625 fibers│           │
│     │   - Bilinear       │   │                     │           │
│     │   - Yield limit    │   │ Circular:           │           │
│     └───────────┬────────┘   │   15×30 = 450 fibers│           │
│                 │            └────────────┬────────┘           │
│                 │                         │                    │
│                 └────────────┬────────────┘                    │
│                              │                                 │
│                ┌─────────────▼──────────────┐                 │
│                │  generateInteractionSurface │                 │
│                │                            │                 │
│                │ 1. Angular Sweep           │                 │
│                │    36 angles × 10°         │                 │
│                │    θ ∈ [0°, 360°]          │                 │
│                │                            │                 │
│                │ 2. Depth Sweep             │                 │
│                │    50 depths (logarithmic) │                 │
│                │    c ∈ [0.001·d, 200·d]    │                 │
│                │                            │                 │
│                │ 3. Binary Search           │                 │
│                │    For each (θ, c)        │                 │
│                │    Find ε₀ where N=0      │                 │
│                │    (12 iterations, <1e-9)  │                 │
│                │                            │                 │
│                │ 4. Fiber Integration       │                 │
│                │    N, Mx, My calculation   │                 │
│                │                            │                 │
│                │ 5. Pole Closure            │                 │
│                │    Add 2 poles + rings     │                 │
│                │                            │                 │
│                │ Result: ~1,850 points      │                 │
│                └─────────────┬──────────────┘                 │
│                              │                                 │
│                ┌─────────────▼──────────────┐                 │
│                │ calculateSafetyFactor()    │                 │
│                │ (for each load)            │                 │
│                │                            │                 │
│                │ • Find best-aligned point  │                 │
│                │ • Compute k = |Cap|/|Load|│                 │
│                │ • Check k ≥ 1.0           │                 │
│                └─────────────┬──────────────┘                 │
│                              │                                 │
│                    ┌─────────▼─────────┐                      │
│                    │ Return Results    │                      │
│                    │ • surfacePoints   │                      │
│                    │ • safetyFactors   │                      │
│                    │ • timestamp       │                      │
│                    └───────────────────┘                      │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
             ↑ {surfacePoints, safetyFactors}
             │
             │ Results
             │
  ┌──────────┴────────────┐
  │                       │
  │    State Update       │
  │    Re-render UI       │
  │                       │
  └───────────────────────┘
```

---

## Data Flow Diagram

```
USER INPUTS (Section Geometry, Materials, Reinforcement, Loads)
     ↓
     ├─→ AppInp Component
     │   ├─ Validates input
     │   ├─ Draws section preview
     │   └─ Prepares inputData object
     ↓
CALCULATE BUTTON CLICK
     ↓
     ├─→ handleCalculate()
     │   ├─ setInputData()
     │   ├─ setIsComputing(true)
     │   └─ Show loading overlay
     ↓
     ├─→ CalculationEngine.performAnalysis(inputData)
     │   ├─ generateInteractionSurface()
     │   │  ├─ Initialize materials
     │   │  ├─ Generate fiber mesh
     │   │  ├─ Generate bar positions
     │   │  ├─ Angular sweep (36 angles)
     │   │  │  └─ Depth sweep (50 depths)
     │   │  │     ├─ Binary search for ε₀
     │   │  │     ├─ Integrate section
     │   │  │     └─ Store point {Mx, My, P}
     │   │  ├─ Add pole convergence
     │   │  └─ Add closure rings
     │   │
     │   └─ calculateSafetyFactor() × N
     │      └─ For each load
     ↓
     ├─→ setCalcResults()
     │   └─ Update state with results
     ↓
     ├─→ Hide loading overlay
     ├─→ Trigger toast message
     ↓
     └─→ AppOut Component renders
         ├─ 2D interaction diagram (at selected angle θ)
         ├─ 3D biaxial surface (with meridians & parallels)
         ├─ Safety factor table
         └─ Load case visualization
```

---

## Strain Field Visualization

```
NEUTRAL AXIS ORIENTATION (Angle θ)

            Y
            ↑
            │
        ┌───┼───┐
        │   │   │  Section
        │   │   │  (B × H)
        │   │   │
        └───┼───┘
            └────────→ X

For each angle θ (0°-360°):
  NA normal: (nₓ, nᵧ) = (cos θ, sin θ)
  
  Strain field: ε(x,y) = ε₀ + κ(c - dist_NA)
  
  where:
    dist_NA = nₓ·x + nᵧ·y
    κ = εcᵤ / c  (curvature)
    c = NA distance from origin


EXAMPLE: θ = 0° (NA parallel to Y-axis)

        Y
        ↑
        │
    ────┼────  ← Neutral Axis (c from left)
        │
        └────→ X

   Compression zone (left)  | Tension zone (right)
   ε₀ - κ·c < ε < ε₀       | ε₀ < ε < ε₀ + κ·c

For each depth c:
  • Small c → Large κ → High moment, low force
  • Large c → Small κ → Low moment, high force


BINARY SEARCH FOR ε₀

Goal: Find ε₀ such that ∫σ dA = 0 (force equilibrium)

  for iteration = 1 to 12:
    ε₀ = (ε₀ₗₒw + ε₀ₕᵢ) / 2
    N = ∫σ(ε₀, κ, ...) dA
    
    if N < 0: ε₀ₗₒw = ε₀   (need more compression)
    else:     ε₀ₕᵢ = ε₀    (reduce compression)
  
  → Converges to ε₀ where N ≈ 0
```

---

## Fiber Integration Loop

```
┌─ For each angle θ (36 increments)
│
├─ For each depth c (50 logarithmic steps)
│
│  ├─ Initialize: ε₀ₗₒw = -0.01, ε₀ₕᵢ = +0.01
│  │
│  ├─ Binary search (≈12 iterations):
│  │  │
│  │  └─ ε₀ = (ε₀ₗₒw + ε₀ₕᵢ) / 2
│  │     │
│  │     ├─ Concrete integration:
│  │     │  │
│  │     │  ├─ For i = 1 to 625 (fibers):
│  │     │  │  strain = ε₀ + κ(c - distNAᵢ)
│  │     │  │  stress = ConcreteModel.getStress(strain)
│  │     │  │  N += stress × dAᵢ
│  │     │  │  Mx += stress × yᵢ × dAᵢ
│  │     │  │  My += stress × xᵢ × dAᵢ
│  │     │  │
│  │     │  └─ Steel integration:
│  │     │     │
│  │     │     └─ For j = 1 to Nb (bars):
│  │     │        strain = ε₀ + κ(c - distNAⱼ)
│  │     │        stress = SteelModel.getStress(strain)
│  │     │        N += stress × Asⱼ
│  │     │        Mx += stress × yⱼ × Asⱼ
│  │     │        My += stress × xⱼ × Asⱼ
│  │     │
│  │     └─ Adjust binary search bounds:
│  │        if N > 0: ε₀ₗₒw = ε₀
│  │        else:     ε₀ₕᵢ = ε₀
│  │
│  ├─ Final integration (with converged ε₀):
│  │  P = -N / 1000    (kN, compression +)
│  │  Mx = -Mx / 1e6   (kNm)
│  │  My = -My / 1e6   (kNm)
│  │
│  └─ Store point: {x: My, y: Mx, z: P}
│
├─ Pole convergence:
│  ├─ P_max at pure compression
│  ├─ P_min at pure tension
│  └─ Closure rings for mesh topology
│
└─ Return surfacePoints array (~1,850 points)
```

---

## Material Stress-Strain Models

### Concrete (Whitney Block - ACI)

```
Stress
  ↑
  │     ┌─ 0.85·fck (constant)
  │     │
  │     ├─────────────┐
  │     │             │ Bilinear decay
  │     │             │ to zero
  │     │             │
  ├─────┼─────────────┼────────→ Strain
  0     ε_c0         ε_cu
       0.002        0.003
```

### Concrete (Parabola - EC2/TCVN)

```
Stress
  ↑
  │        ╱─────────
  │       ╱           │ Constant at -fck
  │    ─╱             │
  │   ╱             
  ├────────────────────→ Strain
  0   ε_c1          ε_cu
     0.002          0.0035
```

### Steel (Bilinear)

```
Stress
  ↑     ╱───── fy
  │    ╱ │ 
  │   ╱  │ Elastic: σ = E·ε
  ├──────┼─────→ Strain
  │     │ ε_y = fy/E
  │    ╱ │
  │   ╱─────── -fy
  
  E = 200,000 MPa
  ε_y = fy / 200,000
```

---

## 3D Interaction Surface Structure

```
                P (Axial Force)
                ↑
                │
                │    Top Pole (Pure Compression)
                │      ╱──────────╲
                │     ╱            ╲
                │    ╱   SURFACE    ╲
                │   │   (1,800 pts)  │
                │   │                │
            P_max ┤ ┌┴────────────────┴┐ Equator
                │ │                  │
                │ │   M_y (Moment)   │ 
                │ └┬────────────────┬┘
                │  ╲            ╱
                │   ╲          ╱
                │    ╲────────╱
                │
          P_min ─        Bottom Pole (Pure Tension)
                
                M_x (Moment) →
```

### Surface Points Distribution:

```
Angular Coverage:
  • 36 angles × 10° = Full 360° coverage
  • Includes all NA orientations

Depth Coverage:
  • 50 depths (logarithmic)
  • Small c: High moment, low force
  • Large c: Low moment, high force

Pole Closure:
  • 2 explicit poles (compression/tension)
  • 2 × 12 = 24 ring points
  • Prevents mesh distortion at poles

Result: Topologically closed surface ✓
```

---

## Safety Factor Calculation Method

```
Load Vector: L = (P, Mx, My)
             |L| = √(P² + Mx² + My²)

Unit Load Vector: u = (P, Mx, My) / |L|

For each surface point S:
  1. Compute dot product: dot = S·u / |S|
     (measures alignment)
  
  2. If dot > 0.92 (cos(23°) tolerance):
       k = |S| / |L|  (Safety factor)
  
  3. Record best-aligned point with max dot

Safety: k ≥ 1.0 ✓ Safe
        k < 1.0 ✗ Unsafe


GRAPHICAL INTERPRETATION:

       Surface
          ╱╱╱
    ╱╱╱╱╱╱  Load ray
   │  ╱  ╱
   │ ╱  ╱  ╱  Intersection
   │╱  ╱ ╱╱  point S
   ║ ╱╱╱    
   ║╱─────→ k = |OS| / |OL|
   O
```

---

## Code Organization

```
app-cal.js (v3.0, 649 lines)

├─ SECTION 1: Material Models (100 lines)
│  ├─ ConcreteModel class (50 lines)
│  │  ├─ constructor(standard, fck)
│  │  └─ getStress(strain) → σ (MPa)
│  │
│  └─ SteelModel class (50 lines)
│     ├─ constructor(fyk)
│     └─ getStress(strain) → σ (MPa)
│
├─ SECTION 2: Geometry (80 lines)
│  ├─ generateFiberMesh(type, B, H, D)
│  ├─ generateBarPositions(Nb, B, H, cover)
│  ├─ generateBarPositionsCircular(Nb, D, cover)
│  └─ getDesignCoefficients(standard)
│
├─ SECTION 3: Integration (60 lines)
│  └─ integrateSection(fibers, bars, models, ε₀, κx, κy)
│     → {P, Mx, My}
│
├─ SECTION 4: Surface Generation (270 lines)
│  └─ generateInteractionSurface(inputData)
│     ├─ 36 angles loop
│     ├─ 50 depths loop
│     ├─ Binary search for ε₀
│     ├─ Fiber integration
│     ├─ Pole closure
│     └─ → [~1,850 points]
│
├─ SECTION 5: Safety Factor (40 lines)
│  └─ calculateSafetyFactor(load, surfacePoints)
│     → {k, isSafe}
│
├─ SECTION 6: Main Entry (50 lines)
│  └─ performAnalysis(inputData)
│     → {surfacePoints, safetyFactors, ...}
│
└─ EXPORT to global scope
   └─ window.CalculationEngine
```

---

## Key Mathematical Equations

### 1. Strain Compatibility (3D)
$$\varepsilon(x,y) = \varepsilon_0 + \kappa_x \cdot y - \kappa_y \cdot x$$

### 2. Neutral Axis (Parametric)
$$n_x \cdot x + n_y \cdot y = -c$$

### 3. Distance from NA
$$d_{NA} = n_x \cdot x + n_y \cdot y$$

### 4. Strain at Point
$$\varepsilon(x,y) = \varepsilon_0 + \kappa(c - d_{NA})$$

### 5. Curvature
$$\kappa = \frac{\varepsilon_{cu}}{c}$$

### 6. Fiber Integration
$$P = -\int_A \sigma_c(x,y) \, dA - \int_{A_s} \sigma_s(x,y) \, dA_s$$

$$M_x = -\int_A \sigma_c(x,y) \cdot y \, dA - \int_{A_s} \sigma_s(x,y) \cdot y \, dA_s$$

$$M_y = -\int_A \sigma_c(x,y) \cdot x \, dA - \int_{A_s} \sigma_s(x,y) \cdot x \, dA_s$$

### 7. Safety Factor
$$k = \frac{|\text{Capacity Vector}|}{|\text{Load Vector}|} = \frac{|S|}{|L|}$$

$$\text{Safe if } k \geq 1.0$$

---

**Version:** 3.0  
**Last Updated:** December 19, 2025
