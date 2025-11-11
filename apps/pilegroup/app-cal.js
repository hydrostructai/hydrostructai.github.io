/*
 * APP-CAL.JS
 * Chịu trách nhiệm:
 * 1. Gắn sự kiện cho nút "Run Analysis".
 * 2. Thu thập và xác thực (validate) dữ liệu đầu vào.
 * 3. Kiểm tra license (giới hạn 10 cọc).
 * 4. Gọi hàm Wasm 'calculate'.
 * 5. Chuyển kết quả cho app-out.js (hàm displayResults).
 *
 * Phụ thuộc:
 * - app-check.js (phải được tải trước)
 * - app-out.js (phải được tải sau, cung cấp hàm `displayResults`)
 */

document.addEventListener('DOMContentLoaded', () => {
    
    // Lấy các phần tử DOM
    const calculateButton = document.getElementById('calculate-button');
    const calcSpinner = document.getElementById('calc-spinner');

    // Gắn sự kiện chính
    calculateButton.addEventListener('click', runCalculation);

    /**
     * Hàm chính: Điều phối toàn bộ quá trình tính toán.
     */
    function runCalculation() {
        // 1. Chuẩn bị UI
        hideError(); // Hàm này từ app-check.js
        calcSpinner.style.display = 'inline-block';
        calculateButton.disabled = true;

        // Sử dụng setTimeout để cho phép UI cập nhật (hiển thị spinner)
        setTimeout(() => {
            try {
                // 2. Kiểm tra Wasm
                if (!g_WasmModule || !g_WasmModule.isReady || typeof g_WasmModule.calculate !== 'function') {
                    throw new Error("Lỗi: Lõi tính toán (Wasm) chưa sẵn sàng. Vui lòng tải lại trang.");
                }

                // 3. Thu thập dữ liệu
                const inputData = collectInputData();
                
                // 4. Xác thực dữ liệu (bao gồm cả kiểm tra license)
                validateInputData(inputData); // Sẽ ném lỗi nếu thất bại

                // 5. Gọi Wasm
                const jsonInput = JSON.stringify(inputData);
                const jsonOutput = g_WasmModule.calculate(jsonInput); // Gọi C++

                // 6. Phân tích kết quả
                const results = JSON.parse(jsonOutput);

                // 7. Kiểm tra lỗi từ Wasm
                if (results.status === "error") {
                    // Ném lỗi do C++ trả về (ví dụ: "Ma tran suy bien")
                    throw new Error(results.message);
                }

                // 8. Chuyển giao cho app-out.js
                // Hàm displayResults() sẽ được định nghĩa trong app-out.js
                displayResults(results); 

            } catch (e) {
                // Bắt bất kỳ lỗi nào (từ validate, Wasm, JSON.parse)
                showError(e.message); // Hàm này từ app-check.js
            } finally {
                // 9. Dọn dẹp UI
                calcSpinner.style.display = 'none';
                calculateButton.disabled = false;
            }
        }, 10); // 10ms delay
    }

    /**
     * Thu thập TẤT CẢ dữ liệu từ các tab UI và gom thành đối tượng JSON.
     * @returns {object} Đối tượng JSON đầy đủ để gửi cho Wasm.
     */
    function collectInputData() {
        // Helper để lấy số (float), với giá trị mặc định nếu rỗng
        const getFloat = (id, defaultValue = 0.0) => {
            const val = parseFloat(document.getElementById(id).value);
            return isNaN(val) ? defaultValue : val;
        };

        const inputData = {
            vat_lieu: {
                E: getFloat('input-E'),
                F: getFloat('input-F'),
                Icoc: getFloat('input-Icoc'),
                D: getFloat('input-D'),
                Lcoc: getFloat('input-Lcoc'),
                L0: getFloat('input-L0'),
                Fh: getFloat('input-F') // Giả định Fh = F (theo logic Be07v2.pas)
            },
            be_coc: {
                Bx: getFloat('input-Bx'),
                By: getFloat('input-By'),
            },
            dat_nen: {
                m: getFloat('input-m'),
                mchan: getFloat('input-mchan'),
                Rdat: getFloat('input-Rdat'),
                dieu_kien_mui: document.getElementById('select-dieu-kien-mui').value, // "K", "T", "N"
                lop_dat: [],
                nLopDat: 0
            },
            tai_trong: {
                Hx: getFloat('input-Hx'),
                Hy: getFloat('input-Hy'),
                Pz: getFloat('input-Pz'),
                Mx: getFloat('input-Mx'),
                My: getFloat('input-My'),
                Mz: getFloat('input-Mz')
            },
            coc: []
        };

        // Thu thập dữ liệu lớp đất
        const soilRows = document.getElementById('soil-layer-body').rows;
        for (let i = 0; i < soilRows.length; i++) {
            const cells = soilRows[i].getElementsByTagName('input');
            inputData.dat_nen.lop_dat.push({
                Ldat: parseFloat(cells[0].value) || 0,
                Tdat: parseFloat(cells[1].value) || 0,
                Phi: parseFloat(cells[2].value) || 0
            });
        }
        inputData.dat_nen.nLopDat = soilRows.length;

        // Thu thập dữ liệu cọc
        const pileRows = document.getElementById('pile-table-body').rows;
        for (let i = 0; i < pileRows.length; i++) {
            const cells = pileRows[i].getElementsByTagName('input');
            inputData.coc.push({
                x: parseFloat(cells[0].value) || 0,
                y: parseFloat(cells[1].value) || 0,
                fi: parseFloat(cells[2].value) || 0,
                psi: parseFloat(cells[3].value) || 0
            });
        }

        return inputData;
    }

    /**
     * Kiểm tra dữ liệu đầu vào. Ném lỗi (throw Error) nếu có vấn đề.
     * @param {object} input - Đối tượng JSON đã thu thập.
     */
    function validateInputData(input) {
        if (!input) {
            throw new Error("Không thể thu thập dữ liệu.");
        }
        
        const pileCount = input.coc.length;

        if (pileCount === 0) {
            throw new Error("Dữ liệu không hợp lệ: Cần ít nhất 1 cọc để tính toán.");
        }

        // Kiểm tra logic license
        // g_isLicensed là biến toàn cục từ app-check.js
        if (!g_isLicensed && pileCount > 10) {
            throw new Error(`BẢN DÙNG THỬ (UNLICENSED) CHỈ HỖ TRỢ TỐI ĐA 10 CỌC. (Hiện tại có ${pileCount} cọc). Vui lòng đăng ký!`);
        }

        // Kiểm tra các giá trị vật lý cơ bản
        if (input.vat_lieu.E <= 0 || input.vat_lieu.F <= 0 || input.vat_lieu.Icoc <= 0) {
            throw new Error("Dữ liệu không hợp lệ: Thông số vật liệu E, F, Icoc phải lớn hơn 0.");
        }

        if (input.dat_nen.m <= 0) {
             throw new Error("Dữ liệu không hợp lệ: Hệ số 'm' (T/m4) của đất nền phải lớn hơn 0.");
        }
        
        if (input.dat_nen.lop_dat.length === 0) {
            throw new Error("Dữ liệu không hợp lệ: Cần ít nhất 1 lớp đất (Ldat > 0) để tính Lnen.");
        }

        // (Có thể thêm các kiểm tra khác ở đây)

        return true; // Tất cả đều hợp lệ
    }

}); // Kết thúc DOMContentLoaded
