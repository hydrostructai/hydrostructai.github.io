/*
 * APP-CHECK.JS
 * Chịu trách nhiệm:
 * 1. Khởi tạo Wasm
 * 2. Kiểm tra License
 * 3. Quản lý UI nhập liệu (thêm/xóa hàng)
 * 4. Tải dữ liệu (mẫu, CSV)
 */

// --- 1. KHỞI TẠO VÀ KHAI BÁO BIẾN TOÀN CỤC ---

// Biến toàn cục (để các file khác có thể truy cập)
var Module = {}; // Module Wasm
var g_isLicensed = false; // Trạng thái bản quyền

// Hàm này sẽ được gọi bởi app-cal.js
var g_WasmModule = {
    isReady: false,
    checkLicense: null,
    calculate: null
};

// Sử dụng 'DOMContentLoaded' để đảm bảo tất cả các phần tử HTML đã được tải
document.addEventListener('DOMContentLoaded', () => {
    
    // --- 2. KHỞI TẠO LÕI WASM ---
    const wasmStatus = document.getElementById('wasm-status');
    const wasmSpinner = document.getElementById('wasm-spinner');
    const calculateButton = document.getElementById('calculate-button');
    const checkLicenseButton = document.getElementById('check-license-button');

    // Gọi Factory Function (tên đã định nghĩa trong lệnh build)
    createPileGroupModule()
        .then(instance => {
            // Gán các hàm Wasm vào biến toàn cục
            g_WasmModule.checkLicense = instance.checkLicense;
            g_WasmModule.calculate = instance.calculatePileGroup;
            g_WasmModule.isReady = true;

            // Cập nhật UI
            wasmSpinner.style.display = 'none';
            wasmStatus.classList.remove('alert-info');
            wasmStatus.classList.add('alert-success');
            wasmStatus.innerHTML = '<i class="bi bi-check-circle-fill"></i> Lõi Wasm đã sẵn sàng!';
            
            // Mở khóa các nút
            calculateButton.disabled = false;
            checkLicenseButton.disabled = false;
            
            // Tải dữ liệu mẫu ngay khi Wasm sẵn sàng
            loadSampleData();
        })
        .catch(e => {
            console.error("Lỗi tải Wasm:", e);
            wasmSpinner.style.display = 'none';
            wasmStatus.classList.remove('alert-info');
            wasmStatus.classList.add('alert-danger');
            wasmStatus.innerHTML = '<i class="bi bi-exclamation-triangle-fill"></i> Lỗi tải lõi Wasm!';
        });

    // --- 3. QUẢN LÝ BẢN QUYỀN (LICENSE) ---
    const licenseKeyInput = document.getElementById('license-key');
    const licenseStatusText = document.getElementById('license-status-text');

    checkLicenseButton.addEventListener('click', () => {
        if (!g_WasmModule.isReady) {
            alert("Lõi Wasm chưa sẵn sàng, vui lòng đợi.");
            return;
        }

        const key = licenseKeyInput.value;
        try {
            g_isLicensed = g_WasmModule.checkLicense(key); // Gọi Wasm
            
            if (g_isLicensed) {
                licenseStatusText.innerHTML = '<strong class="text-success"><i class="bi bi-patch-check-fill"></i> Đã đăng ký!</strong> Không giới hạn số cọc.';
                licenseStatusText.classList.remove('text-muted');
                licenseStatusText.classList.add('text-success');
            } else {
                licenseStatusText.innerHTML = '<strong class="text-danger"><i class="bi bi-x-circle-fill"></i> Key không hợp lệ.</strong> Giới hạn 10 cọc.';
                licenseStatusText.classList.remove('text-muted');
                licenseStatusText.classList.add('text-danger');
            }
        } catch (e) {
            console.error("Lỗi khi kiểm tra license:", e);
            g_isLicensed = false;
            licenseStatusText.innerHTML = '<strong class="text-danger">Lỗi kiểm tra.</strong> Giới hạn 10 cọc.';
            licenseStatusText.classList.add('text-danger');
        }
    });


    // --- 4. QUẢN LÝ BẢNG NHẬP LIỆU ---

    // Bảng đất
    const soilTableBody = document.getElementById('soil-layer-body');
    document.getElementById('add-soil-row').addEventListener('click', () => addSoilRow({ Ldat: 0, Tdat: 0, Phi: 0 }));

    // Bảng cọc
    const pileTableBody = document.getElementById('pile-table-body');
    const pileCountSpan = document.getElementById('pile-count');
    document.getElementById('add-pile-row').addEventListener('click', () => addPileRow([0, 0, 0, 0]));
    document.getElementById('remove-pile-row').addEventListener('click', removePileRow);

    // Hàm thêm hàng (đất)
    window.addSoilRow = (data) => {
        const rowCount = soilTableBody.rows.length;
        const newRow = soilTableBody.insertRow();
        newRow.innerHTML = `
            <td>${rowCount + 1}</td>
            <td><input type="number" class="form-control form-control-sm" value="${data.Ldat}"></td>
            <td><input type="number" class="form-control form-control-sm" value="${data.Tdat}"></td>
            <td><input type="number" class="form-control form-control-sm" value="${data.Phi}"></td>
        `;
    };

    // Hàm thêm hàng (cọc)
    window.addPileRow = (data) => {
        const rowCount = pileTableBody.rows.length;
        const newRow = pileTableBody.insertRow();
        newRow.innerHTML = `
            <td>${rowCount + 1}</td>
            <td><input type="number" class="form-control form-control-sm" value="${data[0]}"></td>
            <td><input type="number" class="form-control form-control-sm" value="${data[1]}"></td>
            <td><input type="number" class="form-control form-control-sm" value="${data[2]}"></td>
            <td><input type="number" class="form-control form-control-sm" value="${data[3]}"></td>
        `;
        updatePileCount();
    };

    // Hàm xóa hàng (cọc)
    function removePileRow() {
        if (pileTableBody.rows.length > 0) {
            pileTableBody.deleteRow(-1); // Xóa hàng cuối
            updatePileCount();
        }
    }

    // Hàm xóa bảng (cọc)
    window.clearPileTable = () => {
        pileTableBody.innerHTML = '';
        updatePileCount();
    };

    // Hàm cập nhật số cọc
    window.updatePileCount = () => {
        pileCountSpan.textContent = pileTableBody.rows.length;
    };

    // --- 5. TẢI DỮ LIỆU (MẪU & CSV) ---

    // Dữ liệu mẫu từ Be07v2.pas
    const sampleSoilData = [
        { Ldat: 4.0, Tdat: 3.05, Phi: 0.5236 },
        { Ldat: 5.0, Tdat: 4.65, Phi: 0.5444 },
        { Ldat: 1.0, Tdat: 6.99, Phi: 0.5555 },
    ];
    const samplePileData = [
        [-1.60, 2.70, 0.165, 3.141593], [-1.60, 1.65, 0.165, 3.141593], [-1.60, 0.60, 0.165, 3.141593],
        [-1.60, -0.60, 0.165, 3.141593], [-1.60, -1.65, 0.165, 3.141593], [-1.60, -2.70, 0.165, 3.141593],
        [-0.60, -2.70, 0.0, 0.0], [-0.60, -1.65, 0.0, 0.0], [-0.60, -0.60, 0.0, 0.0],
        [-0.60, 0.60, 0.0, 0.0], [-0.60, 1.65, 0.0, 0.0], [-0.60, 2.70, 0.0, 0.0],
        [0.60, 2.70, 0.0, 0.0], [0.60, 1.65, 0.0, 0.0], [0.60, 0.60, 0.0, 0.0],
        [0.60, -0.60, 0.0, 0.0], [0.60, -1.65, 0.0, 0.0], [0.60, -2.70, 0.0, 0.0],
        [1.60, -2.70, 0.165, 0.0], [1.60, -1.65, 0.165, 0.0], [1.60, -0.60, 0.165, 0.0],
        [1.60, 0.60, 0.165, 0.0], [1.60, 1.65, 0.165, 0.0], [1.60, 2.70, 0.165, 0.0],
    ];

    // Gắn sự kiện cho nút "Tải dữ liệu mẫu"
    document.getElementById('load-sample-data').addEventListener('click', loadSampleData);

    // Hàm tải dữ liệu mẫu
    function loadSampleData() {
        // Tải dữ liệu tab "Vật liệu"
        document.getElementById('input-E').value = 2800000;
        document.getElementById('input-F').value = 0.1225;
        document.getElementById('input-Icoc').value = 0.00125;
        document.getElementById('input-D').value = 0.35;
        document.getElementById('input-Lcoc').value = 12.0;
        document.getElementById('input-L0').value = 2.0;
        document.getElementById('input-Bx').value = 7;
        document.getElementById('input-By').value = 9;
        
        // Tải dữ liệu tab "Đất nền"
        document.getElementById('input-m').value = 600;
        document.getElementById('input-mchan').value = 800;
        document.getElementById('input-Rdat').value = 680;
        document.getElementById('select-dieu-kien-mui').value = 'K';
        soilTableBody.innerHTML = ''; // Xóa bảng đất cũ
        sampleSoilData.forEach(addSoilRow); // Thêm dữ liệu đất mẫu
        
        // Tải dữ liệu tab "Tải trọng"
        document.getElementById('input-Hx').value = 20.2;
        document.getElementById('input-Hy').value = 72.0;
        document.getElementById('input-Pz').value = 1250.06;
        document.getElementById('input-Mx').value = 934.4;
        document.getElementById('input-My').value = 361.9;
        document.getElementById('input-Mz').value = 0.0;

        // Tải dữ liệu tab "Bố trí cọc"
        clearPileTable();
        samplePileData.forEach(addPileRow);
    };

    // Gắn sự kiện cho nút "Nhập CSV"
    document.getElementById('csv-file-input').addEventListener('change', handleFileUpload);

    // Hàm xử lý tải file CSV
    function handleFileUpload(event) {
        const file = event.target.files[0];
        if (!file) return;

        Papa.parse(file, {
            skipEmptyLines: true,
            complete: function(results) {
                clearPileTable();
                // Bỏ qua hàng tiêu đề nếu có (kiểm tra hàng đầu tiên có phải là số không)
                const dataToParse = isNaN(parseFloat(results.data[0][0])) ? results.data.slice(1) : results.data;
                
                dataToParse.forEach(row => {
                    if (row.length >= 4) {
                        // Lấy 4 cột đầu tiên và chuyển sang số
                        const numericRow = row.slice(0, 4).map(Number.parseFloat);
                        if (!numericRow.some(isNaN)) {
                            addPileRow(numericRow);
                        }
                    }
                });
                // Kích hoạt tab cọc để người dùng thấy
                new bootstrap.Tab(document.getElementById('tab-piles')).show();
            },
            error: function(err) {
                // Sử dụng hàm báo lỗi chung
                showError("Lỗi đọc file CSV: " + err.message);
            }
        });
        // Reset input file để có thể tải lại cùng 1 file
        event.target.value = null;
    }

    // --- 6. HÀM TIỆN ÍCH CHUNG (LỖI) ---
    // Các hàm này sẽ được gọi bởi các file JS khác
    
    const errorContainer = document.getElementById('error-message');
    window.showError = (message) => {
        errorContainer.textContent = message;
        errorContainer.style.display = 'block';
    };

    window.hideError = () => {
        errorContainer.textContent = '';
        errorContainer.style.display = 'none';
    };

}); // Kết thúc DOMContentLoaded
