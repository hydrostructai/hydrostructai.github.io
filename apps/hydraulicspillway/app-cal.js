/**
 * APP CALCULATION MODULE (Pure Math)
 * Pure mathematical functions for hydraulic jump calculation
 * NO DOM REFERENCES - Only takes numeric inputs and returns calculation results
 * Flow: Called from app-inp.js -> Returns data to app-inp.js -> Passed to app-out.js
 */

const g = 9.81; // Gia tốc trọng trường (m/s²)

/**
 * Main Hydraulic Jump Calculation Function
 * Takes input object and returns complete calculation results
 */
function performHydraulicCalculation(inputData) {
  try {
    // Extract input parameters
    const Q = inputData.Q;
    const B = inputData.B;
    const Z_tl = inputData.Z_tl;
    const Z_ng = inputData.Z_ng;
    const Z_dk = inputData.Z_dk;
    const h_h = inputData.h_h;
    const phi = inputData.phi;
    const alpha = inputData.alpha;
    const sigma = inputData.sigma;

    // Tính toán cơ bản
    const q = Q / B; // Lưu lượng đơn vị (m³/s/m)

    // Tính cột nước tại ngưỡng
    const H_crest = Z_tl - Z_ng; // Cột nước trên ngưỡng

    // Tính tốc độ và độ sâu tới hạn trên ngưỡng (broad-crested weir theory)
    const h_critical_crest = Math.pow((q * q) / g, 1 / 3); // Độ sâu tới hạn
    const E_crest = 1.5 * h_critical_crest; // Năng lượng tại ngưỡng

    // Tổng năng lượng từ thượng lưu
    const v_approach = q / Math.max(H_crest, 0.5); // Vận tốc đến gần (ước tính)
    const E_total_crest = H_crest + (v_approach * v_approach) / (2 * g);

    // TÍNH TOÁN NỐI TIẾP (không có bể)
    // Năng lượng có sẵn tại cuối dốc (đáy kênh hạ lưu)
    const z_drop = Z_ng - Z_dk; // Độ chênh cao từ ngưỡng xuống đáy
    const E0_at_toe = E_total_crest + z_drop; // Tổng năng lượng tại chân dốc

    // Tính độ sâu tại chân dốc (h1) - giải phương trình năng lượng
    // E0 = h1 + φ²*V1²/(2g) = h1 + φ²*q²/(2g*h1²)
    const h1_no_basin = solveEnergyEquation(E0_at_toe, q, phi);
    const V1_no_basin = q / h1_no_basin;
    const Fr1_no_basin = V1_no_basin / Math.sqrt(g * h1_no_basin);

    // Độ sâu liên hiệp (conjugate depth) sau nước nhảy
    const h2_conjugate =
      0.5 * h1_no_basin * (Math.sqrt(1 + 8 * Fr1_no_basin * Fr1_no_basin) - 1);

    // Xác định hình thức nối tiếp
    let jumpType = "";
    let jumpTypeClass = "";

    if (h_h >= sigma * h2_conjugate) {
      jumpType = "Nối tiếp bằng nước nhảy chìm";
      jumpTypeClass = "success";
    } else if (h_h < h2_conjugate) {
      jumpType = "Nối tiếp bằng nước nhảy phóng xa - Cần bể tiêu năng";
      jumpTypeClass = "warning";
    } else {
      jumpType = "Nối tiếp bằng nước nhảy tự do";
      jumpTypeClass = "info";
    }

    // TÍNH TOÁN BỂ TIÊU NĂNG
    // Lặp để tìm chiều sâu bể thích hợp
    let d_basin = Math.max(0.5, h2_conjugate - h_h); // Giả thiết ban đầu
    let h1_basin, h2_basin, Fr1_basin, deltaZ;
    let converged = false;

    for (let iter = 0; iter < 20; iter++) {
      // Năng lượng với bể (đáy bể thấp hơn đáy kênh)
      const E0_with_basin = E_total_crest + (Z_ng - (Z_dk - d_basin));

      // Độ sâu tại đáy bể
      h1_basin = solveEnergyEquation(E0_with_basin, q, phi);
      const V1_basin = q / h1_basin;
      Fr1_basin = V1_basin / Math.sqrt(g * h1_basin);

      // Độ sâu liên hiệp
      h2_basin =
        0.5 * h1_basin * (Math.sqrt(1 + 8 * Fr1_basin * Fr1_basin) - 1);

      // Độ sâu cần thiết sau bể (với hệ số an toàn)
      const h2_required = sigma * h2_basin;

      // Chênh lệch cột nước tại cửa ra
      deltaZ = h2_required - h_h;

      // Tính lại chiều sâu bể
      const d_new = h2_basin - h_h - deltaZ;

      // Kiểm tra hội tụ
      if (Math.abs(d_new - d_basin) < 0.01) {
        d_basin = d_new;
        converged = true;
        break;
      }

      d_basin = 0.5 * (d_basin + d_new); // Relaxation
    }

    // Chiều dài bể tiêu năng (theo công thức M.D. Chertousov)
    const L_jump = 4.5 * h2_basin; // Chiều dài nước nhảy
    const L_basin = 0.75 * L_jump; // Hệ số an toàn 0.7-0.8

    // Hệ số ngập
    const K = (h_h + deltaZ) / h2_basin;

    // Return calculation results (handled by app-inp.js for display)
    return {
      // Nối tiếp không có bể
      E0: E0_at_toe,
      h1: h1_no_basin,
      V1: V1_no_basin,
      Fr1: Fr1_no_basin,
      h2_conjugate: h2_conjugate,
      jumpType: jumpType,
      jumpTypeClass: jumpTypeClass,

      // Bể tiêu năng
      E0_basin: E_total_crest + (Z_ng - (Z_dk - d_basin)),
      h1_basin: h1_basin,
      V1_basin: q / h1_basin,
      Fr1_basin: Fr1_basin,
      h2_basin: h2_basin,
      d_basin: d_basin,
      L_basin: L_basin,
      deltaZ: deltaZ,
      K: K,
      converged: converged,
    };
  } catch (error) {
    console.error("Lỗi tính toán:", error);
    throw error;
  }
}

/**
 * Giải phương trình năng lượng: E = h + φ²*q²/(2*g*h²)
 * Sử dụng phương pháp Newton-Raphson
 */
function solveEnergyEquation(E, q, phi) {
  let h = Math.pow((q * q) / g, 1 / 3); // Giá trị khởi tạo: độ sâu tới hạn
  const maxIter = 50;
  const tol = 1e-6;
  const phi2 = phi * phi;

  for (let i = 0; i < maxIter; i++) {
    const term = (phi2 * q * q) / (2 * g * h * h);
    const f = h + term - E;
    const df = 1 - (2 * term) / h;

    const h_new = h - f / df;

    if (Math.abs(h_new - h) < tol && h_new > 0) {
      return h_new;
    }

    h = h_new > 0 ? h_new : h / 2; // Đảm bảo h dương
  }

  return h;
}

/**
 * Additional utility functions for energy calculations (pure math)
 */

// More utilities can be added here as needed
