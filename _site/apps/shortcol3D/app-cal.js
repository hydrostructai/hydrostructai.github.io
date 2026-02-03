/**
 * UNIFIED CALCULATION ENGINE (app-cal.js) v3.0 - COMPLETE REFACTOR
 * ========================================
 * Pure mathematical calculation module for ShortCol 3D
 * Theory: Fiber Integration + 3D Strain Compatibility
 *
 * Correct Implementation:
 * - Strain compatibility: ε(x,y) = ε₀ + κₓ·y - κᵧ·x (3D)
 * - Material models: TCVN 5574:2018 | EC2:2004/2015 | ACI 318-19
 * - Method: Angular sweep + depth sweep to generate closed interaction surface
 *
 * NO DOM REFERENCES - Pure mathematical functions only
 */

// =====================================================================
// SECTION 1: MATERIAL MODELS (TCVN / EC2 / ACI)
// =====================================================================

/**
 * Concrete Stress-Strain Model
 * Supports: Whitney Block (ACI), Parabola (EC2/TCVN)
 */
class ConcreteModel {
  constructor(standard, fck) {
    this.standard = standard;
    this.fck = fck;  // MPa
    this.Es = 200000; // MPa

    if (standard === "ACI") {
      this.eps_cu = 0.003;
      this.eps_c0 = 0.002;
      this.type = "whitney";
      // β₁ coefficient
      if (fck <= 28) {
        this.beta1 = 0.85;
      } else if (fck <= 55) {
        this.beta1 = 0.85 - 0.008 * (fck - 28);
      } else {
        this.beta1 = 0.65;
      }
    } else if (standard === "EC2") {
      this.eps_cu = 0.0035;
      this.eps_c1 = 0.002; // Peak strain
      this.eps_c2 = 0.002; // Strain at fck
      this.type = "parabola";
    } else { // TCVN (similar to EC2)
      this.eps_cu = 0.0035;
      this.eps_c1 = 0.002;
      this.type = "parabola";
    }
  }

  /**
   * Get concrete compressive stress (negative convention)
   * @param {number} strain - Strain (positive = tension, negative = compression)
   * @returns {number} Stress in MPa (negative = compression)
   */
  getStress(strain) {
    if (strain >= 0) return 0; // No tension capacity

    const e = Math.abs(strain);

    if (this.type === "whitney") {
      // ACI Whitney Stress Block
      if (e > this.eps_cu) return 0;
      // Bilinear approximation: 85% of fck from 0 to eps_c0, linear decay
      if (e <= this.eps_c0) {
        return -0.85 * this.fck;
      } else {
        const frac = (e - this.eps_c0) / (this.eps_cu - this.eps_c0);
        return -0.85 * this.fck * (1 - frac);
      }
    } else {
      // Parabolic model (EC2/TCVN)
      if (e > this.eps_cu) return 0;
      if (e <= this.eps_c1) {
        // Parabola: f = -fck * (1 - (1 - e/eps_c1)^2) = -fck * (2*e/eps_c1 - (e/eps_c1)^2)
        const eta = e / this.eps_c1;
        return -this.fck * (2 * eta - eta * eta);
      } else {
        // Constant at fck
        return -this.fck;
      }
    }
  }
}

/**
 * Steel Stress-Strain Model
 * Bilinear: Elastic up to yield, constant after
 */
class SteelModel {
  constructor(fyk) {
    this.fyk = fyk;  // MPa
    this.Es = 200000; // MPa
    this.eps_y = fyk / this.Es;
  }

  /**
   * Get steel stress
   * @param {number} strain - Strain
   * @returns {number} Stress in MPa
   */
  getStress(strain) {
    if (Math.abs(strain) <= this.eps_y) {
      return strain * this.Es;
    } else if (strain > 0) {
      return this.fyk;
    } else {
      return -this.fyk;
    }
  }
}

// =====================================================================
// SECTION 2: GEOMETRY & DISCRETIZATION
// =====================================================================

/**
 * Generate fiber mesh for concrete section
 * @param {string} type - "rect" or "circ"
 * @param {number} B - Width (for rect) in mm
 * @param {number} H - Height (for rect) in mm
 * @param {number} D - Diameter (for circ) in mm
 * @returns {Array} Array of {x, y, dA} - fiber coordinates (mm) and area (mm²)
 */
function generateFiberMesh(type, B, H, D) {
  const fibers = [];

  if (type === "rect") {
    const nx = 25;  // Increased for accuracy
    const ny = 25;
    const dx = B / nx;
    const dy = H / ny;
    const dA = dx * dy;

    for (let i = 0; i < nx; i++) {
      for (let j = 0; j < ny; j++) {
        const x = -B / 2 + (i + 0.5) * dx;
        const y = -H / 2 + (j + 0.5) * dy;
        fibers.push({ x, y, dA });
      }
    }
  } else if (type === "circ") {
    // Polar mesh for circular section
    const nr = 15;
    const ntheta = 30;
    const R = D / 2;

    for (let ir = 0; ir < nr; ir++) {
      const r_inner = (ir * R) / nr;
      const r_outer = ((ir + 1) * R) / nr;
      const r_mid = (r_inner + r_outer) / 2;
      const dr = (r_outer - r_inner);
      const dtheta = (2 * Math.PI) / ntheta;
      const dA = r_mid * dr * dtheta;

      for (let itheta = 0; itheta < ntheta; itheta++) {
        const theta = itheta * dtheta + dtheta / 2;
        const x = r_mid * Math.cos(theta);
        const y = r_mid * Math.sin(theta);
        fibers.push({ x, y, dA });
      }
    }
  }

  return fibers;
}

/**
 * Generate reinforcement bar positions
 * @param {number} Nb - Number of bars
 * @param {number} B - Width in mm
 * @param {number} H - Height in mm
 * @param {number} cover - Concrete cover in mm
 * @returns {Array} Array of {x, y, As} - bar coordinates (mm) and area (mm²)
 */
function generateBarPositions(Nb, B, H, cover) {
  const bars = [];
  const W = B - 2 * cover;
  const H_core = H - 2 * cover;
  const perimeter = 2 * (W + H_core);
  const spacing = perimeter / Nb;

  for (let i = 0; i < Nb; i++) {
    let currentDist = i * spacing;
    let x = 0, y = 0;

    // Bottom edge (left to right)
    if (currentDist <= W) {
      x = -W / 2 + currentDist;
      y = -H_core / 2;
    }
    // Right edge (bottom to top)
    else if (currentDist <= W + H_core) {
      x = W / 2;
      y = -H_core / 2 + (currentDist - W);
    }
    // Top edge (right to left)
    else if (currentDist <= 2 * W + H_core) {
      x = W / 2 - (currentDist - W - H_core);
      y = H_core / 2;
    }
    // Left edge (top to bottom)
    else {
      x = -W / 2;
      y = H_core / 2 - (currentDist - 2 * W - H_core);
    }

    bars.push({ x, y });
  }

  return bars;
}

/**
 * Get design coefficients based on design standard
 * @param {string} standard - "TCVN", "EC2", or "ACI"
 * @returns {Object} Coefficients {gammac, gammas}
 */
function getDesignCoefficients(standard) {
  const coeff = {
    TCVN: { gammac: 1.3, gammas: 1.15 },
    EC2: { gammac: 1.5, gammas: 1.15 },
    ACI: { gammac: 0.85, gammas: 0.9 },
  };
  return coeff[standard] || coeff.TCVN;
}

/**
 * Generate circular bar arrangement
 * @param {number} Nb - Number of bars
 * @param {number} D - Diameter in mm
 * @param {number} cover - Concrete cover in mm
 * @returns {Array} Array of {x, y} - bar coordinates
 */
function generateBarPositionsCircular(Nb, D, cover) {
  const bars = [];
  const r = (D - 2 * cover) / 2;

  for (let i = 0; i < Nb; i++) {
    const theta = (2 * Math.PI * i) / Nb;
    const x = r * Math.cos(theta);
    const y = r * Math.sin(theta);
    bars.push({ x, y });
  }

  return bars;
}

// =====================================================================
// SECTION 3: SECTION INTEGRATION
// =====================================================================

/**
 * Integrate section to get internal forces from given strain parameters
 * 
 * Strain compatibility (3D):
 *   ε(x,y) = ε₀ + κₓ·y - κᵧ·x
 * where:
 *   ε₀ = axial strain
 *   κₓ = curvature about x-axis (rotation causing y-bending)
 *   κᵧ = curvature about y-axis (rotation causing x-bending)
 * 
 * @param {Array} fibers - Fiber array from generateFiberMesh
 * @param {Array} bars - Bar array from generateBarPositions
 * @param {ConcreteModel} concreteModel - Material model
 * @param {SteelModel} steelModel - Material model
 * @param {number} eps0 - Axial strain
 * @param {number} kappax - Curvature about x-axis (1/mm)
 * @param {number} kappay - Curvature about y-axis (1/mm)
 * @returns {Object} {P, Mx, My} in kN and kNm (P positive = compression)
 */
function integrateSection(fibers, bars, concreteModel, steelModel, eps0, kappax, kappay) {
  let N_internal = 0;  // N in N (will convert to kN)
  let Mx_internal = 0; // Mx in N·mm (will convert to kNm)
  let My_internal = 0; // My in N·mm (will convert to kNm)

  // ===== CONCRETE FIBERS =====
  for (let fib of fibers) {
    const strain = eps0 + kappax * fib.y - kappay * fib.x;
    const stress = concreteModel.getStress(strain); // MPa (negative for compression)
    const force = stress * fib.dA; // N (stress in MPa, area in mm²)

    N_internal += force;
    Mx_internal += force * fib.y;  // Moment about x-axis
    My_internal += force * fib.x;  // Moment about y-axis
  }

  // ===== STEEL BARS =====
  for (let bar of bars) {
    const strain = eps0 + kappax * bar.y - kappay * bar.x;
    const stress = steelModel.getStress(strain); // MPa
    const force = stress * bar.As; // N

    N_internal += force;
    Mx_internal += force * bar.y;
    My_internal += force * bar.x;
  }

  // Convert to kN and kNm, with positive = compression
  return {
    P: -N_internal / 1000,      // kN, compression positive
    Mx: -Mx_internal / 1e6,     // kNm
    My: -My_internal / 1e6,     // kNm
  };
}

// =====================================================================
// SECTION 4: GENERATE INTERACTION SURFACE (MAIN ALGORITHM)
// =====================================================================

/**
 * MAIN ALGORITHM: Generate P-Mx-My interaction surface
 * 
 * Strategy: Angular sweep + Depth sweep with correct 3D strain compatibility
 * - For each neutral axis orientation angle θ (0° to 360°, 10° steps)
 * - For each neutral axis depth c (logarithmic range)
 * - Map strain parameters correctly: ε(x,y) = ε₀ + κₓ·y - κᵧ·x
 * - Integrate section to get (P, Mx, My)
 * - Create closed mesh by adding pole points and convergence rings
 */
function generateInteractionSurface(inputData) {
  const { colType, geo, mat, steel, standard } = inputData;
  
  // Validate input
  if (!geo.B && !geo.D) throw new Error("Missing geometry");
  if (!mat.fck || !mat.fyk) throw new Error("Missing material");
  if (!steel.Nb || !steel.As_bar) throw new Error("Missing reinforcement");

  // Design coefficients
  const coeff = getDesignCoefficients(standard);
  const fcd = mat.fck / coeff.gammac;   // Design strength (MPa)
  const fsd = mat.fyk / coeff.gammas;   // Design strength (MPa)

  // Section dimensions
  let Ac, d_eff;
  if (colType === "rect") {
    Ac = geo.B * geo.H;
    d_eff = Math.max(geo.B, geo.H);
  } else {
    Ac = Math.PI * Math.pow(geo.D / 2, 2);
    d_eff = geo.D;
  }

  const As_total = steel.Nb * steel.As_bar;

  // Initialize materials
  const concreteModel = new ConcreteModel(standard, mat.fck);
  const steelModel = new SteelModel(mat.fyk);

  // Generate fiber mesh and bar positions
  let fibers, bars;
  if (colType === "rect") {
    fibers = generateFiberMesh("rect", geo.B, geo.H, geo.D);
    const barPos = generateBarPositions(steel.Nb, geo.B, geo.H, geo.cover);
    bars = barPos.map(p => ({ x: p.x, y: p.y, As: steel.As_bar }));
  } else {
    fibers = generateFiberMesh("circ", geo.B, geo.H, geo.D);
    const barPos = generateBarPositionsCircular(steel.Nb, geo.D, geo.cover);
    bars = barPos.map(p => ({ x: p.x, y: p.y, As: steel.As_bar }));
  }

  // Collect surface points
  const points = [];
  const pCollection = [], mxCollection = [], myCollection = [];

  // =====================================================================
  // MAIN LOOP: Angular sweep (NA orientation) + Depth sweep
  // =====================================================================
  
  const numAngles = 36;  // 10° increments
  const numDepths = 50;  // Depth sweep
  
  const c_min = 0.001 * d_eff;
  const c_max = 200 * d_eff;
  const c_log_min = Math.log(c_min);
  const c_log_max = Math.log(c_max);

  for (let iAngle = 0; iAngle < numAngles; iAngle++) {
    const theta = (2 * Math.PI * iAngle) / numAngles;
    const n_x = Math.cos(theta);  // Unit normal to NA
    const n_y = Math.sin(theta);

    for (let iDepth = 0; iDepth < numDepths; iDepth++) {
      // Logarithmic depth distribution for better coverage
      const c_log = c_log_min + (iDepth / (numDepths - 1)) * (c_log_max - c_log_min);
      const c = Math.exp(c_log);

      // ===== STRAIN PARAMETERIZATION =====
      // Neutral axis equation: n_x·x + n_y·y = -c
      // Curvature (strain/depth): κ = ε_cu / c
      // Strain at point (x,y): ε(x,y) = ε₀ + κ·(c - dist_from_NA)
      // where dist_from_NA = n_x·x + n_y·y
      
      const eps_cu = concreteModel.eps_cu;
      const eps_max = -eps_cu;
      
      // Find maximum distance from NA on section
      let max_dist = 0;
      for (let fib of fibers) {
        const dist = fib.x * n_x + fib.y * n_y;
        max_dist = Math.max(max_dist, Math.abs(dist - (-c)));
      }
      for (let bar of bars) {
        const dist = bar.x * n_x + bar.y * n_y;
        max_dist = Math.max(max_dist, Math.abs(dist - (-c)));
      }

      // Curvature magnitude
      const kappa = (eps_max) / max_dist;  // Curvature in 1/mm
      
      // Axial strain: iterate to find ε₀ for equilibrium
      // Binary search for ε₀ that gives zero or near-zero axial force
      
      let eps_0_low = -0.01;
      let eps_0_high = 0.01;
      let eps_0 = 0;

      for (let iter = 0; iter < 12; iter++) {
        eps_0 = (eps_0_low + eps_0_high) / 2;

        // Integrate to check axial force
        let N_trial = 0;

        // Fibers
        for (let fib of fibers) {
          const dist_from_NA = fib.x * n_x + fib.y * n_y;
          const strain = eps_0 + kappa * (c - dist_from_NA);
          const stress = concreteModel.getStress(strain);
          N_trial += stress * fib.dA;
        }

        // Bars
        for (let bar of bars) {
          const dist_from_NA = bar.x * n_x + bar.y * n_y;
          const strain = eps_0 + kappa * (c - dist_from_NA);
          const stress = steelModel.getStress(strain);
          N_trial += stress * bar.As;
        }

        // Adjust bounds
        if (N_trial > 0) {
          eps_0_low = eps_0;
        } else {
          eps_0_high = eps_0;
        }
      }

      // Final integration with converged ε₀
      let N_final = 0, Mx_final = 0, My_final = 0;

      for (let fib of fibers) {
        const dist_from_NA = fib.x * n_x + fib.y * n_y;
        const strain = eps_0 + kappa * (c - dist_from_NA);
        const stress = concreteModel.getStress(strain);
        const force = stress * fib.dA;

        N_final += force;
        Mx_final += force * fib.y;
        My_final += force * fib.x;
      }

      for (let bar of bars) {
        const dist_from_NA = bar.x * n_x + bar.y * n_y;
        const strain = eps_0 + kappa * (c - dist_from_NA);
        const stress = steelModel.getStress(strain);
        const force = stress * bar.As;

        N_final += force;
        Mx_final += force * bar.y;
        My_final += force * bar.x;
      }

      // Convert units: N (N) -> P (kN), Moments (N·mm) -> M (kNm)
      const P = -N_final / 1000;
      const Mx = -Mx_final / 1e6;
      const My = -My_final / 1e6;

      // Add point if valid
      if (P >= -100) { // Small tolerance for numerical error
        points.push({ x: Mx, y: My, z: P });
        P_collection.push(P);
        Mx_collection.push(Mx);
        My_collection.push(My);
      }
    }
  }

  // =====================================================================
  // POLE CONVERGENCE: Add explicit points at extreme states
  // =====================================================================
  
  // Pure compression
  const forces_comp = integrateSection(fibers, bars, concreteModel, steelModel, -concreteModel.eps_cu, 0, 0);
  const P_max = Math.max(forces_comp.P, ...pCollection);
  points.push({ x: 0, y: 0, z: P_max });

  // Pure tension  
  const forces_tens = integrateSection(fibers, bars, concreteModel, steelModel, 0.01, 0, 0);
  const P_min = Math.min(forces_tens.P, ...pCollection);
  points.push({ x: 0, y: 0, z: P_min });

  // Closure rings
  const maxMn = Math.max(...myCollection.map(m => Math.abs(m) || 0), ...mxCollection.map(m => Math.abs(m) || 0), 100);
  const ringRadius = maxMn * 0.06;
  
  for (let i = 0; i < 12; i++) {
    const phi = (2 * Math.PI * i) / 12;
    points.push({
      x: ringRadius * Math.sin(phi),
      y: ringRadius * Math.cos(phi),
      z: P_max
    });
    points.push({
      x: ringRadius * Math.sin(phi),
      y: ringRadius * Math.cos(phi),
      z: P_min
    });
  }

  console.log(`✓ Generated ${points.length} surface points (base: ${numAngles * numDepths}, poles + rings: ${points.length - numAngles * numDepths})`);
  
  return points;
}
// =====================================================================
// SECTION 5: SAFETY FACTOR CALCULATION
// =====================================================================

/**
 * Calculate safety factor for a load case
 * Uses radial convergence on 3D surface
 */
function calculateSafetyFactor(load, surfacePoints) {
  const { P, Mx, My } = load;
  const loadVector = Math.sqrt(P * P + Mx * Mx + My * My);

  if (loadVector < 0.01) {
    return { k: 999, isSafe: true };
  }

  // Unit vector along load direction
  const u_P = P / loadVector;
  const u_Mx = Mx / loadVector;
  const u_My = My / loadVector;

  let maxDot = -1;
  let bestPoint = null;
  let bestDist = 0;

  // Find surface point with maximum alignment with load direction
  for (let pt of surfacePoints) {
    const ptDist = Math.sqrt(pt.x * pt.x + pt.y * pt.y + pt.z * pt.z);
    if (ptDist < 0.01) continue;

    const dot = (pt.x * u_My + pt.y * u_Mx + pt.z * u_P);
    const cosTot = dot / ptDist;

    if (cosTot > maxDot) {
      maxDot = cosTot;
      bestPoint = pt;
      bestDist = ptDist;
    }
  }

  if (bestPoint && maxDot > 0.92) {  // ~23° tolerance
    const k = bestDist / loadVector;
    return { k: Math.max(0.1, k), isSafe: k >= 1.0 };
  }

  return { k: 0, isSafe: false };
}

// =====================================================================
// SECTION 6: MAIN ENTRY POINT
// =====================================================================

/**
 * Perform complete analysis
 * @param {Object} inputData - {colType, geo, mat, steel, standard, loads}
 * @returns {Object} {surfacePoints, safetyFactors, timestamp}
 */
function performAnalysis(inputData) {
  try {
    console.log("=== CalculationEngine Analysis Started ===");
    console.log("Input:", inputData);

    // Validate required fields
    if (!inputData.colType) throw new Error("Column type not specified");
    if (!inputData.geo) throw new Error("Geometry not defined");
    if (!inputData.mat) throw new Error("Materials not defined");
    if (!inputData.steel) throw new Error("Reinforcement not defined");
    if (!inputData.standard) throw new Error("Design standard not selected");

    // Generate interaction surface
    const surfacePoints = generateInteractionSurface(inputData);
    if (surfacePoints.length < 100) {
      console.warn("Warning: Few surface points generated:", surfacePoints.length);
    }

    // Calculate safety factors
    const safetyFactors = {};
    if (inputData.loads && Array.isArray(inputData.loads)) {
      inputData.loads.forEach((load, idx) => {
        const result = calculateSafetyFactor(load, surfacePoints);
        safetyFactors[load.id || idx] = result;
        console.log(`Load ${load.id || idx}: k=${result.k.toFixed(3)}, Safe=${result.isSafe}`);
      });
    }

    const result = {
      surfacePoints,
      safetyFactors,
      timestamp: new Date().toISOString(),
      summary: {
        numPoints: surfacePoints.length,
        numLoads: (inputData.loads || []).length,
        numSafe: Object.values(safetyFactors).filter(s => s.isSafe).length
      }
    };

    console.log("=== Analysis Completed ===", result.summary);
    return result;

  } catch (error) {
    console.error("Analysis Error:", error.message);
    throw error;
  }
}

// =====================================================================
// EXPORT TO GLOBAL SCOPE
// =====================================================================

window.CalculationEngine = {
  generateInteractionSurface,
  calculateSafetyFactor,
  performAnalysis,
  generateBarPositions,
  generateBarPositionsCircular,
  generateFiberMesh,
  integrateSection,
  ConcreteModel,
  SteelModel,
  getDesignCoefficients,
};

console.log("✓ CalculationEngine v3.0 loaded successfully");
