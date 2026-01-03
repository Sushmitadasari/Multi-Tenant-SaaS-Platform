const { Task, Project, AuditLog } = require('../models');

exports.createTask = async (req, res) => {
  try {
    const { title, status, projectId } = req.body;
    const project = await Project.findOne({ 
        where: { id: projectId, tenantId: req.user.tenantId } 
    });
    if (!project) return res.status(404).json({ success: false, message: 'Project not found' });

    const task = await Task.create({
      title,
      status,
      projectId,
      tenantId: req.user.tenantId
    });

    await AuditLog.create({
      action: 'CREATE_TASK',
      entityType: 'Task',
      entityId: task.id,
      tenantId: req.user.tenantId,
      userId: req.user.id
    });

    res.status(201).json({ success: true, data: task });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

exports.getTasks = async (req, res) => {
  try {
    const { projectId } = req.query;
    const whereClause = { tenantId: req.user.tenantId };
    if (projectId) whereClause.projectId = projectId;

    const tasks = await Task.findAll({ where: whereClause });
    res.json({ success: true, data: tasks });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.updateTaskStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const task = await Task.findOne({ where: { id, tenantId: req.user.tenantId } });
    
    if (!task) return res.status(404).json({ success: false, message: 'Task not found' });
    
    task.status = status;
    await task.save();

    await AuditLog.create({
      action: 'UPDATE_TASK_STATUS',
      entityType: 'Task',
      entityId: task.id,
      tenantId: req.user.tenantId,
      userId: req.user.id,
      details: { status }
    });

    res.json({ success: true, data: task });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.updateTask = async (req, res) => {
  try {
    const { title, description, status, priority, assignedTo, dueDate } = req.body;
    const task = await Task.findOne({ where: { id: req.params.id, tenantId: req.user.tenantId }});

    if (!task) return res.status(404).json({ success: false, message: 'Task not found' });

    await task.update({ title, description, status, priority, assignedTo, dueDate });

    await AuditLog.create({
      action: 'UPDATE_TASK',
      entityType: 'Task',
      entityId: task.id,
      tenantId: req.user.tenantId,
      userId: req.user.id
    });

    res.json({ success: true, data: task });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.deleteTask = async (req, res) => {
  try {
    const task = await Task.findOne({ 
      where: { id: req.params.id, tenantId: req.user.tenantId } 
    });

    if (!task) return res.status(404).json({ success: false, message: 'Task not found' });

    await task.destroy();

    await AuditLog.create({
      action: 'DELETE_TASK',
      entityType: 'Task',
      entityId: req.params.id,
      tenantId: req.user.tenantId,
      userId: req.user.id
    });

    res.json({ success: true, message: 'Task deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};