/**
 * SheetPileFEM-WASM - Module Tính toán & Nh?p li?u
 * app-cal.js
 *
 * Ch?u trách nhi?m:
 * 1. Logic cho nút "RUN ANALYSIS".
 * 2. Thu th?p d? li?u t? UI (`collectInputs`).
 * 3. G?i hàm `runAnalysis` c?a WASM.
 * 4. X? lý logic nh?p file (Import) và luu file (Save Input).
 */
(function(App) {
    "use-strict";

    /**
     * Thu th?p t?t c? d? li?u t? UI và xây d?ng d?i tu?ng JSON cho WASM.
     * @returns {object} The complete AnalysisInput object.
     */
    function collectInputs() {
        const inputs = {};

        // 1. Thông s? tu?ng & Hình h?c
        inputs.wall_top = parseFloat(App.dom.inpWallTop.value);
        inputs.wall_bottom = parseFloat(App.dom.inpWallBottom.value);
        inputs.ground_behind = parseFloat(App.dom.inpGroundBehind.value);
        inputs.ground_front = parseFloat(App.dom.inpGroundFront.value);
        inputs.water_behind = parseFloat(App.dom.inpWaterBehind.value);
        inputs.water_front = parseFloat(App.dom.inpWaterFront.value);
        inputs.E = parseFloat(App.dom.inpE.value);
        inputs.I = parseFloat(App.dom.inpI.value);
        inputs.pressure_theory = App.dom.inpPressureTheory.value;

        // 2. Tùy ch?n Phân tích
        inputs.max_iterations = 30;
        inputs.tolerance = 1e-6;

        // 3. Các L?p d?t
        inputs.soil_layers = [];
        App.dom.tableSoilBody.querySelectorAll('tr').forEach(tr => {
            const cells = tr.querySelectorAll('input');
            if (cells.length === 6 && cells[0].value) { // Ð?m b?o hàng không r?ng
                inputs.soil_layers.push({
                    name: cells[0].value,
                    top_elevation: parseFloat(cells[1].value),
                    gamma_natural: parseFloat(cells[2].value),
                    gamma_saturated: parseFloat(cells[3].value),
                    phi_degrees: parseFloat(cells[4].value),
                    cohesion_kPa: parseFloat(cells[5].value)
                });
            }
        });

        // 4. Các Neo
        inputs.anchors = [];
        App.dom.tableAnchorBody.querySelectorAll('tr').forEach(tr => {
            const cells = tr.querySelectorAll('input');
            if (cells.length === 5 && cells[0].value) { // Ð?m b?o hàng không r?ng
                inputs.anchors.push({
                    id: parseInt(cells[0].value),
                    elevation: parseFloat(cells[1].value),
                    slope: parseFloat(cells[2].value),
                    stiffness: parseFloat(cells[3].value),
                    section: cells[4].value
                });
            }
        });
        
        // 5. T?i tr?ng (R?ng)
        inputs.surcharge_loads = [];

        return inputs;
    }
    App.collectInputs = collectInputs; // Expose

    /**
     * LOGIC ÐÃ S?A: X? lý khi nh?n "RUN ANALYSIS"
     * (Ðã lo?i b? ph?n ki?m tra license)
     */
    App.onRunAnalysisClick = function() {
        if (!App.WASM_MODULE) {
            App.handleError("WASM module not loaded. Please refresh.");
            return;
        }

        App.setStatus('Running...', 'text-primary');
        App.dom.btnRun.disabled = true;

        // --- 1. Thu th?p Inputs ---
        let inputs;
        try {
            inputs = collectInputs(); // Ch? thu th?p
        } catch (e) {
            console.error("Input collection error:", e);
            App.handleError("ERROR_INPUT_COLLECTION");
            return;
        }

        // --- 2. Ch?y Phân tích WASM ---
        let results;
        try {
            const inputJsonString = JSON.stringify(inputs);
            
            // G?i hàm C++
            const resultJsonString = App.WASM_MODULE.runAnalysis(inputJsonString);
            
            results = JSON.parse(resultJsonString);

            if (results.error) {
                // L?i t? C++ (ví d?: "Matrix unstable")
                console.error("C++ Core Error:", results.details);
                App.handleError("ERROR_CPP_ANALYSIS_FAILED", results.details);
                return;
            }
        } catch (e) {
            // L?i JS ho?c binding
            console.error("WASM Call Error:", e);
            App.handleError("ERROR_WASM_CALL_FAILED");
            return;
        }

        // --- 3. Thành công: Hi?n th? K?t qu? ---
        App.setStatus('Analysis Completed.', 'text-success');
        App.dom.btnRun.disabled = false;
        
        try {
            App.displayResults(results, inputs); // G?i hàm t? app-out.js
            App.dom.outputSection.style.display = 'block';
            App.dom.outputSection.scrollIntoView({ behavior: 'smooth' });
        } catch (e) {
            console.error("Plotting Error:", e);
            App.handleError("ERROR_PLOTTING_FAILED");
        }
    }

    // --- 7. Logic X? lý File I/O ---

    /**
     * X? lý s? ki?n 'change' c?a input file.
     * (ÐÃ G? B? KI?M TRA LICENSE)
     * @param {Event} e The change event.
     */
    function handleFileImport(e) {
        // KHÔNG CÒN: if (!App.isLicensed) ...
        
        const file = e.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        
        if (file.name.endsWith('.csv') || file.name.endsWith('.txt')) {
            reader.onload = (event) => {
                parseCSV(event.target.result);
            };
            reader.readAsText(file);
        } else if (file.name.endsWith('.xlsx')) {
            reader.onload = (event) => {
                parseExcel(event.target.result);
            };
            reader.readAsArrayBuffer(file);
        } else {
            App.setStatus('Error: Invalid file type.', 'text-danger');
        }
        
        e.target.value = null; // Reset input file
    }
    App.handleFileImport = handleFileImport; // Expose

    /**
     * Phân tích chu?i CSV.
     * @param {string} csvString The raw CSV text.
     */
    function parseCSV(csvString) {
        const data = Papa.parse(csvString, {
            comments: "#",
            skipEmptyLines: true
        }).data;

        const newData = { wall: [], soil: [], anchor: [] };
        
        data.forEach(row => {
            const type = row[0].toUpperCase();
            const values = row.slice(1);
            
            if (type === 'WALL' && values[0] !== 'Value') {
                newData.wall.push({ param: values[0], value: values[1] });
            } else if (type === 'SOIL' && values[0] !== 'col1') {
                newData.soil.push(values);
            } else if (type === 'ANCHOR' && values[0] !== 'col1') {
                newData.anchor.push(values);
            }
        });
        
        App.loadDataIntoUI(newData); // G?i hàm t? app-check.js
        App.setStatus('CSV data imported.', 'text-success');
    }
    App.parseCSV = parseCSV; // Expose

    /**
     * Phân tích file Excel.
     * @param {ArrayBuffer} data The raw file buffer.
     */
    function parseExcel(data) {
        const workbook = XLSX.read(data, { type: 'array' });
        const sheetName = workbook.SheetNames[0];
        const csvString = XLSX.utils.sheet_to_csv(workbook.Sheets[sheetName], {
            header: 1,
            blankrows: false
        });
        
        parseCSV(csvString); // Tái s? d?ng trình phân tích CSV
        App.setStatus('Excel data imported.', 'text-success');
    }
    App.parseExcel = parseExcel; // Expose

    /**
     * Thu th?p input hi?n t?i và luu du?i d?ng CSV.
     */
    function handleSaveInputCSV() {
        const inputs = collectInputs();
        let csvContent = [
            "# SheetPileFEM Combined Input File",
            "# File format: TYPE, col1, col2, col3...",
            "#"
        ];

        // 1. D? li?u Tu?ng
        csvContent.push("# SECTION: WALL (Parameter, Value, Unit)");
        csvContent.push("TYPE,Parameter,Value,Unit");
        csvContent.push(`WALL,wall_top,${inputs.wall_top},m`);
        csvContent.push(`WALL,wall_bottom,${inputs.wall_bottom},m`);
        // ... (thêm các dòng còn l?i)
        inputs.wall.forEach(item => {
             if (item.param !== 'wall_top' && item.param !== 'wall_bottom') {
                 csvContent.push(`WALL,${item.param},${item.value},`); // Ðon gi?n hóa
             }
         });
        csvContent.push("#");
        
        // 2. D? li?u Ð?t
        csvContent.push("# SECTION: SOIL (name, top_elevation, gamma_natural, gamma_saturated, phi_degrees, cohesion_kPa)");
        csvContent.push("TYPE,col1,col2,col3,col4,col5,col6");
        inputs.soil_layers.forEach(s => {
            csvContent.push(`SOIL,${s.name},${s.top_elevation},${s.gamma_natural},${s.gamma_saturated},${s.phi_degrees},${s.cohesion_kPa}`);
        });
        csvContent.push("#");

        // 3. D? li?u Neo
        csvContent.push("# SECTION: ANCHOR (id, elevation, slope, stiffness, section)");
        csvContent.push("TYPE,col1,col2,col3,col4,col5");
        inputs.anchors.forEach(a => {
            csvContent.push(`ANCHOR,${a.id},${a.elevation},${a.slope},${a.stiffness},${a.section}`);
        });

        App.downloadFile(csvContent.join('\n'), 'sheetpile_input.csv', 'text/csv'); // G?i hàm tr? giúp
    }
    App.handleSaveInputCSV = handleSaveInputCSV; // Expose

})(SheetPileApp); // Truy?n vào không gian tên chung
