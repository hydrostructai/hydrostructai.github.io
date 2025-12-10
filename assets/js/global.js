/**
 * GLOBAL UI LIBRARY - ENGINEERING APPS
 * Dùng chung cho SheetPile FEM và Pile Group
 * Version: 1.0.0
 */

const AppUI = {
    // --- 1. Quản lý Màn hình chờ (Loading Overlay) ---
    overlay: {
        /**
         * Hiện màn hình chờ
         * @param {string} message - Thông báo (VD: "Đang tính toán...")
         */
        show: (message = "Đang xử lý dữ liệu...") => {
            const overlay = document.getElementById('loading-overlay');
            const textEl = overlay ? overlay.querySelector('.loading-text') : null;
            
            if (overlay) {
                if (textEl) textEl.innerHTML = `<i class="bi bi-hourglass-split"></i> ${message}`;
                overlay.style.visibility = 'visible';
                overlay.style.opacity = '1';
            }
        },

        /**
         * Ẩn màn hình chờ với hiệu ứng fade-out
         */
        hide: () => {
            const overlay = document.getElementById('loading-overlay');
            if (overlay) {
                overlay.style.opacity = '0';
                // Đợi transition css kết thúc (300ms) rồi ẩn hẳn
                setTimeout(() => {
                    overlay.style.visibility = 'hidden';
                }, 300);
            }
        }
    },

    // --- 2. Quản lý Thông báo (Toast/Alerts) ---
    toast: {
        /**
         * Hiển thị thông báo nổi
         * @param {string} message - Nội dung thông báo
         * @param {string} type - 'success' | 'danger' | 'warning' | 'info'
         * @param {number} duration - Thời gian hiện (ms), mặc định 3000ms
         */
        show: (message, type = 'success', duration = 3000) => {
            // Kiểm tra xem container chứa toast đã có chưa, nếu chưa thì tạo
            let container = document.getElementById('toast-container-global');
            if (!container) {
                container = document.createElement('div');
                container.id = 'toast-container-global';
                container.style.cssText = "position: fixed; top: 20px; right: 20px; z-index: 10000; min-width: 300px;";
                document.body.appendChild(container);
            }

            // Tạo phần tử thông báo
            const toastId = 'toast-' + Date.now();
            const icon = type === 'success' ? 'check-circle-fill' : 
                         type === 'danger' ? 'exclamation-triangle-fill' : 
                         type === 'warning' ? 'exclamation-circle-fill' : 'info-circle-fill';
            
            const alertDiv = document.createElement('div');
            alertDiv.className = `alert alert-${type} shadow-sm d-flex align-items-center mb-2 fade show`;
            alertDiv.setAttribute('role', 'alert');
            alertDiv.id = toastId;
            alertDiv.innerHTML = `
                <i class="bi bi-${icon} me-2 fs-5"></i>
                <div class="flex-grow-1 fw-medium">${message}</div>
                <button type="button" class="btn-close ms-2" data-bs-dismiss="alert" aria-label="Close"></button>
            `;

            container.appendChild(alertDiv);

            // Tự động xóa sau thời gian quy định
            setTimeout(() => {
                const element = document.getElementById(toastId);
                if (element) {
                    element.classList.remove('show'); // Trigger CSS transition
                    setTimeout(() => element.remove(), 300); // Remove from DOM
                }
            }, duration);
        }
    },

    // --- 3. Quản lý Trạng thái Nút bấm (Button States) ---
    button: {
        /**
         * Đặt trạng thái Loading cho nút (Disable + Spinner)
         * @param {string} btnId - ID của nút
         * @param {boolean} isLoading - True: đang tải, False: bình thường
         * @param {string} loadingText - Text hiển thị khi đang tải (tùy chọn)
         */
        setLoading: (btnId, isLoading, loadingText = null) => {
            const btn = document.getElementById(btnId);
            if (!btn) return;

            if (isLoading) {
                // Lưu text gốc để restore sau này
                if (!btn.dataset.originalText) btn.dataset.originalText = btn.innerHTML;
                
                btn.disabled = true;
                // Tìm spinner có sẵn hoặc tạo icon loading
                const spinnerHtml = `<span class="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>`;
                btn.innerHTML = spinnerHtml + (loadingText || "Đang tính...");
                btn.classList.add('disabled');
            } else {
                btn.disabled = false;
                // Khôi phục text gốc
                if (btn.dataset.originalText) {
                    btn.innerHTML = btn.dataset.originalText;
                }
                btn.classList.remove('disabled');
            }
        }
    },

    // --- 4. Quản lý Bảng dữ liệu (Table Operations) ---
    table: {
        /**
         * Xóa hàng chứa nút bấm và đánh lại số thứ tự
         * @param {HTMLElement} btnElement - Nút xóa (this)
         */
        removeRow: (btnElement) => {
            if (!confirm('Bạn có chắc chắn muốn xóa dòng này không?')) return;
            
            const row = btnElement.closest('tr');
            const tbody = row.closest('tbody');
            
            // Hiệu ứng xóa
            row.style.backgroundColor = '#ffebee';
            row.style.transition = 'all 0.3s';
            
            setTimeout(() => {
                row.remove();
                AppUI.table.reindex(tbody);
            }, 200);
        },

        /**
         * Đánh lại số thứ tự (Cột đầu tiên) cho toàn bộ bảng
         * @param {HTMLElement} tbodyElement 
         */
        reindex: (tbodyElement) => {
            if (!tbodyElement) return;
            const rows = tbodyElement.querySelectorAll('tr');
            rows.forEach((row, index) => {
                // Giả định cột STT là cột đầu tiên (index 0)
                const sttCell = row.cells[0]; 
                if (sttCell) sttCell.textContent = index + 1;
            });
        },

        /**
         * Lấy dữ liệu từ bảng ra mảng Object
         * @param {string} tableId - ID của bảng
         * @param {Array} keys - Mảng tên key tương ứng với từng cột input [null, 'depth', 'load', ...]
         */
        getData: (tableId, keys) => {
            const table = document.getElementById(tableId);
            if (!table) return [];
            
            const data = [];
            const rows = table.querySelectorAll('tbody tr');
            
            rows.forEach(row => {
                const rowData = {};
                const inputs = row.querySelectorAll('input, select');
                
                // Duyệt qua các input trong hàng
                inputs.forEach((input, index) => {
                    // +1 vì cột STT thường không có input, cần map đúng với mảng keys
                    // Logic này tùy thuộc cấu trúc bảng, nên điều chỉnh nếu cần
                    // Cách tốt hơn: Dựa vào index của td chứa input
                    const cellIndex = input.closest('td').cellIndex;
                    const key = keys[cellIndex];
                    
                    if (key) {
                        rowData[key] = isNaN(input.value) || input.value === '' ? input.value : parseFloat(input.value);
                    }
                });
                data.push(rowData);
            });
            return data;
        },

        /**
         * Xóa sạch dữ liệu trong bảng
         */
        clear: (tableId) => {
            const tbody = document.querySelector(`#${tableId} tbody`);
            if (tbody) tbody.innerHTML = '';
        }
    },

    // --- 5. Quản lý File (Import/Export) ---
    file: {
        /**
         * Kích hoạt hộp thoại chọn file
         * @param {string} inputId - ID của thẻ input type="file" ẩn
         */
        triggerOpen: (inputId = 'hidden-file-input') => {
            const input = document.getElementById(inputId);
            if (input) {
                input.value = ''; // Reset để chọn lại file cũ vẫn trigger change
                input.click();
            } else {
                console.error(`Không tìm thấy input file với ID: ${inputId}`);
            }
        },

        /**
         * Tải nội dung xuống máy người dùng
         * @param {string} content - Nội dung text/csv/json
         * @param {string} fileName - Tên file
         * @param {string} mimeType - Loại file
         */
        download: (content, fileName, mimeType = 'text/plain') => {
            const blob = new Blob([content], { type: mimeType });
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = fileName;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            window.URL.revokeObjectURL(url);
        }
    },

    // --- 6. Tiện ích định dạng (Utilities) ---
    format: {
        /**
         * Định dạng số thập phân an toàn
         */
        number: (num, decimals = 2) => {
            if (num === null || num === undefined || isNaN(num)) return '-';
            return parseFloat(num).toFixed(decimals);
        }
    },

    // --- 7. Quản lý License (Cơ bản) ---
    license: {
        STORAGE_KEY: 'engineering_app_license',
        
        save: (key) => {
            localStorage.setItem(AppUI.license.STORAGE_KEY, key);
        },
        
        get: () => {
            return localStorage.getItem(AppUI.license.STORAGE_KEY);
        },

        /**
         * Kiểm tra nhanh xem key có chứa từ khóa 'pro' không (Demo logic)
         */
        isPro: () => {
            const key = localStorage.getItem(AppUI.license.STORAGE_KEY) || '';
            return key.toLowerCase().includes('pro') || key.toLowerCase().includes('valid');
        }
    }
};

// Tự động khởi chạy các thiết lập mặc định khi trang load
document.addEventListener('DOMContentLoaded', () => {
    // 1. Kích hoạt tooltips Bootstrap (nếu dùng)
    if (typeof bootstrap !== 'undefined') {
        const tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'));
        tooltipTriggerList.map(function (tooltipTriggerEl) {
            return new bootstrap.Tooltip(tooltipTriggerEl);
        });
    } else {
        console.warn("Bootstrap JS not found. Tooltips skipped.");
    }

    console.log("Global UI Library Loaded Successfully.");
});