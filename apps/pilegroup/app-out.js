/*
 * APP-OUT.JS
 * Chịu trách nhiệm:
 * 1. Định nghĩa hàm `displayResults(results)` (điểm nhận dữ liệu).
 * 2. Điền dữ liệu vào các bảng HTML.
 * 3. Khởi tạo và cập nhật biểu đồ lực dọc (Chart.js).
 * 4. Xử lý xuất dữ liệu (CSV, PNG).
 *
 * Phụ thuộc:
 * - app-cal.js (gọi hàm displayResults)
 * - Chart.js, PapaParse (nạp trong index.html)
 */

document.addEventListener('DOMContentLoaded', () => {
    
    // --- 1. BIẾN TOÀN CỤC CHO HIỂN THỊ VÀ XUẤT FILE ---
    const resultsContainer = document.getElementById('results-container');
    const saveCsvButton = document.getElementById('save-csv-button');
    const savePngButton = document.getElementById('save-png-button');
    
    let g_currentResults = null; // Lưu trữ kết quả hiện tại để xuất file
    let g_pileForceChart = null; // Biến giữ instance của Chart.js

    // --- 2. HÀM CHÍNH: ĐỊNH NGHĨA displayResults ---

    /**
     * @brief Điểm bắt đầu hiển thị kết quả, được gọi bởi app-cal.js
     * @param {object} results - Đối tượng kết quả từ Wasm (JSON.parsed)
     */
    window.displayResults = (results) => {
        g_currentResults = results; // Lưu trữ kết quả
        
        // Cập nhật các bảng
        updateDisplacementTable(results.chuyen_vi);
        updateForcesTable(results.noi_luc_coc);
        updateCheckTable(results.kiem_toan);
        updateBalanceTable(results.kiem_tra_luc);
        
        // Cập nhật biểu đồ
        updatePileForceChart(results.noi_luc_coc);

        // Hiển thị container kết quả
        resultsContainer.style.display = 'block';
        
        // Cuộn xuống xem kết quả
        resultsContainer.scrollIntoView({ behavior: 'smooth' });
    };

    // --- 3. CÁC HÀM CẬP NHẬT BẢNG ---

    function updateDisplacementTable(disp) {
        const body = document.getElementById('displacement-results-body');
        body.innerHTML = `
            <tr><td>Chuyển vị X (a)</td><td>${disp.a.toFixed(4)}</td><td>mm</td></tr>
            <tr><td>Chuyển vị Y (b)</td><td>${disp.b.toFixed(4)}</td><td>mm</td></tr>
            <tr><td>Chuyển vị Z (c)</td><td>${disp.c.toFixed(4)}</td><td>mm</td></tr>
            <tr><td>Góc xoay X (Alfa)</td><td>${disp.Alfa.toFixed(6)}</td><td>rad</td></tr>
            <tr><td>Góc xoay Y (Beta)</td><td>${disp.Beta.toFixed(6)}</td><td>rad</td></tr>
            <tr><td>Góc xoay Z (Gama)</td><td>${disp.Gama.toFixed(6)}</td><td>rad</td></tr>
        `;
    }

    function updateForcesTable(forces) {
        const body = document.getElementById('forces-results-body');
        body.innerHTML = ''; 
        forces.forEach(coc => {
            body.innerHTML += `
                <tr>
                    <td>${coc.id}</td>
                    <td>${coc.N.toFixed(2)}</td>
                    <td>${coc.QII.toFixed(2)}</td>
                    <td>${coc.QIII.toFixed(2)}</td>
                    <td>${coc.MI.toFixed(2)}</td>
                    <td>${coc.MII.toFixed(2)}</td>
                    <td>${coc.MIII.toFixed(2)}</td>
                </tr>
            `;
        });
    }

    function updateCheckTable(kt) {
        const body = document.getElementById('check-results-body');
        const statusClass = kt.dat_cuong_do ? 'status-success' : 'status-fail';
        const statusText = kt.dat_cuong_do ? '<i class="bi bi-check-circle-fill"></i> ĐẠT' : '<i class="bi bi-x-circle-fill"></i> KHÔNG ĐẠT';
        
        body.innerHTML = `
            <tr>
                <td>Ứng suất lớn nhất (USmaxday)</td>
                <td>${kt.USmaxday.toFixed(2)} T/m2</td>
            </tr>
            <tr>
                <td>Ứng suất nhỏ nhất (USminday)</td>
                <td>${kt.USminday.toFixed(2)} T/m2</td>
            </tr>
            <tr>
                <td>Cường độ đất nền (Rdat)</td>
                <td>${kt.Rdat.toFixed(2)} T/m2</td>
            </tr>
            <tr>
                <td><strong>Kết quả Kiểm toán</strong></td>
                <td class="fs-5 ${statusClass}">${statusText}</td>
            </tr>
        `;
    }
    
    function updateBalanceTable(kl) {
        const body = document.getElementById('balance-results-body');
        body.innerHTML = `
            $/*
 * app-out.js (cho Pile Group)
 *
 * Chịu trách nhiệm (Kiến trúc MỚI):
 * 1. Định nghĩa các hàm trợ giúp UI (showLoading, displayError, displayResults).
 * 2. Nhận JSON kết quả và DỮ LIỆU ĐẦU VÀO từ app-cal.js.
 * 3. Xây dựng và chèn (inject) các bảng HTML kết quả vào DOM.
 * 4. VẼ MẶT BẰNG MÓNG CỌC lên <canvas>.
 * 5. Xử lý logic xuất file CSV.
 */

// Biến toàn cục để lưu kết quả cho việc xuất file
let g_currentResults = null;

/**
 * Hiển thị/ẩn spinner và chuẩn bị khu vực output.
 */
function showLoading(isLoading) {
    const spinner = document.getElementById('loading-spinner');
    const outputSection = document.getElementById('output-section');
    
    if (spinner) spinner.style.display = isLoading ? 'block' : 'none';
    
    if (isLoading) {
        if (outputSection) outputSection.style.display = 'block';
        document.getElementById('results-content').style.display = 'none';
        document.getElementById('error-message').style.display = 'none';
    }
}

/**
 * Ẩn thông báo lỗi (nếu có).
 */
function hideError() {
    document.getElementById('error-message').style.display = 'none';
}

/**
 * Ẩn khu vực kết quả.
 */
function hideResults() {
    document.getElementById('output-section').style.display = 'none';
    document.getElementById('results-content').style.display = 'none';
    const exportButton = document.getElementById('btn-export-report');
    if (exportButton) exportButton.disabled = true;
}

/**
 * Hiển thị thông báo lỗi.
 */
function displayError(message) {
    const errorDiv = document.getElementById('error-message');
    if (errorDiv) {
        errorDiv.textContent = `Lỗi Phân tích: ${message}`;
        errorDiv.style.display = 'block';
    }
    document.getElementById('output-section').style.display = 'block';
    document.getElementById('results-content').style.display = 'none';
}

/**
 * HÀM CHÍNH: Nhận và hiển thị kết quả.
 * (Đã cập nhật: Nhận thêm 'inputData')
 * @param {object} results - Đối tượng kết quả (đã parse) từ Wasm.
 * @param {object} inputData - Đối tượng dữ liệu đầu vào (từ app-cal.js).
 */
function displayResults(results, inputData) {
    g_currentResults = results; // Lưu lại để xuất CSV

    try {
        // 1. Xây dựng các bảng HTML (như cũ)
        buildDisplacementTable(results.chuyen_vi);
        buildBalanceTable(results.kiem_tra_luc);
        buildCheckTable(results.kiem_toan);
        buildForcesTable(results.noi_luc_coc);

        // 2. VẼ MẶT BẰNG MÓNG (MỚI)
        drawPileCapLayout(inputData.coc, inputData.be_coc, inputData.vat_lieu.D);

        // 3. Hiển thị khu vực kết quả
        document.getElementById('results-content').style.display = 'block';
        document.getElementById('output-section').style.display = 'block';
        document.getElementById('error-message').style.display = 'none';
        
        // 4. Kích hoạt nút xuất file
        const exportButton = document.getElementById('btn-export-report');
        if (exportButton) exportButton.disabled = false;

        // 5. Cuộn xuống để xem
        document.getElementById('output-section').scrollIntoView({ behavior: 'smooth' });

    } catch (e) {
        displayError(`Lỗi hiển thị kết quả: ${e.message}`);
        console.error("Lỗi khi dựng bảng/vẽ canvas:", e);
    }
}

// --- CÁC HÀM DỰNG BẢNG (Giữ nguyên) ---

function buildDisplacementTable(disp) {
    const target = document.getElementById('chuyen_vi_table');
    if (!target) return;
    target.innerHTML = `
        <thead class="table-light">
            <tr><th>Hạng mục</th><th>Giá trị</th><th>Đơn vị</th></tr>
        </thead>
        <tbody>
            <tr><td>Chuyển vị X (a)</td><td>${disp.a.toFixed(4)}</td><td>mm</td></tr>
            <tr><td>Chuyển vị Y (b)</td><td>${disp.b.toFixed(4)}</td><td>mm</td></tr>
            <tr><td>Chuyển vị Z (c)</td><td>${disp.c.toFixed(4)}</td><td>mm</td></tr>
            <tr><td>Góc xoay X (Alfa)</td><td>${disp.Alfa.toFixed(6)}</td><td>rad</td></tr>
            <tr><td>Góc xoay Y (Beta)</td><td>${disp.Beta.toFixed(6)}</td><td>rad</td></tr>
            <tr><td>Góc xoay Z (Gama)</td><td>${disp.Gama.toFixed(6)}</td><td>rad</td></tr>
        </tbody>`;
}

function buildBalanceTable(kl) {
    const target = document.getElementById('kiem_tra_luc_table');
    if (!target) return;
    let body = '';
    body += createBalanceRow('Hx', kl.Hx_Nhap, kl.Hx_Tinh, 'kN');
    body += createBalanceRow('Hy', kl.Hy_Nhap, kl.Hy_Tinh, 'kN');
    body += createBalanceRow('Pz', kl.Pz_Nhap, kl.Pz_Tinh, 'kN');
    body += createBalanceRow('Mx', kl.Mx_Nhap, kl.Mx_Tinh, 'kN.m');
    body += createBalanceRow('My', kl.My_Nhap, kl.My_Tinh, 'kN.m');
    body += createBalanceRow('Mz', kl.Mz_Nhap, kl.Mz_Tinh, 'kN.m');
    target.innerHTML = `
        <thead class="table-light">
            <tr><th>Lực</th><th>Nhập</th><th>Tính</th><th>Chênh lệch</th></tr>
        </thead>
        <tbody>${body}</tbody>`;
}

function createBalanceRow(label, input, calculated, unit) {
    const diff = (Math.abs(input) < 1e-6) ? 
                 (Math.abs(calculated) < 1e-6 ? 0.0 : 'N/A') : 
                 ((calculated - input) / input * 100);
    const diffText = (typeof diff === 'number') ? `${diff.toFixed(2)}%` : 'N/A';
    return `<tr><td>${label} (${unit})</td><td>${input.toFixed(3)}</td><td>${calculated.toFixed(3)}</td><td>${diffText}</td></tr>`;
}

function buildCheckTable(kt) {
    const target = document.getElementById('kiem_toan_table');
    if (!target) return;
    const statusClass = kt.dat_cuong_do ? 'status-success' : 'status-fail';
    const statusText = kt.dat_cuong_do ? 'ĐẠT' : 'KHÔNG ĐẠT';
    target.innerHTML = `
         <thead class="table-light">
            <tr><th>Hạng mục</th><th>Giá trị</th></tr>
        </thead>
        <tbody>
            <tr><td>Ứng suất lớn nhất (USmaxday)</td><td>${kt.USmaxday.toFixed(2)} kN/m²</td></tr>
            <tr><td>Ứng suất nhỏ nhất (USminday)</td><td>${kt.USminday.toFixed(2)} kN/m²</td></tr>
            <tr><td>Cường độ đất nền (Rdat)</td><td>${kt.Rdat.toFixed(2)} kN/m²</td></tr>
            <tr><td><strong>Kết quả</strong></td><td class="${statusClass}">${statusText}</td></tr>
        </tbody>`;
}

function buildForcesTable(forces) {
    const target = document.getElementById('noi_luc_coc_table');
    if (!target) return;
    let head = `<table class="table table-sm table-bordered table-striped table-hover">
            <thead class="table-light"><tr><th>Cọc số</th><th>N (kN)</th><th>QII (kN)</th><th>QIII (kN)</th>
            <th>MI (kN.m)</th><th>MII (kN.m)</th><th>MIII (kN.m)</th></tr></thead>
            <tbody>`;
    let body = '';
    forces.forEach(coc => {
        body += `<tr>
                <td>${coc.id}</td><td>${coc.N.toFixed(2)}</td><td>${coc.QII.toFixed(2)}</td>
                <td>${coc.QIII.toFixed(2)}</td><td>${coc.MI.toFixed(2)}</td>
                <td>${coc.MII.toFixed(2)}</td><td>${coc.MIII.toFixed(2)}</td>
            </tr>`;
    });
    target.innerHTML = head + body + `</tbody></table>`;
}

// --- HÀM VẼ CANVAS MỚI ---

/**
 * @brief Vẽ mặt bằng móng cọc lên Canvas
 * @param {Array} piles - Mảng cọc (từ inputData.coc)
 * @param {object} cap - Đối tượng bệ cọc (từ inputData.be_coc)
 * @param {number} pileDiameter - Đường kính cọc (từ inputData.vat_lieu.D)
 */
function drawPileCapLayout(piles, cap, pileDiameter) {
    const canvas = document.getElementById('pile-cap-canvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    const cw = canvas.width;
    const ch = canvas.height;
    ctx.clearRect(0, 0, cw, ch);

    // 1. Tìm kích thước tối đa để tính tỷ lệ (scale)
    let maxDim = Math.max(cap.Bx / 2, cap.By / 2);
    piles.forEach(p => {
        maxDim = Math.max(maxDim, Math.abs(p.x), Math.abs(p.y));
    });

    if (maxDim === 0) maxDim = 1; // Tránh chia cho 0
    
    const padding = 50; // 50px padding
    // Tính tỷ lệ: (chiều rộng canvas - 2*padding) / (kích thước thật)
    const scale = (cw - 2 * padding) / (maxDim * 2);
    const originX = cw / 2;
    const originY = ch / 2;

    // Hàm trợ giúp chuyển đổi tọa độ (lật trục Y)
    function transform(x, y) {
        return {
            tx: originX + x * scale,
            ty: originY - y * scale // Lật trục Y
        };
    }

    // 2. Vẽ trục tọa độ
    ctx.beginPath();
    ctx.moveTo(originX, 0); ctx.lineTo(originX, ch); // Trục Y
    ctx.moveTo(0, originY); ctx.lineTo(cw, originY); // Trục X
    ctx.strokeStyle = '#ccc';
    ctx.lineWidth = 1;
    ctx.setLineDash([2, 4]);
    ctx.stroke();
    ctx.setLineDash([]);
    
    ctx.fillStyle = '#999';
    ctx.font = '10px Arial';
    ctx.fillText('Y+', originX + 5, 12);
    ctx.fillText('X+', cw - 15, originY - 5);

    // 3. Vẽ Bệ cọc (be_coc)
    const capTopLeft = transform(-cap.Bx / 2, cap.By / 2);
    const capWidth = cap.Bx * scale;
    const capHeight = cap.By * scale;
    
    ctx.strokeStyle = '#333';
    ctx.lineWidth = 2;
    ctx.strokeRect(capTopLeft.tx, capTopLeft.ty, capWidth, capHeight);

    // 4. Vẽ Cọc (coc)
    const pileRadius = (pileDiameter / 2) * scale;
    piles.forEach((pile, index) => {
        const pileCoords = transform(pile.{createBalanceRow('Hx', kl.Hx_Nhap, kl.Hx_Tinh)}
            ${createBalanceRow('Hy', kl.Hy_Nhap, kl.Hy_Tinh)}
            ${createBalanceRow('Pz', kl.Pz_Nhap, kl.Pz_Tinh)}
            ${createBalanceRow('Mx', kl.Mx_Nhap, kl.Mx_Tinh)}
            ${createBalanceRow('My', kl.My_Nhap, kl.My_Tinh)}
            ${createBalanceRow('Mz', kl.Mz_Nhap, kl.Mz_Tinh)}
        `;
    }

    function createBalanceRow(label, input, calculated) {
        const diff = (Math.abs(input) < 1e-6) ? (Math.abs(calculated) < 1e-6 ? 0.0 : 'N/A') : ((calculated - input) / input * 100).toFixed(2);
        return `
            <tr>
                <td>${label}</td>
                <td>${input.toFixed(3)}</td>
                <td>${calculated.toFixed(3)}</td>
                <td>${diff}%</td>
            </tr>
        `;
    }

    // --- 4. CẬP NHẬT BIỂU ĐỒ (CHART.JS) ---

    function updatePileForceChart(forces) {
        const ctx = document.getElementById('pileForceChart').getContext('2d');
        
        // Chuẩn bị dữ liệu
        const labels = forces.map(c => `Cọc ${c.id}`);
        const dataN = forces.map(c => c.N);
        const dataQII = forces.map(c => c.QII);

        // Hủy instance cũ nếu có
        if (g_pileForceChart) {
            g_pileForceChart.destroy();
        }

        // Tạo instance mới
        g_pileForceChart = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: labels,
                datasets: [{
                    label: 'Lực dọc trục N (T)',
                    data: dataN,
                    backgroundColor: 'rgba(13, 110, 253, 0.7)',
                    borderColor: 'rgba(13, 110, 253, 1)',
                    borderWidth: 1
                }, {
                    label: 'Lực cắt QII (T)',
                    data: dataQII,
                    backgroundColor: 'rgba(255, 99, 132, 0.7)',
                    borderColor: 'rgba(255, 99, 132, 1)',
                    borderWidth: 1
                }]
            },
            options: {
                responsive: true,
                scales: {
                    y: {
                        beginAtZero: false,
                        title: {
                            display: true,
                            text: 'Giá trị Lực (T)'
                        }
                    }
                },
                plugins: {
                    title: {
                        display: true,
                        text: 'Lực dọc N và Lực cắt QII trên các cọc'
                    }
                }
            }
        });
        
        // Kích hoạt tab biểu đồ
        new bootstrap.Tab(document.getElementById('tab-result-chart')).show();
    }

    // --- 5. XUẤT DỮ LIỆU ---

    // Gắn sự kiện
    saveCsvButton.addEventListener('click', exportToCSV);
    savePngButton.addEventListener('click', exportChartToPNG);

    /**
     * @brief Xuất kết quả nội lực cọc sang file CSV.
     */
    function exportToCSV() {
        if (!g_currentResults) return;

        const dataArray = [
            ["Cọc số", "N (T)", "QII (T)", "QIII (T)", "MI (T.m)", "MII (T.m)", "MIII (T.m)"]
        ];

        g_currentResults.noi_luc_coc.forEach(c => {
            dataArray.push([
                c.id,
                c.N.toFixed(3),
                c.QII.toFixed(3),
                c.QIII.toFixed(3),
                c.MI.toFixed(3),
                c.MII.toFixed(3),
                c.MIII.toFixed(3)
            ]);
        });

        // Sử dụng PapaParse.unparse để chuyển mảng thành chuỗi CSV
        const csv = Papa.unparse(dataArray);
        
        // Tạo và tải file
        const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.setAttribute('href', url);
        link.setAttribute('download', 'pilegroup_forces_' + new Date().toISOString().slice(0, 10) + '.csv');
        link.click();
        URL.revokeObjectURL(url);
    }

    /**
     * @brief Xuất biểu đồ Chart.js sang file PNG.
     */
    function exportChartToPNG() {
        if (g_pileForceChart) {
            const url = g_pileForceChart.toBase64Image();
            const link = document.createElement('a');
            link.href = url;
            link.download = 'pilegroup_chart_' + new Date().toISOString().slice(0, 10) + '.png';
            link.click();
        } else {
            showError("Lỗi xuất PNG: Biểu đồ chưa được tạo.");
        }
    }
});
