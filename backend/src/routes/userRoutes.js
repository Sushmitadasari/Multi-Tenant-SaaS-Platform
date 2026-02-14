const express = require('express');
const router = express.Router();
const { addUser, listUsers, updateUser, deleteUser } = require('../controllers/userController');
const { verifyToken, authorize } = require('../middleware/authMiddleware');
const { check } = require('express-validator');

// Note: Some routes are under /api/tenants/:tenantId/users and some under /api/users
// We will handle the routing structure in app.js

// Add User
router.post('/tenants/:tenantId/users', 
    verifyToken, 
    authorize(['tenant_admin']), 
    [
        check('email', 'Valid email is required').isEmail(),
        check('password', 'Password min 8 chars').isLength({ min: 8 }),
        check('fullName', 'Name is required').not().isEmpty()
    ],
    addUser
);

// List Users
router.get('/tenants/:tenantId/users', verifyToken, listUsers);

// Update User
router.put('/users/:userId', verifyToken, updateUser);

// Delete User
router.delete('/users/:userId', verifyToken, authorize(['tenant_admin']), deleteUser);

module.exports = router;