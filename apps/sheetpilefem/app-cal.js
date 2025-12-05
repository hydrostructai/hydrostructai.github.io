/*
 * app-cal.js (cho Sheet Pile FEM - REFACTORED ARCHITECTURE)
 *
 * Responsibilities:
 * 1. Load and initialize WebAssembly module
 * 2. Implement execution flow: validateInputs() -> validateLicense() -> callWasmCalculation() -> renderResults()
 * 3. Gather input data from HTML
 * 4. Handle errors and display results
 */

// Global WASM module instance
let wasmModule;

// Bootstrap Tab reference for license tab navigation
let licenseTabTrigger;

/**
 * Hàm trợ giúp để lấy giá trị số (float) từ một input
 * @param {string} elementId - ID của thẻ input
 * @param {string} fieldName - Tên mô tả của trường (để báo lỗi)
 * @returns {number} Giá trị số
 */
function getFloatValue(elementId, fieldName) {
    const value = parseFloat(document.getElementById(elementId).value);
    if (isNaN(value)) {
        throw new Error(`Dữ liệu không hợp lệ cho "${fieldName}". Vui lòng kiểm tra lại.`);
    }
    return value;
}

/**
 * Thu thập toàn bộ dữ liệu đầu vào từ các form và bảng.
 * (Hàm này giữ nguyên logic từ file gốc vì các ID input không đổi)
 * @returns {object} Một đối tượng JSON chứa toàn bộ dữ liệu đầu vào.
 */
function gatherInputData() {
    const inputData = {};

    // 1. General (Thông số chung)
    inputData.general = {
        E: getFloatValue('general-E', 'Modul đàn hồi (E)'),
        I: getFloatValue('general-I', 'Momen quán tính (I)'),
        L: getFloatValue('general-L', 'Chiều dài tường (L)'),
        H: getFloatValue('general-H', 'Cao độ đào đất (H)')
    };

    // 2. Water (Mực nước)
    inputData.water = {
        Hw1: getFloatValue('water-hw1', 'Mực nước bên trái (Hw1)'),
        Hw2: getFloatValue('water-hw2', 'Mực nước bên phải (Hw2)')
    };

    // 3. Soil Layers (Các lớp đất)
    inputData.soil_layers = [];
    const soilRows = document.querySelectorAll('#soil-layer-table tbody tr');
    soilRows.forEach((row, index) => {
        const inputs = row.querySelectorAll('input[type="number"]');
        const layer = {
            depth: parseFloat(inputs[0].value),
            gamma: parseFloat(inputs[1].value),
            gamma_sat: parseFloat(inputs[2].value), // (gamma')
            phi: parseFloat(inputs[3].value),
            c_prime: parseFloat(inputs[4].value),   // (c')
            k_modul: parseFloat(inputs[5].value)
        };
        // Kiểm tra NaN trong bảng
        Object.entries(layer).forEach(([key, val]) => {
            if (isNaN(val)) throw new Error(`Dữ liệu không hợp lệ tại Lớp đất ${index + 1}, trường ${key}.`);
        });
        inputData.soil_layers.push(layer);
    });

    // 4. Anchors (Neo/Chống)
    inputData.anchors = [];
    const anchorRows = document.querySelectorAll('#anchor-table tbody tr');
    anchorRows.forEach((row, index) => {
        const inputs = row.querySelectorAll('input[type="number"]');
        const anchor = {
            depth: parseFloat(inputs[0].value),
            stiffness: parseFloat(inputs[1].value)
        };
        if (isNaN(anchor.depth) || isNaN(anchor.stiffness)) {
            throw new Error(`Dữ liệu không hợp lệ tại Neo ${index + 1}.`);
        }
        inputData.anchors.push(anchor);
    });

    // 5. Point Loads (Tải trọng tập trung)
    inputData.point_loads = [];
    const loadRows = document.querySelectorAll('#load-table tbody tr');
    loadRows.forEach((row, index) => {
        const inputs = row.querySelectorAll('input[type="number"]');
        const load = {
            depth: parseFloat(inputs[0].value),
            load: parseFloat(inputs[1].value)
        };
        if (isNaN(load.depth) || isNaN(load.load)) {
            throw new Error(`Dữ liệu không hợp lệ tại Tải trọng ${index + 1}.`);
        }
        inputData.point_loads.push(load);
    });

    // 6. Surcharges (Tải trọng phân bố)
    inputData.surcharges = [];
    const surchargeRows = document.querySelectorAll('#surcharge-table tbody tr');
    surchargeRows.forEach((row, index) => {
        const inputs = row.querySelectorAll('input[type="number"]');
        const surcharge = {
            z_start: parseFloat(inputs[0].value),
            z_end: parseFloat(inputs[1].value),
            q_value: parseFloat(inputs[2].value)
        };
        if (isNaN(surcharge.z_start) || isNaN(surcharge.z_end) || isNaN(surcharge.q_value)) {
            throw new Error(`Dữ liệu không hợp lệ tại Tải phân bố ${index + 1}.`);
        }
        inputData.surcharges.push(surcharge);
    });
    
    return inputData;
}

/**
 * STEP 1: Validate Inputs
 * @returns {object|null} - Input data object or null if invalid
 */
function validateInputs() {
    try {
        const inputData = gatherInputData();
        
        // Basic validation
        if (!inputData.soil_layers || inputData.soil_layers.length === 0) {
            throw new Error('Vui lòng thêm ít nhất 1 lớp đất.');
        }
        
        if (inputData.general.L <= 0) {
            throw new Error('Chiều dài tường (L) phải lớn hơn 0.');
        }
        
        return inputData;
    } catch (error) {
        showError(error.message);
        return null;
    }
}

/**
 * STEP 2: Validate License (calls app-check.js function)
 * @returns {boolean} - True if allowed to proceed
 */
function validateLicenseForAnalysis() {
    const isLicensed = localStorage.getItem('sheetpileLicensed') === 'true';
    
    if (!isLicensed) {
        // Check FREE mode restrictions
        const restriction = checkFreeModeRestrictions();
        
        if (!restriction.valid) {
            showError(restriction.message);
            
            // Navigate to license tab
            if (licenseTabTrigger) {
                licenseTabTrigger.show();
            }
            
            return false;
        }
    }
    
    return true;
}

/**
 * STEP 3: Call WASM Calculation
 * @param {object} inputData - Validated input data
 * @returns {object|null} - Result object or null if error
 */
function callWasmCalculation(inputData) {
    try {
        if (!wasmModule) {
            throw new Error("Lõi tính toán (WASM) chưa sẵn sàng.");
        }
        
        const inputJsonString = JSON.stringify(inputData);
        const resultJsonString = wasmModule.calculateSheetPile(inputJsonString);
        const result = JSON.parse(resultJsonString);
        
        if (result.status === 'error') {
            throw new Error(result.message || 'Lỗi tính toán từ WASM.');
        }
        
        return result;
    } catch (error) {
        showError(error.message);
        return null;
    }
}

/**
 * STEP 4: Render Results (calls app-out.js)
 * @param {object} result - Calculation results
 */
function renderResults(result) {
    if (typeof displayResults === 'function') {
        displayResults(result);
    } else {
        console.error('displayResults function not found in app-out.js');
    }
}

/**
 * Helper: Show Error Message
 * @param {string} message - Error message
 */
function showError(message) {
    const errorDiv = document.getElementById('error-message');
    if (errorDiv) {
        errorDiv.textContent = `❌ ${message}`;
        errorDiv.style.display = 'block';
    }
    console.error('Analysis Error:', message);
}

/**
 * Helper: Hide Error Message
 */
function hideError() {
    const errorDiv = document.getElementById('error-message');
    if (errorDiv) {
        errorDiv.style.display = 'none';
    }
}

/**
 * Helper: Show Loading Spinner
 * @param {boolean} isLoading
 */
function showLoading(isLoading) {
    const spinner = document.getElementById('calc-spinner');
    const button = document.getElementById('btn-run-analysis');
    
    if (spinner) {
        spinner.style.display = isLoading ? 'inline-block' : 'none';
    }
    
    if (button) {
        button.disabled = isLoading;
    }
}

/**
 * MAIN EXECUTION FLOW: Run Analysis
 * Follows chain: validateInputs() -> validateLicense() -> callWasmCalculation() -> renderResults()
 */
async function runAnalysis() {
    hideError();
    showLoading(true);
    
    try {
        // STEP 1: Validate Inputs
        const inputData = validateInputs();
        if (!inputData) {
            return; // Validation failed
        }
        
        // STEP 2: Validate License
        if (!validateLicenseForAnalysis()) {
            return; // License check failed
        }
        
        // STEP 3: Call WASM Calculation
        const result = callWasmCalculation(inputData);
        if (!result) {
            return; // Calculation failed
        }
        
        // STEP 4: Render Results
        renderResults(result);
        
    } catch (error) {
        showError(error.message || "Đã xảy ra lỗi không xác định.");
    } finally {
        showLoading(false);
    }
}

/**
 * Initialize Application
 */
document.addEventListener('DOMContentLoaded', () => {
    const runButton = document.getElementById('btn-run-analysis');
    const wasmStatusDiv = document.getElementById('wasm-status');
    const wasmStatusText = document.getElementById('wasm-status-text');
    const wasmSpinner = document.getElementById('wasm-spinner');
    
    // Get license tab reference
    const licenseTabElement = document.getElementById('tab-license');
    if (licenseTabElement) {
        licenseTabTrigger = new bootstrap.Tab(licenseTabElement);
    }
    
    // Disable button until WASM loads
    if (runButton) runButton.disabled = true;

    // Load WASM Module
    createSheetPileModule().then(Module => {
        wasmModule = Module;
        console.log("✅ Sheet Pile FEM WASM Module Loaded");
        
        // Enable Run button
        if (runButton) {
            runButton.disabled = false;
            runButton.addEventListener('click', runAnalysis);
        }

        // Update WASM status UI
        if (wasmStatusDiv) wasmStatusDiv.classList.replace('alert-info', 'alert-success');
        if (wasmSpinner) wasmSpinner.style.display = 'none';
        if (wasmStatusText) wasmStatusText.textContent = '✅ Lõi tính toán sẵn sàng!';
        
    }).catch(e => {
        console.error("❌ Error loading WASM module:", e);
        
        if (runButton) {
            runButton.textContent = "❌ Lỗi WASM";
            runButton.classList.remove('btn-success');
            runButton.classList.add('btn-danger');
            runButton.disabled = true;
        }

        if (wasmStatusDiv) wasmStatusDiv.classList.replace('alert-info', 'alert-danger');
        if (wasmSpinner) wasmSpinner.style.display = 'none';
        if (wasmStatusText) wasmStatusText.textContent = '❌ Lỗi tải WASM!';
        
        showError('Không thể tải lõi tính toán (WASM). Vui lòng tải lại trang.');
    });
});