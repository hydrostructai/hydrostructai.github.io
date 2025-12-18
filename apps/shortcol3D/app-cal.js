/**
 * UNIFIED CALCULATION ENGINE (app-cal.js) UPDATE 18/12/2025
 * ========================================
 * Pure mathematical calculation module for ShortCol 3D
 * Merges Fiber Integration Method (shortcol3D.js) with simplified math functions (app-cal-math.js)
 *
 * Supports: TCVN 5574:2018 | EC2:2004/2015 | ACI 318-19
 * Method: Fiber Integration + Strain Compatibility
 *
 * NO DOM REFERENCES - Pure mathematical functions only
 */

// =====================================================================
// HELPER FUNCTIONS
// =====================================================================

/**
 * Generate reinforcement bar layout positions
 * @param {number} Nb - Number of bars
 * @param {number} B - Width (mm)
 * @param {number} H - Height (mm)
 * @param {number} cover - Concrete cover (mm)
 * @returns {Array} Array of {x, y} positions in mm
 */
function generateBarPositions(Nb, B, H, cover) {
  const bars = [];
  const W = B - 2 * cover;
  const H_core = H - 2 * cover;
  const perimeter = 2 * (W + H_core);
  const spacing = perimeter / Nb;

  for (let i = 0; i < Nb; i++) {
    let currentDist = i * spacing;
    let x = 0,
      y = 0;

    if (currentDist <= W) {
      x = -W / 2 + currentDist;
      y = -H_core / 2;
    } else if (currentDist <= W + H_core) {
      x = W / 2;
      y = -H_core / 2 + (currentDist - W);
    } else if (currentDist <= 2 * W + H_core) {
      x = W / 2 - (currentDist - (W + H_core));
      y = H_core / 2;
    } else {
      x = -W / 2;
      y = H_core / 2 - (currentDist - (2 * W + H_core));
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
 * Calculate moment capacity at a given axial load
 */
function calculateMomentCapacity(
  colType,
  geo,
  barPositions,
  As_bar,
  P,
  fcd,
  fsd,
  direction
) {
  let W, c;

  if (colType === "rect") {
    const B = geo.B;
    const H = geo.H;
    if (direction === "x") {
      W = (B * H * H) / 6;
      c = H / 2;
    } else {
      W = (H * B * B) / 6;
      c = B / 2;
    }
  } else {
    const D = geo.D;
    W = (Math.PI * Math.pow(D, 3)) / 32;
    c = D / 2;
  }

  const Mg = W * fcd;
  const Ms = (fsd * As_bar * barPositions.length * c) / 1000;
  const M_cap = Mg + Ms;

  const Ac =
    colType === "rect" ? geo.B * geo.H : Math.PI * Math.pow(geo.D / 2, 2);
  const Pu = (fcd * Ac) / 1000;
  const interaction = Math.max(0.1, 1 - P / (2 * Pu));

  return M_cap * interaction;
}

// =====================================================================
// MATERIAL MODELING
// =====================================================================

class MaterialModel {
  constructor(standard, fck, fyk) {
    this.standard = standard;
    this.f_c = fck;
    this.f_y = fyk;
    this.eps_cu = 0.0035;
    this.eps_c1 = 0.002;
    this.eps_y = fyk / 200000;
    this.type = "parabola";
    this.beta1 = 0.85;
    this.Es = 200000;

    if (standard === "ACI") {
      this.eps_cu = 0.003;
      this.type = "whitney";
      if (fck <= 28) {
        this.beta1 = 0.85;
      } else if (fck >= 55) {
        this.beta1 = 0.65;
      } else {
        this.beta1 = 0.85 - (0.05 * (fck - 28)) / 7;
      }
    }
  }

  getConcreteStress(strain) {
    if (strain >= 0) return 0;

    const e = Math.abs(strain);
    const f_max = this.f_c;

    if (this.type === "whitney") {
      const e0 = (2 * 0.85 * this.f_c) / (4700 * Math.sqrt(this.f_c));
      if (e > this.eps_cu) return 0;
      if (e < e0) {
        return -f_max * (2 * (e / e0) - (e / e0) ** 2);
      }
      return -f_max * (1 - (0.15 * (e - e0)) / (this.eps_cu - e0));
    }

    // Parabola model
    if (e > this.eps_cu) return 0;
    if (e <= this.eps_c1) {
      return -f_max * (1 - Math.pow(1 - e / this.eps_c1, 2));
    } else {
      return -f_max;
    }
  }

  getSteelStress(strain) {
    const stress = strain * this.Es;
    if (stress > this.f_y) return this.f_y;
    if (stress < -this.f_y) return -this.f_y;
    return stress;
  }
}

// =====================================================================
// FIBER MESH GENERATION
// =====================================================================

function generateFiberMesh(type, B, H, D) {
  const fibers = [];
  const nx = 20;
  const ny = 20;

  if (type === "rect") {
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
  } else {
    const nr = 12;
    const ntheta = 24;
    const R = D / 2;

    for (let i = 0; i < nr; i++) {
      const r_inner = (i * R) / nr;
      const r_outer = ((i + 1) * R) / nr;
      const r_mid = (r_inner + r_outer) / 2;
      const dA = (Math.PI * (r_outer * r_outer - r_inner * r_inner)) / ntheta;

      for (let j = 0; j < ntheta; j++) {
        const theta = (2 * Math.PI * j) / ntheta;
        const x = r_mid * Math.cos(theta);
        const y = r_mid * Math.sin(theta);
        fibers.push({ x, y, dA });
      }
    }
  }

  return fibers;
}

// =====================================================================
// SECTION INTEGRATION
// =====================================================================

function integrateSection(fibers, bars, mat, eps_0, phi_x, phi_y, current_c) {
  let N_int = 0;
  let Mx_int = 0;
  let My_int = 0;

  // Integrate concrete
  for (let fib of fibers) {
    const strain = eps_0 + phi_x * fib.y + phi_y * fib.x;
    const stress = mat.getConcreteStress(strain);
    const force = stress * fib.dA;

    N_int += force;
    Mx_int += force * fib.y;
    My_int += force * fib.x;
  }

  // Integrate steel
  for (let bar of bars) {
    const strain = eps_0 + phi_x * bar.y + phi_y * bar.x;
    const stress = mat.getSteelStress(strain);
    const force = stress * bar.As;

    N_int += force;
    Mx_int += force * bar.y;
    My_int += force * bar.x;
  }

  return {
    P: -N_int / 1000,
    Mx: -Mx_int / 1e6,
    My: -My_int / 1e6,
  };
}

// =====================================================================
// MAIN ANALYSIS FUNCTIONS
// =====================================================================

/**
 * REFACTORED: Generate topologically closed interaction surface (P-Mx-My diagram)
 * using Fiber Integration Method with Angular & Depth Sweeping
 * 
 * Theory:
 * - Strain compatibility: ε(x,y) = ε₀ + κₓ·y - κᵧ·x
 * - κₓ, κᵧ = curvatures (strains/depth); ε₀ = axial strain
 * - For each NA orientation θ, sweep neutral axis depth c from near-zero to very large
 * - This ensures all interaction points are captured and poles are properly closed
 */
function generateInteractionSurface(inputData) {
  const { colType, geo, mat, steel, standard } = inputData;
  const coeff = getDesignCoefficients(standard);

  const fck = mat.fck;
  const fyk = mat.fyk;
  const fcd = fck / coeff.gammac;
  const fsd = fyk / coeff.gammas;

  let Ac, d_eff;
  if (colType === "rect") {
    const B = geo.B;
    const H = geo.H;
    Ac = B * H;
    d_eff = Math.max(B, H);
  } else {
    const D = geo.D;
    Ac = Math.PI * Math.pow(D / 2, 2);
    d_eff = D;
  }

  const Nb = steel.Nb;
  const As_total = steel.As_bar * Nb;

  // Generate fiber mesh and bar positions
  const fibers = generateFiberMesh(colType, geo.B || geo.D, geo.H || geo.D, geo.D || geo.H);
  
  let barPositions = [];
  if (colType === "rect") {
    const barPos = generateBarPositions(Nb, geo.B, geo.H, geo.cover);
    barPositions = barPos.map(p => ({
      x: p.x,
      y: p.y,
      As: steel.As_bar
    }));
  } else {
    const radius = (geo.D - 2 * geo.cover) / 2;
    for (let i = 0; i < Nb; i++) {
      const angle = (2 * Math.PI * i) / Nb;
      barPositions.push({
        x: radius * Math.cos(angle),
        y: radius * Math.sin(angle),
        As: steel.As_bar,
      });
    }
  }

  // Initialize material model
  const materialModel = new MaterialModel(standard, fck, fyk);

  // Collect all surface points
  const points = [];
  const P_collection = [];
  const Mx_collection = [];
  const My_collection = [];

  // ================================================================
  // MAIN LOOP: Angular sweep (NA orientation) + Depth sweep
  // ================================================================
  const numAngles = 36; // 10° increments for smooth surface
  const numDepths = 40; // Sufficient convergence to poles

  // Depth range: from very small to very large (pure compression/tension)
  const c_min = 0.001 * d_eff;
  const c_max = 100 * d_eff;
  const c_log_min = Math.log(c_min);
  const c_log_max = Math.log(c_max);

  for (let angleIdx = 0; angleIdx < numAngles; angleIdx++) {
    // Neutral axis orientation angle (0° to 2π)
    const theta = (2 * Math.PI * angleIdx) / numAngles;
    
    // Unit vector perpendicular to NA (points into compression zone)
    const NA_perpX = Math.cos(theta);
    const NA_perpY = Math.sin(theta);

    for (let depthIdx = 0; depthIdx < numDepths; depthIdx++) {
      // Use logarithmic spacing for better coverage of extreme strains
      const c_frac = depthIdx / (numDepths - 1);
      const c = Math.exp(c_log_min + c_frac * (c_log_max - c_log_min));

      // Maximum strain: at the extreme fiber distance from NA
      const max_dist = Math.max(
        Math.abs(NA_perpX * (geo.B ? geo.B/2 : geo.D/2) + NA_perpY * (geo.H ? geo.H/2 : geo.D/2)),
        Math.abs(-NA_perpX * (geo.B ? geo.B/2 : geo.D/2) - NA_perpY * (geo.H ? geo.H/2 : geo.D/2))
      );

      // Curvature (strain/depth) at extreme fiber
      const kappa = (materialModel.eps_cu) / c; // kappa = ε_cu / c

      // Axial strain: solve for ε₀ that gives target P
      // N = ∫ σ_c dA + ∫ σ_s dA
      // We iterate to find ε₀ that produces this equilibrium

      // Binary search for ε₀ that gives approximately zero stress resultant
      let eps_0_low = -0.005;
      let eps_0_high = 0.005;
      let eps_0 = 0;

      for (let iter = 0; iter < 10; iter++) {
        eps_0 = (eps_0_low + eps_0_high) / 2;

        // Integrate section forces
        let N_trial = 0;
        let Mx_trial = 0;
        let My_trial = 0;

        // Integrate concrete fibers
        for (let fib of fibers) {
          // Strain: distance along NA direction determines compression/tension
          const dist_from_NA = fib.x * NA_perpX + fib.y * NA_perpY;
          const strain = eps_0 + kappa * (c - dist_from_NA);

          const stress = materialModel.getConcreteStress(strain);
          const force = stress * fib.dA;

          N_trial += force;
          Mx_trial += force * fib.y;
          My_trial += force * fib.x;
        }

        // Integrate steel bars
        for (let bar of barPositions) {
          const dist_from_NA = bar.x * NA_perpX + bar.y * NA_perpY;
          const strain = eps_0 + kappa * (c - dist_from_NA);

          const stress = materialModel.getSteelStress(strain);
          const force = stress * bar.As;

          N_trial += force;
          Mx_trial += force * bar.y;
          My_trial += force * bar.x;
        }

        // Adjust bounds for next iteration
        if (N_trial < 0) {
          eps_0_low = eps_0; // More compression needed
        } else {
          eps_0_high = eps_0;
        }
      }

      // Final integration with converged ε₀
      let N_final = 0, Mx_final = 0, My_final = 0;

      for (let fib of fibers) {
        const dist_from_NA = fib.x * NA_perpX + fib.y * NA_perpY;
        const strain = eps_0 + kappa * (c - dist_from_NA);
        const stress = materialModel.getConcreteStress(strain);
        const force = stress * fib.dA;

        N_final += force;
        Mx_final += force * fib.y;
        My_final += force * fib.x;
      }

      for (let bar of barPositions) {
        const dist_from_NA = bar.x * NA_perpX + bar.y * NA_perpY;
        const strain = eps_0 + kappa * (c - dist_from_NA);
        const stress = materialModel.getSteelStress(strain);
        const force = stress * bar.As;

        N_final += force;
        Mx_final += force * bar.y;
        My_final += force * bar.x;
      }

      // Convert units: N (N) -> P (kN), Moments (N·mm) -> M (kNm)
      const P = -N_final / 1000;
      const Mx = -Mx_final / 1e6;
      const My = -My_final / 1e6;

      // Only add points in valid range (P > 0 or near zero)
      if (P >= -50) { // Small tolerance for numerical error
        points.push({ x: Mx, y: My, z: P });
        P_collection.push(P);
        Mx_collection.push(Mx);
        My_collection.push(My);
      }
    }
  }

  // ================================================================
  // POLE CONVERGENCE: Explicit pole points for closed topology
  // ================================================================
  
  // Pure compression point (maximum P at M = 0)
  const P_max = fcd * Ac + fsd * As_total;
  points.push({ x: 0, y: 0, z: P_max / 1000 });

  // Pure tension point (M = 0, P negative or near zero)
  const As_total_eff = As_total;
  const P_tension = -(fsd * As_total_eff) / 1000;
  points.push({ x: 0, y: 0, z: P_tension });

  // ================================================================
  // BOUNDARY RING: Create ring caps at poles for mesh closure
  // ================================================================
  
  // Ring at compression pole
  const ringRadius_comp = Math.max(
    Math.max(...Mx_collection.map(m => Math.abs(m))),
    Math.max(...My_collection.map(m => Math.abs(m)))
  ) * 0.05; // Small radius ring

  const ringNumPoints = 16;
  for (let i = 0; i < ringNumPoints; i++) {
    const phi = (2 * Math.PI * i) / ringNumPoints;
    const Mx_ring = ringRadius_comp * Math.cos(phi);
    const My_ring = ringRadius_comp * Math.sin(phi);
    points.push({ x: Mx_ring, y: My_ring, z: P_max / 1000 });
  }

  // Ring at tension pole
  for (let i = 0; i < ringNumPoints; i++) {
    const phi = (2 * Math.PI * i) / ringNumPoints;
    const Mx_ring = ringRadius_comp * Math.cos(phi);
    const My_ring = ringRadius_comp * Math.sin(phi);
    points.push({ x: Mx_ring, y: My_ring, z: P_tension });
  }

  return points;
}
/**
 * Calculate safety factor for a load case
 */
function calculateSafetyFactor(load, surfacePoints) {
  const { P, Mx, My } = load;
  const dist = Math.sqrt(P * P + Mx * Mx + My * My);

  if (dist < 0.01) {
    return { k: 999, isSafe: true };
  }

  const uP = P / dist;
  const uMx = Mx / dist;
  const uMy = My / dist;

  let maxDot = -1;
  let bestPoint = null;

  for (let pt of surfacePoints) {
    const ptDist = Math.sqrt(pt.x * pt.x + pt.y * pt.y + pt.z * pt.z);
    if (ptDist < 0.01) continue;

    const dot = (pt.x * uMx + pt.y * uMy + pt.z * uP) / ptDist;

    if (dot > maxDot) {
      maxDot = dot;
      bestPoint = pt;
    }
  }

  if (bestPoint && maxDot > 0.95) {
    const capDist = Math.sqrt(
      bestPoint.x ** 2 + bestPoint.y ** 2 + bestPoint.z ** 2
    );
    const k = capDist / dist;
    return { k, isSafe: k >= 1.0 };
  }

  return { k: 0, isSafe: false };
}

/**
 * Main analysis function - entry point for the calculation engine
 * @param {Object} inputData - Input with properties: standard, colType, geo, mat, steel, loads
 * @returns {Object} Results with surfacePoints and safetyFactors
 */
function performAnalysis(inputData) {
  try {
    console.error("!!! performAnalysis CALLED !!!"); // Use error for visibility
    console.warn("Input data received:", inputData);
    
    // Generate interaction surface
    const surfacePoints = generateInteractionSurface(inputData);
    console.warn(`Generated ${surfacePoints.length} surface points`);

    // Calculate safety factors for all loads
    const safetyFactors = {};
    inputData.loads.forEach((load) => {
      safetyFactors[load.id] = calculateSafetyFactor(load, surfacePoints);
    });

    const result = {
      surfacePoints,
      safetyFactors,
      timestamp: new Date().toISOString(),
    };
    
    console.warn("Analysis complete. Result numPoints:", surfacePoints.length);
    return result;
  } catch (error) {
    console.error("Analysis error:", error);
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
};
