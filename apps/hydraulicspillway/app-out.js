/**
 * APP OUTPUT & DISPLAY MODULE
 * Handles all result visualization and DOM updates
 * Input: calculation results from app-cal.js
 */

/**
 * Main display function - shows basic results dashboard
 */
function displayResults(results) {
  // Show results section
  const resultsSection = document.getElementById("resultsSection");
  if (resultsSection) {
    resultsSection.classList.add("show");
  }

  // Display basic results
  document.getElementById("totalHead").innerHTML =
    results.E0.toFixed(2) + '<span class="unit">m</span>';
  document.getElementById("contractedDepth").innerHTML =
    results.h1.toFixed(2) + '<span class="unit">m</span>';
  document.getElementById("contractedVelocity").innerHTML =
    results.V1.toFixed(2) + '<span class="unit">m/s</span>';
  document.getElementById("froudeNumber").innerHTML = results.Fr1.toFixed(2);
  document.getElementById("conjugateDepth").innerHTML =
    results.h2_conjugate.toFixed(2) + '<span class="unit">m</span>';
  document.getElementById("jumpType").innerHTML = results.jumpType;

  // Basin design parameters
  document.getElementById("basinDepth").innerHTML =
    results.d_basin.toFixed(2) + '<span class="unit">m</span>';
  document.getElementById("basinLength").innerHTML =
    results.L_basin.toFixed(2) + '<span class="unit">m</span>';
  document.getElementById("waterDiff").innerHTML =
    results.deltaZ.toFixed(2) + '<span class="unit">m</span>';
  document.getElementById("submergenceFactor").innerHTML = results.K.toFixed(2);

  // Jump type alert
  let alertMessage = "";
  if (results.jumpTypeClass === "success") {
    alertMessage = `<div class="alert alert-success">
      <strong>✅ Kết quả:</strong> ${results.jumpType}. Điều kiện nối tiếp tốt.
    </div>`;
  } else if (results.jumpTypeClass === "warning") {
    alertMessage = `<div class="alert alert-warning">
      <strong>⚠️ Lưu ý:</strong> ${results.jumpType}.
    </div>`;
  } else {
    alertMessage = `<div class="alert alert-info">
      <strong>ℹ️ Thông tin:</strong> ${results.jumpType}.
    </div>`;
  }
  document.getElementById("alertBox").innerHTML = alertMessage;

  // Design conclusion
  let conclusion =
    '<div class="alert alert-info"><strong>📋 Kết luận thiết kế:</strong><br>';
  conclusion += `Chiều sâu bể tiêu năng: <strong>d<sub>b</sub> = ${
    Math.ceil(results.d_basin * 2) / 2
  } m</strong> (làm tròn)<br>`;
  conclusion += `Chiều dài bể tiêu năng: <strong>L<sub>b</sub> = ${Math.ceil(
    results.L_basin
  )} m</strong> (làm tròn)<br>`;
  conclusion += `Số Froude tại đầu nước nhảy: <strong>Fr = ${results.Fr1_basin.toFixed(
    2
  )}</strong><br>`;

  if (results.K >= 1.0 && results.K <= 1.2) {
    conclusion +=
      '<span style="color: green;">✓ Hệ số ngập K nằm trong phạm vi an toàn (1.0 - 1.2).</span>';
  } else if (results.K < 1.0) {
    conclusion +=
      '<span style="color: red;">⚠️ Hệ số ngập K < 1.0, cần tăng độ sâu bể hoặc điều chỉnh thiết kế.</span>';
  } else {
    conclusion +=
      '<span style="color: orange;">Hệ số ngập K > 1.2, có thể giảm độ sâu bể để tối ưu.</span>';
  }

  if (!results.converged) {
    conclusion +=
      '<br><span style="color: orange;">⚠️ Lưu ý: Kết quả chưa hội tụ hoàn toàn, cần kiểm tra lại.</span>';
  }

  conclusion += "</div>";

  const conclusionBox = document.getElementById("conclusionBox");
  if (conclusionBox) {
    conclusionBox.innerHTML = conclusion;
  }

  // Scroll to results
  if (resultsSection) {
    resultsSection.scrollIntoView({ behavior: "smooth", block: "nearest" });
  }
}

/**
 * Display detailed results with comprehensive tables
 */
function displayDetailedResults(results, inputData) {
  const detailedContainer = document.getElementById("detailedResults");
  if (!detailedContainer) return;

  detailedContainer.classList.add("show");

  // Generate comparison table
  const comparisonTable = generateComparisonTable(results, inputData);
  const detailedTable = generateDetailedParametersTable(results, inputData);

  // Update container
  let html = comparisonTable + "<br>" + detailedTable;
  detailedContainer.innerHTML = html;

  detailedContainer.scrollIntoView({
    behavior: "smooth",
    block: "nearest",
  });
}

/**
 * Generate comparison table (with vs without basin)
 */
function generateComparisonTable(results, inputData) {
  return `
    <h4 style="color: #0073e6; margin-top: 0;">Bảng So Sánh: Có bể vs Không có bể</h4>
    <table class="results-table">
      <thead>
        <tr>
          <th>Thông số</th>
          <th>Không có bể</th>
          <th>Có bể tiêu năng</th>
          <th>Ghi chú</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td>Cột nước toàn phần E₀ (m)</td>
          <td>${results.E0.toFixed(2)}</td>
          <td>${results.E0_basin.toFixed(2)}</td>
          <td>Tăng do đào sâu bể</td>
        </tr>
        <tr>
          <td>Độ sâu tại chân dốc h₁ (m)</td>
          <td>${results.h1.toFixed(3)}</td>
          <td>${results.h1_basin.toFixed(3)}</td>
          <td>Giảm nhẹ</td>
        </tr>
        <tr>
          <td>Vận tốc V₁ (m/s)</td>
          <td>${results.V1.toFixed(2)}</td>
          <td>${results.V1_basin.toFixed(2)}</td>
          <td>Tăng nhẹ</td>
        </tr>
        <tr>
          <td>Số Froude Fr₁</td>
          <td>${results.Fr1.toFixed(2)}</td>
          <td>${results.Fr1_basin.toFixed(2)}</td>
          <td>Siêu tới hạn</td>
        </tr>
        <tr>
          <td>Độ sâu liên hiệp h₂ (m)</td>
          <td>${results.h2_conjugate.toFixed(2)}</td>
          <td>${results.h2_basin.toFixed(2)}</td>
          <td>Tăng do bể</td>
        </tr>
        <tr>
          <td>Hình thức nối tiếp</td>
          <td colspan="2">${results.jumpType}</td>
          <td>${results.jumpTypeClass === "warning" ? "Cần bể" : "OK"}</td>
        </tr>
      </tbody>
    </table>
  `;
}

/**
 * Generate detailed parameters table
 */
function generateDetailedParametersTable(results, inputData) {
  return `
    <h4 style="color: #0073e6; margin-top: 20px;">Bảng Chi Tiết: Thông Số Thiết Kế</h4>
    <table class="results-table">
      <thead>
        <tr>
          <th>Mục</th>
          <th>Ký hiệu</th>
          <th>Giá trị</th>
          <th>Đơn vị</th>
        </tr>
      </thead>
      <tbody>
        <tr class="section-divider">
          <td colspan="4"><strong>Thông Số Đầu Vào</strong></td>
        </tr>
        <tr>
          <td>Lưu lượng tính toán</td>
          <td>Q</td>
          <td>${inputData.Q.toFixed(2)}</td>
          <td>m³/s</td>
        </tr>
        <tr>
          <td>Bề rộng dốc</td>
          <td>B</td>
          <td>${inputData.B.toFixed(2)}</td>
          <td>m</td>
        </tr>
        <tr>
          <td>Lưu lượng đơn vị</td>
          <td>q</td>
          <td>${(inputData.Q / inputData.B).toFixed(3)}</td>
          <td>m³/s/m</td>
        </tr>
        <tr class="section-divider">
          <td colspan="4"><strong>Thông Số Tại Đáy Bể</strong></td>
        </tr>
        <tr>
          <td>Độ sâu tại đáy bể</td>
          <td>h₁</td>
          <td>${results.h1_basin.toFixed(3)}</td>
          <td>m</td>
        </tr>
        <tr>
          <td>Vận tốc tại đáy bể</td>
          <td>V₁</td>
          <td>${results.V1_basin.toFixed(2)}</td>
          <td>m/s</td>
        </tr>
        <tr>
          <td>Số Froude</td>
          <td>Fr₁</td>
          <td>${results.Fr1_basin.toFixed(2)}</td>
          <td>-</td>
        </tr>
        <tr>
          <td>Cột nước toàn phần</td>
          <td>E₀</td>
          <td>${results.E0_basin.toFixed(2)}</td>
          <td>m</td>
        </tr>
        <tr class="section-divider">
          <td colspan="4"><strong>Nước Nhảy Và Tiêu Năng</strong></td>
        </tr>
        <tr>
          <td>Độ sâu liên hiệp</td>
          <td>h₂</td>
          <td>${results.h2_basin.toFixed(2)}</td>
          <td>m</td>
        </tr>
        <tr>
          <td>Chiều sâu bể thiết kế</td>
          <td>d<sub>b</sub></td>
          <td><strong>${results.d_basin.toFixed(2)}</strong></td>
          <td>m</td>
        </tr>
        <tr>
          <td>Chiều dài bể thiết kế</td>
          <td>L<sub>b</sub></td>
          <td><strong>${results.L_basin.toFixed(2)}</strong></td>
          <td>m</td>
        </tr>
        <tr>
          <td>Chiều dài nước nhảy</td>
          <td>L<sub>jump</sub></td>
          <td>${(results.L_basin / 0.75).toFixed(2)}</td>
          <td>m</td>
        </tr>
        <tr class="section-divider">
          <td colspan="4"><strong>Kiểm Tra An Toàn</strong></td>
        </tr>
        <tr>
          <td>Độ sâu hạ lưu</td>
          <td>h<sub>h</sub></td>
          <td>${inputData.h_h.toFixed(2)}</td>
          <td>m</td>
        </tr>
        <tr>
          <td>Chênh lệch cột nước</td>
          <td>ΔZ</td>
          <td>${results.deltaZ.toFixed(2)}</td>
          <td>m</td>
        </tr>
        <tr>
          <td>Hệ số ngập</td>
          <td>K</td>
          <td><strong>${results.K.toFixed(3)}</strong></td>
          <td>-</td>
        </tr>
        <tr>
          <td>Trạng thái</td>
          <td>-</td>
          <td colspan="2">
            ${
              results.K >= 1.0 && results.K <= 1.2
                ? '<span style="color: green;">✓ Đạt yêu cầu an toàn</span>'
                : results.K < 1.0
                ? '<span style="color: red;">⚠ Cần điều chỉnh</span>'
                : '<span style="color: orange;">⚠ Cần xem xét tối ưu</span>'
            }
          </td>
        </tr>
      </tbody>
    </table>
  `;
}

/**
 * Generate simplified water profile data
 */
function generateSimplifiedProfile(results, inputData) {
  const stations = [];
  const bedElevations = [];
  const waterSurface = [];

  const Z_ng = inputData.Z_ng || 625.0;
  const Z_dk = inputData.Z_dk || 617.0;
  const chuteLength = 65; // 20m + 45m from PDF
  const basinLength = results.L_basin;

  // Chute section (0 to chuteLength)
  const numPoints = 20;
  for (let i = 0; i <= numPoints; i++) {
    const x = (chuteLength * i) / numPoints;
    stations.push(x.toFixed(1));

    // Bed elevation (linear slope 20%)
    const bedElev = Z_ng - x * 0.2;
    bedElevations.push(bedElev.toFixed(2));

    // Water surface (simplified - depth decreases along chute)
    const depth =
      results.h1 + (results.h1_basin - results.h1) * (1 - i / numPoints) * 0.5;
    waterSurface.push((bedElev + depth).toFixed(2));
  }

  // Basin section
  const basinPoints = 5;
  for (let i = 1; i <= basinPoints; i++) {
    const x = chuteLength + (basinLength * i) / basinPoints;
    stations.push(x.toFixed(1));

    // Basin bed
    bedElevations.push((Z_dk - results.d_basin).toFixed(2));

    // Water surface in basin (jump occurs)
    const depth = i < 2 ? results.h1_basin : results.h2_basin;
    waterSurface.push((Z_dk - results.d_basin + depth).toFixed(2));
  }

  // Downstream section
  for (let i = 1; i <= 3; i++) {
    const x = chuteLength + basinLength + 10 * i;
    stations.push(x.toFixed(1));
    bedElevations.push(Z_dk.toFixed(2));
    waterSurface.push((Z_dk + inputData.h_h).toFixed(2));
  }

  return {
    stations,
    bedElevations,
    waterSurface,
    basinLocation: chuteLength,
  };
}
