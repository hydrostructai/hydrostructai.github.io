/*
 * app-check.js (cho Pile Group)
 *
 * Chịu trách nhiệm (Kiến trúc MỚI):
 * 1. Đọc trạng thái license từ localStorage khi tải trang.
 * 2. Xử lý sự kiện click cho các nút "Check License" (trong tab và trên sidebar).
 * 3. Gửi yêu cầu (fetch) đến server (giả lập API) để xác thực email và key.
 * 4. Cập nhật localStorage và UI (màu sắc, text) dựa trên kết quả.
 *
 * Tệp này KHÔNG còn trách nhiệm tải WASM hay quản lý UI nhập liệu.
 */

/**
 * Hàm trợ giúp cập nhật UI cho trạng thái license
 * @param {string} status - Loại trạng thái ('success', 'error', 'checking', 'not_checked')
 * @param {string} message - Tin nhắn để hiển thị
 */
function updateLicenseStatusUI(status, message) {
    // ID này đến từ index.html mới
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
 * (Đây là hàm async vì nó sử dụng fetch)
 */
async function handleLicenseCheck() {
    // 1. Lấy dữ liệu từ input
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

        // Giả sử server của bạn luôn trả về JSON
        const data = await response.json();

        if (response.ok && data.status === 'success') {
            // 5. THÀNH CÔNG
            // Lưu trạng thái đã kích hoạt vào localStorage
            localStorage.setItem('pilegroupLicensed', 'true');
            updateLicenseStatusUI('success', data.message || 'Kích hoạt thành công!');
        } else {
            // 6. THẤT BẠI (Server trả về lỗi, ví dụ: key sai, email không khớp)
            localStorage.setItem('pilegroupLicensed', 'false');
            updateLicenseStatusUI('error', data.message || 'Key hoặc Email không hợp lệ.');
        }

    } catch (error) {
        // 7. LỖI (Mạng, server sập, không thể kết nối)
        
        // ---- GIẢ LẬP OFFLINE ĐỂ TEST ----
        // (Vì chúng ta không có API thật, tôi sẽ giả lập ở đây)
        console.warn("Đang sử dụng logic giả lập API (offline test).");
        await new Promise(resolve => setTimeout(resolve, 1000)); // Giả lập 1s
        
        // (Chúng ta không gọi wasmModule.checkLicense ở đây nữa, 
        // vì hàm đó chỉ kiểm tra định dạng. Việc xác thực thật
        // phải do server làm.)
        
        if (licenseKey.toLowerCase().includes('valid')) {
            localStorage.setItem('pilegroupLicensed', 'true');
            updateLicenseStatusUI('success', 'Kích hoạt thành công! (Test)');
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
    const btnCheckInSidebar = document.getElementById('btn-check-license-sidebar');
    const licenseMenuLink = document.querySelector('a[data-target="div_license"]');
    
    // 2. Kiểm tra trạng thái đã lưu khi tải trang
    const isLicensed = localStorage.getItem('pilegroupLicensed') === 'true';
    if (isLicensed) {
        updateLicenseStatusUI('success', 'Đã kích hoạt');
    } else {
        updateLicenseStatusUI('not_checked', 'Chưa kích hoạt');
    }

    // 3. Gán sự kiện cho nút "Check License" TRÊN SIDEBAR
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