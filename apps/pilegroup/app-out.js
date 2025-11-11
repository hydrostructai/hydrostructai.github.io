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
            ${createBalanceRow('Hx', kl.Hx_Nhap, kl.Hx_Tinh)}
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
