/**
 * Output Visualization Module for Hydraulic Spillway Calculator
 * Handles tables and charts for water profile and stilling basin results
 */

let profileChart = null; // Global chart instance

/**
 * Display comprehensive results with tables and chart
 * @param {Object} results - Calculation results from calc.js
 * @param {Object} inputData - Original input parameters
 */
function displayDetailedResults(results, inputData) {
  // Show results section
  document.getElementById('detailedResults').classList.add('show');
  
  // Generate tables
  generateStillingBasinTable(results, inputData);
  generateSummaryTable(results);
  
  // Generate chart if profile data available
  if (results.profileData) {
    generateProfileChart(results.profileData, inputData);
  }
  
  // Scroll to results
  document.getElementById('detailedResults').scrollIntoView({ 
    behavior: 'smooth', 
    block: 'nearest' 
  });
}

/**
 * Generate stilling basin design parameters table
 */
function generateStillingBasinTable(results, inputData) {
  const tableContainer = document.getElementById('stillingBasinTable');
  
  const html = `
    <h4 style="color: #0073e6; margin-top: 0;">Thông Số Bể Tiêu Năng</h4>
    <table class="results-table">
      <thead>
        <tr>
          <th>Thông số</th>
          <th>Ký hiệu</th>
          <th>Giá trị</th>
          <th>Đơn vị</th>
        </tr>
      </thead>
      <tbody>
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
          <td colspan="4"><strong>Thông số tại đáy bể</strong></td>
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
          <td colspan="4"><strong>Nước nhảy và tiêu năng</strong></td>
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
          <td colspan="4"><strong>Kiểm tra an toàn</strong></td>
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
            ${results.K >= 1.0 && results.K <= 1.2 
              ? '<span style="color: green;">✓ Đạt yêu cầu an toàn</span>' 
              : results.K < 1.0 
                ? '<span style="color: red;">⚠ Cần điều chỉnh</span>'
                : '<span style="color: orange;">⚠ Cần xem xét tối ưu</span>'}
          </td>
        </tr>
      </tbody>
    </table>
    
    <div class="design-note">
      <h5>📐 Kích thước thiết kế đề xuất (làm tròn):</h5>
      <ul>
        <li><strong>Chiều sâu bể:</strong> d<sub>b</sub> = ${Math.ceil(results.d_basin * 2) / 2} m</li>
        <li><strong>Chiều dài bể:</strong> L<sub>b</sub> = ${Math.ceil(results.L_basin)} m</li>
        <li><strong>Loại nước nhảy:</strong> ${results.Fr1_basin > 4.5 ? 'Nước nhảy mạnh (Fr > 4.5)' : 'Nước nhảy trung bình'}</li>
        <li><strong>Hiệu suất tiêu năng:</strong> ~${results.Fr1_basin > 4.5 ? '60-70%' : '50-60%'}</li>
      </ul>
    </div>
  `;
  
  tableContainer.innerHTML = html;
}

/**
 * Generate summary comparison table
 */
function generateSummaryTable(results) {
  const tableContainer = document.getElementById('summaryTable');
  
  const html = `
    <h4 style="color: #0073e6; margin-top: 0;">So Sánh: Có bể vs Không có bể</h4>
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
          <td>${results.jumpTypeClass === 'warning' ? 'Cần bể' : 'OK'}</td>
        </tr>
      </tbody>
    </table>
  `;
  
  tableContainer.innerHTML = html;
}

/**
 * Generate water surface profile chart using Chart.js
 */
function generateProfileChart(profileData, inputData) {
  const canvas = document.getElementById('profileChart');
  const ctx = canvas.getContext('2d');
  
  // Destroy existing chart if any
  if (profileChart) {
    profileChart.destroy();
  }
  
  // Prepare data
  const stations = profileData.stations || [];
  const bedElevations = profileData.bedElevations || [];
  const waterSurface = profileData.waterSurface || [];
  const basinLocation = profileData.basinLocation || null;
  
  // Create chart
  profileChart = new Chart(ctx, {
    type: 'line',
    data: {
      labels: stations,
      datasets: [
        {
          label: 'Đáy dốc (Bed)',
          data: bedElevations,
          borderColor: '#8B4513',
          backgroundColor: 'rgba(139, 69, 19, 0.1)',
          borderWidth: 2,
          fill: true,
          tension: 0.1,
          pointRadius: 0
        },
        {
          label: 'Mặt nước (Water Surface)',
          data: waterSurface,
          borderColor: '#0073e6',
          backgroundColor: 'rgba(0, 115, 230, 0.2)',
          borderWidth: 3,
          fill: false,
          tension: 0.3,
          pointRadius: 3,
          pointHoverRadius: 5
        }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: true,
      aspectRatio: 2.5,
      plugins: {
        title: {
          display: true,
          text: 'Mặt cắt dọc dốc nước và bể tiêu năng',
          font: {
            size: 16,
            weight: 'bold'
          },
          color: '#333'
        },
        legend: {
          display: true,
          position: 'top',
          labels: {
            usePointStyle: true,
            padding: 15
          }
        },
        tooltip: {
          mode: 'index',
          intersect: false,
          callbacks: {
            title: function(context) {
              return 'Lý trình: ' + context[0].label + ' m';
            },
            label: function(context) {
              return context.dataset.label + ': ' + context.parsed.y.toFixed(2) + ' m';
            }
          }
        }
      },
      scales: {
        x: {
          title: {
            display: true,
            text: 'Khoảng cách (m)',
            font: {
              size: 14,
              weight: 'bold'
            }
          },
          grid: {
            display: true,
            color: 'rgba(0, 0, 0, 0.05)'
          }
        },
        y: {
          title: {
            display: true,
            text: 'Cao trình (m)',
            font: {
              size: 14,
              weight: 'bold'
            }
          },
          grid: {
            display: true,
            color: 'rgba(0, 0, 0, 0.1)'
          }
        }
      },
      interaction: {
        mode: 'nearest',
        axis: 'x',
        intersect: false
      }
    }
  });
  
  // Show chart container
  document.getElementById('chartContainer').style.display = 'block';
}

/**
 * Generate simplified profile data for visualization
 * This creates a basic profile based on design parameters
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
    const bedElev = Z_ng - (x * 0.20);
    bedElevations.push(bedElev.toFixed(2));
    
    // Water surface (simplified - actual would come from gradually varied flow)
    // Assuming water depth decreases along chute
    const depth = results.h1 + (results.h1_basin - results.h1) * (1 - i/numPoints) * 0.5;
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
    const x = chuteLength + basinLength + (10 * i);
    stations.push(x.toFixed(1));
    bedElevations.push(Z_dk.toFixed(2));
    waterSurface.push((Z_dk + inputData.h_h).toFixed(2));
  }
  
  return {
    stations,
    bedElevations,
    waterSurface,
    basinLocation: chuteLength
  };
}

/**
 * Export results to text format
 */
function exportResults() {
  alert('Tính năng xuất kết quả đang được phát triển!');
  // TODO: Implement export to CSV or PDF
}

