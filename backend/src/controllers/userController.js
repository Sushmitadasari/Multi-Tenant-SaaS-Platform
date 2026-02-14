const db = require('../config/db');
const bcrypt = require('bcrypt');
const logAction = require('../utils/auditLogger');

// API 8: Add User to Tenant
exports.addUser = async (req, res) => {
    const { tenantId } = req.params;
    const { email, password, fullName, role } = req.body;

    // Authorization: Only Tenant Admin can add users
    if (req.user.role !== 'tenant_admin' || req.user.tenantId !== tenantId) {
        return res.status(403).json({ success: false, message: 'Unauthorized' });
    }

    const client = await db.pool.connect();

    try {
        await client.query('BEGIN');

        // 1. Check Subscription Limits
        const tenantRes = await client.query('SELECT max_users FROM tenants WHERE id = $1', [tenantId]);
        const userCountRes = await client.query('SELECT COUNT(*) FROM users WHERE tenant_id = $1', [tenantId]);
        
        const maxUsers = tenantRes.rows[0].max_users;
        const currentUsers = parseInt(userCountRes.rows[0].count);

        if (currentUsers >= maxUsers) {
            await client.query('ROLLBACK');
            return res.status(403).json({ success: false, message: 'Subscription user limit reached' });
        }

        // 2. Check if email exists in this tenant
        const emailCheck = await client.query('SELECT id FROM users WHERE tenant_id = $1 AND email = $2', [tenantId, email]);
        if (emailCheck.rows.length > 0) {
            await client.query('ROLLBACK');
            return res.status(409).json({ success: false, message: 'Email already exists in this organization' });
        }

        // 3. Create User
        const hashedPassword = await bcrypt.hash(password, 10);
        const newUser = await client.query(
            `INSERT INTO users (tenant_id, email, password_hash, full_name, role)
             VALUES ($1, $2, $3, $4, $5)
             RETURNING id, email, full_name, role, is_active, created_at`,
            [tenantId, email, hashedPassword, fullName, role || 'user']
        );

        await client.query('COMMIT');
        
        logAction(tenantId, req.user.userId, 'CREATE_USER', 'user', newUser.rows[0].id, req.ip);

        res.status(201).json({
            success: true,
            message: 'User created successfully',
            data: { ...newUser.rows[0], tenantId }
        });

    } catch (error) {
        await client.query('ROLLBACK');
        res.status(500).json({ success: false, message: error.message });
    } finally {
        client.release();
    }
};

// API 9: List Tenant Users
exports.listUsers = async (req, res) => {
    const { tenantId } = req.params;
    const { search, role, page = 1, limit = 50 } = req.query;
    const offset = (page - 1) * limit;

    // Security: Ensure user belongs to this tenant
    if (req.user.role !== 'super_admin' && req.user.tenantId !== tenantId) {
        return res.status(403).json({ success: false, message: 'Unauthorized' });
    }

    try {
        let query = 'SELECT id, email, full_name, role, is_active, created_at FROM users WHERE tenant_id = $1';
        const values = [tenantId];
        let paramCounter = 2;

        if (search) {
            query += ` AND (email ILIKE $${paramCounter} OR full_name ILIKE $${paramCounter})`;
            values.push(`%${search}%`);
            paramCounter++;
        }
        if (role) {
            query += ` AND role = $${paramCounter}`;
            values.push(role);
            paramCounter++;
        }

        // Get total count
        const countQuery = query.replace('SELECT id, email, full_name, role, is_active, created_at', 'SELECT COUNT(*)');
        const countRes = await db.query(countQuery, values);
        const total = parseInt(countRes.rows[0].count);

        // Pagination
        query += ` ORDER BY created_at DESC LIMIT $${paramCounter} OFFSET $${paramCounter + 1}`;
        values.push(limit, offset);

        const result = await db.query(query, values);

        res.status(200).json({
            success: true,
            data: {
                users: result.rows,
                total,
                pagination: {
                    currentPage: parseInt(page),
                    totalPages: Math.ceil(total / limit),
                    limit: parseInt(limit)
                }
            }
        });

    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// API 10: Update User
exports.updateUser = async (req, res) => {
    const { userId } = req.params;
    const { fullName, role, isActive } = req.body;
    
    // Security Checks
    // 1. Tenant Admin can update anyone in their tenant
    // 2. Regular User can only update their own fullName
    const isSelf = req.user.userId === userId;
    const isAdmin = req.user.role === 'tenant_admin';

    if (!isSelf && !isAdmin) {
        return res.status(403).json({ success: false, message: 'Unauthorized' });
    }

    try {
        // Verify user belongs to requester's tenant (Data Isolation)
        const userCheck = await db.query('SELECT tenant_id FROM users WHERE id = $1', [userId]);
        if (userCheck.rows.length === 0) return res.status(404).json({ success: false, message: 'User not found' });
        
        if (userCheck.rows[0].tenant_id !== req.user.tenantId && req.user.role !== 'super_admin') {
            return res.status(403).json({ success: false, message: 'Unauthorized access to other tenant data' });
        }

        let query = 'UPDATE users SET updated_at = NOW()';
        const values = [];
        let paramCounter = 1;

        if (fullName) {
            query += `, full_name = $${paramCounter}`;
            values.push(fullName);
            paramCounter++;
        }

        // Only Admin can update role/status
        if (isAdmin) {
            if (role) {
                query += `, role = $${paramCounter}`;
                values.push(role);
                paramCounter++;
            }
            if (isActive !== undefined) {
                query += `, is_active = $${paramCounter}`;
                values.push(isActive);
                paramCounter++;
            }
        } else if (role || isActive !== undefined) {
            return res.status(403).json({ success: false, message: 'Only admins can change role or status' });
        }

        query += ` WHERE id = $${paramCounter} RETURNING id, full_name, role, is_active, updated_at`;
        values.push(userId);

        const result = await db.query(query, values);

        logAction(req.user.tenantId, req.user.userId, 'UPDATE_USER', 'user', userId, req.ip);

        res.status(200).json({
            success: true,
            message: 'User updated successfully',
            data: result.rows[0]
        });

    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// API 11: Delete User
exports.deleteUser = async (req, res) => {
    const { userId } = req.params;

    if (req.user.role !== 'tenant_admin') {
        return res.status(403).json({ success: false, message: 'Unauthorized' });
    }

    if (req.user.userId === userId) {
        return res.status(403).json({ success: false, message: 'Cannot delete yourself' });
    }

    const client = await db.pool.connect();

    try {
        await client.query('BEGIN');

        // Verify Tenant Isolation
        const userCheck = await client.query('SELECT tenant_id FROM users WHERE id = $1', [userId]);
        if (userCheck.rows.length === 0) {
            await client.query('ROLLBACK');
            return res.status(404).json({ success: false, message: 'User not found' });
        }
        if (userCheck.rows[0].tenant_id !== req.user.tenantId) {
            await client.query('ROLLBACK');
            return res.status(403).json({ success: false, message: 'Unauthorized' });
        }

        // Unassign tasks (Handle constraints manually to be safe)
        await client.query('UPDATE tasks SET assigned_to = NULL WHERE assigned_to = $1', [userId]);

        // Delete User
        await client.query('DELETE FROM users WHERE id = $1', [userId]);

        await client.query('COMMIT');
        
        logAction(req.user.tenantId, req.user.userId, 'DELETE_USER', 'user', userId, req.ip);

        res.status(200).json({ success: true, message: 'User deleted successfully' });

    } catch (error) {
        await client.query('ROLLBACK');
        res.status(500).json({ success: false, message: error.message });
    } finally {
        client.release();
    }
};