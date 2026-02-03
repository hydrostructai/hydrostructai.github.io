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

    // 4. Anchors (Kết cấu neo) - NEW STRUCTURE with physical properties
    inputData.anchors = [];
    const anchorRows = document.querySelectorAll('#anchor-table tbody tr');
    anchorRows.forEach((row, index) => {
        const inputs = row.querySelectorAll('input');
        const anchor = {
            elevation: parseFloat(inputs[0].value),           // Cao trình neo (m)
            angle: parseFloat(inputs[1].value),               // Góc nghiêng (deg)
            area: parseFloat(inputs[2].value),                // Diện tích A (m²)
            elastic_modulus: parseFloat(inputs[3].value),     // Mô đun E (kN/m²) - supports scientific notation
            spacing: parseFloat(inputs[4].value)              // Khoảng cách L (m)
        };
        // Validate all properties
        Object.entries(anchor).forEach(([key, val]) => {
            if (isNaN(val)) {
                throw new Error(`Dữ liệu không hợp lệ tại Neo ${index + 1}, trường ${key}.`);
            }
        });
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
    alert("Sắp ra mắt, vui lòng quay lại sau!");
    return;
    // Các logic cũ bên dưới sẽ không bao giờ được chạy
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
 * FILE MANAGEMENT FUNCTIONS
 */

/**
 * New File: Clear all inputs and reset to defaults
 */
function newFile() {
    if (!confirm("Tạo file mới? Dữ liệu hiện tại sẽ bị xóa.")) return;
    
    // Reset general inputs
    document.getElementById('general-E').value = '210000000';
    document.getElementById('general-I').value = '0.00032';
    document.getElementById('general-EI').value = '67200';
    document.getElementById('general-L').value = '15';
    document.getElementById('general-H').value = '5';
    
    // Reset water levels
    document.getElementById('water-hw1').value = '5';
    document.getElementById('water-hw2').value = '1';
    
    // Reset soil layers (keep first row only)
    const soilTable = document.querySelector('#soil-layer-table tbody');
    soilTable.innerHTML = `
        <tr>
            <td class="text-center fw-bold">1</td>
            <td><input type="number" class="form-control" value="5" step="0.5" required></td>
            <td><input type="number" class="form-control" value="18" step="0.1" required></td>
            <td><input type="number" class="form-control" value="8" step="0.1" required></td>
            <td><input type="number" class="form-control" value="30" step="1" required></td>
            <td><input type="number" class="form-control" value="0" step="1" required></td>
            <td><input type="number" class="form-control" value="10000" step="1000" required></td>
            <td class="text-center">
                <button class="btn btn-outline-danger btn-sm" onclick="removeRow(this)" title="Xóa lớp">
                    <i class="bi bi-trash"></i>
                </button>
            </td>
        </tr>`;
    
    // Reset anchors (initialize with 1 default row as per new requirement)
    const anchorTable = document.querySelector('#anchor-table tbody');
    anchorTable.innerHTML = `
        <tr>
            <td class="text-center fw-bold">1</td>
            <td><input type="number" class="form-control" value="1.0" step="0.1" required title="Elevation"></td>
            <td><input type="number" class="form-control" value="0" step="1" required title="Angle"></td>
            <td><input type="number" class="form-control" value="0.01" step="0.001" required title="Cross-sectional Area"></td>
            <td><input type="text" class="form-control" value="210000000" required title="Elastic Modulus"></td>
            <td><input type="number" class="form-control" value="3.0" step="0.5" required title="Anchor Spacing"></td>
            <td class="text-center">
                <button class="btn btn-outline-danger btn-sm" onclick="removeRow(this)" title="Xóa">
                    <i class="bi bi-trash"></i>
                </button>
            </td>
        </tr>`;
    
    // Clear point loads
    document.querySelector('#load-table tbody').innerHTML = '';
    
    // Reset surcharge (keep first row)
    const surchargeTable = document.querySelector('#surcharge-table tbody');
    surchargeTable.innerHTML = `
        <tr>
            <td>1</td>
            <td><input type="number" class="form-control" value="0"></td>
            <td><input type="number" class="form-control" value="5"></td>
            <td><input type="number" class="form-control" value="10"></td>
            <td><button class="btn btn-danger btn-sm" onclick="removeRow(this)"><i class="bi bi-trash"></i></button></td>
        </tr>`;
    
    alert("✅ File mới đã được tạo!");
}

/**
 * Open File: Parse CSV or INP file and populate form
 */
function openFile() {
    const fileInput = document.getElementById('hidden-file-input');
    fileInput.value = ''; // Reset input
    fileInput.onchange = (e) => {
        const file = e.target.files[0];
        if (!file) return;
        
        const reader = new FileReader();
        reader.onload = (event) => {
            try {
                const content = event.target.result;
                const extension = file.name.split('.').pop().toLowerCase();
                
                if (extension === 'csv') {
                    parseCSV(content);
                } else if (extension === 'inp') {
                    parseINP(content);
                } else {
                    alert("❌ Định dạng file không hỗ trợ. Chỉ chấp nhận .csv hoặc .inp");
                }
            } catch (error) {
                alert(`❌ Lỗi đọc file: ${error.message}`);
            }
        };
        reader.readAsText(file);
    };
    fileInput.click();
}

/**
 * Parse CSV format
 */
function parseCSV(content) {
    const lines = content.split('\n').map(line => line.trim()).filter(line => line);
    const data = {};
    
    lines.forEach(line => {
        const [key, ...values] = line.split(',');
        data[key.trim()] = values.map(v => v.trim());
    });
    
    // Populate general inputs
    if (data.E) document.getElementById('general-E').value = data.E[0];
    if (data.I) document.getElementById('general-I').value = data.I[0];
    if (data.L) document.getElementById('general-L').value = data.L[0];
    if (data.H) document.getElementById('general-H').value = data.H[0];
    if (data.Hw1) document.getElementById('water-hw1').value = data.Hw1[0];
    if (data.Hw2) document.getElementById('water-hw2').value = data.Hw2[0];
    
    alert("✅ File CSV đã được tải!");
}

/**
 * Parse INP format (custom text format)
 */
function parseINP(content) {
    const lines = content.split('\n').map(line => line.trim()).filter(line => line && !line.startsWith('#'));
    
    // Simple key=value parsing
    lines.forEach(line => {
        const [key, value] = line.split('=').map(s => s.trim());
        const input = document.getElementById(`general-${key}`) || document.getElementById(`water-${key.toLowerCase()}`);
        if (input) input.value = value;
    });
    
    alert("✅ File INP đã được tải!");
}

/**
 * Save File: Export form data to CSV or INP
 */
function saveFile() {
    const format = prompt("Chọn định dạng file:\n1 - CSV\n2 - INP\n\nNhập 1 hoặc 2:", "1");
    
    if (format === '1') {
        saveAsCSV();
    } else if (format === '2') {
        saveAsINP();
    } else if (format !== null) {
        alert("❌ Lựa chọn không hợp lệ.");
    }
}

/**
 * Save as CSV format
 */
function saveAsCSV() {
    try {
        const inputData = gatherInputData();
        let csv = "# Sheet Pile FEM - Input Data (CSV)\n";
        
        csv += `E,${inputData.general.E}\n`;
        csv += `I,${inputData.general.I}\n`;
        csv += `L,${inputData.general.L}\n`;
        csv += `H,${inputData.general.H}\n`;
        csv += `Hw1,${inputData.water.Hw1}\n`;
        csv += `Hw2,${inputData.water.Hw2}\n`;
        
        // Add soil layers
        csv += "\n# Soil Layers (depth,gamma,gamma_sat,phi,c_prime,k_modul)\n";
        inputData.soil_layers.forEach((layer, i) => {
            csv += `SOIL_${i+1},${layer.depth},${layer.gamma},${layer.gamma_sat},${layer.phi},${layer.c_prime},${layer.k_modul}\n`;
        });
        
        downloadFile(csv, 'sheetpile_input.csv', 'text/csv');
    } catch (error) {
        alert(`❌ Lỗi lưu file: ${error.message}`);
    }
}

/**
 * Save as INP format (custom text)
 */
function saveAsINP() {
    try {
        const inputData = gatherInputData();
        let inp = "# Sheet Pile FEM - Input File (INP Format)\n\n";
        
        inp += "[GENERAL]\n";
        inp += `E = ${inputData.general.E}\n`;
        inp += `I = ${inputData.general.I}\n`;
        inp += `L = ${inputData.general.L}\n`;
        inp += `H = ${inputData.general.H}\n\n`;
        
        inp += "[WATER]\n";
        inp += `Hw1 = ${inputData.water.Hw1}\n`;
        inp += `Hw2 = ${inputData.water.Hw2}\n\n`;
        
        inp += "[SOIL_LAYERS]\n";
        inputData.soil_layers.forEach((layer, i) => {
            inp += `Layer_${i+1} = ${layer.depth}, ${layer.gamma}, ${layer.gamma_sat}, ${layer.phi}, ${layer.c_prime}, ${layer.k_modul}\n`;
        });
        
        downloadFile(inp, 'sheetpile_input.inp', 'text/plain');
    } catch (error) {
        alert(`❌ Lỗi lưu file: ${error.message}`);
    }
}

/**
 * Helper: Trigger file download
 */
function downloadFile(content, filename, mimeType) {
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    alert(`✅ File đã được lưu: ${filename}`);
}

/**
 * Initialize Application
 */
document.addEventListener('DOMContentLoaded', () => {
    const runButton = document.getElementById('btn-run-analysis');
    const wasmStatusDiv = document.getElementById('wasm-status');
    const wasmStatusText = document.getElementById('wasm-status-text');
    const wasmSpinner = document.getElementById('wasm-spinner');
    const loadingOverlay = document.getElementById('loading-overlay');
    
    // Get license tab reference
    const licenseTabElement = document.getElementById('tab-license');
    if (licenseTabElement) {
        licenseTabTrigger = new bootstrap.Tab(licenseTabElement);
    }
    
    // Disable button until WASM loads
    if (runButton) runButton.disabled = true;
    
    // Show loading overlay
    if (loadingOverlay) loadingOverlay.style.display = 'flex';

    // Load WASM Module with cache-busting and proper async initialization
    const wasmVersion = '1.0.0'; // Update this when you update WASM
    
    // Wrap in try-catch to prevent browser freeze
    try {
        SheetPileFEM_Module({
            locateFile: (path) => {
                if (path.endsWith('.wasm')) {
                    return `${path}?v=${wasmVersion}`; // Cache-busting
                }
                return path;
            },
            print: (text) => console.log('[WASM]', text),
            printErr: (text) => console.error('[WASM Error]', text)
        }).then(Module => {
            wasmModule = Module;
            console.log("✅ Sheet Pile FEM WASM Module Fully Initialized");
            console.log("✅ Available functions:", Object.keys(Module).filter(k => typeof Module[k] === 'function'));
            
            // Hide loading overlay
            if (loadingOverlay) {
                loadingOverlay.style.opacity = '0';
                setTimeout(() => {
                    loadingOverlay.style.display = 'none';
                }, 300);
            }
            
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
            console.error("❌ Error stack:", e.stack);
            
            // Hide loading overlay
            if (loadingOverlay) {
                loadingOverlay.style.display = 'none';
            }
            
            if (runButton) {
                runButton.textContent = "❌ Lỗi WASM";
                runButton.classList.remove('btn-success');
                runButton.classList.add('btn-danger');
                runButton.disabled = true;
            }

            if (wasmStatusDiv) wasmStatusDiv.classList.replace('alert-info', 'alert-danger');
            if (wasmSpinner) wasmSpinner.style.display = 'none';
            if (wasmStatusText) wasmStatusText.innerHTML = `❌ Lỗi tải WASM!<br><small>${e.message}</small>`;
            
            showError(`Không thể tải lõi tính toán (WASM): ${e.message}`);
        });
    } catch (syncError) {
        console.error("❌ Synchronous error during WASM initialization:", syncError);
        
        // Hide loading overlay
        if (loadingOverlay) {
            loadingOverlay.style.display = 'none';
        }
        
        showError(`Lỗi khởi tạo WASM: ${syncError.message}`);
    }
    
    // File Management Button Listeners
    const btnNew = document.getElementById('btn-new-file');
    const btnOpen = document.getElementById('btn-open-file');
    const btnSave = document.getElementById('btn-save-file');
    
    if (btnNew) btnNew.addEventListener('click', newFile);
    if (btnOpen) btnOpen.addEventListener('click', openFile);
    if (btnSave) btnSave.addEventListener('click', saveFile);
});
