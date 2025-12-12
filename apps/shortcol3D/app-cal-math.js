/**
 * PURE CALCULATION ENGINE (Math Module)
 * Pure mathematical functions for biaxial bending interaction diagram
 * NO DOM REFERENCES - Only takes numeric inputs and returns calculation results
 */

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
  const W = B - 2 * cover; // Core width
  const H_core = H - 2 * cover; // Core height
  const perimeter = 2 * (W + H_core);
  const spacing = perimeter / Nb;

  for (let i = 0; i < Nb; i++) {
    let currentDist = i * spacing;
    let x = 0,
      y = 0;

    if (currentDist <= W) {
      // Bottom edge
      x = -W / 2 + currentDist;
      y = -H_core / 2;
    } else if (currentDist <= W + H_core) {
      // Right edge
      x = W / 2;
      y = -H_core / 2 + (currentDist - W);
    } else if (currentDist <= 2 * W + H_core) {
      // Top edge
      x = W / 2 - (currentDist - (W + H_core));
      y = H_core / 2;
    } else {
      // Left edge
      x = -W / 2;
      y = H_core / 2 - (currentDist - (2 * W + H_core));
    }

    bars.push({ x, y });
  }

  return bars;
}

/**
 * Generate interaction surface points
 * Calculates moment capacities for different axial load levels
 * @param {Object} inputData - Input parameters {colType, geo, mat, steel, standard}
 * @returns {Array} Array of {x, y, z} points representing P-Mx-My surface
 */
function generateInteractionSurface(inputData) {
  const { colType, geo, mat, steel, standard } = inputData;

  // Get design coefficients based on standard
  const coeff = getDesignCoefficients(standard);

  // Material properties
  const fck = mat.fck; // Concrete strength (MPa)
  const fyk = mat.fyk; // Steel yield (MPa)
  const fcd = fck / coeff.gammac; // Design concrete strength
  const fsd = fyk / coeff.gammas; // Design steel strength

  // Geometry
  let Ac, d_eff, I;
  if (colType === "rect") {
    const B = geo.B; // Width
    const H = geo.H; // Height
    Ac = B * H; // Gross area
    d_eff = Math.max(B, H); // Effective depth (simplified)
    I = (B * Math.pow(H, 3)) / 12; // Moment of inertia
  } else {
    const D = geo.D;
    Ac = Math.PI * Math.pow(D / 2, 2);
    d_eff = D;
    I = (Math.PI * Math.pow(D, 4)) / 64;
  }

  // Reinforcement
  const Nb = steel.Nb;
  const As_total = steel.As_bar * Nb; // Total reinforcement area
  const rho = As_total / Ac; // Reinforcement ratio

  // Bar positions
  let barPositions = [];
  if (colType === "rect") {
    barPositions = generateBarPositions(Nb, geo.B, geo.H, geo.cover);
  } else {
    // Circular - generate bars in circle
    barPositions = [];
    const radius = (geo.D - 2 * geo.cover) / 2;
    for (let i = 0; i < Nb; i++) {
      const angle = (2 * Math.PI * i) / Nb;
      barPositions.push({
        x: radius * Math.cos(angle),
        y: radius * Math.sin(angle),
      });
    }
  }

  // Generate points on interaction surface
  const points = [];

  // Load levels: 0 to Pu (ultimate axial capacity)
  const Pu = fcd * Ac + fsd * As_total; // Approximate ultimate capacity
  const numLoads = 12;

  for (let loadIdx = 0; loadIdx <= numLoads; loadIdx++) {
    const loadFraction = loadIdx / numLoads;
    const P = loadFraction * Pu;

    // For each load level, calculate Mx and My capacities
    // Using strain compatibility and equilibrium approach

    // Moment capacity in X direction (bending about Y-axis)
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

    // Moment capacity in Y direction (bending about X-axis)
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

    // Add points to surface
    // Generate multiple points around the biaxial envelope
    const numAngles = 16;
    for (let angleIdx = 0; angleIdx < numAngles; angleIdx++) {
      const theta = (2 * Math.PI * angleIdx) / numAngles;

      // Biaxial interaction using Bresler's formula (simplified)
      // M = Mx*sin(θ) + My*cos(θ)
      const Mx_point = Mx_cap * Math.sin(theta);
      const My_point = My_cap * Math.cos(theta);

      points.push({
        x: Mx_point,
        y: My_point,
        z: P,
      });
    }
  }

  return points;
}

/**
 * Calculate moment capacity at a given axial load
 * @param {string} colType - "rect" or "circ"
 * @param {Object} geo - Geometry {B, H, D, cover}
 * @param {Array} barPositions - Bar coordinates
 * @param {number} As_bar - Single bar area
 * @param {number} P - Axial load (kN)
 * @param {number} fcd - Design concrete strength
 * @param {number} fsd - Design steel strength
 * @param {string} direction - "x" or "y"
 * @returns {number} Moment capacity (kNm)
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
  // Simplified moment capacity calculation
  // Using elastic analysis with section properties

  let W; // Section modulus
  let c; // Centroid distance

  if (colType === "rect") {
    const B = geo.B;
    const H = geo.H;

    if (direction === "x") {
      // Bending about Y-axis
      W = (B * H * H) / 6;
      c = H / 2;
    } else {
      // Bending about X-axis
      W = (H * B * B) / 6;
      c = B / 2;
    }
  } else {
    const D = geo.D;
    // Section modulus for circle
    W = (Math.PI * Math.pow(D, 3)) / 32;
    c = D / 2;
  }

  // Calculate capacity based on strain compatibility
  // Simplified: Use ultimate moment approach
  // Assume neutral axis position based on axial load

  // Gross section moment (concrete + steel)
  const Mg = W * fcd; // Concrete contribution

  // Steel contribution (simplified)
  const Ms = (fsd * As_bar * barPositions.length * c) / 1000; // Convert to kNm

  // Combined moment capacity
  const M_cap = Mg + Ms;

  // Reduce based on axial load (interaction effect)
  const Ac =
    colType === "rect" ? geo.B * geo.H : Math.PI * Math.pow(geo.D / 2, 2);
  const Pu = (fcd * Ac) / 1000; // Convert to kN
  const interaction = Math.max(0.1, 1 - P / (2 * Pu)); // Simple reduction

  return M_cap * interaction;
}

/**
 * Get design coefficients based on design standard
 * @param {string} standard - "TCVN", "EC2", or "ACI"
 * @returns {Object} Coefficients {gammac, gammas, ...}
 */
function getDesignCoefficients(standard) {
  const coeff = {
    TCVN: { gammac: 1.3, gammas: 1.15 },
    EC2: { gammac: 1.5, gammas: 1.15 },
    ACI: { gammac: 0.85, gammas: 0.9 }, // ACI uses reduction factors
  };

  return coeff[standard] || coeff.TCVN;
}

/**
 * Calculate safety factor for a load case
 * @param {Object} load - {P, Mx, My} in kN, kNm, kNm
 * @param {Array} surfacePoints - Interaction surface points
 * @returns {Object} {k, isSafe, location}
 */
function calculateSafetyFactor(load, surfacePoints) {
  const { P, Mx, My } = load;

  // Distance from origin
  const dist = Math.sqrt(P * P + Mx * Mx + My * My);

  if (dist < 0.01) {
    return { k: 999, isSafe: true, location: "origin" };
  }

  // Unit vector of load
  const uP = P / dist;
  const uMx = Mx / dist;
  const uMy = My / dist;

  // Find intersection point on surface
  let maxDot = -1;
  let bestPoint = null;

  for (let pt of surfacePoints) {
    const ptDist = Math.sqrt(pt.x * pt.x + pt.y * pt.y + pt.z * pt.z);
    if (ptDist < 0.01) continue;

    // Dot product with load direction
    const dot = (pt.x * uMx + pt.y * uMy + pt.z * uP) / ptDist;

    if (dot > maxDot) {
      maxDot = dot;
      bestPoint = pt;
    }
  }

  if (bestPoint && maxDot > 0.95) {
    const capDist = Math.sqrt(
      bestPoint.x * bestPoint.x +
        bestPoint.y * bestPoint.y +
        bestPoint.z * bestPoint.z
    );
    const k = capDist / dist;
    return { k, isSafe: k >= 1.0, location: bestPoint };
  }

  return { k: 0, isSafe: false, location: null };
}

/**
 * Main calculation function
 * @param {Object} inputData - Complete input data
 * @returns {Object} Calculation results
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

    // Return results
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

// Export to global scope
window.CalculationEngine = {
  generateInteractionSurface,
  calculateSafetyFactor,
  performAnalysis,
  generateBarPositions,
};
