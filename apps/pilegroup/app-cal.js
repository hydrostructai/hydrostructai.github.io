/*
 * app-cal.js (cho Pile Group - Kiến trúc MỚI)
 *
 * Chịu trách nhiệm:
 * 1. Tải và khởi tạo module WebAssembly (WASM).
 * 2. Gán sự kiện cho nút "Run Analysis" (ID: calculate-button).
 * 3. Thu thập toàn bộ dữ liệu input từ HTML (ID mới).
 * 4. Kiểm tra logic bản quyền (giới hạn 10 cọc) KHI NHẤN RUN.
 * 5. Gọi hàm WASM và xử lý kết quả trả về.
 * 6. Gọi các hàm trong app-out.js để hiển thị kết quả hoặc lỗi.
 */

// Biến toàn cục để giữ module WASM
let wasmModule;
// Biến toàn cục cho Bootstrap Tab (để chuyển tab khi lỗi)
let licenseTabTrigger;

/**
 * Hàm trợ giúp để lấy giá trị số (float) từ một input
 */
function getFloatValue(elementId, fieldName) {
    const element = document.getElementById(elementId);
    if (!element) {
        throw new Error(`Lỗi lập trình: Không tìm thấy phần tử ${elementId}.`);
    }
    const value = parseFloat(element.value);
    if (isNaN(value)) {
        throw new Error(`Dữ liệu không hợp lệ cho "${fieldName}" (ID: ${elementId}). Vui lòng kiểm tra lại.`);
    }
    return value;
}

/**
 * Thu thập toàn bộ dữ liệu đầu vào từ các form và bảng (theo ID MỚI).
 */
function gatherInputData() {
    const inputData = {};

    // 1. Vật liệu & Cọc (Tab 1)
    inputData.vat_lieu = {
        E: getFloatValue('input-E', 'Vật liệu: Modul đàn hồi (E)'),
        Icoc: getFloatValue('input-Icoc', 'Vật liệu: Momen quán tính (Icoc)'),
        D: getFloatValue('input-D', 'Vật liệu: Cạnh/Đường kính (D)'),
        F: getFloatValue('input-F', 'Vật liệu: Diện tích (F)'),
        // Fh: không có trong HTML mới
        Lcoc: getFloatValue('input-Lcoc', 'Vật liệu: Chiều dài cọc (Lcoc)'),
        L0: getFloatValue('input-L0', 'Vật liệu: Chiều dài cọc tự do (L0)')
        // m: Đã chuyển sang tab Đất nền
    };

    // 2. Đất nền (Tab 2)
    inputData.dat_nen = {
        // Lấy 'm' từ tab đất nền theo HTML mới
        m: getFloatValue('input-m', 'Đất nền: Hệ số m (m)'), 
        dieu_kien_mui: document.getElementById('select-dieu-kien-mui').value,
        Rdat: getFloatValue('input-Rdat', 'Đất nền: Cường độ (Rdat)'),
        mchan: getFloatValue('input-mchan', 'Đất nền: Hệ số m chân (mchan)')
        // nLopDat: không có trong HTML mới
    };
    
    // 2b. Các lớp đất (Tab 2 - Bảng)
    inputData.dat_nen.lop_dat = [];
    const lopDatRows = document.querySelectorAll('#soil-layer-body tr');
    lopDatRows.forEach((row, index) => {
        const inputs = row.querySelectorAll('input[type="number"]');
        // HTML mới có 3 cột: Ldat, Tdat, Phi
        const ldat = parseFloat(inputs[0].value);
        const tdat = parseFloat(inputs[1].value);
        const phi = parseFloat(inputs[2].value);

        if (isNaN(ldat) || isNaN(tdat) || isNaN(phi)) {
            throw new Error(`Dữ liệu không hợp lệ tại Lớp đất ${index + 1}.`);
        }
        inputData.dat_nen.lop_dat.push({ 
            Ldat: ldat,
            Tdat: tdat, // Thêm Tdat
            Phi: phi   // Thêm Phi
        });
    });
    
    // 3. Bệ cọc (Tab 1)
    inputData.be_coc = {
        Bx: getFloatValue('input-Bx', 'Bệ cọc: Kích thước Bx'),
        By: getFloatValue('input-By', 'Bệ cọc: Kích thước By')
    };

    // 4. Vị trí Cọc (Tab 4)
    inputData.coc = [];
    const cocRows = document.querySelectorAll('#pile-table-body tr');
    cocRows.forEach((row, index) => {
        const inputs = row.querySelectorAll('input[type="number"]');
        const coc = {
            x: parseFloat(inputs[0].value),
            y: parseFloat(inputs[1].value),
            fi: parseFloat(inputs[2].value), // Góc Fi
            psi: parseFloat(inputs[3].value) // Góc Psi
        };
        Object.entries(coc).forEach(([key, val]) => {
            if (isNaN(val)) throw new Error(`Dữ liệu không hợp lệ tại Cọc ${index + 1}, trường ${key}.`);
        });
        inputData.coc.push(coc);
    });

    // 5. Tải trọng (Tab 3)
    inputData.tai_trong = {
        Hx: getFloatValue('input-Hx', 'Tải trọng: Hx'),
        Hy: getFloatValue('input-Hy', 'Tải trọng: Hy'),
        Pz: getFloatValue('input-Pz', 'Tải trọng: Pz'),
        Mx: getFloatValue('input-Mx', 'Tải trọng: Mx'),
        My: getFloatValue('input-My', 'Tải trọng: My'),
        Mz: getFloatValue('input-Mz', 'Tải trọng: Mz')
    };

    return inputData;
}

/**
 * Hàm chính thực thi phân tích
 */
async function runAnalysis() {
    if (!wasmModule) {
        // Giả sử app-out.js cung cấp hàm displayError
        if (typeof displayError === 'function') {
            displayError("Lõi tính toán (WASM) chưa sẵn sàng. Vui lòng đợi hoặc tải lại trang.");
        } else {
            alert("Lõi tính toán (WASM) chưa sẵn sàng. Vui lòng đợi hoặc tải lại trang.");
        }
        return;
    }

    // Giả sử app-out.js cung cấp các hàm UI này
    if (typeof showLoading === 'function') showLoading(true);
    if (typeof hideError === 'function') hideError();
    if (typeof hideResults === 'function') hideResults();

    try {
        // === LOGIC BẢN QUYỀN MỚI ===
        // 1. Đọc trạng thái đã lưu
        const isLicensed = localStorage.getItem('pilegroupLicensed') === 'true';
        
        // 2. Đếm số cọc từ bảng
        const pileCount = document.querySelectorAll('#pile-table-body tr').length;

        // 3. Kiểm tra điều kiện
        if (!isLicensed && pileCount > 10) {
            // 4. Vi phạm -> Báo lỗi và chuyển tab
            const errorMessage = `Hãy đăng ký để tính toán nhiều hơn 10 cọc. (Hiện tại: ${pileCount} cọc)`;
            
            // Hiện thông báo lỗi
            if (typeof displayError === 'function') {
                displayError(errorMessage);
            } else {
                alert(errorMessage);
            }
            
            // Tự động chuyển sang tab "Bản quyền"
            if (licenseTabTrigger) {
                licenseTabTrigger.show();
            }
            
            // Dừng thực thi
            return; 
        }
        // =============================

        // Nếu vượt qua kiểm tra bản quyền -> tiếp tục tính toán
        const inputData = gatherInputData();
        const inputJsonString = JSON.stringify(inputData);
        
        // Gọi hàm WASM (giả định tên hàm là 'calculatePileGroup')
        const resultJsonString = wasmModule.calculatePileGroup(inputJsonString);
        
        const result = JSON.parse(resultJsonString);

        if (result.status === 'error') {
            throw new Error(result.message);
        } else {
            // Gửi cả inputData (cho việc vẽ) và result (cho bảng)
            // (Giả sử app-out.js cung cấp hàm displayResults)
            if (typeof displayResults === 'function') {
                displayResults(result, inputData); 
            }
        }

    } catch (error) {
        console.error("Analysis Error:", error);
        if (typeof displayError === 'function') {
            displayError(error.message || "Đã xảy ra lỗi không xác định.");
        }
    } finally {
        if (typeof showLoading === 'function') showLoading(false);
    }
}

/**
 * KHỞI TẠO: Chờ DOM tải xong
 */
document.addEventListener('DOMContentLoaded', () => {
    // Lấy nút Run Analysis (ID MỚI)
    const runButton = document.getElementById('calculate-button');
    // Lấy các phần tử trạng thái WASM (ID MỚI)
    const wasmStatusDiv = document.getElementById('wasm-status');
    const wasmStatusText = document.getElementById('wasm-status-text');
    const wasmSpinner = document.getElementById('wasm-spinner');
    
    // Lấy trình kích hoạt tab "Bản quyền" để sử dụng sau
    const licenseTabElement = document.getElementById('tab-license');
    if (licenseTabElement) {
        licenseTabTrigger = new bootstrap.Tab(licenseTabElement);
    }

    // Vô hiệu hóa nút cho đến khi WASM tải xong
    runButton.disabled = true;

    // Khởi tạo module WASM (giả định file pilegroup.js cung cấp 'createPileGroupModule')
    createPileGroupModule().then(Module => {
        wasmModule = Module;
        console.log("Pile Group WASM Module Loaded.");
        
        // Kích hoạt nút Run
        runButton.disabled = false;
        
        // Cập nhật trạng thái WASM
        if(wasmStatusDiv) wasmStatusDiv.classList.replace('alert-info', 'alert-success');
        if(wasmSpinner) wasmSpinner.style.display = 'none';
        if(wasmStatusText) wasmStatusText.textContent = 'Lõi tính toán đã sẵn sàng!';
        
        // Gán sự kiện click
        runButton.addEventListener('click', runAnalysis);
        
    }).catch(e => {
        // Lỗi nghiêm trọng: Không thể tải WASM
        console.error("Error loading WASM module:", e);
        runButton.textContent = "Lỗi WASM";
        runButton.disabled = true;

        if(wasmStatusDiv) wasmStatusDiv.classList.replace('alert-info', 'alert-danger');
        if(wasmSpinner) wasmSpinner.style.display = 'none';
        if(wasmStatusText) wasmStatusText.textContent = 'Lỗi tải lõi tính toán!';
        
        if (typeof displayError === 'function') {
            displayError('Không thể tải lõi tính toán (WASM). Vui lòng tải lại trang.');
        } else {
            alert('Không thể tải lõi tính toán (WASM). Vui lòng tải lại trang.');
        }
    });
});