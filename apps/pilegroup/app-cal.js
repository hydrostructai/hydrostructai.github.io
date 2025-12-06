/*
 * app-cal.js (cho Pile Group - FIXED ROBUST VERSION)
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
        if (inputs.length >= 3) {
            const ldat = parseFloat(inputs[0].value);
            const tdat = parseFloat(inputs[1].value);
            const phi = parseFloat(inputs[2].value);

            if (isNaN(ldat) || isNaN(tdat) || isNaN(phi)) {
                throw new Error(`Dữ liệu không hợp lệ tại Lớp đất ${index + 1}.`);
            }
            inputData.dat_nen.lop_dat.push({ Ldat: ldat, Tdat: tdat, Phi: phi });
        }
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
        if (inputs.length >= 4) {
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
        }
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
        showError(error.message || String(error));
        return null;
    }
}

/**
 * STEP 2: Validate License (with Safe Fallback)
 * @returns {boolean} - True if allowed to proceed
 */
function validateLicenseForAnalysis() {
    const isLicensed = localStorage.getItem('pilegroupLicensed') === 'true';
    
    if (!isLicensed) {
        // Kiểm tra xem hàm checkFreeModeRestrictions có tồn tại không (từ app-check.js)
        if (typeof checkFreeModeRestrictions === 'function') {
            const restriction = checkFreeModeRestrictions();
            if (!restriction.valid) {
                // Đảm bảo luôn có message hiển thị
                showError(restriction.message || "Giới hạn phiên bản Free: Vui lòng kiểm tra số lượng cọc.");
                
                if (licenseTabTrigger) {
                    licenseTabTrigger.show();
                }
                return false;
            }
        } else {
            // Fallback: Kiểm tra thủ công nếu chưa load được file check
            const pileCount = document.querySelectorAll('#pile-table-body tr').length;
            if (pileCount > 4) {
                showError("Phiên bản FREE giới hạn tối đa 4 cọc. Vui lòng xóa bớt cọc hoặc nâng cấp PRO.");
                if (licenseTabTrigger) licenseTabTrigger.show();
                return false;
            }
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
            throw new Error("Lõi tính toán (WASM) chưa sẵn sàng. Vui lòng đợi hoặc tải lại trang.");
        }
        
        const inputJsonString = JSON.stringify(inputData);
        
        // Kiểm tra hàm tồn tại trong module không
        if (typeof wasmModule.calculatePileGroup !== 'function') {
            throw new Error("Lỗi WASM: Hàm 'calculatePileGroup' không tìm thấy trong module.");
        }

        const resultJsonString = wasmModule.calculatePileGroup(inputJsonString);
        
        // Parse kết quả
        let result;
        try {
            result = JSON.parse(resultJsonString);
        } catch (e) {
            throw new Error("Lỗi phân tích dữ liệu trả về từ WASM (Invalid JSON).");
        }
        
        if (result.status === 'error') {
            throw new Error(result.message || 'Lỗi tính toán nội bộ từ WASM.');
        }
        
        return result;
    } catch (error) {
        showError(error.message || "Lỗi không xác định khi gọi tính toán.");
        console.error(error);
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
        showError("Không thể hiển thị kết quả (thiếu hàm displayResults).");
    }
}

/**
 * Helper: Show Error Message
 * @param {string} message - Error message
 */
function showError(message) {
    const errorDiv = document.getElementById('error-message');
    // Đảm bảo message không bao giờ là undefined/null
    const safeMessage = message || "Đã xảy ra lỗi không xác định.";
    
    if (errorDiv) {
        errorDiv.textContent = `❌ ${safeMessage}`;
        errorDiv.style.display = 'block';
    }
    console.error('Analysis Error:', safeMessage);
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
 * PILE MANAGEMENT FUNCTIONS
 */

/**
 * Initialize Default 4 Piles (Rectangular Layout)
 */
function initializeDefaultPiles() {
    const pileTableBody = document.getElementById('pile-table-body');
    if (!pileTableBody) return;
    
    // Default 4 piles in rectangular layout
    const defaultPiles = [
        { x: -3.0, y: -4.0, fi: 0, psi: 0 },  // Bottom-left
        { x: 3.0, y: -4.0, fi: 0, psi: 0 },   // Bottom-right
        { x: -3.0, y: 4.0, fi: 0, psi: 0 },   // Top-left
        { x: 3.0, y: 4.0, fi: 0, psi: 0 }     // Top-right
    ];
    
    pileTableBody.innerHTML = '';
    defaultPiles.forEach((pile, index) => {
        addPileRow(index + 1, pile.x, pile.y, pile.fi, pile.psi);
    });
    
    updatePileCount();
}

/**
 * Add a single pile row to the table
 */
function addPileRow(id, x = 0, y = 0, fi = 0, psi = 0) {
    const pileTableBody = document.getElementById('pile-table-body');
    if (!pileTableBody) return;
    
    const newRow = pileTableBody.insertRow();
    newRow.innerHTML = `
        <td class="text-center fw-bold">${id}</td>
        <td><input type="number" class="form-control" value="${x}" step="0.1"></td>
        <td><input type="number" class="form-control" value="${y}" step="0.1"></td>
        <td><input type="number" class="form-control" value="${fi}" step="0.01"></td>
        <td><input type="number" class="form-control" value="${psi}" step="0.01"></td>
    `;
}

/**
 * Add Pile Button Handler
 */
function handleAddPile() {
    const pileTableBody = document.getElementById('pile-table-body');
    const currentCount = pileTableBody.rows.length;
    
    // Check FREE tier restriction
    const isLicensed = localStorage.getItem('pilegroupLicensed') === 'true';
    if (!isLicensed && currentCount >= 4) {
        alert("Phiên bản Free chỉ cho phép tối đa 4 cọc.\n\nVui lòng nâng cấp lên PRO để sử dụng không giới hạn.");
        if (licenseTabTrigger) licenseTabTrigger.show();
        return;
    }
    
    // Add new pile at origin with default values
    addPileRow(currentCount + 1, 0, 0, 0, 0);
    updatePileCount();
}

/**
 * Remove Last Pile Button Handler
 */
function handleRemovePile() {
    const pileTableBody = document.getElementById('pile-table-body');
    const currentCount = pileTableBody.rows.length;
    
    if (currentCount <= 1) {
        alert("⚠️ Phải có ít nhất 1 cọc.");
        return;
    }
    
    pileTableBody.deleteRow(currentCount - 1);
    updatePileCount();
}

/**
 * Load Sample Data (24 Piles)
 */
function loadSampleData() {
    const pileTableBody = document.getElementById('pile-table-body');
    if (!pileTableBody) return;
    
    // Check if user wants to replace existing data
    if (pileTableBody.rows.length > 0) {
        if (!confirm("Tải dữ liệu mẫu 24 cọc?\n\nDữ liệu hiện tại sẽ bị thay thế.")) {
            return;
        }
    }
    
    // Sample 24-pile configuration (6x4 grid)
    const sample24Piles = [
        // Row 1 (Y = -3.6)
        { x: -5.0, y: -3.6, fi: 0, psi: 0 }, { x: -3.0, y: -3.6, fi: 0, psi: 0 },
        { x: -1.0, y: -3.6, fi: 0, psi: 0 }, { x: 1.0, y: -3.6, fi: 0, psi: 0 },
        { x: 3.0, y: -3.6, fi: 0, psi: 0 },  { x: 5.0, y: -3.6, fi: 0, psi: 0 },
        
        // Row 2 (Y = -1.2)
        { x: -5.0, y: -1.2, fi: 0, psi: 0 }, { x: -3.0, y: -1.2, fi: 0, psi: 0 },
        { x: -1.0, y: -1.2, fi: 0, psi: 0 }, { x: 1.0, y: -1.2, fi: 0, psi: 0 },
        { x: 3.0, y: -1.2, fi: 0, psi: 0 },  { x: 5.0, y: -1.2, fi: 0, psi: 0 },
        
        // Row 3 (Y = 1.2)
        { x: -5.0, y: 1.2, fi: 0, psi: 0 },  { x: -3.0, y: 1.2, fi: 0, psi: 0 },
        { x: -1.0, y: 1.2, fi: 0, psi: 0 },  { x: 1.0, y: 1.2, fi: 0, psi: 0 },
        { x: 3.0, y: 1.2, fi: 0, psi: 0 },   { x: 5.0, y: 1.2, fi: 0, psi: 0 },
        
        // Row 4 (Y = 3.6)
        { x: -5.0, y: 3.6, fi: 0, psi: 0 },  { x: -3.0, y: 3.6, fi: 0, psi: 0 },
        { x: -1.0, y: 3.6, fi: 0, psi: 0 },  { x: 1.0, y: 3.6, fi: 0, psi: 0 },
        { x: 3.0, y: 3.6, fi: 0, psi: 0 },   { x: 5.0, y: 3.6, fi: 0, psi: 0 }
    ];
    
    // Clear and load
    pileTableBody.innerHTML = '';
    sample24Piles.forEach((pile, index) => {
        addPileRow(index + 1, pile.x, pile.y, pile.fi, pile.psi);
    });
    
    updatePileCount();
    
    // Inform user about FREE tier limitation
    const isLicensed = localStorage.getItem('pilegroupLicensed') === 'true';
    if (!isLicensed) {
        alert("✅ Đã tải 24 cọc mẫu!\n\n⚠️ Lưu ý: Phiên bản Free giới hạn 4 cọc cho tính toán.\nDữ liệu mẫu này chỉ để tham khảo. Kích hoạt PRO để phân tích 24 cọc.");
    } else {
        alert("✅ Đã tải 24 cọc mẫu thành công!");
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
            showLoading(false);
            return; // Validation failed
        }
        
        // STEP 2: Validate License
        if (!validateLicenseForAnalysis()) {
            showLoading(false);
            return; // License check failed
        }
        
        // STEP 3: Call WASM Calculation
        // Sử dụng setTimeout để UI có thời gian hiển thị loading spinner trước khi treo vì tính toán
        setTimeout(() => {
            try {
                const result = callWasmCalculation(inputData);
                if (result) {
                    // STEP 4: Render Results
                    renderResults(result, inputData);
                    
                    // Hiển thị và cuộn tới container kết quả
                    const resultsContainer = document.getElementById('results-container');
                    if (resultsContainer) {
                        resultsContainer.style.display = 'block';
                        resultsContainer.scrollIntoView({ behavior: 'smooth' });
                    }
                }
            } catch (calcError) {
                showError(calcError.message);
            } finally {
                showLoading(false);
            }
        }, 50);

    } catch (error) {
        showError(error.message || "Đã xảy ra lỗi nghiêm trọng.");
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
    
    // Reset inputs by ID...
    const idsToReset = [
        'input-E', 'input-F', 'input-Icoc', 'input-D', 'input-Lcoc', 'input-L0',
        'input-Bx', 'input-By',
        'input-m', 'input-mchan', 'input-Rdat',
        'input-Hx', 'input-Hy', 'input-Pz', 'input-Mx', 'input-My', 'input-Mz'
    ];
    
    idsToReset.forEach(id => {
        const el = document.getElementById(id);
        if (el) el.value = '0.0';
    });
    
    if (document.getElementById('select-dieu-kien-mui')) {
        document.getElementById('select-dieu-kien-mui').value = 'K';
    }
    
    // Clear soil layers
    const soilBody = document.getElementById('soil-layer-body');
    if (soilBody) soilBody.innerHTML = '';
    
    // Initialize with 4 default piles (FREE tier default)
    initializeDefaultPiles();
    
    // Hide results
    const resContainer = document.getElementById('results-container');
    if (resContainer) resContainer.style.display = 'none';
    
    alert("✅ File mới đã được tạo với 4 cọc mặc định!");
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
                    parsePileGroupCSV(content);
                } else if (extension === 'inp') {
                    parsePileGroupINP(content);
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
 * Parse CSV format for Pile Group
 */
function parsePileGroupCSV(content) {
    const lines = content.split('\n').map(line => line.trim()).filter(line => line && !line.startsWith('#'));
    
    // Clear existing pile table first
    const pileTableBody = document.getElementById('pile-table-body');
    if (pileTableBody) pileTableBody.innerHTML = '';
    
    let pileCounter = 0;
    
    lines.forEach(line => {
        const parts = line.split(',').map(s => s.trim());
        const key = parts[0];
        
        // Parse pile data
        if (key.startsWith('PILE_')) {
            pileCounter++;
            const x = parseFloat(parts[1]) || 0;
            const y = parseFloat(parts[2]) || 0;
            const fi = parseFloat(parts[3]) || 0;
            const psi = parseFloat(parts[4]) || 0;
            addPileRow(pileCounter, x, y, fi, psi);
        }
        // Parse other inputs
        else {
            const input = document.getElementById(`input-${key}`);
            if (input && parts[1]) input.value = parts[1];
        }
    });
    
    updatePileCount();
    alert(`✅ File CSV đã được tải với ${pileCounter} cọc!`);
}

/**
 * Parse INP format for Pile Group
 */
function parsePileGroupINP(content) {
    const lines = content.split('\n').map(line => line.trim()).filter(line => line && !line.startsWith('#'));
    
    lines.forEach(line => {
        if (line.includes('=')) {
            const [key, value] = line.split('=').map(s => s.trim());
            const input = document.getElementById(`input-${key}`);
            if (input) input.value = value;
        }
    });
    
    alert("✅ File INP đã được tải!");
}

/**
 * Save File: Export form data to CSV or INP
 */
function saveFile() {
    const format = prompt("Chọn định dạng file:\n1 - CSV\n2 - INP\n\nNhập 1 hoặc 2:", "1");
    
    if (format === '1') {
        savePileGroupAsCSV();
    } else if (format === '2') {
        savePileGroupAsINP();
    } else if (format !== null) {
        alert("❌ Lựa chọn không hợp lệ.");
    }
}

/**
 * Save as CSV format
 */
function savePileGroupAsCSV() {
    try {
        const inputData = gatherInputData();
        let csv = "# Pile Group 3D - Input Data (CSV)\n\n";
        
        csv += "# Material Properties\n";
        csv += `E,${inputData.vat_lieu.E}\nIcoc,${inputData.vat_lieu.Icoc}\nD,${inputData.vat_lieu.D}\nF,${inputData.vat_lieu.F}\nLcoc,${inputData.vat_lieu.Lcoc}\nL0,${inputData.vat_lieu.L0}\n\n`;
        
        csv += "# Cap Dimensions\n";
        csv += `Bx,${inputData.be_coc.Bx}\nBy,${inputData.be_coc.By}\n\n`;
        
        csv += "# Loads\n";
        csv += `Hx,${inputData.tai_trong.Hx}\nHy,${inputData.tai_trong.Hy}\nPz,${inputData.tai_trong.Pz}\nMx,${inputData.tai_trong.Mx}\nMy,${inputData.tai_trong.My}\nMz,${inputData.tai_trong.Mz}\n\n`;
        
        csv += "# Piles (X,Y,Fi,Psi)\n";
        inputData.coc.forEach((pile, i) => {
            csv += `PILE_${i+1},${pile.x},${pile.y},${pile.fi},${pile.psi}\n`;
        });
        
        downloadFile(csv, 'pilegroup_input.csv', 'text/csv');
    } catch (error) {
        alert(`❌ Lỗi lưu file: ${error.message}`);
    }
}

/**
 * Save as INP format
 */
function savePileGroupAsINP() {
    try {
        const inputData = gatherInputData();
        let inp = "# Pile Group 3D - Input File (INP Format)\n\n";
        
        inp += "[MATERIAL]\n";
        inp += `E = ${inputData.vat_lieu.E}\nIcoc = ${inputData.vat_lieu.Icoc}\nD = ${inputData.vat_lieu.D}\nF = ${inputData.vat_lieu.F}\nLcoc = ${inputData.vat_lieu.Lcoc}\nL0 = ${inputData.vat_lieu.L0}\n\n`;
        
        inp += "[CAP_DIMENSIONS]\n";
        inp += `Bx = ${inputData.be_coc.Bx}\nBy = ${inputData.be_coc.By}\n\n`;
        
        inp += "[LOADS]\n";
        inp += `Hx = ${inputData.tai_trong.Hx}\nHy = ${inputData.tai_trong.Hy}\nPz = ${inputData.tai_trong.Pz}\nMx = ${inputData.tai_trong.Mx}\nMy = ${inputData.tai_trong.My}\nMz = ${inputData.tai_trong.Mz}\n\n`;
        
        inp += "[PILES]\n";
        inputData.coc.forEach((pile, i) => {
            inp += `Pile_${i+1} = ${pile.x}, ${pile.y}, ${pile.fi}, ${pile.psi}\n`;
        });
        
        downloadFile(inp, 'pilegroup_input.inp', 'text/plain');
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
}

/**
 * Initialize Application
 */
document.addEventListener('DOMContentLoaded', () => {
    const runButton = document.getElementById('calculate-button');
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

    // Initialize pile count display
    updatePileCount();
    
    // Update pile count when table changes
    const pileTableBody = document.getElementById('pile-table-body');
    if (pileTableBody) {
        const observer = new MutationObserver(updatePileCount);
        observer.observe(pileTableBody, { childList: true });
    }

    // Load WASM Module with cache-busting
    const wasmVersion = '1.0.0';
    
    try {
        // Kiểm tra xem hàm tạo module (từ pilegroup.js) có tồn tại không
        if (typeof createPileGroupModule !== 'function') {
            throw new Error("Không tìm thấy hàm khởi tạo WASM (createPileGroupModule). Vui lòng kiểm tra file pilegroup.js.");
        }

        createPileGroupModule({
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
            console.log("✅ Pile Group WASM Module Fully Initialized");
            
            // Hide loading overlay
            if (loadingOverlay) {
                loadingOverlay.style.opacity = '0';
                setTimeout(() => { loadingOverlay.style.display = 'none'; }, 300);
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
            
            // Hide loading overlay & show error
            if (loadingOverlay) loadingOverlay.style.display = 'none';
            
            if (runButton) {
                runButton.textContent = "❌ Lỗi WASM";
                runButton.classList.replace('btn-success', 'btn-danger');
                runButton.disabled = true;
            }

            if (wasmStatusDiv) wasmStatusDiv.classList.replace('alert-info', 'alert-danger');
            if (wasmSpinner) wasmSpinner.style.display = 'none';
            if (wasmStatusText) wasmStatusText.innerHTML = `❌ Lỗi tải WASM!<br><small>${e.message}</small>`;
            
            showError(`Không thể tải lõi tính toán (WASM): ${e.message}`);
        });
    } catch (syncError) {
        console.error("❌ Synchronous error during WASM initialization:", syncError);
        if (loadingOverlay) loadingOverlay.style.display = 'none';
        showError(`Lỗi khởi tạo WASM: ${syncError.message}`);
    }
    
    // File Management Button Listeners
    const btnNew = document.getElementById('btn-new-file');
    const btnOpen = document.getElementById('btn-open-file');
    const btnSave = document.getElementById('btn-save-file');
    
    if (btnNew) btnNew.addEventListener('click', newFile);
    if (btnOpen) btnOpen.addEventListener('click', openFile);
    if (btnSave) btnSave.addEventListener('click', saveFile);
    
    // Pile Management Button Listeners
    const btnAddPile = document.getElementById('add-pile-row');
    const btnRemovePile = document.getElementById('remove-pile-row');
    const btnLoadSample = document.getElementById('load-sample-data');
    
    if (btnAddPile) btnAddPile.addEventListener('click', handleAddPile);
    if (btnRemovePile) btnRemovePile.addEventListener('click', handleRemovePile);
    if (btnLoadSample) btnLoadSample.addEventListener('click', loadSampleData);
    
    // Initialize with 4 default piles on page load
    initializeDefaultPiles();
});