const db = require('../config/db');
const logAction = require('../utils/auditLogger');

// API 5: Get Tenant Details
exports.getTenantDetails = async (req, res) => {
    const { tenantId } = req.params;

    // Security Check: Users can only see their own tenant, unless Super Admin
    if (req.user.role !== 'super_admin' && req.user.tenantId !== tenantId) {
        return res.status(403).json({ success: false, message: 'Unauthorized access to this tenant' });
    }

    try {
        const tenantRes = await db.query('SELECT * FROM tenants WHERE id = $1', [tenantId]);
        if (tenantRes.rows.length === 0) {
            return res.status(404).json({ success: false, message: 'Tenant not found' });
        }

        // Calculate Stats
        const userCount = await db.query('SELECT COUNT(*) FROM users WHERE tenant_id = $1', [tenantId]);
        const projectCount = await db.query('SELECT COUNT(*) FROM projects WHERE tenant_id = $1', [tenantId]);
        const taskCount = await db.query('SELECT COUNT(*) FROM tasks WHERE tenant_id = $1', [tenantId]);

        const tenant = tenantRes.rows[0];
        tenant.stats = {
            totalUsers: parseInt(userCount.rows[0].count),
            totalProjects: parseInt(projectCount.rows[0].count),
            totalTasks: parseInt(taskCount.rows[0].count)
        };

        res.status(200).json({ success: true, data: tenant });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// API 6: Update Tenant
exports.updateTenant = async (req, res) => {
    const { tenantId } = req.params;
    const { name, status, subscriptionPlan, maxUsers, maxProjects } = req.body;
    const { role } = req.user;

    // Authorization: Only Tenant Admin or Super Admin
    if (role !== 'super_admin' && role !== 'tenant_admin') {
        return res.status(403).json({ success: false, message: 'Unauthorized' });
    }
    
    // Security Check: Tenant Admin can only update their own tenant
    if (role === 'tenant_admin' && req.user.tenantId !== tenantId) {
        return res.status(403).json({ success: false, message: 'Unauthorized' });
    }

    // Security Check: Tenant Admin can ONLY update name
    if (role === 'tenant_admin' && (status || subscriptionPlan || maxUsers || maxProjects)) {
        return res.status(403).json({ success: false, message: 'Tenant Admins can only update the name' });
    }

    try {
        // Construct dynamic query
        let query = 'UPDATE tenants SET updated_at = NOW()';
        const values = [];
        let paramCounter = 1;

        if (name) {
            query += `, name = $${paramCounter}`;
            values.push(name);
            paramCounter++;
        }
        
        // Only Super Admin can update these fields
        if (role === 'super_admin') {
            if (status) {
                query += `, status = $${paramCounter}`;
                values.push(status);
                paramCounter++;
            }
            if (subscriptionPlan) {
                query += `, subscription_plan = $${paramCounter}`;
                values.push(subscriptionPlan);
                paramCounter++;
            }
            if (maxUsers) {
                query += `, max_users = $${paramCounter}`;
                values.push(maxUsers);
                paramCounter++;
            }
            if (maxProjects) {
                query += `, max_projects = $${paramCounter}`;
                values.push(maxProjects);
                paramCounter++;
            }
        }

        query += ` WHERE id = $${paramCounter} RETURNING *`;
        values.push(tenantId);

        const result = await db.query(query, values);

        if (result.rows.length === 0) {
            return res.status(404).json({ success: false, message: 'Tenant not found' });
        }

        logAction(tenantId, req.user.userId, 'UPDATE_TENANT', 'tenant', tenantId, req.ip);

        res.status(200).json({
            success: true,
            message: 'Tenant updated successfully',
            data: result.rows[0]
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// API 7: List All Tenants (Super Admin Only)
exports.listTenants = async (req, res) => {
    if (req.user.role !== 'super_admin') {
        return res.status(403).json({ success: false, message: 'Access denied. Super Admin only.' });
    }

    const { page = 1, limit = 10, status, subscriptionPlan } = req.query;
    const offset = (page - 1) * limit;

    try {
        let query = 'SELECT * FROM tenants WHERE 1=1';
        const values = [];
        let paramCounter = 1;

        if (status) {
            query += ` AND status = $${paramCounter}`;
            values.push(status);
            paramCounter++;
        }
        if (subscriptionPlan) {
            query += ` AND subscription_plan = $${paramCounter}`;
            values.push(subscriptionPlan);
            paramCounter++;
        }

        // Get Total Count for Pagination
        const countQuery = query.replace('SELECT *', 'SELECT COUNT(*)');
        const countRes = await db.query(countQuery, values);
        const totalTenants = parseInt(countRes.rows[0].count);

        // Get Data
        query += ` ORDER BY created_at DESC LIMIT $${paramCounter} OFFSET $${paramCounter + 1}`;
        values.push(limit, offset);

        const result = await db.query(query, values);

        res.status(200).json({
            success: true,
            data: {
                tenants: result.rows,
                pagination: {
                    currentPage: parseInt(page),
                    totalPages: Math.ceil(totalTenants / limit),
                    totalTenants,
                    limit: parseInt(limit)
                }
            }
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};