/*
 * app-check.js (cho Lateral Pile - REFACTORED ARCHITECTURE)
 *
 * Responsibilities:
 * 1. Implement validateLicense(key) function with FREE/PRO logic
 * 2. Handle license check button events
 * 3. Update localStorage and UI based on validation
 * 4. Provide subscription status checking functions for backend validation
 */

const LICENSE_CONFIG = {
    APP_NAME: 'lateralpile',
    STORAGE_KEY: 'lateralpileLicensed',
    FREE_LIMIT: 1,  // Max soil layers in FREE mode
    LIMIT_MESSAGE: 'Giới hạn 1 lớp đất',
    API_ENDPOINT: '/api/verify-license-lateralpile'
};

/**
 * CORE FUNCTION: Validate License Key
 * @param {string} key - License key to validate
 * @returns {string} - "FREE" or "PRO"
 */
function validateLicense(key) {
    if (!key || key.trim() === '') {
        return 'FREE';
    }
    
    // Mock validation: key containing "valid" or "pro" = PRO mode
    const keyLower = key.toLowerCase();
    if (keyLower.includes('valid') || keyLower.includes('pro')) {
        return 'PRO';
    }
    
    return 'FREE';
}

/**
 * Get current user's subscription plan
 * This function simulates backend user plan retrieval
 * @returns {string} - "FREE" or "PAID"
 */
function getUserPlan() {
    const isLicensed = localStorage.getItem(LICENSE_CONFIG.STORAGE_KEY) === 'true';
    return isLicensed ? 'PAID' : 'FREE';
}

/**
 * Check if current configuration violates FREE mode limits
 * @returns {object} - {valid: boolean, message: string}
 */
function checkFreeModeRestrictions() {
    const soilLayerCount = document.querySelectorAll('#soil-layer-table tbody tr').length;
    
    if (soilLayerCount > LICENSE_CONFIG.FREE_LIMIT) {
        return {
            valid: false,
            message: `Phiên bản FREE giới hạn ${LICENSE_CONFIG.FREE_LIMIT} lớp đất. Hiện tại: ${soilLayerCount} lớp. Vui lòng kích hoạt bản quyền PRO.`
        };
    }
    
    return { valid: true, message: 'OK' };
}

/**
 * Update License Status UI
 * @param {string} status - Status type ('success', 'error', 'checking', 'not_checked')
 * @param {string} message - Display message
 */
function updateLicenseStatusUI(status, message) {
    const statusDiv = document.getElementById('license-status');
    if (!statusDiv) return;

    statusDiv.classList.remove('alert-success', 'alert-danger', 'alert-info', 'alert-secondary');

    switch (status) {
        case 'success':
            statusDiv.classList.add('alert-success');
            break;
        case 'error':
            statusDiv.classList.add('alert-danger');
            break;
        case 'checking':
            statusDiv.classList.add('alert-info');
            break;
        case 'not_checked':
        default:
            statusDiv.classList.add('alert-secondary');
            break;
    }
    statusDiv.textContent = message;
}

/**
 * Main License Check Handler
 */
async function handleLicenseCheck() {
    const emailInput = document.getElementById('user-email');
    const keyInput = document.getElementById('license-key');
    
    const email = emailInput ? emailInput.value : '';
    const licenseKey = keyInput ? keyInput.value : '';

    // 1. Validate inputs
    if (!email || !licenseKey) {
        updateLicenseStatusUI('error', 'Vui lòng nhập đầy đủ Email và License Key.');
        return;
    }

    // 2. Update UI to "checking" state
    updateLicenseStatusUI('checking', 'Đang kiểm tra, vui lòng đợi...');

    // 3. Try to reach API server
    try {
        const response = await fetch(LICENSE_CONFIG.API_ENDPOINT, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, licenseKey })
        });

        const data = await response.json();

        if (response.ok && data.status === 'success') {
            localStorage.setItem(LICENSE_CONFIG.STORAGE_KEY, 'true');
            updateLicenseStatusUI('success', data.message || 'Kích hoạt thành công! Phiên bản PRO.');
        } else {
            localStorage.setItem(LICENSE_CONFIG.STORAGE_KEY, 'false');
            updateLicenseStatusUI('error', data.message || 'Key hoặc Email không hợp lệ.');
        }

    } catch (error) {
        // 4. Fallback to mock validation (offline mode / API unavailable)
        console.warn("API không khả dụng. Sử dụng logic giả lập.");
        await new Promise(resolve => setTimeout(resolve, 800));
        
        const mode = validateLicense(licenseKey);
        
        if (mode === 'PRO') {
            localStorage.setItem(LICENSE_CONFIG.STORAGE_KEY, 'true');
            updateLicenseStatusUI('success', 'Kích hoạt thành công! (Offline mode). Phiên bản PRO.');
        } else {
            localStorage.setItem(LICENSE_CONFIG.STORAGE_KEY, 'false');
            updateLicenseStatusUI('error', `Key không hợp lệ. Phiên bản FREE giới hạn ${LICENSE_CONFIG.FREE_LIMIT} lớp đất.`);
        }
    }
}

/**
 * Initialize License System
 */
document.addEventListener('DOMContentLoaded', () => {
    const btnCheckLicense = document.getElementById('btn-check-license');
    
    // Display current license status
    const isLicensed = localStorage.getItem(LICENSE_CONFIG.STORAGE_KEY) === 'true';
    if (isLicensed) {
        updateLicenseStatusUI('success', `Trạng thái: Phiên bản PRO. Không giới hạn.`);
    } else {
        updateLicenseStatusUI('not_checked', `Trạng thái: Phiên bản FREE. ${LICENSE_CONFIG.LIMIT_MESSAGE}.`);
    }

    // Bind license check button
    if (btnCheckLicense) {
        btnCheckLicense.addEventListener('click', handleLicenseCheck);
    }
});


