/**
 * SheetPileFEM-WASM - Module Hiển thị Kết quả
 * app-out.js
 *
 * Chịu trách nhiệm:
 * 1. Hàm `displayResults` chính.
 * 2. Tất cả các hàm vẽ biểu đồ Plotly (Geometry, Pressure, Deflection, v.v.).
 * 3. Các hàm điền dữ liệu vào bảng kết quả (Summary, Detailed).
 * 4. Logic cho nút "Save Results CSV".
 */
(function(App) {
    "use-strict";

    /**
     * Hàm chính để hiển thị tất cả kết quả.
     * @param {Array} results Mảng các đối tượng ResultNode từ WASM.
     * @param {object} inputs Đối tượng input (cần cho biểu đồ hình học).
     */
    App.displayResults = function(results, inputs) {
        // 1. Vẽ Biểu đồ
        plotGeometryChart(results, inputs);
        plotStandardCharts(results);
        plotPressureChart(results); 
        
        // 2. Điền Bảng
        populateSummaryTable(results);
        populateDetailedTable(results);
    }
    
    /**
     * Vẽ 3 biểu đồ phân tích chuẩn (Chuyển vị, Moment, Lực cắt).
     * @param {Array} results Mảng các đối tượng ResultNode.
     */
    function plotStandardCharts(results) {
        const elev = results.map(r => r.elevation);
        const deflect = results.map(r => r.displacement_mm);
        const moment = results.map(r => r.moment_kNm);
        const shear = results.map(r => r.shear_kN);

        const commonLayout = {
            yaxis: { title: 'Elevation (m)' },
            margin: { l: 60, r: 20, t: 40, b: 50 },
            hovermode: 'y unified'
        };

        Plotly.newPlot(App.dom.chartDeflection,
            [{ x: deflect, y: elev, type: 'scatter', mode: 'lines', name: 'Deflection' }],
            { ...commonLayout, title: 'Wall Deflection', xaxis: { title: 'Deflection (mm)' } }
        );
        Plotly.newPlot(App.dom.chartMoment,
            [{ x: moment, y: elev, type: 'scatter', mode: 'lines', name: 'Moment' }],
            { ...commonLayout, title: 'Bending Moment', xaxis: { title: 'Moment (kNm/m)' } }
        );
        Plotly.newPlot(App.dom.chartShear,
            [{ x: shear, y: elev, type: 'scatter', mode: 'lines', name: 'Shear' }],
            { ...commonLayout, title: 'Shear Force', xaxis: { title: 'Shear (kN/m)' } }
        );
    }

    /**
     * Vẽ biểu đồ Áp lực Đất
     * @param {Array} results Mảng đối tượng ResultNode.
     */
    function plotPressureChart(results) {
        const elev = results.map(r => r.elevation);
        
        // Tính tổng áp lực chủ động (đất + nước)
        const active_total = results.map(r => (r.pressure_active_kPa || 0) + (r.pressure_water_behind_kPa || 0));
        
        // Tính tổng áp lực bị động (đất + nước) và nhân với -1 để vẽ sang trái
        const passive_total = results.map(r => -((r.pressure_passive_kPa || 0) + (r.pressure_water_front_kPa || 0)));

        const traceActive = {
            x: active_total,
            y: elev,
            type: 'scatter',
            mode: 'lines',
            name: 'Áp lực Chủ động (Tổ hợp)',
            fill: 'tozerox', 
            fillcolor: 'rgba(214, 39, 40, 0.2)', 
            line: { color: 'rgba(214, 39, 40, 0.6)' }
        };

        const tracePassive = {
            x: passive_total,
            y: elev,
            type: 'scatter',
            mode: 'lines',
            name: 'Áp lực Bị động (Tổ hợp)',
            fill: 'tozerox', 
            fillcolor: 'rgba(31, 119, 180, 0.2)', 
            line: { color: 'rgba(31, 119, 180, 0.6)' }
        };
        
        const layout = {
            title: 'Biểu đồ áp lực đấy (Tổ hợp)',
            xaxis: { 
                title: 'Áp lực (kPa)', 
                zeroline: true, 
                zerolinewidth: 2, 
                zerolinecolor: '#000' 
            },
            yaxis: { title: 'Cao độ (m)' },
            margin: { l: 60, r: 20, t: 40, b: 50 },
            hovermode: 'y unified',
            legend: { yanchor: "top", y: 0.99, xanchor: "left", x: 0.01 }
        };
        
        Plotly.newPlot(App.dom.chartPressure, [traceActive, tracePassive], layout);
    }

    /**
     * Vẽ biểu đồ hình học mô hình.
     * @param {Array} results Mảng đối tượng ResultNode.
     * @param {object} inputs Đối tượng input.
     */
    function plotGeometryChart(results, inputs) {
        const shapes = [];
        const annotations = [];
        
        let minX = -10, maxX = 10; // Khoảng X cho hình học

        // 1. Thêm các Lớp đất
        const sortedSoil = [...inputs.soil_layers].sort((a, b) => b.top_elevation - a.top_elevation);
        let bottomElev = inputs.wall_bottom - 5; // Đáy biểu đồ
        
        sortedSoil.forEach((layer, i) => {
            let top = layer.top_elevation;
            let bottom = (i + 1 < sortedSoil.length) ? sortedSoil[i+1].top_elevation : bottomElev;
            
            shapes.push({
                type: 'rect',
                xref: 'paper', x0: 0, x1: 1, // Toàn chiều rộng
                y0: bottom, y1: top,
                fillcolor: `rgba(150, 150, 150, ${0.1 + (i*0.05)})`,
                line: { width: 0 }
            });
            annotations.push({
                x: 0.95, xref: 'paper',
                y: (top + bottom) / 2,
                text: layer.name,
                showarrow: false,
                font: { color: '#555', size: 10 }
            });
        });

        // 2. Thêm Tường
        shapes.push({
            type: 'line',
            x0: 0, x1: 0,
            y0: inputs.wall_bottom, y1: inputs.wall_top,
            line: { color: 'black', width: 4 }
        });

        // 3. Thêm các đường Mực nước/Mặt đất
        const addLine = (y, color, name) => {
            shapes.push({
                type: 'line',
                x0: minX, x1: maxX,
                y0: y, y1: y,
                line: { color: color, width: 2, dash: 'dot' }
            });
            annotations.push({
                x: minX + 0.5, y: y, text: name, showarrow: false, ay: -10
            });
        };
        
        addLine(inputs.ground_behind, 'green', 'Ground (Behind)');
        addLine(inputs.ground_front, 'darkgreen', 'Ground (Front)');
        addLine(inputs.water_behind, 'blue', 'Water (Behind)');
        addLine(inputs.water_front, 'darkblue', 'Water (Front)');
        
        // 4. Thêm Neo
        inputs.anchors.forEach(anchor => {
             annotations.push({
                x: 0, y: anchor.elevation,
                text: `? Anchor ${anchor.id}`,
                showarrow: true, ax: -30, ay: 0,
                font: { color: 'red' }
            });
        });

        const layout = {
            title: 'Model Geometry',
            xaxis: { visible: false, range: [minX, maxX] },
            yaxis: { title: 'Elevation (m)', range: [bottomElev, inputs.wall_top + 5] },
            margin: { l: 60, r: 20, t: 40, b: 50 },
            shapes: shapes,
            annotations: annotations,
            showlegend: false
        };
        
        Plotly.newPlot(App.dom.chartGeom, [], layout);
    }
    
    /**
     * Điền bảng tóm tắt (max/min).
     * @param {Array} results Mảng đối tượng ResultNode.
     */
    function populateSummaryTable(results) {
        const deflect = results.map(r => r.displacement_mm);
        const moment = results.map(r => r.moment_kNm);
        const shear = results.map(r => r.shear_kN);

        const maxDeflect = Math.max(...deflect.map(Math.abs));
        const maxMoment = Math.max(...moment.map(Math.abs));
        const maxShear = Math.max(...shear.map(Math.abs));

        App.dom.tableSummaryContainer.innerHTML = `
            <table class="table table-sm table-bordered" style="max-width: 600px;">
                <thead class="table-light">
                    <tr><th>Parameter</th><th>Value</th><th>Unit</th></tr>
                </thead>
                <tbody>
                    <tr><td>Max Deflection</td><td>${maxDeflect.toFixed(2)}</td><td>mm</td></tr>
                    <tr><td>Max Bending Moment</td><td>${maxMoment.toFixed(2)}</td><td>kNm/m</td></tr>
                    <tr><td>Max Shear Force</td><td>${maxShear.toFixed(2)}</td><td>kN/m</td></tr>
                </tbody>
            </table>
        `;
    }

    /**
     * Điền bảng kết quả chi tiết.
     * @param {Array} results Mảng đối tượng ResultNode.
     */
    function populateDetailedTable(results) {
        // 1. Tạo Header
        App.dom.tableResultsHeader.innerHTML = '';
        const headers = Object.keys(results[0]);
        const trHead = document.createElement('tr');
        headers.forEach(h => {
            const th = document.createElement('th');
            th.textContent = h;
            trHead.appendChild(th);
        });
        App.dom.tableResultsHeader.appendChild(trHead);

        // 2. Tạo Body
        App.dom.tableResultsBody.innerHTML = '';
        results.forEach(row => {
            const tr = document.createElement('tr');
            headers.forEach(h => {
                const td = document.createElement('td');
                let val = row[h];
                if (typeof val === 'number') {
                    if (Math.abs(val) > 100) {
                         td.textContent = val.toFixed(1);
                    } else if (Math.abs(val) > 0.1) {
                         td.textContent = val.toFixed(3);
                    } else if (val === 0) {
                         td.textContent = 0;
                    }
                    else {
                        td.textContent = val.toExponential(2);
                    }
                } else {
                    td.textContent = val;
                }
                tr.appendChild(td);
            });
            App.dom.tableResultsBody.appendChild(tr);
        });
    }

    /**
     * Lưu bảng kết quả chi tiết ra CSV.
     */
    function handleSaveResultsCSV() {
        const rows = [];
        
        // 1. Lấy Header
        const header = [];
        App.dom.tableResultsHeader.querySelectorAll('th').forEach(th => {
            header.push(th.textContent);
        });
        rows.push(header);

        // 2. Lấy Body
        App.dom.tableResultsBody.querySelectorAll('tr').forEach(tr => {
            const row = [];
            tr.querySelectorAll('td').forEach(td => {
                row.push(td.textContent);
            });
            rows.push(row);
        });
        
        const csvString = Papa.unparse(rows);
        App.downloadFile(csvString, 'sheetpile_results.csv', 'text/csv'); // Gọi hàm trợ giúp
    }
    App.handleSaveResultsCSV = handleSaveResultsCSV; // Expose

})(SheetPileApp); // Truyền vào không gian tên chung
