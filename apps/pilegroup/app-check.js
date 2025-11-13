/*
 * app-check.js (cho Pile Group)
 *
 * Chịu trách nhiệm (Kiến trúc MỚI):
 * 1. Đọc trạng thái license từ localStorage khi tải trang.
 * 2. Xử lý sự kiện click cho nút "Check License" (trong tab "Bản quyền").
 * 3. Gửi yêu cầu (fetch) đến server (giả lập API) để xác thực email và key.
 * 4. Cập nhật localStorage và UI (màu sắc, text) dựa trên kết quả.
 */

/**
 * Hàm trợ giúp cập nhật UI cho trạng thái license
 * @param {string} status - Loại trạng thái ('success', 'error', 'checking', 'not_checked')
 * @param {string} message - Tin nhắn để hiển thị
 */
function updateLicenseStatusUI(status, message) {
    // ID này đến từ index.html mới (trong tab "Bản quyền")
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
 * (Đây là hàm async vì nó sử dụng fetch)
 */
async function handleLicenseCheck() {
    // 1. Lấy dữ liệu từ input (ID từ index.html mới)
    const emailInput = document.getElementById('user-email');
    const keyInput = document.getElementById('license-key');
    
    const email = emailInput.value;
    const licenseKey = keyInput.value;

    // 2. Kiểm tra input rỗng
    if (!email || !licenseKey) {
        updateLicenseStatusUI('error', 'Vui lòng nhập đầy đủ Email và License Key.');
        return;
    }

    // 3. Cập nhật UI sang trạng thái "Đang kiểm tra"
    updateLicenseStatusUI('checking', 'Đang kiểm tra, vui lòng đợi...');

    // 4. Gửi yêu cầu (fetch) đến server
    // *** CHÚ Ý: Đây là API GIẢ LẬP ***
    // Thay thế '/api/verify-license-pilegroup' bằng URL API thực tế của bạn
    try {
        const response = await fetch('/api/verify-license-pilegroup', {
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
            // 5. THÀNH CÔNG
            localStorage.setItem('pilegroupLicensed', 'true');
            updateLicenseStatusUI('success', data.message || 'Kích hoạt thành công! Không giới hạn số cọc.');
        } else {
            // 6. THẤT BẠI
            localStorage.setItem('pilegroupLicensed', 'false');
            updateLicenseStatusUI('error', data.message || 'Key hoặc Email không hợp lệ.');
        }

    } catch (error) {
        // 7. LỖI (Mạng, server sập, hoặc đang test offline)
        
        console.warn("Lỗi API thật, đang sử dụng logic giả lập offline.");
        // Giả lập 1s
        await new Promise(resolve => setTimeout(resolve, 1000)); 
        
        // ---- LOGIC GIẢ LẬP ĐỂ TEST ----
        if (licenseKey.toLowerCase().includes('valid')) {
            localStorage.setItem('pilegroupLicensed', 'true');
            updateLicenseStatusUI('success', 'Kích hoạt thành công! (Test). Không giới hạn số cọc.');
        } else {
            localStorage.setItem('pilegroupLicensed', 'false');
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
    const isLicensed = localStorage.getItem('pilegroupLicensed') === 'true';
    if (isLicensed) {
        updateLicenseStatusUI('success', 'Trạng thái: Đã kích hoạt. Không giới hạn số cọc.');
    } else {
        updateLicenseStatusUI('not_checked', 'Trạng thái: Chưa kích hoạt. Giới hạn 10 cọc.');
    }

    // 3. Gán sự kiện cho nút "Kiểm tra" CHÍNH (TRONG TAB BẢN QUYỀN)
    if (btnCheckInContent) {
        btnCheckInContent.addEventListener('click', handleLicenseCheck);
    }
    
    // 4. (Đã xóa logic cho btn-check-license-sidebar)
});