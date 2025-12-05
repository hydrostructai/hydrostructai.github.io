/*
 * app-out.js (Sheet Pile FEM - VISUALIZATION IMPLEMENTATION)
 *
 * Responsibilities:
 * 1. Display calculation results with Chart.js
 * 2. Render vertical charts (Deflection, Moment, Shear)
 * 3. Show summary statistics
 * 4. Handle FREE mode watermark
 * 5. Export functionality
 */

// Global variables for chart instances
let g_currentResults = null;
let g_chartDeflection = null;
let g_chartMoment = null;
let g_chartShear = null;
let g_chartPressure = null;

/**
 * Main Display Results Function
 * Called by app-cal.js after successful calculation
 * @param {object} results - Calculation results from WASM
 */
function displayResults(results) {
    g_currentResults = results;
    
    try {
        // Check license mode and show watermark if FREE
        showLicenseWatermark();
        
        // Display summary statistics
        displaySummary(results);
        
        // Render all charts
        renderDeflectionChart(results);
        renderMomentChart(results);
        renderShearChart(results);
        renderPressureChart(results);
        
        // Show results section
        const outputSection = document.getElementById('output-section');
        if (outputSection) {
            outputSection.style.display = 'block';
            outputSection.scrollIntoView({ behavior: 'smooth' });
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
    const isLicensed = localStorage.getItem('sheetpileLicensed') === 'true';
    
    if (!isLicensed) {
        const outputSection = document.getElementById('output-section');
        if (!outputSection) return;
        
        // Check if watermark already exists
        let watermark = outputSection.querySelector('.trial-watermark');
        if (!watermark) {
            watermark = document.createElement('div');
            watermark.className = 'trial-watermark alert alert-warning';
            watermark.innerHTML = `
                <i class="bi bi-exclamation-triangle-fill"></i>
                <strong>PHIÊN BẢN FREE - GIỚI HẠN KẾT QUẢ</strong>
                <p class="mb-0">Kích hoạt bản quyền PRO để xem đầy đủ phân tích và xuất báo cáo.</p>
            `;
            outputSection.insertBefore(watermark, outputSection.firstChild);
        }
    }
}

/**
 * Display Summary Statistics
 * @param {object} results - Calculation results
 */
function displaySummary(results) {
    const summaryContainer = document.getElementById('json-output');
    if (!summaryContainer) return;
    
    // Parse results (assuming results have arrays of data)
    const deflections = results.displacement_mm || [];
    const moments = results.moment_kNm || [];
    const shears = results.shear_kN || [];
    
    const maxDeflection = Math.max(...deflections.map(Math.abs));
    const maxMoment = Math.max(...moments.map(Math.abs));
    const maxShear = Math.max(...shears.map(Math.abs));
    
    const minDeflection = Math.min(...deflections.map(Math.abs));
    const minMoment = Math.min(...moments.map(Math.abs));
    const minShear = Math.min(...shears.map(Math.abs));
    
    summaryContainer.innerHTML = `
        <div class="summary-panel">
            <h5 class="text-white mb-3">
                <i class="bi bi-clipboard-data"></i> Tóm tắt kết quả phân tích
            </h5>
            <div class="row g-3">
                <div class="col-md-4">
                    <div class="summary-item">
                        <span class="summary-label">
                            <i class="bi bi-arrows-move"></i> Chuyển vị lớn nhất:
                        </span>
                        <span class="summary-value">${maxDeflection.toFixed(2)} mm</span>
                    </div>
                    <div class="summary-item">
                        <span class="summary-label">Chuyển vị nhỏ nhất:</span>
                        <span class="summary-value">${minDeflection.toFixed(2)} mm</span>
                    </div>
                </div>
                <div class="col-md-4">
                    <div class="summary-item">
                        <span class="summary-label">
                            <i class="bi bi-arrow-repeat"></i> Moment lớn nhất:
                        </span>
                        <span class="summary-value">${maxMoment.toFixed(2)} kNm</span>
                    </div>
                    <div class="summary-item">
                        <span class="summary-label">Moment nhỏ nhất:</span>
                        <span class="summary-value">${minMoment.toFixed(2)} kNm</span>
                    </div>
                </div>
                <div class="col-md-4">
                    <div class="summary-item">
                        <span class="summary-label">
                            <i class="bi bi-arrow-down-up"></i> Lực cắt lớn nhất:
                        </span>
                        <span class="summary-value">${maxShear.toFixed(2)} kN</span>
                    </div>
                    <div class="summary-item">
                        <span class="summary-label">Lực cắt nhỏ nhất:</span>
                        <span class="summary-value">${minShear.toFixed(2)} kN</span>
                    </div>
                </div>
            </div>
        </div>
    `;
}

/**
 * Render Deflection Chart (Vertical - Depth on Y-axis)
 * @param {object} results - Calculation results
 */
function renderDeflectionChart(results) {
    const canvas = document.getElementById('chart-displacement');
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    
    // Destroy previous chart if exists
    if (g_chartDeflection) {
        g_chartDeflection.destroy();
    }
    
    // Prepare data
    const depths = results.elevation || results.depth || [];
    const deflections = results.displacement_mm || [];
    
    g_chartDeflection = new Chart(ctx, {
        type: 'line',
        data: {
            labels: deflections,
            datasets: [{
                label: 'Chuyển vị (mm)',
                data: deflections.map((val, idx) => ({ x: val, y: depths[idx] })),
                borderColor: '#0d6efd',
                backgroundColor: 'rgba(13, 110, 253, 0.1)',
                borderWidth: 3,
                fill: true,
                tension: 0.3
            }]
        },
        options: {
            indexAxis: 'y', // CRITICAL: Swap axes for vertical display
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                title: {
                    display: true,
                    text: 'Chuyển vị tường cừ (Displacement)',
                    font: { size: 16, weight: 'bold' }
                },
                legend: {
                    display: false
                }
            },
            scales: {
                x: {
                    title: {
                        display: true,
                        text: 'Chuyển vị (mm)',
                        font: { weight: 'bold' }
                    },
                    grid: {
                        color: 'rgba(0, 0, 0, 0.05)'
                    }
                },
                y: {
                    title: {
                        display: true,
                        text: 'Độ sâu (m)',
                        font: { weight: 'bold' }
                    },
                    reverse: true, // 0 at top, increasing downward
                    grid: {
                        color: 'rgba(0, 0, 0, 0.05)'
                    }
                }
            }
        }
    });
}

/**
 * Render Moment Chart (Vertical - Depth on Y-axis)
 * @param {object} results - Calculation results
 */
function renderMomentChart(results) {
    const canvas = document.getElementById('chart-moment');
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    
    if (g_chartMoment) {
        g_chartMoment.destroy();
    }
    
    const depths = results.elevation || results.depth || [];
    const moments = results.moment_kNm || [];
    
    g_chartMoment = new Chart(ctx, {
        type: 'line',
        data: {
            datasets: [{
                label: 'Moment (kNm)',
                data: moments.map((val, idx) => ({ x: val, y: depths[idx] })),
                borderColor: '#dc3545',
                backgroundColor: 'rgba(220, 53, 69, 0.1)',
                borderWidth: 3,
                fill: true,
                tension: 0.3
            }]
        },
        options: {
            indexAxis: 'y',
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                title: {
                    display: true,
                    text: 'Moment uốn (Bending Moment)',
                    font: { size: 16, weight: 'bold' }
                },
                legend: {
                    display: false
                }
            },
            scales: {
                x: {
                    title: {
                        display: true,
                        text: 'Moment (kNm/m)',
                        font: { weight: 'bold' }
                    },
                    grid: {
                        color: 'rgba(0, 0, 0, 0.05)'
                    }
                },
                y: {
                    title: {
                        display: true,
                        text: 'Độ sâu (m)',
                        font: { weight: 'bold' }
                    },
                    reverse: true,
                    grid: {
                        color: 'rgba(0, 0, 0, 0.05)'
                    }
                }
            }
        }
    });
}

/**
 * Render Shear Chart (Vertical - Depth on Y-axis)
 * @param {object} results - Calculation results
 */
function renderShearChart(results) {
    const canvas = document.getElementById('chart-shear');
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    
    if (g_chartShear) {
        g_chartShear.destroy();
    }
    
    const depths = results.elevation || results.depth || [];
    const shears = results.shear_kN || [];
    
    g_chartShear = new Chart(ctx, {
        type: 'line',
        data: {
            datasets: [{
                label: 'Lực cắt (kN)',
                data: shears.map((val, idx) => ({ x: val, y: depths[idx] })),
                borderColor: '#198754',
                backgroundColor: 'rgba(25, 135, 84, 0.1)',
                borderWidth: 3,
                fill: true,
                tension: 0.3
            }]
        },
        options: {
            indexAxis: 'y',
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                title: {
                    display: true,
                    text: 'Lực cắt (Shear Force)',
                    font: { size: 16, weight: 'bold' }
                },
                legend: {
                    display: false
                }
            },
            scales: {
                x: {
                    title: {
                        display: true,
                        text: 'Lực cắt (kN/m)',
                        font: { weight: 'bold' }
                    },
                    grid: {
                        color: 'rgba(0, 0, 0, 0.05)'
                    }
                },
                y: {
                    title: {
                        display: true,
                        text: 'Độ sâu (m)',
                        font: { weight: 'bold' }
                    },
                    reverse: true,
                    grid: {
                        color: 'rgba(0, 0, 0, 0.05)'
                    }
                }
            }
        }
    });
}

/**
 * Render Pressure Chart (Vertical - Depth on Y-axis)
 * @param {object} results - Calculation results
 */
function renderPressureChart(results) {
    const canvas = document.getElementById('chart-pressure');
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    
    if (g_chartPressure) {
        g_chartPressure.destroy();
    }
    
    const depths = results.elevation || results.depth || [];
    const pressures = results.p_active_kPa || results.pressure_kPa || [];
    
    g_chartPressure = new Chart(ctx, {
        type: 'line',
        data: {
            datasets: [{
                label: 'Áp lực (kPa)',
                data: pressures.map((val, idx) => ({ x: val, y: depths[idx] })),
                borderColor: '#ffc107',
                backgroundColor: 'rgba(255, 193, 7, 0.1)',
                borderWidth: 3,
                fill: true,
                tension: 0.3
            }]
        },
        options: {
            indexAxis: 'y',
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                title: {
                    display: true,
                    text: 'Áp lực đất (Earth Pressure)',
                    font: { size: 16, weight: 'bold' }
                },
                legend: {
                    display: false
                }
            },
            scales: {
                x: {
                    title: {
                        display: true,
                        text: 'Áp lực (kPa)',
                        font: { weight: 'bold' }
                    },
                    grid: {
                        color: 'rgba(0, 0, 0, 0.05)'
                    }
                },
                y: {
                    title: {
                        display: true,
                        text: 'Độ sâu (m)',
                        font: { weight: 'bold' }
                    },
                    reverse: true,
                    grid: {
                        color: 'rgba(0, 0, 0, 0.05)'
                    }
                }
            }
        }
    });
}

/**
 * Export Results to CSV
 */
function exportToCSV() {
    if (!g_currentResults) {
        alert('Không có dữ liệu để xuất.');
        return;
    }
    
    const depths = g_currentResults.elevation || g_currentResults.depth || [];
    const deflections = g_currentResults.displacement_mm || [];
    const moments = g_currentResults.moment_kNm || [];
    const shears = g_currentResults.shear_kN || [];
    
    let csv = 'Depth (m),Displacement (mm),Moment (kNm),Shear (kN)\n';
    
    for (let i = 0; i < depths.length; i++) {
        csv += `${depths[i].toFixed(3)},${deflections[i].toFixed(3)},${moments[i].toFixed(3)},${shears[i].toFixed(3)}\n`;
    }
    
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `sheetpile_results_${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
    URL.revokeObjectURL(url);
    
    console.log('✅ CSV exported successfully');
}

/**
 * Initialize Export Button
 */
document.addEventListener('DOMContentLoaded', () => {
    const exportButton = document.getElementById('btn-export-csv');
    if (exportButton) {
        exportButton.addEventListener('click', exportToCSV);
    }
    
    console.log('✅ app-out.js initialized with Chart.js visualization');
});
