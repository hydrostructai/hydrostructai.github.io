/**
 * SheetPileFEM-WASM Main Application Logic
 * app.js
 *
 * This file controls the entire user interface, data management,
 * and communication with the C++/WASM core.
 *
 * Libraries (loaded in index.html):
 * - Bootstrap 5 (for UI)
 * - Plotly.js (for charts)
 * - PapaParse (for CSV)
 * - SheetJS (for Excel)
 * - sheetpilefem.js (WASM Glue)
 */

(function() {
    "use-strict";

    // --- 1. Global State and Module ---
    let WASM_MODULE = null; // Will hold the loaded WASM module
    let isLicensed = false; // NEW: Track license status

    // --- 2. DOM Element Cache ---
    // (Get all elements we need to interact with)
    const dom = {
        // Run Button & Status
        btnRun: document.getElementById('btn-run-analysis'),
        statusMessage: document.getElementById('status-message'),
        
        // License
        inpEmail: document.getElementById('inp-license-email'),
        inpKey: document.getElementById('inp-license-key'),

        // Wall & Geom Inputs
        inpWallTop: document.getElementById('inp-wall_top'),
        inpWallBottom: document.getElementById('inp-wall_bottom'),
        inpGroundBehind: document.getElementById('inp-ground_behind'),
        inpGroundFront: document.getElementById('inp-ground_front'),
        inpWaterBehind: document.getElementById('inp-water_behind'),
        inpWaterFront: document.getElementById('inp-water_front'),
        inpE: document.getElementById('inp-E'),
        inpI: document.getElementById('inp-I'),
        inpPressureTheory: document.getElementById('inp-pressure_theory'),
        
        // Soil Table
        btnAddSoilRow: document.getElementById('btn-add-soil-row'),
        tableSoilBody: document.getElementById('table-soil-body'),
        
        // Anchor Table
        btnAddAnchorRow: document.getElementById('btn-add-anchor-row'),
        tableAnchorBody: document.getElementById('table-anchor-body'),
        
        // File I/O
        btnImport: document.getElementById('btn-import'),
        inpFileImporter: document.getElementById('file-importer'),
        btnSaveCSV: document.getElementById('btn-save-csv'),
        btnSaveResultsCSV: document.getElementById('btn-save-results-csv'),

        // Output Section
        outputSection: document.getElementById('output-section'),
        chartGeom: document.getElementById('chart-geom'),
        // B? SUNG: Thêm ID bi?u d? áp l?c d?t
        chartPressure: document.getElementById('chart-pressure'),
        chartDeflection: document.getElementById('chart-deflection'),
        chartMoment: document.getElementById('chart-moment'),
        chartShear: document.getElementById('chart-shear'),
        tableSummaryContainer: document.getElementById('table-summary-container'),
        tableResultsHeader: document.getElementById('table-results-header'),
        tableResultsBody: document.getElementById('table-results-body'),

        // NEW: Get all input fields to lock/unlock
        allInputs: document.querySelectorAll('#input-section input, #input-section select')
    };

    // --- 3. Default Data (from your example) ---
    const defaultData = {
        wall: [
            { param: 'wall_top', value: 2.0 },
            { param: 'wall_bottom', value: -15.0 },
            { param: 'ground_behind', value: 1.5 },
            { param: 'ground_front', value: -5.0 },
            { param: 'water_behind', value: 0.5 },
            { param: 'water_front', value: -2.0 },
            { param: 'E', value: 3.5e7 },
            { param: 'I', value: 0.0076 },
            { param: 'pressure_theory', value: 'Rankine' },
        ],
        // CH? HI?N TH? 2 L?P Ð?T M?C Ð?NH
        soil: [
            // Name, Top Elev, Gamma, Gamma_Sat, Phi, Cohesion
            ['Lop 1 (Cat pha)', 1.5, 18.0, 19.0, 30, 2],
            ['Lop 2 (Set deo)', -8.0, 16.5, 17.5, 10, 15]
        ],
    
        anchor: [
            [1, 2.0, 0.0, 67000.0, 'D32_CT3']
        ]
    };

    // --- 4. Initialization ---

    /**
     * Main entry point when the page loads.
     */
    function initialize() {
        setStatus('Loading C++/WASM Core...', 'text-muted');
        
        // Load the WASM module
        // 'SheetPileFEM' is the EXPORT_NAME from our build command
        SheetPileFEM({
            locateFile: (path, prefix) => {
                // Helps locate the .wasm file
                if (path.endsWith('.wasm')) {
                    // Assuming .wasm is in the same directory as sheetpilefem.js
                    return prefix + path.replace(".js", ".wasm");
                }
                return prefix + path;
            }
        }).then(module => {
            WASM_MODULE = module;
            setStatus('Ready. Running in Trial Mode.', 'text-success'); // Updated text
            dom.btnRun.disabled = false;
        }).catch(err => {
            console.error("WASM Load Error:", err);
            setStatus('FATAL: WASM Core failed to load.', 'text-danger');
        });

        // Attach all event listeners
        bindEventListeners();
        
        // Load default data into the UI
        loadDataIntoUI(defaultData);

        // NEW: Lock the UI immediately for Trial Mode
        toggleUI(true);
    }

    /**
     * Binds all click (and other) handlers.
     */
    function bindEventListeners() {
        dom.btnRun.disabled = false; // MODIFIED: Button is always enabled for Trial
        dom.btnRun.addEventListener('click', onRunAnalysisClick);
        
        // Table row management
        dom.btnAddSoilRow.addEventListener('click', () => addSoilRow());
        dom.btnAddAnchorRow.addEventListener('click', () => addAnchorRow());

        // Dynamic row removal (using event delegation)
        dom.tableSoilBody.addEventListener('click', handleRemoveRow);
        dom.tableAnchorBody.addEventListener('click', handleRemoveRow);
        
        // File I/O
        dom.btnImport.addEventListener('click', () => dom.inpFileImporter.click());
        dom.inpFileImporter.addEventListener('change', handleFileImport);
        dom.btnSaveCSV.addEventListener('click', handleSaveInputCSV);
        dom.btnSaveResultsCSV.addEventListener('click', handleSaveResultsCSV);
    }

    // --- 5. UI & Table Management ---

    /**
     * NEW: Toggles the enabled/disabled state of the UI
     * @param {boolean} isLocked True to lock, false to unlock.
     */
    function toggleUI(isLocked) {
        // 1. Lock/Unlock all forms in the input section
        dom.allInputs.forEach(el => {
            // BUT, don't lock the license fields
            if (el.id !== 'inp-license-email' && el.id !== 'inp-license-key') {
                el.disabled = isLocked;
            }
        });
        
        // 2. Lock/Unlock table buttons
        dom.btnAddSoilRow.disabled = isLocked;
        dom.btnAddAnchorRow.disabled = isLocked;

        // 3. Lock/Unlock file buttons
        dom.btnImport.disabled = isLocked;
        dom.btnSaveCSV.disabled = isLocked;
        
        // 4. Lock/Unlock all "Remove" buttons
        document.querySelectorAll('.btn-remove-row').forEach(btn => {
            btn.disabled = isLocked;
        });
    }

    /**
     * Loads a data object (like defaultData) into the UI.
     * @param {object} data The data object {wall: [], soil: [], anchor: []}
     */
    function loadDataIntoUI(data) {
        // 1. Clear existing data
        dom.tableSoilBody.innerHTML = '';
        dom.tableAnchorBody.innerHTML = '';

        // 2. Load Wall parameters
        data.wall.forEach(item => {
            const el = document.getElementById(`inp-${item.param}`);
            if (el) {
                el.value = item.value;
            }
        });

        // 3. Load Soil layers
        data.soil.forEach(row => addSoilRow(row));

        // 4. Load Anchors
        data.anchor.forEach(row => addAnchorRow(row));
    }

    /**
     * Adds a new row to the Soil table.
     * @param {Array} [data] Optional data to pre-fill the row.
     */
    function addSoilRow(data = ['', '', '', '', '', '']) {
        const tr = document.createElement('tr');
        // MODIFIED: Add disabled attribute based on license status
        const disabled = !isLicensed ? 'disabled' : '';
        tr.innerHTML = `
            <td><input type="text" class="form-control form-control-sm" value="${data[0]}" ${disabled}></td>
            <td><input type="number" class="form-control form-control-sm" value="${data[1]}" ${disabled}></td>
            <td><input type="number" class="form-control form-control-sm" value="${data[2]}" ${disabled}></td>
            <td><input type="number" class="form-control form-control-sm" value="${data[3]}" ${disabled}></td>
            <td><input type="number" class="form-control form-control-sm" value="${data[4]}" ${disabled}></td>
            <td><input type="number" class="form-control form-control-sm" value="${data[5]}" ${disabled}></td>
            <td><button class="btn btn-sm btn-danger btn-remove-row" ${disabled}>X</button></td>
        `;
        dom.tableSoilBody.appendChild(tr);
    }

    /**
     * Adds a new row to the Anchor table.
     * @param {Array} [data] Optional data to pre-fill the row.
     */
    function addAnchorRow(data = ['', '', '', '', '']) {
        const tr = document.createElement('tr');
        // MODIFIED: Add disabled attribute based on license status
        const disabled = !isLicensed ? 'disabled' : '';
        tr.innerHTML = `
            <td><input type="number" class="form-control form-control-sm" value="${data[0]}" ${disabled}></td>
            <td><input type="number" class="form-control form-control-sm" value="${data[1]}" ${disabled}></td>
            <td><input type="number" class="form-control form-control-sm" value="${data[2]}" ${disabled}></td>
            <td><input type="number" class="form-control form-control-sm" value="${data[3]}" ${disabled}></td>
            <td><input type="text" class="form-control form-control-sm" value="${data[4]}" ${disabled}></td>
            <td><button class="btn btn-sm btn-danger btn-remove-row" ${disabled}>X</button></td>
        `;
        dom.tableAnchorBody.appendChild(tr);
    }

    /**
     * Handles the click event for the 'X' button on any table row.
     * @param {Event} e The click event.
     */
    function handleRemoveRow(e) {
        if (e.target.classList.contains('btn-remove-row')) {
            e.target.closest('tr').remove();
        }
    }

    // --- 6. Data Collection & Formatting ---

    /**
     * Collects all data from the UI and builds the JSON object for WASM.
     * This must match the `AnalysisInput` struct in `datastructs.h`.
     * @returns {object} The complete AnalysisInput object.
     */
    function collectInputs() {
        const inputs = {};

        // 1. Wall & Geometry
        inputs.wall_top = parseFloat(dom.inpWallTop.value);
        inputs.wall_bottom = parseFloat(dom.inpWallBottom.value);
        inputs.ground_behind = parseFloat(dom.inpGroundBehind.value);
        inputs.ground_front = parseFloat(dom.inpGroundFront.value);
        inputs.water_behind = parseFloat(dom.inpWaterBehind.value);
        inputs.water_front = parseFloat(dom.inpWaterFront.value);
        inputs.E = parseFloat(dom.inpE.value);
        inputs.I = parseFloat(dom.inpI.value);
        inputs.pressure_theory = dom.inpPressureTheory.value;

        // 2. Analysis Options (from datastructs.h defaults)
        inputs.max_iterations = 30;
        inputs.tolerance = 1e-6;

        // 3. Soil Layers
        inputs.soil_layers = [];
        dom.tableSoilBody.querySelectorAll('tr').forEach(tr => {
            const cells = tr.querySelectorAll('input');
            if (cells.length === 6 && cells[0].value) { // Ensure row is not empty
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

        // 4. Anchors
        inputs.anchors = [];
        dom.tableAnchorBody.querySelectorAll('tr').forEach(tr => {
            const cells = tr.querySelectorAll('input');
            if (cells.length === 5 && cells[0].value) { // Ensure row is not empty
                inputs.anchors.push({
                    id: parseInt(cells[0].value),
                    elevation: parseFloat(cells[1].value),
                    slope: parseFloat(cells[2].value),
                    stiffness: parseFloat(cells[3].value),
                    section: cells[4].value
                });
            }
        });
        
        // 5. Surcharge (Empty for now, as per UI)
        inputs.surcharge_loads = [];

        return inputs;
    }

    // --- 7. File I/O Handlers ---

    /**
     * Handles the 'change' event for the file input.
     * Detects file type and calls the appropriate parser.
     * @param {Event} e The change event.
     */
    function handleFileImport(e) {
        if (!isLicensed) { // NEW: Block if not licensed
            handleError("ERROR_LICENSE_REQUIRED_FOR_IMPORT");
            return;
        }
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
            setStatus('Error: Invalid file type.', 'text-danger');
        }
        
        // Reset file input
        e.target.value = null;
    }

    /**
     * Parses the "combined" CSV format.
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
            
            if (type === 'WALL' && values[0] !== 'Value') { // Skip header
                newData.wall.push({ param: values[0], value: values[1] });
            } else if (type === 'SOIL' && values[0] !== 'col1') { // Skip header
                newData.soil.push(values);
            } else if (type === 'ANCHOR' && values[0] !== 'col1') { // Skip header
                newData.anchor.push(values);
            }
        });
        
        loadDataIntoUI(newData);
        setStatus('CSV data imported.', 'text-success');
    }

    /**
     * Parses an Excel file (assumes format is same as CSV sections).
     * @param {ArrayBuffer} data The raw file buffer.
     */
    function parseExcel(data) {
        // This is more complex, as Excel files don't have a single
        // "text" representation. A common convention is one sheet
        // per data type (e.g., "Wall", "Soil", "Anchor").
        
        // For simplicity, we'll assume the *first sheet* is in the
        // *same combined CSV format* as our CSV parser.
        const workbook = XLSX.read(data, { type: 'array' });
        const sheetName = workbook.SheetNames[0];
        const csvString = XLSX.utils.sheet_to_csv(workbook.Sheets[sheetName], {
            header: 1,
            blankrows: false
        });
        
        // Re-use the CSV parser
        parseCSV(csvString);
        setStatus('Excel data imported.', 'text-success');
    }

    /**
     * Collects current UI data and saves it as a "combined" CSV.
     */
    function handleSaveInputCSV() {
        const inputs = collectInputs();
        let csvContent = [
            "# SheetPileFEM Combined Input File",
            "# File format: TYPE, col1, col2, col3...",
            "#"
        ];

        // 1. Wall Data
        csvContent.push("# SECTION: WALL (Parameter, Value, Unit)");
        csvContent.push("TYPE,Parameter,Value,Unit");
        csvContent.push(`WALL,wall_top,${inputs.wall_top},m`);
        csvContent.push(`WALL,wall_bottom,${inputs.wall_bottom},m`);
        csvContent.push(`WALL,ground_behind,${inputs.ground_behind},m`);
        csvContent.push(`WALL,ground_front,${inputs.ground_front},m`);
        csvContent.push(`WALL,water_behind,${inputs.water_behind},m`);
        csvContent.push(`WALL,water_front,${inputs.water_front},m`);
        csvContent.push(`WALL,E,${inputs.E},kN/m2`);
        csvContent.push(`WALL,I,${inputs.I},m4/m`);
        csvContent.push(`WALL,pressure_theory,${inputs.pressure_theory},`);
        csvContent.push("#");
        
        // 2. Soil Data
        csvContent.push("# SECTION: SOIL (name, top_elevation, gamma_natural, gamma_saturated, phi_degrees, cohesion_kPa)");
        csvContent.push("TYPE,col1,col2,col3,col4,col5,col6");
        inputs.soil_layers.forEach(s => {
            csvContent.push(`SOIL,${s.name},${s.top_elevation},${s.gamma_natural},${s.gamma_saturated},${s.phi_degrees},${s.cohesion_kPa}`);
        });
        csvContent.push("#");

        // 3. Anchor Data
        csvContent.push("# SECTION: ANCHOR (id, elevation, slope, stiffness, section)");
        csvContent.push("TYPE,col1,col2,col3,col4,col5");
        inputs.anchors.forEach(a => {
            csvContent.push(`ANCHOR,${a.id},${a.elevation},${a.slope},${a.stiffness},${a.section}`);
        });

        downloadFile(csvContent.join('\n'), 'sheetpile_input.csv', 'text/csv');
    }

    /**
     * Saves the detailed results table to a CSV file.
     */
    function handleSaveResultsCSV() {
        const rows = [];
        
        // 1. Get Header
        const header = [];
        dom.tableResultsHeader.querySelectorAll('th').forEach(th => {
            header.push(th.textContent);
        });
        rows.push(header);

        // 2. Get Body
        dom.tableResultsBody.querySelectorAll('tr').forEach(tr => {
            const row = [];
            tr.querySelectorAll('td').forEach(td => {
                row.push(td.textContent);
            });
            rows.push(row);
        });
        
        const csvString = Papa.unparse(rows);
        downloadFile(csvString, 'sheetpile_results.csv', 'text/csv');
    }

    /**
     * Helper to trigger a file download.
     * @param {string} content File content.
     * @param {string} fileName The name of the file.
     * @param {string} mimeType The MIME type.
     */
    function downloadFile(content, fileName, mimeType) {
        const a = document.createElement('a');
        const blob = new Blob([content], { type: mimeType });
        a.href = URL.createObjectURL(blob);
        a.download = fileName;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
    }


    // --- 8. Core Analysis & Results ---

    /**
     * Main function: Called when "RUN ANALYSIS" is clicked.
     */
    async function onRunAnalysisClick() {
        if (!WASM_MODULE) {
            handleError("WASM module not loaded. Please refresh.");
            return;
        }

        setStatus('Running...', 'text-primary');
        dom.btnRun.disabled = true;

        // --- 1. License Check (3-Layer) ---
        const email = dom.inpEmail.value;
        const key = dom.inpKey.value;
        
        let serverTime;
        try {
            // Fetch time from a public API (WorldTimeAPI)
            const response = await fetch('https://worldtimeapi.org/api/timezone/Etc/UTC');
            if (!response.ok) throw new Error('Network response was not ok.');
            const data = await response.json();
            serverTime = new Date(data.utc_datetime).getTime();
        } catch (e) {
            console.error("Time API fetch error:", e);
            handleError("ERROR_TIME_API_FAILED");
            return;
        }

        const clientTime = new Date().getTime();
        
        // Call C++/WASM license function
        const licenseResult = WASM_MODULE.validateLicense(email, key, serverTime, clientTime);

        // --- NEW LOGIC for Trial vs Licensed ---
        if (licenseResult === "OK") {
            if (!isLicensed) {
                // This is the first time they passed!
                isLicensed = true;
                toggleUI(false); // Unlock the interface!
                setStatus('License Validated! UI Unlocked.', 'text-success');
            } else {
                // They are already licensed, just running.
                setStatus('Running analysis (Licensed)...', 'text-primary');
            }
        } else {
            // License is NOT ok
            if (isLicensed) {
                // They *were* licensed, but it expired (e.g., date changed)
                isLicensed = false;
                toggleUI(true); // Lock the UI
                handleError("ERROR_LICENSE_EXPIRED_OR_INVALIDATED");
                return; // Stop them
            }
            
            // Not licensed, running in Trial mode.
            // Only show an error if they *tried* to enter a key.
            if (email || key) {
                handleError(licenseResult); // Show the specific error
            } else {
                setStatus('Running Trial Mode...', 'text-info');
            }
            // *We still proceed with the analysis*
        }
        
        // --- 2. Collect Inputs ---
        let inputs;
        try {
            inputs = collectInputs();
        } catch (e) {
            console.error("Input collection error:", e);
            handleError("ERROR_INPUT_COLLECTION");
            return;
        }

        // --- 3. Run C++/WASM Analysis ---
        let results;
        try {
            const inputJsonString = JSON.stringify(inputs);
            
            // Call the main C++ analysis function
            const resultJsonString = WASM_MODULE.runAnalysis(inputJsonString);
            
            results = JSON.parse(resultJsonString);

            if (results.error) {
                // This is an error *from C++* (e.g., "Matrix unstable")
                console.error("C++ Core Error:", results.details);
                handleError("ERROR_CPP_ANALYSIS_FAILED", results.details);
                return;
            }
        } catch (e) {
            // This is a JavaScript or WASM-binding error
            console.error("WASM Call Error:", e);
            handleError("ERROR_WASM_CALL_FAILED");
            return;
        }

        // --- 4. Success: Display Results ---
        setStatus('Analysis Completed.', 'text-success');
        dom.btnRun.disabled = false;
        
        try {
            displayResults(results, inputs); // Pass inputs for geometry chart
            dom.outputSection.style.display = 'block';
            // Scroll to results
            dom.outputSection.scrollIntoView({ behavior: 'smooth' });
        } catch (e) {
            console.error("Plotting Error:", e);
            handleError("ERROR_PLOTTING_FAILED");
        }
    }

    /**
     * Handles error codes from C++ and JS.
     * @param {string} errorCode The error code (e.g., "ERROR_TIME_TAMPER_DETECTED").
     * @param {string} [details] Optional extra details.
     */
    function handleError(errorCode, details = "") {
        let message = "An unknown error occurred.";
        
        // This is the Error Code Table
        switch(errorCode) {
            case "OK":
                message = "Analysis Completed.";
                setStatus(message, 'text-success');
                dom.btnRun.disabled = false;
                return;
            case "ERROR_TIME_TAMPER_DETECTED":
                message = "License Error: System time mismatch detected. Please check your clock.";
                break;
            case "ERROR_BINARY_EXPIRED":
                message = "License Error: This version of the software has expired. Please contact support.";
                break;
            case "ERROR_LICENSE_INVALID_OR_EXPIRED":
                message = "License Error: The provided Email or License Key is invalid or has expired.";
                break;
            // NEW Error codes
            case "ERROR_LICENSE_EXPIRED_OR_INVALIDATED":
                message = "License Error: Your license is no longer valid. The UI has been locked.";
                break;
            case "ERROR_LICENSE_REQUIRED_FOR_IMPORT":
                message = "A valid license is required to import files.";
                break;
            case "ERROR_TIME_API_FAILED":
                message = "Error: Could not verify time. Please check your internet connection and try again.";
                break;
            case "ERROR_INPUT_COLLECTION":
                message = "Error: Could not read data from input fields. Check for invalid numbers.";
                break;
            case "ERROR_CPP_ANALYSIS_FAILED":
                message = `Core Analysis Failed: ${details || "The C++ engine reported an error."}`;
                break;
            case "ERROR_WASM_CALL_FAILED":
                message = "Critical Error: The call to the WASM module failed.";
                break;
            case "ERROR_PLOTTING_FAILED":
                message = "Analysis complete, but failed to render charts.";
                break;
        }
        
        setStatus(message, 'text-danger');
        dom.btnRun.disabled = false; // MODIFIED: Always re-enable the run button
    }

    /**
     * Sets the text and color of the status message.
     * @param {string} text The message to display.
     * @param {string} className The Bootstrap class (e.g., 'text-success', 'text-danger').
     */
    function setStatus(text, className) {
        dom.statusMessage.textContent = text;
        dom.statusMessage.className = `me-3 ${className}`;
    }

    // --- 9. Plotting & Results Display ---

    /**
     * Main function to display all results.
     * @param {Array} results The array of ResultNode objects from WASM.
     * @param {object} inputs The input object (needed for geometry chart).
     */
    function displayResults(results, inputs) {
        // 1. Plot Charts
        plotGeometryChart(results, inputs);
        plotStandardCharts(results);
        
        // B? SUNG: G?i hàm v? bi?u d? áp l?c d?t
        plotPressureChart(results); 
        
        // 2. Populate Tables
        populateSummaryTable(results);
        populateDetailedTable(results);
    }
    
    /**
     * Plots the 3 standard analysis charts (Deflection, Moment, Shear).
     * @param {Array} results The array of ResultNode objects.
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

        Plotly.newPlot(dom.chartDeflection,
            [{ x: deflect, y: elev, type: 'scatter', mode: 'lines', name: 'Deflection' }],
            { ...commonLayout, title: 'Wall Deflection', xaxis: { title: 'Deflection (mm)' } }
        );
        Plotly.newPlot(dom.chartMoment,
            [{ x: moment, y: elev, type: 'scatter', mode: 'lines', name: 'Moment' }],
            { ...commonLayout, title: 'Bending Moment', xaxis: { title: 'Moment (kNm/m)' } }
        );
        Plotly.newPlot(dom.chartShear,
            [{ x: shear, y: elev, type: 'scatter', mode: 'lines', name: 'Shear' }],
            { ...commonLayout, title: 'Shear Force', xaxis: { title: 'Shear (kN/m)' } }
        );
    }

    /**
     * B? SUNG: V? bi?u d? Áp l?c Ð?t
     * @param {Array} results M?ng d?i tu?ng ResultNode.
     */
    function plotPressureChart(results) {
        const elev = results.map(r => r.elevation);
        
        // Gi? d?nh các thu?c tính này t?n t?i trong d?i tu?ng 'results' tr? v? t? WASM
        // Tính t?ng áp l?c ch? d?ng (d?t + nu?c)
        const active_total = results.map(r => (r.pressure_active_kPa || 0) + (r.pressure_water_behind_kPa || 0));
        
        // Tính t?ng áp l?c b? d?ng (d?t + nu?c) và nhân v?i -1 d? v? sang bên trái
        const passive_total = results.map(r => -((r.pressure_passive_kPa || 0) + (r.pressure_water_front_kPa || 0)));

        const traceActive = {
            x: active_total,
            y: elev,
            type: 'scatter',
            mode: 'lines',
            name: 'Áp l?c Ch? d?ng (T? h?p)',
            fill: 'tozerox', // Tô màu t? du?ng line v? tr?c X=0
            fillcolor: 'rgba(214, 39, 40, 0.2)', // Màu d? nh?t (Plotly default red)
            line: { color: 'rgba(214, 39, 40, 0.6)' }
        };

        const tracePassive = {
            x: passive_total,
            y: elev,
            type: 'scatter',
            mode: 'lines',
            name: 'Áp l?c B? d?ng (T? h?p)',
            fill: 'tozerox', // Tô màu t? du?ng line v? tr?c X=0
            fillcolor: 'rgba(31, 119, 180, 0.2)', // Màu xanh nh?t (Plotly default blue)
            line: { color: 'rgba(31, 119, 180, 0.6)' }
        };
        
        const layout = {
            title: 'Bi?u d? Áp l?c d?t (T? h?p)',
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
        
        Plotly.newPlot(dom.chartPressure, [traceActive, tracePassive], layout);
    }

    /**
     * Plots the complex geometry chart, as seen in the image.
     * @param {Array} results The array of ResultNode objects.
     * @param {object} inputs The input object.
     */
    function plotGeometryChart(results, inputs) {
        const shapes = [];
        const annotations = [];
        
        let minX = -10, maxX = 10; // X-axis range for geometry

        // 1. Add Soil Layers
        // (Sort by elevation, descending)
        const sortedSoil = [...inputs.soil_layers].sort((a, b) => b.top_elevation - a.top_elevation);
        let bottomElev = inputs.wall_bottom - 5; // Chart bottom
        
        sortedSoil.forEach((layer, i) => {
            let top = layer.top_elevation;
            let bottom = (i + 1 < sortedSoil.length) ? sortedSoil[i+1].top_elevation : bottomElev;
            
            // Add a rectangle shape
            shapes.push({
                type: 'rect',
                xref: 'paper', x0: 0, x1: 1, // Full width
                y0: bottom, y1: top,
                fillcolor: `rgba(150, 150, 150, ${0.1 + (i*0.05)})`, // Thay d?i màu ng?u nhiên
                line: { width: 0 }
            });
            // Add layer name
            annotations.push({
                x: 0.95, xref: 'paper',
                y: (top + bottom) / 2,
                text: layer.name,
                showarrow: false,
                font: { color: '#555', size: 10 }
            });
        });

        // 2. Add Wall
        shapes.push({
            type: 'line',
            x0: 0, x1: 0,
            y0: inputs.wall_bottom, y1: inputs.wall_top,
            line: { color: 'black', width: 4 }
        });

        // 3. Add Ground/Water Lines
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
        
        // 4. Add Anchors
        inputs.anchors.forEach(anchor => {
             annotations.push({
                x: 0, y: anchor.elevation,
                text: `? Anchor ${anchor.id}`, // Thay d?i ký t?
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
        
        Plotly.newPlot(dom.chartGeom, [], layout);
    }
    
    /**
     * Populates the summary table with max values.
     * @param {Array} results The array of ResultNode objects.
     */
    function populateSummaryTable(results) {
        const deflect = results.map(r => r.displacement_mm);
        const moment = results.map(r => r.moment_kNm);
        const shear = results.map(r => r.shear_kN);

        const maxDeflect = Math.max(...deflect.map(Math.abs));
        const maxMoment = Math.max(...moment.map(Math.abs));
        const maxShear = Math.max(...shear.map(Math.abs));

        dom.tableSummaryContainer.innerHTML = `
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
     * Populates the detailed results table.
     * @param {Array} results The array of ResultNode objects.
     */
    function populateDetailedTable(results) {
        // 1. Create Header
        dom.tableResultsHeader.innerHTML = '';
        const headers = Object.keys(results[0]);
        const trHead = document.createElement('tr');
        headers.forEach(h => {
            const th = document.createElement('th');
            th.textContent = h;
            trHead.appendChild(th);
        });
        dom.tableResultsHeader.appendChild(trHead);

        // 2. Create Body
        dom.tableResultsBody.innerHTML = '';
        results.forEach(row => {
            const tr = document.createElement('tr');
            headers.forEach(h => {
                const td = document.createElement('td');
                let val = row[h];
                // Format numbers
                if (typeof val === 'number') {
                    // B? SUNG: Làm tròn t?t hon, d?c bi?t cho các giá tr? r?t nh?
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
            dom.tableResultsBody.appendChild(tr);
        });
    }

    // --- Kick it all off ---
    document.addEventListener('DOMContentLoaded', initialize);

})();
