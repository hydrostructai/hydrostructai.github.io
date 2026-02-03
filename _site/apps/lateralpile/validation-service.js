/**
 * BACKEND VALIDATION SERVICE MODULE
 * 
 * This module provides backend-style validation logic for soil layer creation.
 * In a real backend application, this would be implemented as:
 * - Node.js/Express: Controller + Service layer
 * - Python/Django: View + Service class
 * - Java/Spring: Controller + Service bean
 * 
 * The validation logic enforces strict subscription limits:
 * - FREE Plan: Maximum 1 soil layer per project
 * - PAID Plan: Unlimited soil layers
 */

/**
 * Validation Error Class
 * Represents a validation error with HTTP status code
 */
class ValidationError extends Error {
    constructor(code, message) {
        super(message);
        this.code = code;
        this.name = 'ValidationError';
    }
}

/**
 * BACKEND VALIDATION SERVICE
 * 
 * This service class simulates backend validation logic.
 * In a real backend, this would be a service class injected into controllers.
 */
class SoilLayerValidationService {
    constructor(config) {
        this.config = config || {
            FREE_LIMIT: 1,
            STORAGE_KEY: 'lateralpileLicensed'
        };
    }

    /**
     * Get user's subscription plan from database/session
     * 
     * REAL BACKEND IMPLEMENTATION EXAMPLE:
     * ```javascript
     * async getUserPlan(userId) {
     *     const user = await User.findById(userId).select('subscription_plan');
     *     return user.subscription_plan; // 'FREE' or 'PAID'
     * }
     * ```
     * 
     * @param {string|number} userId - User ID from session/auth context
     * @returns {Promise<string>} - "FREE" or "PAID"
     */
    async getUserPlan(userId) {
        // Simulate async database lookup
        await new Promise(resolve => setTimeout(resolve, 10));
        
        // CLIENT-SIDE: Check localStorage
        // BACKEND: Query database
        const isLicensed = localStorage.getItem(this.config.STORAGE_KEY) === 'true';
        return isLicensed ? 'PAID' : 'FREE';
    }

    /**
     * Count existing soil layers for a project
     * 
     * REAL BACKEND IMPLEMENTATION EXAMPLE:
     * ```javascript
     * async countExistingLayers(projectId) {
     *     return await SoilLayer.countDocuments({ projectId });
     * }
     * ```
     * 
     * @param {string|number} projectId - Project ID
     * @returns {Promise<number>} - Count of existing soil layers
     */
    async countExistingLayers(projectId) {
        // Simulate async database query
        await new Promise(resolve => setTimeout(resolve, 10));
        
        // CLIENT-SIDE: Count DOM rows
        // BACKEND: SELECT COUNT(*) FROM soil_layers WHERE project_id = ?
        const soilLayerRows = document.querySelectorAll('#soil-layer-table tbody tr');
        return soilLayerRows.length;
    }

    /**
     * BACKEND-STYLE VALIDATION: Enforce subscription limits
     * 
     * This is the core validation logic that would run on the server.
     * It performs atomic checks to prevent race conditions.
     * 
     * REAL BACKEND IMPLEMENTATION EXAMPLE:
     * ```javascript
     * async validateCreation(userId, projectId) {
     *     // Use database transaction for atomicity
     *     const session = await mongoose.startSession();
     *     session.startTransaction();
     *     
     *     try {
     *         const userPlan = await this.getUserPlan(userId);
     *         const count = await SoilLayer.countDocuments({ projectId }).session(session);
     *         
     *         if (userPlan === 'FREE' && count >= this.config.FREE_LIMIT) {
     *             await session.abortTransaction();
     *             throw new ValidationError(403, 'Free plan limit reached...');
     *         }
     *         
     *         await session.commitTransaction();
     *         return { success: true };
     *     } catch (error) {
     *         await session.abortTransaction();
     *         throw error;
     *     } finally {
     *         session.endSession();
     *     }
     * }
     * ```
     * 
     * @param {string|number} userId - User ID
     * @param {string|number} projectId - Project ID
     * @returns {Promise<{success: boolean, error?: ValidationError}>}
     * @throws {ValidationError} If validation fails
     */
    async validateCreation(userId, projectId) {
        // Step 1: Identify the User's Plan
        const userPlan = await this.getUserPlan(userId);
        
        // Step 2: Count Existing Layers (atomic query)
        const existingLayerCount = await this.countExistingLayers(projectId);
        
        // Step 3: Implement Validation Logic
        if (userPlan === 'FREE' && existingLayerCount >= this.config.FREE_LIMIT) {
            // Block the creation request immediately
            // Throw a strict 403 Forbidden error
            throw new ValidationError(
                403,
                `Free plan limit reached. You can only define ${this.config.FREE_LIMIT} soil layer. Please upgrade to create more.`
            );
        }
        
        // IF user is on PAID plan: Proceed with creation normally (no limit)
        // FREE plan but under limit: Allow creation
        return { success: true };
    }
}

/**
 * SOIL LAYER SERVICE
 * 
 * This service handles the business logic for soil layer operations.
 * In a real backend, this would be a service class with database operations.
 */
class SoilLayerService {
    constructor(validationService) {
        this.validationService = validationService;
        this.isCreating = false; // Mutex for preventing race conditions
    }

    /**
     * Create a new soil layer with validation
     * 
     * REAL BACKEND IMPLEMENTATION EXAMPLE:
     * ```javascript
     * async createLayer(userId, projectId, layerData) {
     *     // Validate first
     *     await this.validationService.validateCreation(userId, projectId);
     *     
     *     // Use database transaction
     *     const session = await mongoose.startSession();
     *     session.startTransaction();
     *     
     *     try {
     *         const layer = await SoilLayer.create([{
     *             ...layerData,
     *             projectId,
     *             userId,
     *             createdAt: new Date()
     *         }], { session });
     *         
     *         await session.commitTransaction();
     *         return { success: true, data: layer[0] };
     *     } catch (error) {
     *         await session.abortTransaction();
     *         throw error;
     *     } finally {
     *         session.endSession();
     *     }
     * }
     * ```
     * 
     * @param {string|number} userId - User ID
     * @param {string|number} projectId - Project ID
     * @param {Object} layerData - Soil layer data
     * @returns {Promise<{success: boolean, data?: Object, error?: Object}>}
     */
    async createLayer(userId, projectId, layerData) {
        // Prevent concurrent creation attempts (race condition protection)
        if (this.isCreating) {
            return {
                success: false,
                error: {
                    code: 409, // Conflict
                    message: 'Another layer creation is in progress. Please wait.'
                }
            };
        }
        
        try {
            this.isCreating = true; // Lock
            
            // Step 1: Validate before creation (BACKEND-STYLE CHECK)
            await this.validationService.validateCreation(userId, projectId);
            
            // Step 2: Proceed with creation
            // In real backend: await SoilLayer.create({ ...layerData, projectId });
            
            // CLIENT-SIDE: Add to DOM
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
            if (error instanceof ValidationError) {
                return {
                    success: false,
                    error: {
                        code: error.code,
                        message: error.message
                    }
                };
            }
            
            console.error('Error creating soil layer:', error);
            return {
                success: false,
                error: {
                    code: 500,
                    message: `Failed to create soil layer: ${error.message}`
                }
            };
        } finally {
            this.isCreating = false; // Unlock
        }
    }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        ValidationError,
        SoilLayerValidationService,
        SoilLayerService
    };
}

// Create singleton instances for client-side use
const validationService = new SoilLayerValidationService({
    FREE_LIMIT: 1,
    STORAGE_KEY: 'lateralpileLicensed'
});

const soilLayerService = new SoilLayerService(validationService);

// Make available globally
window.SoilLayerValidationService = SoilLayerValidationService;
window.SoilLayerService = SoilLayerService;
window.validationService = validationService;
window.soilLayerService = soilLayerService;


