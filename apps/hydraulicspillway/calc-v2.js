/**
 * Hydraulic Spillway Calculator - Simplified Version
 * Tính toán nước nhảy thủy lực và bể tiêu năng
 * Based on hydraulic jump theory and energy dissipation principles
 */

const g = 9.81; // Gia tốc trọng trường (m/s²)

/**
 * Hàm tính toán chính
 */
function calculateHydraulicJump() {
  try {
    // Lấy dữ liệu đầu vào
    const Q = parseFloat(document.getElementById('flowRate').value);
    const B = parseFloat(document.getElementById('chuteWidth').value);
    const Z_tl = parseFloat(document.getElementById('upstreamLevel').value);
    const Z_ng = parseFloat(document.getElementById('thresholdLevel').value);
    const Z_dk = parseFloat(document.getElementById('basinBottom').value);
    const h_h = parseFloat(document.getElementById('downstreamDepth').value);
    const phi = parseFloat(document.getElementById('velocityCoeff').value);
    const alpha = parseFloat(document.getElementById('momentumCoeff').value);
    const sigma = parseFloat(document.getElementById('safetyCoeff').value);

    // Kiểm tra dữ liệu đầu vào
    if (isNaN(Q) || isNaN(B) || Q <= 0 || B <= 0) {
      showAlert('Vui lòng nhập đầy đủ lưu lượng Q và bề rộng B!', 'danger');
      return;
    }

    // Tính toán cơ bản
    const q = Q / B; // Lưu lượng đơn vị (m³/s/m)
    
    // Tính cột nước tại ngưỡng
    const H_crest = Z_tl - Z_ng; // Cột nước trên ngưỡng
    
    // Tính tốc độ và độ sâu tới hạn trên ngưỡng (broad-crested weir theory)
    const h_critical_crest = Math.pow(q * q / g, 1/3); // Độ sâu tới hạn
    const E_crest = 1.5 * h_critical_crest; // Năng lượng tại ngưỡng
    
    // Tổng năng lượng từ thượng lưu
    const v_approach = q / Math.max(H_crest, 0.5); // Vận tốc đến gần (ước tính)
    const E_total_crest = H_crest + v_approach * v_approach / (2 * g);
    
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
    const h2_conjugate = 0.5 * h1_no_basin * (Math.sqrt(1 + 8 * Fr1_no_basin * Fr1_no_basin) - 1);
    
    // Xác định hình thức nối tiếp
    let jumpType = '';
    let jumpTypeClass = '';
    
    if (h_h >= sigma * h2_conjugate) {
      jumpType = 'Nối tiếp bằng nước nhảy chìm';
      jumpTypeClass = 'success';
    } else if (h_h < h2_conjugate) {
      jumpType = 'Nối tiếp bằng nước nhảy phóng xa - Cần bể tiêu năng';
      jumpTypeClass = 'warning';
    } else {
      jumpType = 'Nối tiếp bằng nước nhảy tự do';
      jumpTypeClass = 'info';
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
      h2_basin = 0.5 * h1_basin * (Math.sqrt(1 + 8 * Fr1_basin * Fr1_basin) - 1);
      
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

    // HIỂN THỊ KẾT QUẢ
    displayResults({
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
      converged: converged
    });

  } catch (error) {
    console.error('Lỗi tính toán:', error);
    showAlert('Đã xảy ra lỗi trong quá trình tính toán: ' + error.message, 'danger');
  }
}

/**
 * Giải phương trình năng lượng: E = h + φ²*q²/(2*g*h²)
 * Sử dụng phương pháp Newton-Raphson
 */
function solveEnergyEquation(E, q, phi) {
  let h = Math.pow(q * q / g, 1/3); // Giá trị khởi tạo: độ sâu tới hạn
  const maxIter = 50;
  const tol = 1e-6;
  const phi2 = phi * phi;
  
  for (let i = 0; i < maxIter; i++) {
    const term = phi2 * q * q / (2 * g * h * h);
    const f = h + term - E;
    const df = 1 - 2 * term / h;
    
    const h_new = h - f / df;
    
    if (Math.abs(h_new - h) < tol && h_new > 0) {
      return h_new;
    }
    
    h = h_new > 0 ? h_new : h / 2; // Đảm bảo h dương
  }
  
  return h;
}

/**
 * Hiển thị kết quả lên giao diện
 */
function displayResults(results) {
  // Hiển thị phần kết quả
  const resultsSection = document.getElementById('resultsSection');
  resultsSection.classList.add('show');
  
  // Thông số nối tiếp
  document.getElementById('totalHead').innerHTML = results.E0.toFixed(2) + '<span class="unit">m</span>';
  document.getElementById('contractedDepth').innerHTML = results.h1.toFixed(2) + '<span class="unit">m</span>';
  document.getElementById('contractedVelocity').innerHTML = results.V1.toFixed(2) + '<span class="unit">m/s</span>';
  document.getElementById('froudeNumber').innerHTML = results.Fr1.toFixed(2);
  document.getElementById('conjugateDepth').innerHTML = results.h2_conjugate.toFixed(2) + '<span class="unit">m</span>';
  document.getElementById('jumpType').innerHTML = results.jumpType;
  
  // Bể tiêu năng
  document.getElementById('basinDepth').innerHTML = results.d_basin.toFixed(2) + '<span class="unit">m</span>';
  document.getElementById('basinLength').innerHTML = results.L_basin.toFixed(2) + '<span class="unit">m</span>';
  document.getElementById('waterDiff').innerHTML = results.deltaZ.toFixed(2) + '<span class="unit">m</span>';
  document.getElementById('submergenceFactor').innerHTML = results.K.toFixed(2);
  
  // Hiển thị thông báo hình thức nối tiếp
  let alertMessage = '';
  if (results.jumpTypeClass === 'success') {
    alertMessage = `<div class="alert alert-success">
      <strong>✅ Kết quả:</strong> ${results.jumpType}. Điều kiện nối tiếp tốt.
    </div>`;
  } else if (results.jumpTypeClass === 'warning') {
    alertMessage = `<div class="alert alert-warning">
      <strong>⚠️ Lưu ý:</strong> ${results.jumpType}.
    </div>`;
  } else {
    alertMessage = `<div class="alert alert-info">
      <strong>ℹ️ Thông tin:</strong> ${results.jumpType}.
    </div>`;
  }
  document.getElementById('alertBox').innerHTML = alertMessage;
  
  // Kết luận
  let conclusion = '<div class="alert alert-info"><strong>📋 Kết luận thiết kế:</strong><br>';
  conclusion += `Chiều sâu bể tiêu năng: <strong>d<sub>b</sub> = ${Math.ceil(results.d_basin * 2) / 2} m</strong> (làm tròn)<br>`;
  conclusion += `Chiều dài bể tiêu năng: <strong>L<sub>b</sub> = ${Math.ceil(results.L_basin)} m</strong> (làm tròn)<br>`;
  conclusion += `Số Froude tại đầu nước nhảy: <strong>Fr = ${results.Fr1_basin.toFixed(2)}</strong><br>`;
  
  if (results.K >= 1.0 && results.K <= 1.2) {
    conclusion += '<span style="color: green;">✓ Hệ số ngập K nằm trong phạm vi an toàn (1.0 - 1.2).</span>';
  } else if (results.K < 1.0) {
    conclusion += '<span style="color: red;">⚠️ Hệ số ngập K < 1.0, cần tăng độ sâu bể hoặc điều chỉnh thiết kế.</span>';
  } else {
    conclusion += '<span style="color: orange;">Hệ số ngập K > 1.2, có thể giảm độ sâu bể để tối ưu.</span>';
  }
  
  if (!results.converged) {
    conclusion += '<br><span style="color: orange;">⚠️ Lưu ý: Kết quả chưa hội tụ hoàn toàn, cần kiểm tra lại.</span>';
  }
  
  conclusion += '</div>';
  
  document.getElementById('conclusionBox').innerHTML = conclusion;
  
  // Cuộn xuống kết quả
  resultsSection.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}

/**
 * Hiển thị thông báo
 */
function showAlert(message, type) {
  const alertBox = document.getElementById('alertBox');
  const alertClass = `alert alert-${type}`;
  alertBox.innerHTML = `<div class="${alertClass}">${message}</div>`;
  
  const resultsSection = document.getElementById('resultsSection');
  resultsSection.classList.add('show');
  resultsSection.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}

// Tự động tính toán khi người dùng nhấn Enter trong input
document.addEventListener('DOMContentLoaded', function() {
  const inputs = document.querySelectorAll('input[type="number"]');
  inputs.forEach(input => {
    input.addEventListener('keypress', function(e) {
      if (e.key === 'Enter') {
        calculateHydraulicJump();
      }
    });
  });
});

