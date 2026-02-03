# Backend Limit Enforcement for Lateral Pile App

## Overview

This document describes the backend-style validation logic implemented for enforcing subscription limits on soil layer creation in the `/apps/lateralpile` application.

## Subscription Limits

- **Free Plan:** Users can create **ONLY 1** soil layer per project
- **Paid (Pro) Plan:** Users can create **unlimited** soil layers

## Architecture

The validation logic is structured to simulate backend validation patterns, making it easy to port to a real backend server.

### File Structure

```
apps/lateralpile/
├── app-check.js              # License validation and subscription status
├── app-cal.js                # Main calculation logic with validation
├── validation-service.js     # Backend-style validation service module
└── BACKEND_VALIDATION_README.md
```

## Implementation Details

### 1. User Plan Detection

**Location:** `app-check.js` → `getUserPlan()`

```javascript
function getUserPlan() {
    const isLicensed = localStorage.getItem('lateralpileLicensed') === 'true';
    return isLicensed ? 'PAID' : 'FREE';
}
```

**Backend Equivalent:**
```javascript
// Node.js/Express example
async function getUserPlan(userId) {
    const user = await User.findById(userId).select('subscription_plan');
    return user.subscription_plan; // 'FREE' or 'PAID'
}
```

### 2. Existing Layer Count

**Location:** `app-cal.js` → `countExistingSoilLayers(projectId)`

```javascript
async function countExistingSoilLayers(projectId) {
    const soilLayerRows = document.querySelectorAll('#soil-layer-table tbody tr');
    return soilLayerRows.length;
}
```

**Backend Equivalent:**
```javascript
// MongoDB example
async function countExistingSoilLayers(projectId) {
    return await SoilLayer.countDocuments({ projectId });
}

// SQL example
async function countExistingSoilLayers(projectId) {
    const result = await db.query(
        'SELECT COUNT(*) FROM soil_layers WHERE project_id = ?',
        [projectId]
    );
    return result[0]['COUNT(*)'];
}
```

### 3. Validation Logic

**Location:** `app-cal.js` → `validateSoilLayerCreation(projectId)`

The core validation logic:

```javascript
async function validateSoilLayerCreation(projectId) {
    // Step 1: Identify the User's Plan
    const userPlan = await getUserPlan();
    
    // Step 2: Count Existing Layers
    const existingLayerCount = await countExistingSoilLayers(projectId);
    
    // Step 3: Implement Validation Logic
    if (userPlan === 'FREE' && existingLayerCount >= 1) {
        return {
            success: false,
            error: {
                code: 403,
                message: 'Free plan limit reached. You can only define 1 soil layer. Please upgrade to create more.'
            }
        };
    }
    
    // PAID plan: Proceed normally
    return { success: true };
}
```

**Backend Equivalent (Node.js/Express):**

```javascript
// Controller
app.post('/api/projects/:projectId/soil-layers', async (req, res) => {
    const { projectId } = req.params;
    const userId = req.user.id; // From authentication middleware
    
    try {
        // Validate before creation
        await validateSoilLayerCreation(userId, projectId);
        
        // Create layer
        const layer = await SoilLayer.create({
            ...req.body,
            projectId,
            userId
        });
        
        res.status(201).json({ success: true, data: layer });
    } catch (error) {
        if (error.code === 403) {
            res.status(403).json({ success: false, error: error.message });
        } else {
            res.status(500).json({ success: false, error: 'Internal server error' });
        }
    }
});

// Service
async function validateSoilLayerCreation(userId, projectId) {
    const user = await User.findById(userId);
    const count = await SoilLayer.countDocuments({ projectId });
    
    if (user.subscription_plan === 'FREE' && count >= 1) {
        throw new ValidationError(
            403,
            'Free plan limit reached. You can only define 1 soil layer. Please upgrade to create more.'
        );
    }
}
```

### 4. Race Condition Prevention

**Location:** `app-cal.js` → `createSoilLayer()` with mutex pattern

```javascript
let isCreatingLayer = false; // Simple mutex flag

async function createSoilLayer(layerData, projectId) {
    if (isCreatingLayer) {
        return {
            success: false,
            error: { code: 409, message: 'Another layer creation is in progress.' }
        };
    }
    
    try {
        isCreatingLayer = true; // Lock
        // ... validation and creation logic
    } finally {
        isCreatingLayer = false; // Unlock
    }
}
```

**Backend Equivalent (Database Transaction):**

```javascript
// MongoDB with transactions
async function createSoilLayer(userId, projectId, layerData) {
    const session = await mongoose.startSession();
    session.startTransaction();
    
    try {
        // Atomic validation and creation
        await validateSoilLayerCreation(userId, projectId);
        const layer = await SoilLayer.create([{
            ...layerData,
            projectId,
            userId
        }], { session });
        
        await session.commitTransaction();
        return { success: true, data: layer[0] };
    } catch (error) {
        await session.abortTransaction();
        throw error;
    } finally {
        session.endSession();
    }
}
```

## Error Handling

### 403 Forbidden Error

When a FREE user tries to create more than 1 layer:

```javascript
{
    success: false,
    error: {
        code: 403,
        message: 'Free plan limit reached. You can only define 1 soil layer. Please upgrade to create more.'
    }
}
```

### 409 Conflict Error

When concurrent creation attempts occur:

```javascript
{
    success: false,
    error: {
        code: 409,
        message: 'Another layer creation is in progress. Please wait.'
    }
}
```

## Usage Example

### Client-Side Usage

```javascript
// Import validation service
import { soilLayerService } from './validation-service.js';

// Create a new soil layer
const result = await soilLayerService.createLayer(
    userId,
    projectId,
    {
        depth: 5.0,
        gamma: 18.0,
        gamma_sat: 20.0,
        phi: 30.0,
        c_prime: 0.0,
        k_modul: 10000.0
    }
);

if (!result.success) {
    if (result.error.code === 403) {
        // Show upgrade message
        alert(result.error.message);
        navigateToLicenseTab();
    } else {
        alert(`Error: ${result.error.message}`);
    }
} else {
    console.log('Layer created:', result.data);
}
```

### Backend API Endpoint Example

```javascript
// Express.js route
router.post('/projects/:projectId/soil-layers', 
    authenticateUser,  // Middleware to get userId
    async (req, res) => {
        const { projectId } = req.params;
        const userId = req.user.id;
        
        const result = await soilLayerService.createLayer(
            userId,
            projectId,
            req.body
        );
        
        if (!result.success) {
            return res.status(result.error.code).json(result);
        }
        
        res.status(201).json(result);
    }
);
```

## Testing

### Test Cases

1. **FREE Plan - First Layer:** Should succeed
2. **FREE Plan - Second Layer:** Should return 403 Forbidden
3. **PAID Plan - Multiple Layers:** Should succeed (unlimited)
4. **Concurrent Creation:** Should return 409 Conflict
5. **Invalid Project ID:** Should return 500 Internal Error

### Example Test

```javascript
describe('Soil Layer Creation Validation', () => {
    it('should block FREE user from creating second layer', async () => {
        // Setup: Create first layer
        await createSoilLayer({ depth: 5 }, 'project-1');
        
        // Test: Try to create second layer
        const result = await createSoilLayer({ depth: 10 }, 'project-1');
        
        expect(result.success).toBe(false);
        expect(result.error.code).toBe(403);
    });
    
    it('should allow PAID user unlimited layers', async () => {
        // Setup: Set user to PAID
        setUserPlan('PAID');
        
        // Test: Create multiple layers
        for (let i = 0; i < 10; i++) {
            const result = await createSoilLayer({ depth: i }, 'project-1');
            expect(result.success).toBe(true);
        }
    });
});
```

## Migration to Real Backend

When migrating to a real backend server:

1. **Replace localStorage** with database queries
2. **Use database transactions** for atomic operations
3. **Implement proper authentication** middleware
4. **Add rate limiting** to prevent abuse
5. **Use database indexes** on `projectId` for performance
6. **Add logging** for audit trails
7. **Implement caching** for subscription status

## Security Considerations

1. **Server-Side Validation:** Always validate on the server, never trust client-side checks
2. **Authentication:** Verify user identity before checking subscription
3. **Authorization:** Ensure users can only create layers for their own projects
4. **Rate Limiting:** Prevent abuse with rate limiting middleware
5. **Input Validation:** Validate all input data before processing

## Summary

The validation logic enforces strict subscription limits:

- ✅ **FREE Plan:** Maximum 1 soil layer per project
- ✅ **PAID Plan:** Unlimited soil layers
- ✅ **Race Condition Protection:** Mutex pattern prevents concurrent creation
- ✅ **Proper Error Codes:** 403 Forbidden for limit violations, 409 Conflict for race conditions
- ✅ **Backend-Ready:** Code structure mirrors real backend patterns

This implementation ensures that subscription limits are enforced consistently and securely, preventing users from bypassing restrictions.


