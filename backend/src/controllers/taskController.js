const db = require('../config/db');
const logAction = require('../utils/auditLogger');

// API 16: Create Task
exports.createTask = async (req, res) => {
    const { projectId } = req.params;
    const { title, description, assignedTo, priority, dueDate } = req.body;
    const { tenantId, userId } = req.user;

    try {
        // 1. Verify Project belongs to Tenant
        const projectCheck = await db.query('SELECT tenant_id FROM projects WHERE id = $1', [projectId]);
        if (projectCheck.rows.length === 0) return res.status(404).json({ success: false, message: 'Project not found' });
        
        if (projectCheck.rows[0].tenant_id !== tenantId) {
            return res.status(403).json({ success: false, message: 'Unauthorized project access' });
        }

        // 2. Verify Assigned User belongs to Tenant (if provided)
        if (assignedTo) {
            const userCheck = await db.query('SELECT tenant_id FROM users WHERE id = $1', [assignedTo]);
            if (userCheck.rows.length === 0 || userCheck.rows[0].tenant_id !== tenantId) {
                return res.status(400).json({ success: false, message: 'Assigned user does not belong to this organization' });
            }
        }

        // 3. Create Task
        const result = await db.query(
            `INSERT INTO tasks (project_id, tenant_id, title, description, status, priority, assigned_to, due_date)
             VALUES ($1, $2, $3, $4, 'todo', $5, $6, $7)
             RETURNING *`,
            [projectId, tenantId, title, description, priority || 'medium', assignedTo, dueDate]
        );

        logAction(tenantId, userId, 'CREATE_TASK', 'task', result.rows[0].id, req.ip);

        res.status(201).json({
            success: true,
            data: result.rows[0]
        });

    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// API 17: List Project Tasks
exports.listTasks = async (req, res) => {
    const { projectId } = req.params;
    const { tenantId } = req.user;
    const { status, priority, assignedTo, search, page = 1, limit = 50 } = req.query;
    const offset = (page - 1) * limit;

    try {
        // Verify Project Ownership
        const projectCheck = await db.query('SELECT tenant_id FROM projects WHERE id = $1', [projectId]);
        if (projectCheck.rows.length === 0 || projectCheck.rows[0].tenant_id !== tenantId) {
            return res.status(403).json({ success: false, message: 'Unauthorized or project not found' });
        }

        let query = `
            SELECT t.*, u.full_name as assignee_name, u.email as assignee_email
            FROM tasks t
            LEFT JOIN users u ON t.assigned_to = u.id
            WHERE t.project_id = $1 AND t.tenant_id = $2
        `;
        
        const values = [projectId, tenantId];
        let paramCounter = 3;

        if (status) {
            query += ` AND t.status = $${paramCounter}`;
            values.push(status);
            paramCounter++;
        }
        if (priority) {
            query += ` AND t.priority = $${paramCounter}`;
            values.push(priority);
            paramCounter++;
        }
        if (assignedTo) {
            query += ` AND t.assigned_to = $${paramCounter}`;
            values.push(assignedTo);
            paramCounter++;
        }
        if (search) {
            query += ` AND t.title ILIKE $${paramCounter}`;
            values.push(`%${search}%`);
            paramCounter++;
        }

        // Get Count
        const countQuery = `SELECT COUNT(*) FROM tasks t WHERE t.project_id = $1 AND t.tenant_id = $2`; 
        // Note: For simplicity in this demo code, strict count filtering is omitted but recommended for prod
        const countRes = await db.query(countQuery, [projectId, tenantId]);
        const total = parseInt(countRes.rows[0].count);

        // Order and Pagination
        query += ` ORDER BY CASE 
                    WHEN t.priority = 'high' THEN 1 
                    WHEN t.priority = 'medium' THEN 2 
                    ELSE 3 END, 
                    t.due_date ASC 
                    LIMIT $${paramCounter} OFFSET $${paramCounter + 1}`;
        values.push(limit, offset);

        const result = await db.query(query, values);

        // Format Response
        const tasks = result.rows.map(t => ({
            id: t.id,
            title: t.title,
            description: t.description,
            status: t.status,
            priority: t.priority,
            assignedTo: t.assigned_to ? {
                id: t.assigned_to,
                fullName: t.assignee_name,
                email: t.assignee_email
            } : null,
            dueDate: t.due_date,
            createdAt: t.created_at
        }));

        res.status(200).json({
            success: true,
            data: {
                tasks,
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

// API 18: Update Task Status
exports.updateTaskStatus = async (req, res) => {
    const { taskId } = req.params;
    const { status } = req.body;
    const { tenantId } = req.user;

    if (!['todo', 'in_progress', 'completed'].includes(status)) {
        return res.status(400).json({ success: false, message: 'Invalid status value' });
    }

    try {
        const result = await db.query(
            `UPDATE tasks SET status = $1, updated_at = NOW() 
             WHERE id = $2 AND tenant_id = $3 
             RETURNING id, status, updated_at`,
            [status, taskId, tenantId]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ success: false, message: 'Task not found' });
        }

        res.status(200).json({ success: true, data: result.rows[0] });

    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// API 19: Update Task (Full)
exports.updateTask = async (req, res) => {
    const { taskId } = req.params;
    const { title, description, status, priority, assignedTo, dueDate } = req.body;
    const { tenantId, userId } = req.user;

    try {
        // 1. Verify Task exists and belongs to tenant
        const taskCheck = await db.query('SELECT * FROM tasks WHERE id = $1', [taskId]);
        if (taskCheck.rows.length === 0) return res.status(404).json({ success: false, message: 'Task not found' });
        if (taskCheck.rows[0].tenant_id !== tenantId) return res.status(403).json({ success: false, message: 'Unauthorized' });

        // 2. Verify Assigned User (if changing)
        if (assignedTo) {
            const userCheck = await db.query('SELECT tenant_id FROM users WHERE id = $1', [assignedTo]);
            if (userCheck.rows.length === 0 || userCheck.rows[0].tenant_id !== tenantId) {
                return res.status(400).json({ success: false, message: 'Assigned user invalid' });
            }
        }

        // 3. Construct Update Query
        let query = 'UPDATE tasks SET updated_at = NOW()';
        const values = [];
        let paramCounter = 1;

        if (title) { query += `, title = $${paramCounter}`; values.push(title); paramCounter++; }
        if (description) { query += `, description = $${paramCounter}`; values.push(description); paramCounter++; }
        if (status) { query += `, status = $${paramCounter}`; values.push(status); paramCounter++; }
        if (priority) { query += `, priority = $${paramCounter}`; values.push(priority); paramCounter++; }
        if (dueDate !== undefined) { query += `, due_date = $${paramCounter}`; values.push(dueDate); paramCounter++; }
        
        // Handle explicit null for unassigning
        if (assignedTo !== undefined) { 
            query += `, assigned_to = $${paramCounter}`; 
            values.push(assignedTo); 
            paramCounter++; 
        }

        query += ` WHERE id = $${paramCounter} RETURNING *`;
        values.push(taskId);

        const result = await db.query(query, values);

        logAction(tenantId, userId, 'UPDATE_TASK', 'task', taskId, req.ip);

        // Fetch user details for response
        let assignee = null;
        if (result.rows[0].assigned_to) {
            const uRes = await db.query('SELECT id, full_name, email FROM users WHERE id = $1', [result.rows[0].assigned_to]);
            assignee = uRes.rows[0];
        }

        const data = result.rows[0];
        data.assignedTo = assignee;

        res.status(200).json({
            success: true,
            message: 'Task updated successfully',
            data
        });

    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};