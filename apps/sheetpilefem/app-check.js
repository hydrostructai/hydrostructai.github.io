/*
 * app-check.js (cho Sheet Pile FEM - Kiến trúc MỚI)
 *
 * Chịu trách nhiệm:
 * 1. Đọc trạng thái license từ localStorage khi tải trang.
 * 2. Xử lý sự kiện click cho nút "Check License" (trong tab "Bản quyền").
 * 3. Gửi yêu cầu (fetch) đến server (giả lập API) để xác thực.
 * 4. Cập nhật localStorage và UI (màu sắc, text) dựa trên kết quả.
 */

/**
 * Hàm trợ giúp cập nhật UI cho trạng thái license
 * @param {string} status - Loại trạng thái ('success', 'error', 'checking', 'not_checked')
 * @param {string} message - Tin nhắn để hiển thị
 */
function updateLicenseStatusUI(status, message) {
    const statusDiv = document.getElementById('license-status');
    if (!statusDiv) return;

    // Xóa các lớp màu cũ (Bootstrap 5)
    statusDiv.classList.remove('alert-success', 'alert-danger', 'alert-info', 'alert-secondary');

    switch (status) {
        case 'success':
            statusDiv.classList.add('alert-success'); // Màu xanh
            break;
        case 'error':
            statusDiv.classList.add('alert-danger'); // Màu đỏ
            break;
        case 'checking':
            statusDiv.classList.add('alert-info'); // Màu xanh nhạt
            break;
        case 'not_checked':
        default:
            statusDiv.classList.add('alert-secondary'); // Màu xám
            break;
    }
    statusDiv.textContent = message;
}

/**
 * Hàm chính để xử lý việc kiểm tra license
 */
async function handleLicenseCheck() {
    const emailInput = document.getElementById('user-email');
    const keyInput = document.getElementById('license-key');
    
    const email = emailInput.value;
    const licenseKey = keyInput.value;

    // 1. Kiểm tra input rỗng
    if (!email || !licenseKey) {
        updateLicenseStatusUI('error', 'Vui lòng nhập đầy đủ Email và License Key.');
        return;
    }

    // 2. Cập nhật UI sang trạng thái "Đang kiểm tra"
    updateLicenseStatusUI('checking', 'Đang kiểm tra, vui lòng đợi...');

    // 3. Giả lập gửi yêu cầu (fetch) đến server
    // Thay thế '/api/verify-license-sheetpile' bằng URL API thực tế của bạn
    try {
        const response = await fetch('/api/verify-license-sheetpile', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                email: email,
                licenseKey: licenseKey
            })
        });

        const data = await response.json();

        if (response.ok && data.status === 'success') {
            // 4. THÀNH CÔNG
            // Lưu trạng thái đã kích hoạt (key lấy từ app-cal.js cũ)
            localStorage.setItem('sheetpileLicensed', 'true');
            updateLicenseStatusUI('success', data.message || 'Kích hoạt thành công! Không giới hạn lớp đất.');
        } else {
            // 5. THẤT BẠI
            localStorage.setItem('sheetpileLicensed', 'false');
            updateLicenseStatusUI('error', data.message || 'Key hoặc Email không hợp lệ.');
        }

    } catch (error) {
        // 6. LỖI (Mạng, server sập, hoặc đang test offline)
        console.warn("Lỗi API thật, đang sử dụng logic giả lập offline.");
        // Giả lập 1s
        await new Promise(resolve => setTimeout(resolve, 1000)); 
        
        // ---- LOGIC GIẢ LẬP ĐỂ TEST ----
        if (licenseKey.toLowerCase().includes('valid')) {
            localStorage.setItem('sheetpileLicensed', 'true');
            updateLicenseStatusUI('success', 'Kích hoạt thành công! (Test). Không giới hạn lớp đất.');
        } else {
            localStorage.setItem('sheetpileLicensed', 'false');
            updateLicenseStatusUI('error', 'Key hoặc Email không hợp lệ. (Test)');
        }
        // ---- HẾT PHẦN GIẢ LẬP ----
    }
}

/**
 * KHỞI TẠO: Chờ DOM tải xong
 */
document.addEventListener('DOMContentLoaded', () => {
    // 1. Lấy các phần tử DOM
    const btnCheckInContent = document.getElementById('btn-check-license');
    
    // 2. Kiểm tra trạng thái đã lưu khi tải trang
    // Key 'sheetpileLicensed' phải khớp với key trong app-cal.js
    const isLicensed = localStorage.getItem('sheetpileLicensed') === 'true';
    if (isLicensed) {
        updateLicenseStatusUI('success', 'Trạng thái: Đã kích hoạt. Không giới hạn lớp đất.');
    } else {
        updateLicenseStatusUI('not_checked', 'Trạng thái: Chưa kích hoạt. Giới hạn 2 lớp đất.');
    }

    // 3. (Đã xóa logic cho btn-check-license-sidebar)

    // 4. Gán sự kiện cho nút "Kiểm tra" CHÍNH (TRONG TAB BẢN QUYỀN)
    if (btnCheckInContent) {
        btnCheckInContent.addEventListener('click', handleLicenseCheck);
    }
});