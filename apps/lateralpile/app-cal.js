/*
 * app-cal.js (cho Lateral Pile - BACKEND-STYLE VALIDATION)
 *
 * Responsibilities:
 * 1. Backend-style limit enforcement for soil layer creation
 * 2. Implement strict validation: FREE = 1 layer, PRO = unlimited
 * 3. Prevent race conditions with atomic checks
 * 4. Return proper error responses (403 Forbidden)
 */

// Import license configuration from app-check.js
// Note: In a real backend, this would be imported from a shared config module
const LICENSE_CONFIG = {
    APP_NAME: 'lateralpile',
    STORAGE_KEY: 'lateralpileLicensed',
    FREE_LIMIT: 1,  // Max soil layers in FREE mode
    LIMIT_MESSAGE: 'Giới hạn 1 lớp đất',
    API_ENDPOINT: '/api/verify-license-lateralpile'
};

/**
 * BACKEND-STYLE VALIDATION SERVICE
 * 
 * This function simulates backend validation logic that would run on the server.
 * In a real backend, this would be in a controller/service layer.
 */

/**
 * Get user's subscription plan
 * Simulates retrieving from User/Organization model or session context
 * @returns {Promise<string>} - "FREE" or "PAID"
 */
async function getUserPlan() {
    // Simulate async database/session lookup
    await new Promise(resolve => setTimeout(resolve, 10));
    
    // In real backend: return await User.findById(userId).select('subscription_plan');
    const isLicensed = localStorage.getItem(LICENSE_CONFIG.STORAGE_KEY) === 'true';
    return isLicensed ? 'PAID' : 'FREE';
}

/**
 * Count existing soil layers for a project
 * Simulates database query: SELECT COUNT(*) FROM soil_layers WHERE project_id = ?
 * @param {string|number} projectId - Current project ID
 * @returns {Promise<number>} - Count of existing soil layers
 */
async function countExistingSoilLayers(projectId) {
    // Simulate async database query
    await new Promise(resolve => setTimeout(resolve, 10));
    
    // In real backend: return await SoilLayer.countDocuments({ projectId });
    // For client-side: count DOM rows
    const soilLayerRows = document.querySelectorAll('#soil-layer-table tbody tr');
    return soilLayerRows.length;
}

/**
 * BACKEND-STYLE VALIDATION: Enforce subscription limits before creation
 * 
 * This function implements the strict validation logic as specified:
 * - FREE plan: Block if existing_layer_count >= 1
 * - PAID plan: Allow unlimited
 * 
 * @param {string|number} projectId - Current project ID
 * @returns {Promise<{success: boolean, error?: {code: number, message: string}}>}
 */
async function validateSoilLayerCreation(projectId) {
    try {
        // Step 1: Identify the User's Plan
        const userPlan = await getUserPlan();
        
        // Step 2: Count Existing Layers
        const existingLayerCount = await countExistingSoilLayers(projectId);
        
        // Step 3: Implement Validation Logic
        if (userPlan === 'FREE' && existingLayerCount >= LICENSE_CONFIG.FREE_LIMIT) {
            // Block the creation request immediately
            // Throw a strict 403 Forbidden error
            return {
                success: false,
                error: {
                    code: 403,
                    message: `Free plan limit reached. You can only define ${LICENSE_CONFIG.FREE_LIMIT} soil layer. Please upgrade to create more.`
                }
            };
        }
        
        // IF user is on PAID plan: Proceed with creation normally (no limit)
        if (userPlan === 'PAID') {
            return { success: true };
        }
        
        // FREE plan but under limit: Allow creation
        if (userPlan === 'FREE' && existingLayerCount < LICENSE_CONFIG.FREE_LIMIT) {
            return { success: true };
        }
        
        // Fallback (should not reach here)
        return {
            success: false,
            error: {
                code: 500,
                message: 'Unexpected validation error'
            }
        };
        
    } catch (error) {
        // Handle unexpected errors
        console.error('Validation error:', error);
        return {
            success: false,
            error: {
                code: 500,
                message: `Internal validation error: ${error.message}`
            }
        };
    }
}

/**
 * ATOMIC OPERATION: Create Soil Layer with Transaction-like Lock
 * 
 * This function uses a mutex-like pattern to prevent race conditions
 * (e.g., double-clicking allowing 2 layers)
 * 
 * @param {Object} layerData - Soil layer data to create
 * @param {string|number} projectId - Current project ID
 * @returns {Promise<{success: boolean, data?: Object, error?: Object}>}
 */
let isCreatingLayer = false; // Simple mutex flag

async function createSoilLayer(layerData, projectId) {
    // Prevent concurrent creation attempts (race condition protection)
    if (isCreatingLayer) {
        return {
            success: false,
            error: {
                code: 409, // Conflict
                message: 'Another layer creation is in progress. Please wait.'
            }
        };
    }
    
    try {
        isCreatingLayer = true; // Lock
        
        // Step 1: Validate before creation (BACKEND-STYLE CHECK)
        const validation = await validateSoilLayerCreation(projectId);
        
        if (!validation.success) {
            // Return error immediately (403 Forbidden)
            return validation;
        }
        
        // Step 2: Proceed with creation (simulate database insert)
        // In real backend: await SoilLayer.create({ ...layerData, projectId });
        
        // For client-side: Add to DOM
        const tableBody = document.querySelector('#soil-layer-table tbody');
        if (!tableBody) {
            throw new Error('Soil layer table not found');
        }
        
        const newRow = document.createElement('tr');
        newRow.innerHTML = `
            <td><input type="number" value="${layerData.depth || ''}" step="0.1"></td>
            <td><input type="number" value="${layerData.gamma || ''}" step="0.1"></td>
            <td><input type="number" value="${layerData.gamma_sat || ''}" step="0.1"></td>
            <td><input type="number" value="${layerData.phi || ''}" step="0.1"></td>
            <td><input type="number" value="${layerData.c_prime || ''}" step="0.1"></td>
            <td><input type="number" value="${layerData.k_modul || ''}" step="0.1"></td>
            <td>
                <button class="btn btn-sm btn-danger remove-layer-btn">
                    <i class="bi bi-trash"></i> Xóa
                </button>
            </td>
        `;
        
        tableBody.appendChild(newRow);
        
        // Attach delete handler
        const deleteBtn = newRow.querySelector('.remove-layer-btn');
        if (deleteBtn) {
            deleteBtn.addEventListener('click', () => {
                newRow.remove();
            });
        }
        
        return {
            success: true,
            data: {
                id: Date.now(), // Simulated ID
                ...layerData
            }
        };
        
    } catch (error) {
        console.error('Error creating soil layer:', error);
        return {
            success: false,
            error: {
                code: 500,
                message: `Failed to create soil layer: ${error.message}`
            }
        };
    } finally {
        isCreatingLayer = false; // Unlock
    }
}

/**
 * Handler for "Add Soil Layer" button
 * This is the entry point that calls the backend-style validation
 */
async function handleAddSoilLayer() {
    const projectId = 'current-project'; // In real app, get from context
    
    // Gather layer data from form (if any default values)
    const layerData = {
        depth: 0,
        gamma: 18,
        gamma_sat: 20,
        phi: 30,
        c_prime: 0,
        k_modul: 10000
    };
    
    // Call backend-style creation function
    const result = await createSoilLayer(layerData, projectId);
    
    if (!result.success) {
        // Display error message
        const errorCode = result.error.code;
        const errorMessage = result.error.message;
        
        if (errorCode === 403) {
            // 403 Forbidden - Show upgrade message
            alert(`❌ ${errorMessage}\n\nVui lòng kích hoạt bản quyền PRO để tạo thêm lớp đất.`);
            
            // Navigate to license tab if exists
            const licenseTab = document.getElementById('tab-license');
            if (licenseTab) {
                licenseTab.click();
            }
        } else {
            // Other errors
            alert(`❌ Lỗi: ${errorMessage}`);
        }
        
        return;
    }
    
    // Success - layer created
    console.log('✅ Soil layer created successfully:', result.data);
}

/**
 * Initialize event listeners
 */
document.addEventListener('DOMContentLoaded', () => {
    const addLayerBtn = document.getElementById('btn-add-soil-layer');
    
    if (addLayerBtn) {
        addLayerBtn.addEventListener('click', handleAddSoilLayer);
    }
    
    // Also handle delete buttons for existing rows
    document.querySelectorAll('.remove-layer-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            this.closest('tr').remove();
        });
    });
});

/**
 * Export functions for use in other modules
 * In a real backend, these would be exported from a service module
 */
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        validateSoilLayerCreation,
        createSoilLayer,
        getUserPlan,
        countExistingSoilLayers
    };
}


