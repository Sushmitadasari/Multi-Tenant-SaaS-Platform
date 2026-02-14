const express = require('express');
const router = express.Router();
const { getTenantDetails, updateTenant, listTenants } = require('../controllers/tenantController');
const { verifyToken, authorize } = require('../middleware/authMiddleware');

// Get all tenants (Super Admin only)
router.get('/', verifyToken, authorize(['super_admin']), listTenants);

// Get specific tenant details
router.get('/:tenantId', verifyToken, getTenantDetails);

// Update tenant
router.put('/:tenantId', verifyToken, updateTenant);

module.exports = router;