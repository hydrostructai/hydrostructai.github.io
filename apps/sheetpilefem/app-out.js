/**
 * SheetPileFEM-WASM - Module Hi?n th? K?t qu?
 * app-out.js
 *
 * Ch?u trách nhi?m:
 * 1. Hàm `displayResults` chính.
 * 2. T?t c? các hàm v? bi?u d? Plotly (Geometry, Pressure, Deflection, v.v.).
 * 3. Các hàm di?n d? li?u vào b?ng k?t qu? (Summary, Detailed).
 * 4. Logic cho nút "Save Results CSV".
 */
(function(App) {
    "use-strict";

    /**
     * Hàm chính d? hi?n th? t?t c? k?t qu?.
     * @param {Array} results M?ng các d?i tu?ng ResultNode t? WASM.
     * @param {object} inputs Ð?i tu?ng input (c?n cho bi?u d? hình h?c).
     */
    App.displayResults = function(results, inputs) {
        // 1. V? Bi?u d?
        plotGeometryChart(results, inputs);
        plotStandardCharts(results);
        plotPressureChart(results); 
        
        // 2. Ði?n B?ng
        populateSummaryTable(results);
        populateDetailedTable(results);
    }
    
    /**
     * V? 3 bi?u d? phân tích chu?n (Chuy?n v?, Moment, L?c c?t).
     * @param {Array} results M?ng các d?i tu?ng ResultNode.
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
     * V? bi?u d? Áp l?c Ð?t
     * @param {Array} results M?ng d?i tu?ng ResultNode.
     */
    function plotPressureChart(results) {
        const elev = results.map(r => r.elevation);
        
        // Tính t?ng áp l?c ch? d?ng (d?t + nu?c)
        const active_total = results.map(r => (r.pressure_active_kPa || 0) + (r.pressure_water_behind_kPa || 0));
        
        // Tính t?ng áp l?c b? d?ng (d?t + nu?c) và nhân v?i -1 d? v? sang trái
        const passive_total = results.map(r => -((r.pressure_passive_kPa || 0) + (r.pressure_water_front_kPa || 0)));

        const traceActive = {
            x: active_total,
            y: elev,
            type: 'scatter',
            mode: 'lines',
            name: 'Áp l?c Ch? d?ng (T? h?p)',
            fill: 'tozerox', 
            fillcolor: 'rgba(214, 39, 40, 0.2)', 
            line: { color: 'rgba(214, 39, 40, 0.6)' }
        };

        const tracePassive = {
            x: passive_total,
            y: elev,
            type: 'scatter',
            mode: 'lines',
            name: 'Áp l?c B? d?ng (T? h?p)',
            fill: 'tozerox', 
            fillcolor: 'rgba(31, 119, 180, 0.2)', 
            line: { color: 'rgba(31, 119, 180, 0.6)' }
        };
        
        const layout = {
            title: 'Bi?u d? áp l?c d?y (T? h?p)',
            xaxis: { 
                title: 'Áp l?c (kPa)', 
                zeroline: true, 
                zerolinewidth: 2, 
                zerolinecolor: '#000' 
            },
            yaxis: { title: 'Cao d? (m)' },
            margin: { l: 60, r: 20, t: 40, b: 50 },
            hovermode: 'y unified',
            legend: { yanchor: "top", y: 0.99, xanchor: "left", x: 0.01 }
        };
        
        Plotly.newPlot(App.dom.chartPressure, [traceActive, tracePassive], layout);
    }

    /**
     * V? bi?u d? hình h?c mô hình.
     * @param {Array} results M?ng d?i tu?ng ResultNode.
     * @param {object} inputs Ð?i tu?ng input.
     */
    function plotGeometryChart(results, inputs) {
        const shapes = [];
        const annotations = [];
        
        let minX = -10, maxX = 10; // Kho?ng X cho hình h?c

        // 1. Thêm các L?p d?t
        const sortedSoil = [...inputs.soil_layers].sort((a, b) => b.top_elevation - a.top_elevation);
        let bottomElev = inputs.wall_bottom - 5; // Ðáy bi?u d?
        
        sortedSoil.forEach((layer, i) => {
            let top = layer.top_elevation;
            let bottom = (i + 1 < sortedSoil.length) ? sortedSoil[i+1].top_elevation : bottomElev;
            
            shapes.push({
                type: 'rect',
                xref: 'paper', x0: 0, x1: 1, // Toàn chi?u r?ng
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

        // 2. Thêm Tu?ng
        shapes.push({
            type: 'line',
            x0: 0, x1: 0,
            y0: inputs.wall_bottom, y1: inputs.wall_top,
            line: { color: 'black', width: 4 }
        });

        // 3. Thêm các du?ng M?c nu?c/M?t d?t
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
     * Ði?n b?ng tóm t?t (max/min).
     * @param {Array} results M?ng d?i tu?ng ResultNode.
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
     * Ði?n b?ng k?t qu? chi ti?t.
     * @param {Array} results M?ng d?i tu?ng ResultNode.
     */
    function populateDetailedTable(results) {
        // 1. T?o Header
        App.dom.tableResultsHeader.innerHTML = '';
        const headers = Object.keys(results[0]);
        const trHead = document.createElement('tr');
        headers.forEach(h => {
            const th = document.createElement('th');
            th.textContent = h;
            trHead.appendChild(th);
        });
        App.dom.tableResultsHeader.appendChild(trHead);

        // 2. T?o Body
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
     * Luu b?ng k?t qu? chi ti?t ra CSV.
     */
    function handleSaveResultsCSV() {
        const rows = [];
        
        // 1. L?y Header
        const header = [];
        App.dom.tableResultsHeader.querySelectorAll('th').forEach(th => {
            header.push(th.textContent);
        });
        rows.push(header);

        // 2. L?y Body
        App.dom.tableResultsBody.querySelectorAll('tr').forEach(tr => {
            const row = [];
            tr.querySelectorAll('td').forEach(td => {
                row.push(td.textContent);
            });
            rows.push(row);
        });
        
        const csvString = Papa.unparse(rows);
        App.downloadFile(csvString, 'sheetpile_results.csv', 'text/csv'); // G?i hàm tr? giúp
    }
    App.handleSaveResultsCSV = handleSaveResultsCSV; // Expose

})(SheetPileApp); // Truy?n vào không gian tên chung
