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
 * Generate interaction surface points (P-Mx-My diagram)
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

  let barPositions = [];
  if (colType === "rect") {
    barPositions = generateBarPositions(Nb, geo.B, geo.H, geo.cover);
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

  const points = [];
  const Pu = fcd * Ac + fsd * As_total;
  const numLoads = 12;

  for (let loadIdx = 0; loadIdx <= numLoads; loadIdx++) {
    const loadFraction = loadIdx / numLoads;
    const P = loadFraction * Pu;

    const Mx_cap = calculateMomentCapacity(
      colType,
      geo,
      barPositions,
      As_total / Nb,
      P,
      fcd,
      fsd,
      "x"
    );
    const My_cap = calculateMomentCapacity(
      colType,
      geo,
      barPositions,
      As_total / Nb,
      P,
      fcd,
      fsd,
      "y"
    );

// --- ĐOẠN CODE SỬA ĐỔI: TẠO ĐIỂM BIÊN VÀ ĐÓNG KÍN MẶT (CAP) ---
    const numAngles = 24; // Tăng mật độ điểm để Mesh mịn hơn
    for (let angleIdx = 0; angleIdx < numAngles; angleIdx++) {
      const theta = (2 * Math.PI * angleIdx) / numAngles;
      const Mx_point = Mx_cap * Math.cos(theta);
      const My_point = My_cap * Math.sin(theta);

      points.push({
        x: Mx_point,
        y: My_point,
        z: P,
      });
    }
  }

  // FIX HỞ ĐÁY: Bổ sung các điểm trọng tâm tuyệt đối (Centroid points)
  // Điểm chốt tại đỉnh biểu đồ (Lực nén lớn nhất, Moment = 0)
  points.push({ x: 0, y: 0, z: Pu });
  
  // Điểm chốt tại đáy biểu đồ (Lực nén = 0, Moment = 0) 
  // Thêm một offset cực nhỏ (-0.001) để định hướng Vector pháp tuyến mặt đáy
  points.push({ x: 0, y: 0, z: 0 });
  points.push({ x: 0, y: 0, z: -0.001 }); 

  // Bổ sung vòng đệm đáy để ép Alphahull tạo mặt phẳng phẳng tuyệt đối
  for (let i = 0; i < 8; i++) {
    const angle = (2 * Math.PI * i) / 8;
    points.push({ x: 0.1 * Math.cos(angle), y: 0.1 * Math.sin(angle), z: 0 });
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
    // Generate interaction surface
    const surfacePoints = generateInteractionSurface(inputData);

    // Calculate safety factors for all loads
    const safetyFactors = {};
    inputData.loads.forEach((load) => {
      safetyFactors[load.id] = calculateSafetyFactor(load, surfacePoints);
    });

    return {
      surfacePoints,
      safetyFactors,
      timestamp: new Date().toISOString(),
    };
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
