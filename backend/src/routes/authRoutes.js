const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');

router.post('/register-tenant', authController.registerTenant);
router.post('/register', authController.register); // Keep for adding users to existing tenant
router.post('/login', authController.login);
router.post('/logout', protect, authController.logout);
router.get('/me', protect, authController.getMe); 

module.exports = router;