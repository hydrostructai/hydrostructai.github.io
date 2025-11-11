/*
 * app-cal.js (cho Pile Group)
 *
 * (Giữ nguyên toàn bộ file, chỉ sửa 1 dòng trong hàm runAnalysis)
 */

// Biến toàn cục để giữ module WASM
let wasmModule;

/**
 * Hàm trợ giúp để lấy giá trị số (float) từ một input
 */
function getFloatValue(elementId, fieldName) {
    const value = parseFloat(document.getElementById(elementId).value);
    if (isNaN(value)) {
        throw new Error(`Dữ liệu không hợp lệ cho "${fieldName}" (ID: ${elementId}). Vui lòng kiểm tra lại.`);
    }
    return value;
}

/**
 * Thu thập toàn bộ dữ liệu đầu vào từ các form và bảng.
 */
function gatherInputData() {
    const inputData = {};

    // 1. Vật liệu & Cọc (vat_lieu)
    inputData.vat_lieu = {
        E: getFloatValue('vl-E', 'Vật liệu: Modul đàn hồi (E)'),
        Icoc: getFloatValue('vl-Icoc', 'Vật liệu: Momen quán tính (Icoc)'),
        D: getFloatValue('vl-D', 'Vật liệu: Cạnh/Đường kính (D)'),
        F: getFloatValue('vl-F', 'Vật liệu: Diện tích (F)'),
        Fh: getFloatValue('vl-Fh', 'Vật liệu: Diện tích hữu hiệu (Fh)'),
        Lcoc: getFloatValue('vl-Lcoc', 'Vật liệu: Chiều dài cọc (Lcoc)'),
        L0: getFloatValue('vl-L0', 'Vật liệu: Chiều dài cọc tự do (L0)'),
        m: getFloatValue('vl-m', 'Vật liệu: Hệ số m (m)')
    };

    // 2. Đất nền (dat_nen)
    inputData.dat_nen = {
        dieu_kien_mui: document.getElementById('dn-dieu-kien-mui').value,
        Rdat: getFloatValue('dn-Rdat', 'Đất nền: Cường độ (Rdat)'),
        mchan: getFloatValue('dn-mchan', 'Đất nền: Hệ số m chân (mchan)'),
        nLopDat: getFloatValue('dn-nLopDat', 'Đất nền: Số lớp đất (nLopDat)')
    };
    
    // 2b. Các lớp đất (lop_dat)
    inputData.dat_nen.lop_dat = [];
    const lopDatRows = document.querySelectorAll('#lop-dat-table tbody tr');
    lopDatRows.forEach((row, index) => {
        const input = row.querySelector('input[type="number"]');
        const ldat = parseFloat(input.value);
        if (isNaN(ldat)) {
            throw new Error(`Dữ liệu không hợp lệ tại Lớp đất ${index + 1}.`);
        }
        inputData.dat_nen.lop_dat.push({ Ldat: ldat });
    });
    
    if (inputData.dat_nen.nLopDat !== lopDatRows.length) {
         throw new Error(`Giá trị 'Số lớp đất' (${inputData.dat_nen.nLopDat}) không khớp với số hàng trong bảng (${lopDatRows.length}).`);
    }

    // 3. Bệ cọc (be_coc)
    inputData.be_coc = {
        Bx: getFloatValue('bc-Bx', 'Bệ cọc: Kích thước Bx'),
        By: getFloatValue('bc-By', 'Bệ cọc: Kích thước By')
    };

    // 4. Vị trí Cọc (coc)
    inputData.coc = [];
    const cocRows = document.querySelectorAll('#coc-table tbody tr');
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

    // 5. Tải trọng (tai_trong)
    inputData.tai_trong = {
        Hx: getFloatValue('tt-Hx', 'Tải trọng: Hx'),
        Hy: getFloatValue('tt-Hy', 'Tải trọng: Hy'),
        Pz: getFloatValue('tt-Pz', 'Tải trọng: Pz'),
        Mx: getFloatValue('tt-Mx', 'Tải trọng: Mx'),
        My: getFloatValue('tt-My', 'Tải trọng: My'),
        Mz: getFloatValue('tt-Mz', 'Tải trọng: Mz')
    };

    return inputData;
}

/**
 * Hàm chính thực thi phân tích
 */
async function runAnalysis() {
    if (!wasmModule) {
        alert("Lõi tính toán (WASM) chưa sẵn sàng. Vui lòng đợi hoặc tải lại trang.");
        return;
    }

    showLoading(true);
    hideError();
    hideResults();

    try {
        const inputData = gatherInputData();
        const inputJsonString = JSON.stringify(inputData);
        
        const resultJsonString = wasmModule.calculatePileGroup(inputJsonString);
        
        const result = JSON.parse(resultJsonString);

        if (result.status === 'error') {
            throw new Error(result.message);
        } else {
            // === THAY ĐỔI DUY NHẤT ===
            // Gửi cả inputData (cho việc vẽ) và result (cho bảng)
            displayResults(result, inputData); 
            // =========================
        }

    } catch (error) {
        console.error("Analysis Error:", error);
        displayError(error.message || "Đã xảy ra lỗi không xác định.");
    } finally {
        showLoading(false);
    }
}

/**
 * KHỞI TẠO: Chờ DOM tải xong
 */
document.addEventListener('DOMContentLoaded', () => {
    const runButton = document.getElementById('btn-run-analysis');
    
    runButton.disabled = true;
    runButton.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Đang tải lõi...';

    createPileGroupModule().then(Module => {
        wasmModule = Module;
        console.log("Pile Group WASM Module Loaded.");
        
        runButton.disabled = false;
        runButton.innerHTML = '<i class="fas fa-play"></i> Run Analysis';
        
        runButton.addEventListener('click', runAnalysis);
        
    }).catch(e => {
        console.error("Error loading WASM module:", e);
        runButton.textContent = "Lỗi tải WASM";
        runButton.classList.remove('btn-success');
        runButton.classList.add('btn-danger');
        if(typeof displayError === 'function') {
            displayError('Không thể tải lõi tính toán (WASM). Vui lòng tải lại trang.');
        } else {
            alert('Không thể tải lõi tính toán (WASM). Vui lòng tải lại trang.');
        }
    });
});