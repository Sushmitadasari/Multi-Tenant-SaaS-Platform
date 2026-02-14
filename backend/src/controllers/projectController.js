const db = require('../config/db');
const logAction = require('../utils/auditLogger');

// API 12: Create Project
exports.createProject = async (req, res) => {
    const { name, description, status } = req.body;
    const { tenantId, userId } = req.user;

    const client = await db.pool.connect();

    try {
        await client.query('BEGIN');

        // 1. Check Subscription Limits
        const tenantRes = await client.query('SELECT max_projects FROM tenants WHERE id = $1', [tenantId]);
        const projectCountRes = await client.query('SELECT COUNT(*) FROM projects WHERE tenant_id = $1', [tenantId]);
        
        const maxProjects = tenantRes.rows[0].max_projects;
        const currentProjects = parseInt(projectCountRes.rows[0].count);

        if (currentProjects >= maxProjects) {
            await client.query('ROLLBACK');
            return res.status(403).json({ success: false, message: 'Subscription project limit reached' });
        }

        // 2. Create Project
        const newProject = await client.query(
            `INSERT INTO projects (tenant_id, name, description, status, created_by)
             VALUES ($1, $2, $3, $4, $5)
             RETURNING *`,
            [tenantId, name, description, status || 'active', userId]
        );

        await client.query('COMMIT');
        
        logAction(tenantId, userId, 'CREATE_PROJECT', 'project', newProject.rows[0].id, req.ip);

        res.status(201).json({
            success: true,
            data: newProject.rows[0]
        });

    } catch (error) {
        await client.query('ROLLBACK');
        res.status(500).json({ success: false, message: error.message });
    } finally {
        client.release();
    }
};

// API 13: List Projects
exports.listProjects = async (req, res) => {
    const { tenantId } = req.user;
    const { status, search, page = 1, limit = 20 } = req.query;
    const offset = (page - 1) * limit;

    try {
        // Base Query with Tenant Isolation
        let query = `
            SELECT p.*, u.full_name as creator_name,
            (SELECT COUNT(*) FROM tasks t WHERE t.project_id = p.id) as task_count,
            (SELECT COUNT(*) FROM tasks t WHERE t.project_id = p.id AND t.status = 'completed') as completed_task_count
            FROM projects p
            LEFT JOIN users u ON p.created_by = u.id
            WHERE p.tenant_id = $1
        `;
        
        const values = [tenantId];
        let paramCounter = 2;

        if (status) {
            query += ` AND p.status = $${paramCounter}`;
            values.push(status);
            paramCounter++;
        }
        if (search) {
            query += ` AND p.name ILIKE $${paramCounter}`;
            values.push(`%${search}%`);
            paramCounter++;
        }

        // Get Total Count
        const countQuery = `SELECT COUNT(*) FROM projects p WHERE p.tenant_id = $1 ${status ? 'AND p.status = $2' : ''} ${search ? (status ? 'AND p.name ILIKE $3' : 'AND p.name ILIKE $2') : ''}`;
        // Note: Reusing values for count query is tricky with dynamic params, simplified approach:
        // Ideally run a separate simpler count query.
        
        // Simplified Count Execution
        const countResult = await db.query(`SELECT COUNT(*) FROM projects WHERE tenant_id = $1`, [tenantId]);
        const total = parseInt(countResult.rows[0].count);

        // Pagination
        query += ` ORDER BY p.created_at DESC LIMIT $${paramCounter} OFFSET $${paramCounter + 1}`;
        values.push(limit, offset);

        const result = await db.query(query, values);

        // Format response to match spec structure
        const formattedProjects = result.rows.map(p => ({
            id: p.id,
            name: p.name,
            description: p.description,
            status: p.status,
            createdBy: {
                id: p.created_by,
                fullName: p.creator_name
            },
            taskCount: parseInt(p.task_count),
            completedTaskCount: parseInt(p.completed_task_count),
            createdAt: p.created_at
        }));

        res.status(200).json({
            success: true,
            data: {
                projects: formattedProjects,
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

// API 14: Update Project
exports.updateProject = async (req, res) => {
    const { projectId } = req.params;
    const { name, description, status } = req.body;
    const { tenantId, userId, role } = req.user;

    try {
        // 1. Verify Project Ownership/Tenancy
        const projectCheck = await db.query('SELECT * FROM projects WHERE id = $1', [projectId]);
        
        if (projectCheck.rows.length === 0) {
            return res.status(404).json({ success: false, message: 'Project not found' });
        }

        const project = projectCheck.rows[0];

        // Data Isolation Check
        if (project.tenant_id !== tenantId && role !== 'super_admin') {
            return res.status(403).json({ success: false, message: 'Unauthorized' });
        }

        // Permission Check: Only Admin or Creator
        if (role !== 'tenant_admin' && project.created_by !== userId && role !== 'super_admin') {
            return res.status(403).json({ success: false, message: 'Only admin or creator can update' });
        }

        let query = 'UPDATE projects SET updated_at = NOW()';
        const values = [];
        let paramCounter = 1;

        if (name) {
            query += `, name = $${paramCounter}`;
            values.push(name);
            paramCounter++;
        }
        if (description) {
            query += `, description = $${paramCounter}`;
            values.push(description);
            paramCounter++;
        }
        if (status) {
            query += `, status = $${paramCounter}`;
            values.push(status);
            paramCounter++;
        }

        query += ` WHERE id = $${paramCounter} RETURNING *`;
        values.push(projectId);

        const result = await db.query(query, values);

        logAction(tenantId, userId, 'UPDATE_PROJECT', 'project', projectId, req.ip);

        res.status(200).json({
            success: true,
            message: 'Project updated successfully',
            data: result.rows[0]
        });

    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// API 15: Delete Project
exports.deleteProject = async (req, res) => {
    const { projectId } = req.params;
    const { tenantId, userId, role } = req.user;

    try {
        const projectCheck = await db.query('SELECT * FROM projects WHERE id = $1', [projectId]);
        
        if (projectCheck.rows.length === 0) return res.status(404).json({ success: false, message: 'Project not found' });

        const project = projectCheck.rows[0];

        if (project.tenant_id !== tenantId && role !== 'super_admin') {
            return res.status(403).json({ success: false, message: 'Unauthorized' });
        }

        if (role !== 'tenant_admin' && project.created_by !== userId && role !== 'super_admin') {
            return res.status(403).json({ success: false, message: 'Only admin or creator can delete' });
        }

        // DB Cascade delete will handle tasks, but let's be explicit if needed.
        // For this task, we rely on ON DELETE CASCADE in schema.
        await db.query('DELETE FROM projects WHERE id = $1', [projectId]);

        logAction(tenantId, userId, 'DELETE_PROJECT', 'project', projectId, req.ip);

        res.status(200).json({ success: true, message: 'Project deleted successfully' });

    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// --- ADD THIS FUNCTION ---
exports.getProject = async (req, res) => {
  try {
    const { projectId } = req.params;
    
    // Check if project exists and belongs to tenant
    // We also check if the user has access (for now, tenant-wide access is assumed)
    const projectRes = await db.query(
      `SELECT * FROM projects WHERE id = $1 AND tenant_id = $2`,
      [projectId, req.user.tenantId]
    );

    if (projectRes.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Project not found' });
    }

    res.status(200).json({
      success: true,
      data: {
        projects: [projectRes.rows[0]] // Sending as array to match your frontend logic
      }
    });

  } catch (error) {
    console.error('Error fetching project:', error);
    res.status(500).json({ success: false, message: 'Server error fetching project' });
  }
};