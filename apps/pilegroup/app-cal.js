/*
 * app-cal.js (cho Pile Group - REFACTORED ARCHITECTURE)
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
 * Helper: Get float value from input element
 * @param {string} elementId - Element ID
 * @param {string} fieldName - Field name for error messages
 * @returns {number} - Parsed float value
 */
function getFloatValue(elementId, fieldName) {
    const element = document.getElementById(elementId);
    if (!element) {
        throw new Error(`Lỗi lập trình: Không tìm thấy phần tử ${elementId}.`);
    }
    const value = parseFloat(element.value);
    if (isNaN(value)) {
        throw new Error(`Dữ liệu không hợp lệ cho "${fieldName}" (ID: ${elementId}).`);
    }
    return value;
}

/**
 * Gather Input Data from HTML Form
 * @returns {object} - Input data object
 */
function gatherInputData() {
    const inputData = {};

    // 1. Material & Pile Properties (Tab 1)
    inputData.vat_lieu = {
        E: getFloatValue('input-E', 'Modul đàn hồi (E)'),
        Icoc: getFloatValue('input-Icoc', 'Momen quán tính (Icoc)'),
        D: getFloatValue('input-D', 'Đường kính/Cạnh (D)'),
        F: getFloatValue('input-F', 'Diện tích (F)'),
        Lcoc: getFloatValue('input-Lcoc', 'Chiều dài cọc (Lcoc)'),
        L0: getFloatValue('input-L0', 'Chiều dài cọc tự do (L0)')
    };

    // 2. Soil Foundation (Tab 2)
    inputData.dat_nen = {
        m: getFloatValue('input-m', 'Hệ số m'),
        dieu_kien_mui: document.getElementById('select-dieu-kien-mui').value,
        Rdat: getFloatValue('input-Rdat', 'Cường độ đất nền (Rdat)'),
        mchan: getFloatValue('input-mchan', 'Hệ số m chân (mchan)')
    };
    
    // 2b. Soil Layers (Tab 2 - Table)
    inputData.dat_nen.lop_dat = [];
    const lopDatRows = document.querySelectorAll('#soil-layer-body tr');
    lopDatRows.forEach((row, index) => {
        const inputs = row.querySelectorAll('input[type="number"]');
        const ldat = parseFloat(inputs[0].value);
        const tdat = parseFloat(inputs[1].value);
        const phi = parseFloat(inputs[2].value);

        if (isNaN(ldat) || isNaN(tdat) || isNaN(phi)) {
            throw new Error(`Dữ liệu không hợp lệ tại Lớp đất ${index + 1}.`);
        }
        inputData.dat_nen.lop_dat.push({ Ldat: ldat, Tdat: tdat, Phi: phi });
    });
    
    // 3. Pile Cap Properties (Tab 1)
    inputData.be_coc = {
        Bx: getFloatValue('input-Bx', 'Kích thước Bx'),
        By: getFloatValue('input-By', 'Kích thước By')
    };

    // 4. Pile Positions (Tab 4)
    inputData.coc = [];
    const cocRows = document.querySelectorAll('#pile-table-body tr');
    cocRows.forEach((row, index) => {
        const inputs = row.querySelectorAll('input[type="number"]');
        const coc = {
            x: parseFloat(inputs[0].value),
            y: parseFloat(inputs[1].value),
            fi: parseFloat(inputs[2].value),
            psi: parseFloat(inputs[3].value)
        };
        Object.entries(coc).forEach(([key, val]) => {
            if (isNaN(val)) throw new Error(`Dữ liệu không hợp lệ tại Cọc ${index + 1}, trường ${key}.`);
        });
        inputData.coc.push(coc);
    });

    // 5. Loads (Tab 3)
    inputData.tai_trong = {
        Hx: getFloatValue('input-Hx', 'Tải trọng Hx'),
        Hy: getFloatValue('input-Hy', 'Tải trọng Hy'),
        Pz: getFloatValue('input-Pz', 'Tải trọng Pz'),
        Mx: getFloatValue('input-Mx', 'Tải trọng Mx'),
        My: getFloatValue('input-My', 'Tải trọng My'),
        Mz: getFloatValue('input-Mz', 'Tải trọng Mz')
    };

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
        if (!inputData.coc || inputData.coc.length === 0) {
            throw new Error('Vui lòng thêm ít nhất 1 cọc vào bảng bố trí.');
        }
        
        if (inputData.vat_lieu.Lcoc <= 0) {
            throw new Error('Chiều dài cọc (Lcoc) phải lớn hơn 0.');
        }
        
        if (inputData.be_coc.Bx <= 0 || inputData.be_coc.By <= 0) {
            throw new Error('Kích thước bệ cọc (Bx, By) phải lớn hơn 0.');
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
    const isLicensed = localStorage.getItem('pilegroupLicensed') === 'true';
    
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
        const resultJsonString = wasmModule.calculatePileGroup(inputJsonString);
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
 * @param {object} inputData - Input data for visualization
 */
function renderResults(result, inputData) {
    if (typeof displayResults === 'function') {
        displayResults(result, inputData);
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
    const button = document.getElementById('calculate-button');
    
    if (spinner) {
        spinner.style.display = isLoading ? 'inline-block' : 'none';
    }
    
    if (button) {
        button.disabled = isLoading;
    }
}

/**
 * Update Pile Count Display
 */
function updatePileCount() {
    const pileCountSpan = document.getElementById('pile-count');
    const pileCount = document.querySelectorAll('#pile-table-body tr').length;
    if (pileCountSpan) {
        pileCountSpan.textContent = pileCount;
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
        renderResults(result, inputData);
        
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
    const runButton = document.getElementById('calculate-button');
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

    // Initialize pile count display
    updatePileCount();
    
    // Update pile count when table changes
    const pileTableBody = document.getElementById('pile-table-body');
    if (pileTableBody) {
        const observer = new MutationObserver(updatePileCount);
        observer.observe(pileTableBody, { childList: true });
    }

    // Load WASM Module
    createPileGroupModule().then(Module => {
        wasmModule = Module;
        console.log("✅ Pile Group WASM Module Loaded");
        
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
