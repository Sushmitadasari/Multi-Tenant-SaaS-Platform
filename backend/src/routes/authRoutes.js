const express = require('express');
const router = express.Router();
const { check } = require('express-validator');

// Import Controllers (Destructuring matches exports.funcName)
const { registerTenant, login, getMe, logout } = require('../controllers/authController');

// Import Middleware (Destructuring matches module.exports = { verifyToken })
const { verifyToken } = require('../middleware/authMiddleware');

// Validation Logic
const registerValidation = [
    check('tenantName', 'Tenant Name is required').not().isEmpty(),
    check('subdomain', 'Subdomain is required').not().isEmpty(),
    check('adminEmail', 'Please include a valid email').isEmail(),
    check('adminPassword', 'Password must be 8 or more characters').isLength({ min: 8 })
];

// Routes
router.post('/register-tenant', registerValidation, registerTenant);
router.post('/login', login);

// Protected Routes
router.get('/me', verifyToken, getMe);
router.post('/logout', verifyToken, logout);

module.exports = router;