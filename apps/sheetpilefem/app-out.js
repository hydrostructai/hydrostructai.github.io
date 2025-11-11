/**
 * SheetPileFEM-WASM - Module Hiển thị Kết quả
 * app-out.js
 *
 * Chịu trách nhiệm:
 * 1. Logic cho việc vẽ biểu đồ Plotly.
 * 2. Logic cho việc hiển thị bảng tóm tắt và bảng chi tiết.
 * 3. Logic cho việc xuất kết quả ra CSV.
 */
(function(App) {
    "use-strict";

    const PLOTLY_CONFIG = {
        responsive: true,
        displaylogo: false,
        modeBarButtonsToRemove: ['toImage', 'sendDataToCloud', 'select2d', 'lasso2d', 'toggleSpikelines']
    };

    /**
     * Hàm trợ giúp tạo layout chung cho Plotly
     * @param {string} title Tiêu đề biểu đồ
     * @param {string} xtitle Tên trục X
     * @param {string} ytitle Tên trục Y
     * @param {boolean} x_reversed True nếu đảo ngược trục X
     * @returns {object} Đối tượng layout của Plotly
     */
    function plotlyLayout(title, xtitle, ytitle, x_reversed = false) {
        return {
            title: {
                text: title,
                font: { size: 16 }
            },
            xaxis: {
                title: xtitle,
                autorange: x_reversed ? 'reversed' : true,
                zeroline: true,
                zerolinecolor: '#999',
                zerolinewidth: 1,
            },
            yaxis: {
                title: ytitle
            },
            legend: {
                orientation: 'h',
                yanchor: 'bottom',
                y: 1.02,
                xanchor: 'right',
                x: 1
            },
            margin: { l: 70, r: 40, b: 60, t: 60, pad: 4 }
        };
    }

    /**
     * Hàm chính: Nhận kết quả và gọi các hàm vẽ
     * @param {Array<object>} results Mảng các đối tượng ResultNode từ C++
     * @param {object} inputs Đối tượng AnalysisInput đã gửi cho C++
     */
    App.displayResults = function(results, inputs) {
        // 1. Vẽ các biểu đồ
        plotGeom(results, inputs);
        plotPressure(results);
        plotDeflection(results);
        plotMoment(results);
        plotShear(results);

        // 2. Hiển thị các bảng
        displaySummaryTable(results);
        displayResultsTable(results);
    }

    /**
     * 1. Vẽ Biểu đồ Hình học (Geometry)
     */
    function plotGeom(results, inputs) {
        const elevations = results.map(r => r.elevation);
        const y_min = Math.min(...elevations);
        const y_max = Math.max(...elevations);
        const y_range = y_max - y_min;

        const traces = [];

        // 1. Vẽ Tường
        traces.push({
            x: [0, 0],
            y: [inputs.wall_top, inputs.wall_bottom],
            type: 'scatter',
            mode: 'lines',
            line: { color: '#333', width: 5 },
            name: 'Tường Cừ'
        });

        // 2. Vẽ Mặt đất
        traces.push({
            x: [-1, 0],
            y: [inputs.ground_behind, inputs.ground_behind],
            type: 'scatter',
            mode: 'lines',
            line: { color: 'green', dash: 'solid' },
            name: 'Mặt đất (Sau)'
        });
        traces.push({
            x: [0, 1],
            y: [inputs.ground_front, inputs.ground_front],
            type: 'scatter',
            mode: 'lines',
            line: { color: 'darkred', dash: 'solid' },
            name: 'Mặt đất (Trước)'
        });

        // 3. Vẽ Mực nước
        traces.push({
            x: [-1, 0],
            y: [inputs.water_behind, inputs.water_behind],
            type: 'scatter',
            mode: 'lines',
            line: { color: 'blue', dash: 'dash' },
            name: 'Mực nước (Sau)'
        });
        traces.push({
            x: [0, 1],
            y: [inputs.water_front, inputs.water_front],
            type: 'scatter',
            mode: 'lines',
            line: { color: 'cyan', dash: 'dash' },
            name: 'Mực nước (Trước)'
        });

        // 4. Vẽ Neo
        inputs.anchors.forEach(anchor => {
            traces.push({
                x: [-0.5, 0],
                y: [anchor.elevation, anchor.elevation],
                type: 'scatter',
                mode: 'lines+markers',
                line: { color: 'orange', width: 3 },
                marker: { symbol: 'triangle-left', size: 12, color: 'orange' },
                name: `Neo #${anchor.id}`
            });
        });

        const layout = plotlyLayout('Mô hình Hình học', 'Vị trí Tương đối', 'Cao độ (m)');
        layout.xaxis.range = [-1.5, 1.5];
        layout.xaxis.showticklabels = false;
        layout.yaxis.range = [inputs.wall_bottom - y_range * 0.1, inputs.wall_top + y_range * 0.1];

        Plotly.newPlot(App.dom.chartGeom, traces, layout, PLOTLY_CONFIG);
    }

    /**
     * 2. Vẽ Biểu đồ Áp lực (Pressure)
     */
    function plotPressure(results) {
        const elevations = results.map(r => r.elevation);
        
        // p_active_kPa là TỔNG áp lực (Đất + Tải trọng + Nước)
        const p_active = results.map(r => r.p_active_kPa); 
        
        // p_passive_kPa là phản lực bị động
        const p_passive = results.map(r => r.p_passive_kPa);

        const traceActive = {
            x: p_active,
            y: elevations,
            type: 'scatter',
            mode: 'lines',
            fill: 'tozerox',
            line: { color: 'red' },
            name: 'Áp lực Chủ động (Net)'
        };
        
        const tracePassive = {
            x: p_passive,
            y: elevations,
            type: 'scatter',
            mode: 'lines',
            fill: 'tozerox',
            line: { color: 'green' },
            name: 'Phản lực Bị động'
        };
        
        // (Để tách p_a và p_q, C++ phải trả về các trường riêng biệt)

        const layout = plotlyLayout('Biểu đồ Áp lực Đất (Net)', 'Áp lực (kPa)', 'Cao độ (m)', true);
        Plotly.newPlot(App.dom.chartPressure, [traceActive, tracePassive], layout, PLOTLY_CONFIG);
    }

    /**
     * 3. Vẽ Biểu đồ Chuyển vị (Deflection)
     */
    function plotDeflection(results) {
        const elevations = results.map(r => r.elevation);
        const deflections = results.map(r => r.displacement_mm);

        const trace = {
            x: deflections,
            y: elevations,
            type: 'scatter',
            mode: 'lines',
            line: { color: 'blue' },
            name: 'Chuyển vị'
        };

        const layout = plotlyLayout('Biểu đồ Chuyển vị', 'Chuyển vị (mm)', 'Cao độ (m)');
        Plotly.newPlot(App.dom.chartDeflection, [trace], layout, PLOTLY_CONFIG);
    }

    /**
     * 4. Vẽ Biểu đồ Moment
     */
    function plotMoment(results) {
        const elevations = results.map(r => r.elevation);
        const moments = results.map(r => r.moment_kNm);

        const trace = {
            x: moments,
            y: elevations,
            type: 'scatter',
            mode: 'lines',
            line: { color: 'purple' },
            name: 'Moment'
        };

        const layout = plotlyLayout('Biểu đồ Moment', 'Moment (kNm/m)', 'Cao độ (m)');
        Plotly.newPlot(App.dom.chartMoment, [trace], layout, PLOTLY_CONFIG);
    }

    /**
     * 5. Vẽ Biểu đồ Lực cắt (Shear)
     */
    function plotShear(results) {
        const elevations = results.map(r => r.elevation);
        const shears = results.map(r => r.shear_kN);

        const trace = {
            x: shears,
            y: elevations,
            type: 'scatter',
            mode: 'lines',
            line: { color: 'orange' },
            name: 'Lực cắt'
        };

        const layout = plotlyLayout('Biểu đồ Lực cắt', 'Lực cắt (kN/m)', 'Cao độ (m)');
        Plotly.newPlot(App.dom.chartShear, [trace], layout, PLOTLY_CONFIG);
    }


    /**
     * 6. Hiển thị Bảng Tóm tắt
     */
    function displaySummaryTable(results) {
        // Tìm giá trị lớn nhất
        const maxMoment = Math.max(...results.map(r => r.moment_kNm));
        const minMoment = Math.min(...results.map(r => r.moment_kNm));
        const maxShear = Math.max(...results.map(r => r.shear_kN));
        const minShear = Math.min(...results.map(r => r.shear_kN));
        const maxDeflection = Math.max(...results.map(r => r.displacement_mm));
        const minDeflection = Math.min(...results.map(r => r.displacement_mm));

        // (Chúng ta có thể thêm logic tìm cao độ của các giá trị này)

        const html = `
            <table class="table table-sm table-bordered">
                <thead class="table-light">
                    <tr>
                        <th>Hạng mục</th>
                        <th>Giá trị Lớn nhất</th>
                        <th>Giá trị Nhỏ nhất</th>
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        <td>Moment (kNm/m)</td>
                        <td>${maxMoment.toFixed(2)}</td>
                        <td>${minMoment.toFixed(2)}</td>
                    </tr>
                    <tr>
                        <td>Lực cắt (kN/m)</td>
                        <td>${maxShear.toFixed(2)}</td>
                        <td>${minShear.toFixed(2)}</td>
                    </tr>
                    <tr>
                        <td>Chuyển vị (mm)</td>
                        <td>${maxDeflection.toFixed(2)}</td>
                        <td>${minDeflection.toFixed(2)}</td>
                    </tr>
                </tbody>
            </table>
        `;
        App.dom.tableSummaryContainer.innerHTML = html;
    }

    /**
     * 7. Hiển thị Bảng Kết quả Chi tiết
     */
    function displayResultsTable(results) {
        // 1. Tạo Header
        const headers = Object.keys(results[0]);
        let headerHtml = '<tr>';
        headers.forEach(h => headerHtml += `<th>${h}</th>`);
        headerHtml += '</tr>';
        App.dom.tableResultsHeader.innerHTML = headerHtml;

        // 2. Tạo Body
        let bodyHtml = '';
        results.forEach(row => {
            bodyHtml += '<tr>';
            headers.forEach(key => {
                const val = row[key];
                // Làm tròn số nếu là kiểu number
                const displayVal = (typeof val === 'number') ? val.toFixed(3) : val;
                bodyHtml += `<td>${displayVal}</td>`;
            });
            bodyHtml += '</tr>';
        });
        App.dom.tableResultsBody.innerHTML = bodyHtml;
    }
    
    /**
     * 8. Xuất Bảng Kết quả ra CSV
     */
    App.handleSaveResultsCSV = function() {
        const header = App.dom.tableResultsHeader.innerText.trim();
        const body = App.dom.tableResultsBody.innerText.trim();
        
        if (!header || !body) {
            App.setStatus('Không có dữ liệu kết quả để lưu.', 'text-danger');
            return;
        }
        
        const csvContent = header + '\n' + body;
        
        App.downloadFile(csvContent, 'sheetpile_results.csv', 'text/csv');
        App.setStatus('Đã lưu kết quả CSV.', 'text-success');
    }

})(SheetPileApp); // Truyền vào không gian tên chung
