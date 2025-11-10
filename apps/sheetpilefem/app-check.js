/**
 * SheetPileFEM-WASM - Module Ki?m tra License & Qu?n lý UI
 * app-check.js
 *
 * Ch?u trách nhi?m:
 * 1. Kh?i t?o ?ng d?ng và t?i WASM.
 * 2. Ki?m tra `sessionStorage` d? duy trì tr?ng thái license.
 * 3. X? lý logic cho nút "Ki?m tra Gi?y phép".
 * 4. Khóa/M? khóa giao di?n (toggleUI).
 * 5. Qu?n lý các hàm tr? giúp (setStatus, handleError, downloadFile).
 * 6. Qu?n lý vi?c thêm/xóa hàng trong b?ng (vì liên quan d?n tr?ng thái UI).
 */
(function(App) {
    "use-strict";

    // --- 1. Tr?ng thái và Module Chung ---
    App.WASM_MODULE = null;
    App.isLicensed = false; // Tr?ng thái license du?c luu trong b? nh?

    // --- 2. Cache các ph?n t? DOM ---
    App.dom = {
        // Run Button & Status
        btnRun: document.getElementById('btn-run-analysis'),
        statusMessage: document.getElementById('status-message'),
        
        // License
        btnCheckLicense: document.getElementById('btn-check-license'), // NÚT M?I
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
        chartPressure: document.getElementById('chart-pressure'),
        chartDeflection: document.getElementById('chart-deflection'),
        chartMoment: document.getElementById('chart-moment'),
        chartShear: document.getElementById('chart-shear'),
        tableSummaryContainer: document.getElementById('table-summary-container'),
        tableResultsHeader: document.getElementById('table-results-header'),
        tableResultsBody: document.getElementById('table-results-body'),

        // T?t c? các tru?ng input c?n khóa/m? khóa
        allInputs: document.querySelectorAll('#input-section input, #input-section select')
    };

    // --- 3. D? li?u M?c d?nh ---
    App.defaultData = {
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
        soil: [
            ['Lop 1 (Cat pha)', 1.5, 18.0, 19.0, 30, 2],
            ['Lop 2 (Set deo)', -8.0, 16.5, 17.5, 10, 15]
        ],
        anchor: [
            [1, 2.0, 0.0, 67000.0, 'D32_CT3']
        ]
    };

    // --- 4. Kh?i t?o ---

    /**
     * Hàm kh?i t?o chính
     */
    function initialize() {
        setStatus('Loading C++/WASM Core...', 'text-muted');
        
        // T?i module WASM
        SheetPileFEM({
            locateFile: (path, prefix) => {
                if (path.endsWith('.wasm')) {
                    return prefix + path.replace(".js", ".wasm");
                }
                return prefix + path;
            }
        }).then(module => {
            App.WASM_MODULE = module;
            
            // KI?M TRA PHIÊN LÀM VI?C (SESSION)
            App.isLicensed = sessionStorage.getItem('isLicensed') === 'true';
            
            const statusText = App.isLicensed ? 'Ready (Licensed)' : 'Ready (Trial Mode)';
            setStatus(statusText, App.isLicensed ? 'text-success' : 'text-info');
            
            App.dom.btnRun.disabled = false;
            App.dom.btnCheckLicense.disabled = false; // M? nút check license

            // Áp d?ng tr?ng thái khóa/m? khóa t? phiên
            toggleUI(!App.isLicensed);

        }).catch(err => {
            console.error("WASM Load Error:", err);
            setStatus('FATAL: WASM Core failed to load.', 'text-danger');
        });

        // Gán t?t c? các trình nghe s? ki?n
        bindEventListeners();
        
        // T?i d? li?u m?c d?nh vào UI
        loadDataIntoUI(App.defaultData);
    }

    /**
     * Gán các trình nghe s? ki?n cho các nút
     */
    function bindEventListeners() {
        App.dom.btnRun.disabled = true; // Khóa nút Run ban d?u
        App.dom.btnCheckLicense.disabled = true; // Khóa nút Check ban d?u

        // Gán s? ki?n cho các hàm t? các file khác
        App.dom.btnCheckLicense.addEventListener('click', onCheckLicenseClick);
        App.dom.btnRun.addEventListener('click', App.onRunAnalysisClick);
        
        // Qu?n lý b?ng
        App.dom.btnAddSoilRow.addEventListener('click', () => addSoilRow());
        App.dom.btnAddAnchorRow.addEventListener('click', () => addAnchorRow());
        App.dom.tableSoilBody.addEventListener('click', handleRemoveRow);
        App.dom.tableAnchorBody.addEventListener('click', handleRemoveRow);
        
        // File I/O (g?i các hàm t? app-cal.js và app-out.js)
        App.dom.btnImport.addEventListener('click', () => App.handleFileImport());
        App.dom.inpFileImporter.addEventListener('change', App.handleFileImport);
        App.dom.btnSaveCSV.addEventListener('click', App.handleSaveInputCSV);
        App.dom.btnSaveResultsCSV.addEventListener('click', App.handleSaveResultsCSV);
    }

    // --- 5. Logic License & UI ---

    /**
     * LOGIC M?I: X? lý khi nh?n nút "Ki?m tra Gi?y phép"
     */
    async function onCheckLicenseClick() {
        if (!App.WASM_MODULE) {
            handleError("WASM module not loaded. Please refresh.");
            return;
        }

        setStatus('Checking license...', 'text-primary');
        App.dom.btnCheckLicense.disabled = true;

        const email = App.dom.inpEmail.value;
        const key = App.dom.inpKey.value;
        
        let serverTime;
        try {
            const response = await fetch('https://worldtimeapi.org/api/timezone/Etc/UTC');
            if (!response.ok) throw new Error('Network response was not ok.');
            const data = await response.json();
            serverTime = new Date(data.utc_datetime).getTime();
        } catch (e) {
            console.error("Time API fetch error:", e);
            handleError("ERROR_TIME_API_FAILED");
            App.dom.btnCheckLicense.disabled = false;
            return;
        }

        const clientTime = new Date().getTime();
        const licenseResult = App.WASM_MODULE.validateLicense(email, key, serverTime, clientTime);

        // X? lý 4 k?ch b?n
        if (licenseResult === "OK") {
            if (!App.isLicensed) {
                // K?ch b?n 1: Ðang ký thành công l?n d?u
                App.isLicensed = true;
                sessionStorage.setItem('isLicensed', 'true'); // LUU VÀO PHIÊN
                toggleUI(false); // M? khóa UI
                setStatus('License Validated! UI Unlocked.', 'text-success');
            } else {
                // K?ch b?n 2: Ðã dang ký r?i, ki?m tra l?i
                setStatus('License is already active.', 'text-info');
            }
        } else {
            if (App.isLicensed) {
                // K?ch b?n 4: Ðã dang ký nhung gi? h?t h?n/không h?p l?
                App.isLicensed = false;
                sessionStorage.setItem('isLicensed', 'false'); // XÓA KH?I PHIÊN
                toggleUI(true); // Khóa UI
                handleError("ERROR_LICENSE_EXPIRED_OR_INVALIDATED");
            } else {
                // K?ch b?n 3: Chua dang ký và ki?m tra th?t b?i
                handleError(licenseResult || "ERROR_LICENSE_INVALID_OR_EXPIRED");
            }
        }
        
        App.dom.btnCheckLicense.disabled = false;
    }

    /**
     * Khóa ho?c m? khóa toàn b? giao di?n d?a trên tr?ng thái license.
     * @param {boolean} isLocked True d? khóa, false d? m? khóa.
     */
    function toggleUI(isLocked) {
        // 1. Khóa/M? khóa t?t c? các tru?ng input (tr? license)
        App.dom.allInputs.forEach(el => {
            if (el.id !== 'inp-license-email' && el.id !== 'inp-license-key') {
                el.disabled = isLocked;
            }
        });
        
        // 2. Khóa/M? khóa các nút qu?n lý b?ng
        App.dom.btnAddSoilRow.disabled = isLocked;
        App.dom.btnAddAnchorRow.disabled = isLocked;

        // 3. Khóa/M? khóa các nút file I/O
        App.dom.btnImport.disabled = isLocked;
        App.dom.btnSaveCSV.disabled = isLocked;
        
        // 4. Khóa/M? khóa t?t c? các nút "Xóa"
        document.querySelectorAll('.btn-remove-row').forEach(btn => {
            btn.disabled = isLocked;
        });
    }

    /**
     * T?i d? li?u (nhu defaultData) vào các b?ng.
     * @param {object} data The data object {wall: [], soil: [], anchor: []}
     */
    function loadDataIntoUI(data) {
        // 1. Xóa d? li?u cu (ch? các b?ng d?ng)
        App.dom.tableSoilBody.innerHTML = '';
        App.dom.tableAnchorBody.innerHTML = '';

        // 2. T?i thông s? tu?ng
        data.wall.forEach(item => {
            const el = document.getElementById(`inp-${item.param}`);
            if (el) {
                el.value = item.value;
            }
        });

        // 3. T?i các l?p d?t
        data.soil.forEach(row => addSoilRow(row));

        // 4. T?i các neo
        data.anchor.forEach(row => addAnchorRow(row));
    }

    /**
     * Thêm m?t hàng vào b?ng d?t (ki?m tra tr?ng thái license).
     * @param {Array} [data] D? li?u tùy ch?n.
     */
    function addSoilRow(data = ['', '', '', '', '', '']) {
        const tr = document.createElement('tr');
        const disabled = !App.isLicensed ? 'disabled' : ''; // Dùng tr?ng thái toàn c?c
        tr.innerHTML = `
            <td><input type="text" class="form-control form-control-sm" value="${data[0]}" ${disabled}></td>
            <td><input type="number" class="form-control form-control-sm" value="${data[1]}" ${disabled}></td>
            <td><input type="number" class="form-control form-control-sm" value="${data[2]}" ${disabled}></td>
            <td><input type="number" class="form-control form-control-sm" value="${data[3]}" ${disabled}></td>
            <td><input type="number" class="form-control form-control-sm" value="${data[4]}" ${disabled}></td>
            <td><input type="number" class="form-control form-control-sm" value="${data[5]}" ${disabled}></td>
            <td><button class="btn btn-sm btn-danger btn-remove-row" ${disabled}>X</button></td>
        `;
        App.dom.tableSoilBody.appendChild(tr);
    }

    /**
     * Thêm m?t hàng vào b?ng neo (ki?m tra tr?ng thái license).
     * @param {Array} [data] D? li?u tùy ch?n.
     */
    function addAnchorRow(data = ['', '', '', '', '']) {
        const tr = document.createElement('tr');
        const disabled = !App.isLicensed ? 'disabled' : ''; // Dùng tr?ng thái toàn c?c
        tr.innerHTML = `
            <td><input type="number" class="form-control form-control-sm" value="${data[0]}" ${disabled}></td>
            <td><input type="number" class="form-control form-control-sm" value="${data[1]}" ${disabled}></td>
            <td><input type="number" class="form-control form-control-sm" value="${data[2]}" ${disabled}></td>
            <td><input type="number" class="form-control form-control-sm" value="${data[3]}" ${disabled}></td>
            <td><input type="text" class="form-control form-control-sm" value="${data[4]}" ${disabled}></td>
            <td><button class="btn btn-sm btn-danger btn-remove-row" ${disabled}>X</button></td>
        `;
        App.dom.tableAnchorBody.appendChild(tr);
    }

    /**
     * X? lý s? ki?n click cho nút 'X' trên hàng c?a b?ng.
     * @param {Event} e The click event.
     */
    function handleRemoveRow(e) {
        if (e.target.classList.contains('btn-remove-row')) {
            e.target.closest('tr').remove();
        }
    }

    // --- 6. Hàm tr? giúp (Cung c?p cho các module khác) ---

    /**
     * Ð?t thông báo tr?ng thái.
     * @param {string} text The message to display.
     * @param {string} className The Bootstrap class (e.g., 'text-success', 'text-danger').
     */
    function setStatus(text, className) {
        App.dom.statusMessage.textContent = text;
        App.dom.statusMessage.className = `me-3 ${className}`;
    }
    App.setStatus = setStatus; // Expose

    /**
     * X? lý l?i.
     * @param {string} errorCode The error code (e.g., "ERROR_TIME_TAMPER_DETECTED").
     * @param {string} [details] Optional extra details.
     */
    function handleError(errorCode, details = "") {
        let message = "An unknown error occurred.";
        
        switch(errorCode) {
            case "OK":
                message = "Analysis Completed.";
                setStatus(message, 'text-success');
                App.dom.btnRun.disabled = false;
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
        App.dom.btnRun.disabled = false;
    }
    App.handleError = handleError; // Expose

    /**
     * Tr? giúp t?i file.
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
    App.downloadFile = downloadFile; // Expose

    // Expose các hàm qu?n lý UI c?n thi?t cho các module khác
    App.loadDataIntoUI = loadDataIntoUI;
    
    // --- B?t d?u ?ng d?ng ---
    document.addEventListener('DOMContentLoaded', initialize);

})(SheetPileApp); // Truy?n vào không gian tên chung
