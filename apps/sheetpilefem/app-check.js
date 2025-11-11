/*
 * app-check.js (cho Sheet Pile FEM)
 *
 * Chịu trách nhiệm:
 * 1. Đọc trạng thái license từ localStorage khi tải trang.
 * 2. Xử lý sự kiện click cho các nút "Check License".
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

    // Xóa các lớp màu cũ
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

        // Giả sử server của bạn luôn trả về JSON
        const data = await response.json();

        if (response.ok && data.status === 'success') {
            // 4. THÀNH CÔNG
            // Lưu trạng thái đã kích hoạt vào localStorage
            localStorage.setItem('sheetpileLicensed', 'true');
            updateLicenseStatusUI('success', 'Kích hoạt thành công!');
        } else {
            // 5. THẤT BẠI (Server trả về lỗi, ví dụ: key sai, email không khớp)
            localStorage.setItem('sheetpileLicensed', 'false');
            updateLicenseStatusUI('error', data.message || 'Key hoặc Email không hợp lệ.');
        }

    } catch (error) {
        // 6. LỖI (Mạng, server sập, không thể kết nối)
        console.error('License check failed:', error);
        localStorage.setItem('sheetpileLicensed', 'false');
        updateLicenseStatusUI('error', 'Lỗi kết nối. Không thể xác thực. Vui lòng thử lại.');
    }
}

/**
 * KHỞI TẠO: Chờ DOM tải xong
 */
document.addEventListener('DOMContentLoaded', () => {
    // 1. Lấy các phần tử DOM
    const btnCheckInContent = document.getElementById('btn-check-license');
    const btnCheckInSidebar = document.getElementById('btn-check-license-sidebar');
    const licenseMenuLink = document.querySelector('a[data-target="div_license"]');
    
    // 2. Kiểm tra trạng thái đã lưu khi tải trang
    const isLicensed = localStorage.getItem('sheetpileLicensed') === 'true';
    if (isLicensed) {
        updateLicenseStatusUI('success', 'Đã kích hoạt');
    } else {
        updateLicenseStatusUI('not_checked', 'Chưa kích hoạt');
    }

    // 3. Gán sự kiện cho nút "Check License" TRONG SIDEBAR
    // (Nút này chỉ mở tab "Bản quyền")
    if (btnCheckInSidebar && licenseMenuLink) {
        btnCheckInSidebar.addEventListener('click', () => {
            licenseMenuLink.click();
        });
    }

    // 4. Gán sự kiện cho nút "Kiểm tra" CHÍNH (TRONG TAB BẢN QUYỀN)
    if (btnCheckInContent) {
        btnCheckInContent.addEventListener('click', handleLicenseCheck);
    }
});