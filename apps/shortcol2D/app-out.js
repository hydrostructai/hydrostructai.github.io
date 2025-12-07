/**
 * ShortCol UI Module
 * app-out.js
 */

const ShortColOut = {
    chart: null,

    /**
     * Render SVG mặt cắt cột (Preview)
     */
    drawCrossSection: function(containerId, colType, geo, bars, d_bar) {
        const container = document.getElementById(containerId);
        if (!container) return;

        // Tính toán tỷ lệ vẽ
        // SVG size 200x200
        const svgSize = 220;
        const maxDim = Math.max(geo.B || geo.D, geo.H || geo.D);
        // Scale sao cho hình vẽ chiếm khoảng 180px (padding 20)
        const scale = 160 / (maxDim || 1); 
        
        const cx = svgSize / 2;
        const cy = svgSize / 2;

        let shapeSvg = '';
        
        // Vẽ biên bê tông
        if (colType === 'rect') {
            const w = geo.B * scale;
            const h = geo.H * scale;
            shapeSvg = `<rect x="${cx - w/2}" y="${cy - h/2}" width="${w}" height="${h}" 
                        fill="#e9ecef" stroke="#343a40" stroke-width="2" />`;
        } else {
            const r = (geo.D / 2) * scale;
            shapeSvg = `<circle cx="${cx}" cy="${cy}" r="${r}" 
                        fill="#e9ecef" stroke="#343a40" stroke-width="2" />`;
        }

        // Vẽ thép
        const r_bar_scaled = Math.max((d_bar / 2) * scale, 3); // Tối thiểu 3px để dễ nhìn
        let barsSvg = bars.map(b => {
            // Hệ tọa độ SVG y hướng xuống
            const bx = cx + b.x * scale;
            const by = cy - b.y * scale; 
            return `<circle cx="${bx}" cy="${by}" r="${r_bar_scaled}" fill="#dc3545" stroke="black" stroke-width="0.5" />`;
        }).join('');

        // Trục tọa độ giả
        const axisSvg = `
            <line x1="${cx-15}" y1="${cy}" x2="${cx+15}" y2="${cy}" stroke="#0d6efd" stroke-width="1" />
            <line x1="${cx}" y1="${cy-15}" x2="${cx}" y2="${cy+15}" stroke="#0d6efd" stroke-width="1" />
        `;

        container.innerHTML = `
            <svg width="${svgSize}" height="${svgSize}" xmlns="http://www.w3.org/2000/svg">
                ${shapeSvg}
                ${axisSvg}
                ${barsSvg}
            </svg>
        `;
        
        // Cập nhật badge
        const badge = document.getElementById('preview-badge');
        if(badge) {
            badge.textContent = (colType === 'rect') ? `${geo.B}x${geo.H}` : `D${geo.D}`;
        }
    },

    /**
     * Vẽ biểu đồ tương tác P-M bằng Chart.js
     */
    renderChart: function(canvasId, curvePoints, loads, safetyFactors) {
        const ctx = document.getElementById(canvasId).getContext('2d');

        if (this.chart) {
            this.chart.destroy();
        }

        // 1. Dữ liệu đường bao (Curve)
        const curveData = {
            label: 'Khả năng chịu lực (P-M)',
            data: curvePoints,
            borderColor: '#0d6efd', // Bootstrap Primary
            backgroundColor: 'rgba(13, 110, 253, 0.1)',
            showLine: true,
            pointRadius: 0,
            fill: true,
            tension: 0.2, // Làm mượt nhẹ
            order: 2
        };

        // 2. Dữ liệu điểm tải trọng (Loads)
        const loadPoints = loads.map(l => ({
            x: Math.abs(l.Mu), // Vẽ tuyệt đối
            y: l.Pu,
            label: l.name 
        }));

        const loadDataset = {
            label: 'Điểm tải trọng',
            data: loadPoints,
            backgroundColor: '#dc3545', // Bootstrap Danger
            borderColor: '#dc3545',
            pointRadius: 6,
            pointHoverRadius: 8,
            type: 'scatter',
            order: 1
        };

        // 3. Đường an toàn (Safety Lines)
        const safetyLinesDatasets = [];
        loads.forEach((l, i) => {
            const k = safetyFactors[i];
            if (k) {
                const M_target = Math.abs(l.Mu);
                const P_target = l.Pu;
                const M_cap = M_target * k;
                const P_cap = P_target * k;
                
                const isSafe = k >= 1.0;
                
                safetyLinesDatasets.push({
                    type: 'line',
                    label: `LineSafety`, // Hidden later
                    data: [{x: 0, y: 0}, {x: M_cap, y: P_cap}],
                    borderColor: isSafe ? 'rgba(25, 135, 84, 0.3)' : 'rgba(220, 53, 69, 0.5)',
                    borderWidth: 1,
                    borderDash: [5, 5],
                    pointRadius: 0,
                    showLine: true,
                    fill: false,
                    order: 3
                });
            }
        });

        this.chart = new Chart(ctx, {
            type: 'scatter',
            data: {
                datasets: [curveData, loadDataset, ...safetyLinesDatasets]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        labels: {
                            filter: function(item) {
                                return !item.text.includes('LineSafety');
                            }
                        }
                    },
                    tooltip: {
                        callbacks: {
                            label: function(context) {
                                const pt = context.raw;
                                if (context.dataset.label === 'Điểm tải trọng') {
                                    const loadItem = loads[context.dataIndex];
                                    return `${loadItem.name}: Mu=${pt.x}, Pu=${pt.y}`;
                                }
                                return `M=${pt.x.toFixed(1)}, P=${pt.y.toFixed(1)}`;
                            }
                        }
                    }
                },
                scales: {
                    x: {
                        title: { display: true, text: 'Momen uốn Mu (kNm)' },
                        beginAtZero: true
                    },
                    y: {
                        title: { display: true, text: 'Lực dọc Pu (kN)' }
                    }
                }
            }
        });
    },

    /**
     * Render bảng kết quả
     */
    renderResultsTable: function(tbodyId, loads, safetyFactors) {
        const tbody = document.getElementById(tbodyId);
        tbody.innerHTML = '';

        loads.forEach((l, i) => {
            const k = safetyFactors[i];
            let rowClass = '';
            let statusHtml = '<span class="badge bg-secondary">N/A</span>';
            let kStr = '-';

            if (k !== null) {
                kStr = k.toFixed(3);
                if (k >= 1.0) {
                    statusHtml = '<span class="badge bg-success"><i class="bi bi-check-lg"></i> ĐẠT</span>';
                } else {
                    statusHtml = '<span class="badge bg-danger"><i class="bi bi-x-lg"></i> KHÔNG</span>';
                    rowClass = 'table-danger';
                }
            }

            const tr = document.createElement('tr');
            if (rowClass) tr.className = rowClass;
            tr.innerHTML = `
                <td>${l.name}</td>
                <td class="text-end font-monospace">${l.Mu}</td>
                <td class="text-end font-monospace">${l.Pu}</td>
                <td class="text-center fw-bold text-primary">${kStr}</td>
                <td class="text-center">${statusHtml}</td>
            `;
            tbody.appendChild(tr);
        });
    }
};