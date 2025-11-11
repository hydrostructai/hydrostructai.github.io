/*
 * app-cal.js (cho Sheet Pile FEM)
 *
 * Chịu trách nhiệm:
 * 1. Tải và khởi tạo module WebAssembly (WASM).
 * 2. Gán sự kiện cho nút "Run Analysis".
 * 3. Thực hiện kiểm tra license phía client.
 * 4. Thu thập toàn bộ dữ liệu input từ HTML.
 * 5. Gọi hàm WASM và xử lý kết quả trả về.
 * 6. Gọi các hàm trong app-out.js để hiển thị kết quả hoặc lỗi.
 */

// Biến toàn cục để giữ module WASM sau khi khởi tạo
let wasmModule;

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
 * Hàm chính thực thi phân tích
 */
async function runAnalysis() {
    // 1. Kiểm tra module đã sẵn sàng
    if (!wasmModule) {
        alert("Lõi tính toán (WASM) chưa sẵn sàng. Vui lòng đợi hoặc tải lại trang.");
        return;
    }

    // 2. Kích hoạt trạng thái "Đang tải" (gọi hàm từ app-out.js)
    showLoading(true);
    hideError();
    hideResults();

    try {
        // 3. KIỂM TRA LICENSE (Theo yêu cầu)
        const isLicensed = localStorage.getItem('sheetpileLicensed') === 'true';
        
        // Đếm số lớp đất và neo TRƯỚC khi thu thập dữ liệu
        const soilLayerCount = document.querySelectorAll('#soil-layer-table tbody tr').length;
        const anchorCount = document.querySelectorAll('#anchor-table tbody tr').length;

        if (!isLicensed && (soilLayerCount > 2 || anchorCount > 0)) {
            // VI PHẠM ĐIỀU KIỆN
            throw new Error(
                "Lỗi Bản Quyền: Tài khoản miễn phí chỉ cho phép tính toán với tối đa 2 lớp đất và không có neo/chống. Vui lòng đăng ký để mở khóa toàn bộ tính năng."
            );
        }

        // 4. Thu thập dữ liệu (Nếu license hợp lệ)
        const inputData = gatherInputData();
        const inputJsonString = JSON.stringify(inputData);

        // 5. Gọi hàm WASM
        // (Giả định hàm C++ được export tên là 'calculateSheetPile')
        const resultJsonString = wasmModule.calculateSheetPile(inputJsonString);
        
        // 6. Xử lý kết quả
        const result = JSON.parse(resultJsonString);

        if (result.status === 'error') {
            // Lỗi tính toán từ C++
            throw new Error(result.message);
        } else {
            // Thành công! Gửi kết quả cho app-out.js
            displayResults(result); 
        }

    } catch (error) {
        // Bắt mọi lỗi (License, Thu thập dữ liệu, Tính toán)
        console.error("Analysis Error:", error);
        // Gửi lỗi cho app-out.js
        displayError(error.message || "Đã xảy ra lỗi không xác định.");
    } finally {
        // 7. Tắt trạng thái "Đang tải"
        showLoading(false);
    }
}

/**
 * KHỞI TẠO: Chờ DOM tải xong
 */
document.addEventListener('DOMContentLoaded', () => {
    // Lấy nút Run Analysis
    const runButton = document.getElementById('btn-run-analysis');
    
    // Vô hiệu hóa nút cho đến khi WASM tải xong
    runButton.disabled = true;
    runButton.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Đang tải lõi...';

    // Khởi tạo module WASM
    // (Giả định tên factory function là 'createSheetPileModule' 
    // được tạo bởi file sheetpilefem.js)
    createSheetPileModule().then(Module => {
        wasmModule = Module;
        console.log("Sheet Pile FEM WASM Module Loaded.");
        
        // Kích hoạt nút Run
        runButton.disabled = false;
        runButton.innerHTML = '<i class="fas fa-play"></i> Run Analysis';
        
        // Gán sự kiện click
        runButton.addEventListener('click', runAnalysis);
        
    }).catch(e => {
        // Lỗi nghiêm trọng: Không thể tải WASM
        console.error("Error loading WASM module:", e);
        runButton.textContent = "Lỗi tải WASM";
        runButton.classList.remove('btn-success');
        runButton.classList.add('btn-danger');
        displayError('Không thể tải lõi tính toán (WASM). Vui lòng tải lại trang.');
    });
});