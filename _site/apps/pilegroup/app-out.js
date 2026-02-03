/*
 * app-out.js (Pile Group - VISUALIZATION IMPLEMENTATION)
 *
 * Responsibilities:
 * 1. Display calculation results with tables and charts
 * 2. Render force table for each pile
 * 3. Display cap displacement
 * 4. Create 2D plan view with pile positions
 * 5. Highlight maximum force pile
 * 6. Handle FREE mode watermark
 * 7. Export functionality
 */

// Global variables
let g_currentResults = null;
let g_currentInputData = null;
let g_chartPileLayout = null;
let g_chartPileForces = null;

/**
 * Main Display Results Function
 * Called by app-cal.js after successful calculation
 * @param {object} results - Calculation results from WASM
 * @param {object} inputData - Input data for visualization
 */
function displayResults(results, inputData) {
    g_currentResults = results;
    g_currentInputData = inputData;
    
    try {
        // Check license mode and show watermark if FREE
        showLicenseWatermark();
        
        // Display cap displacement
        displayCapDisplacement(results.chuyen_vi);
        
        // Display pile forces table
        displayPileForcesTable(results.noi_luc_coc);
        
        // Display verification results
        displayCheckTable(results.kiem_toan);
        
        // Display balance check
        displayBalanceTable(results.kiem_tra_luc);
        
        // Render 2D pile layout with force visualization
        renderPileLayoutChart(inputData.coc, results.noi_luc_coc, inputData.be_coc, inputData.vat_lieu.D);
        
        // Render force comparison chart
        renderPileForceChart(results.noi_luc_coc);
        
        // Show results section
        const resultsContainer = document.getElementById('results-container');
        if (resultsContainer) {
            resultsContainer.style.display = 'block';
            resultsContainer.scrollIntoView({ behavior: 'smooth' });
        }
        
        console.log('✅ Results visualized successfully');
        
    } catch (error) {
        console.error('Error displaying results:', error);
        alert(`Lỗi hiển thị kết quả: ${error.message}`);
    }
}

/**
 * Show License Watermark for FREE Mode
 */
function showLicenseWatermark() {
    const isLicensed = localStorage.getItem('pilegroupLicensed') === 'true';
    
    if (!isLicensed) {
        const resultsContainer = document.getElementById('results-container');
        if (!resultsContainer) return;
        
        // Check if watermark already exists
        let watermark = resultsContainer.querySelector('.trial-watermark');
        if (!watermark) {
            watermark = document.createElement('div');
            watermark.className = 'trial-watermark alert alert-warning';
            watermark.innerHTML = `
                <i class="bi bi-exclamation-triangle-fill"></i>
                <strong>Phiên bản Free giới hạn kết quả</strong>
                <p class="mb-0">Kích hoạt bản quyền PRO để phân tích nhóm cọc lớn và xuất báo cáo đầy đủ.</p>
            `;
            
            const cardBody = resultsContainer.querySelector('.card-body');
            if (cardBody) {
                cardBody.insertBefore(watermark, cardBody.firstChild);
            }
        }
    }
}

/**
 * Display Cap Displacement
 * @param {object} disp - Displacement data
 */
function displayCapDisplacement(disp) {
    const tbody = document.getElementById('displacement-results-body');
    if (!tbody) return;
    
    tbody.innerHTML = `
        <tr>
            <td><i class="bi bi-arrow-left-right"></i> Chuyển vị X (a)</td>
            <td><strong>${disp.a.toFixed(4)}</strong></td>
            <td>mm</td>
        </tr>
        <tr>
            <td><i class="bi bi-arrow-up-down"></i> Chuyển vị Y (b)</td>
            <td><strong>${disp.b.toFixed(4)}</strong></td>
            <td>mm</td>
        </tr>
        <tr>
            <td><i class="bi bi-arrow-down-circle"></i> Chuyển vị Z (c)</td>
            <td><strong>${disp.c.toFixed(4)}</strong></td>
            <td>mm</td>
        </tr>
        <tr>
            <td><i class="bi bi-arrow-clockwise"></i> Góc xoay X (Alfa)</td>
            <td><strong>${disp.Alfa.toFixed(6)}</strong></td>
            <td>rad</td>
        </tr>
        <tr>
            <td><i class="bi bi-arrow-clockwise"></i> Góc xoay Y (Beta)</td>
            <td><strong>${disp.Beta.toFixed(6)}</strong></td>
            <td>rad</td>
        </tr>
        <tr>
            <td><i class="bi bi-arrow-clockwise"></i> Góc xoay Z (Gama)</td>
            <td><strong>${disp.Gama.toFixed(6)}</strong></td>
            <td>rad</td>
        </tr>
    `;
}

/**
 * Display Pile Forces Table with Max Force Highlighting
 * @param {Array} forces - Array of pile force objects
 */
function displayPileForcesTable(forces) {
    const tbody = document.getElementById('forces-results-body');
    if (!tbody) return;
    
    // Find max axial force
    const maxAxialForce = Math.max(...forces.map(p => Math.abs(p.N)));
    
    let html = '';
    forces.forEach(pile => {
        const isMaxForce = Math.abs(pile.N) === maxAxialForce;
        const rowClass = isMaxForce ? 'table-danger' : '';
        const forceClass = isMaxForce ? 'pile-max-force' : 'pile-normal';
        
        html += `
            <tr class="${rowClass}">
                <td class="text-center fw-bold">${pile.id}</td>
                <td class="${forceClass}">
                    ${pile.N.toFixed(2)}
                    ${isMaxForce ? '<i class="bi bi-exclamation-circle-fill ms-1" title="Lực dọc lớn nhất"></i>' : ''}
                </td>
                <td>${pile.QII.toFixed(2)}</td>
                <td>${pile.QIII.toFixed(2)}</td>
                <td>${pile.MI.toFixed(2)}</td>
                <td>${pile.MII.toFixed(2)}</td>
                <td>${pile.MIII.toFixed(2)}</td>
            </tr>
        `;
    });
    tbody.innerHTML = html;
}

/**
 * Display Check (Verification) Results
 * @param {object} kt - Check results
 */
function displayCheckTable(kt) {
    const tbody = document.getElementById('check-results-body');
    if (!tbody) return;
    
    const statusClass = kt.dat_cuong_do ? 'status-success' : 'status-fail';
    const statusIcon = kt.dat_cuong_do ? 
        '<i class="bi bi-check-circle-fill"></i>' : 
        '<i class="bi bi-x-circle-fill"></i>';
    const statusText = kt.dat_cuong_do ? 'ĐẠT' : 'KHÔNG ĐẠT';
    
    tbody.innerHTML = `
        <tr>
            <td>Ứng suất lớn nhất (USmaxday)</td>
            <td><strong>${kt.USmaxday.toFixed(2)}</strong> kN/m²</td>
        </tr>
        <tr>
            <td>Ứng suất nhỏ nhất (USminday)</td>
            <td><strong>${kt.USminday.toFixed(2)}</strong> kN/m²</td>
        </tr>
        <tr>
            <td>Cường độ đất nền (Rdat)</td>
            <td><strong>${kt.Rdat.toFixed(2)}</strong> kN/m²</td>
        </tr>
        <tr class="table-${kt.dat_cuong_do ? 'success' : 'danger'}">
            <td><strong>Kết quả Kiểm toán</strong></td>
            <td class="fs-5 ${statusClass}">${statusIcon} <strong>${statusText}</strong></td>
        </tr>
    `;
}

/**
 * Display Balance Check Table
 * @param {object} kl - Balance check data
 */
function displayBalanceTable(kl) {
    const tbody = document.getElementById('balance-results-body');
    if (!tbody) return;
    
    function createBalanceRow(label, input, calculated) {
        const diff = (Math.abs(input) < 1e-6) ? 
            (Math.abs(calculated) < 1e-6 ? 0.0 : 'N/A') : 
            ((calculated - input) / input * 100);
        const diffText = (typeof diff === 'number') ? `${diff.toFixed(2)}%` : 'N/A';
        const diffClass = (typeof diff === 'number' && Math.abs(diff) < 5) ? 'text-success' : 'text-warning';
        
        return `
            <tr>
                <td><strong>${label}</strong></td>
                <td>${input.toFixed(3)}</td>
                <td>${calculated.toFixed(3)}</td>
                <td class="${diffClass}"><strong>${diffText}</strong></td>
            </tr>
        `;
    }
    
    tbody.innerHTML = `
        ${createBalanceRow('Hx (T)', kl.Hx_Nhap, kl.Hx_Tinh)}
        ${createBalanceRow('Hy (T)', kl.Hy_Nhap, kl.Hy_Tinh)}
        ${createBalanceRow('Pz (T)', kl.Pz_Nhap, kl.Pz_Tinh)}
        ${createBalanceRow('Mx (T.m)', kl.Mx_Nhap, kl.Mx_Tinh)}
        ${createBalanceRow('My (T.m)', kl.My_Nhap, kl.My_Tinh)}
        ${createBalanceRow('Mz (T.m)', kl.Mz_Nhap, kl.Mz_Tinh)}
    `;
}

/**
 * Render 2D Pile Layout with Force Visualization
 * @param {Array} piles - Pile positions
 * @param {Array} forces - Pile forces
 * @param {object} cap - Cap dimensions
 * @param {number} pileDiameter - Pile diameter
 */
function renderPileLayoutChart(piles, forces, cap, pileDiameter) {
    const canvas = document.getElementById('pileForceChart');
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    
    if (g_chartPileLayout) {
        g_chartPileLayout.destroy();
    }
    
    // Find max axial force
    const maxAxialForce = Math.max(...forces.map(p => Math.abs(p.N)));
    
    // Prepare scatter plot data with color coding
    const scatterData = piles.map((pile, idx) => {
        const force = forces.find(f => f.id === (idx + 1));
        const isMaxForce = Math.abs(force.N) === maxAxialForce;
        
        return {
            x: pile.x,
            y: pile.y,
            r: 10, // Point radius
            backgroundColor: isMaxForce ? '#dc3545' : '#0d6efd',
            label: `Cọc ${idx + 1}: ${force.N.toFixed(1)} T`
        };
    });
    
    g_chartPileLayout = new Chart(ctx, {
        type: 'scatter',
        data: {
            datasets: [{
                label: 'Vị trí cọc',
                data: scatterData,
                backgroundColor: scatterData.map(d => d.backgroundColor),
                borderColor: '#000',
                borderWidth: 2,
                pointRadius: 12,
                pointHoverRadius: 15
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: true,
            aspectRatio: 1,
            plugins: {
                title: {
                    display: true,
                    text: 'Mặt bằng bố trí cọc (Pile Layout)',
                    font: { size: 16, weight: 'bold' }
                },
                legend: {
                    display: false
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            const dataPoint = scatterData[context.dataIndex];
                            const pile = piles[context.dataIndex];
                            const force = forces[context.dataIndex];
                            return [
                                `Cọc ${context.dataIndex + 1}`,
                                `Tọa độ: (${pile.x.toFixed(2)}, ${pile.y.toFixed(2)})`,
                                `Lực dọc: ${force.N.toFixed(2)} T`,
                                `Lực cắt: QII=${force.QII.toFixed(2)} T, QIII=${force.QIII.toFixed(2)} T`
                            ];
                        }
                    }
                }
            },
            scales: {
                x: {
                    title: {
                        display: true,
                        text: 'X (m)',
                        font: { weight: 'bold' }
                    },
                    grid: {
                        color: 'rgba(0, 0, 0, 0.1)'
                    }
                },
                y: {
                    title: {
                        display: true,
                        text: 'Y (m)',
                        font: { weight: 'bold' }
                    },
                    grid: {
                        color: 'rgba(0, 0, 0, 0.1)'
                    }
                }
            }
        }
    });
}

/**
 * Render Pile Force Comparison Bar Chart
 * @param {Array} forces - Pile forces
 */
function renderPileForceChart(forces) {
    // This function can be implemented if there's a separate canvas for bar chart
    // For now, we're using the scatter plot above
    console.log('Pile force chart rendered in layout view');
}

/**
 * Export Results to CSV
 */
function exportToCSV() {
    if (!g_currentResults || !g_currentResults.noi_luc_coc) {
        alert('Không có dữ liệu để xuất.');
        return;
    }
    
    let csv = 'Pile ID,N (T),QII (T),QIII (T),MI (T.m),MII (T.m),MIII (T.m)\n';
    
    g_currentResults.noi_luc_coc.forEach(pile => {
        csv += `${pile.id},${pile.N.toFixed(3)},${pile.QII.toFixed(3)},${pile.QIII.toFixed(3)},`;
        csv += `${pile.MI.toFixed(3)},${pile.MII.toFixed(3)},${pile.MIII.toFixed(3)}\n`;
    });
    
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `pilegroup_results_${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
    URL.revokeObjectURL(url);
    
    console.log('✅ CSV exported successfully');
}

/**
 * Export Chart to PNG
 */
function exportToPNG() {
    const canvas = document.getElementById('pileForceChart');
    if (!canvas) {
        alert('Không tìm thấy biểu đồ để xuất.');
        return;
    }
    
    canvas.toBlob(function(blob) {
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `pilegroup_layout_${new Date().toISOString().slice(0, 10)}.png`;
        link.click();
        URL.revokeObjectURL(url);
    });
    
    console.log('✅ PNG exported successfully');
}

/**
 * Initialize Export Buttons
 */
document.addEventListener('DOMContentLoaded', () => {
    const csvButton = document.getElementById('save-csv-button');
    const pngButton = document.getElementById('save-png-button');
    
    if (csvButton) {
        csvButton.addEventListener('click', exportToCSV);
    }
    
    if (pngButton) {
        pngButton.addEventListener('click', exportToPNG);
    }
    
    console.log('✅ app-out.js initialized with Chart.js visualization');
});
