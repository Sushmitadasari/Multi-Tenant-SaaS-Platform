const { Project, Task, User, Tenant, AuditLog } = require('../models');

exports.createProject = async (req, res) => {
  try {
    const tenant = await Tenant.findByPk(req.user.tenantId);
    const projectCount = await Project.count({ where: { tenantId: req.user.tenantId } });

    if (projectCount >= tenant.maxProjects) {
      return res.status(403).json({ 
        success: false, 
        message: `Project limit reached for plan (${tenant.maxProjects} max)` 
      });
    }

    const { name, description } = req.body;
    const project = await Project.create({
      name,
      description,
      tenantId: req.user.tenantId,
      createdById: req.user.id
    });

    await AuditLog.create({
      action: 'CREATE_PROJECT',
      entityType: 'Project',
      entityId: project.id,
      tenantId: req.user.tenantId,
      userId: req.user.id
    });

    res.status(201).json({ success: true, data: project });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

exports.getProjects = async (req, res) => {
  try {
    const projects = await Project.findAll({
      where: { tenantId: req.user.tenantId },
      include: [
        { model: User, as: 'creator', attributes: ['id', 'fullName'] }
      ],
      order: [['createdAt', 'DESC']]
    });
    res.json({ success: true, data: projects });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getProject = async (req, res) => {
  try {
    const project = await Project.findOne({
      where: { id: req.params.id, tenantId: req.user.tenantId },
      include: [
        { model: User, as: 'creator', attributes: ['id', 'fullName'] }
      ]
    });
    if (!project) return res.status(404).json({ success: false, message: 'Project not found' });
    res.json({ success: true, data: project });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.updateProject = async (req, res) => {
  try {
    const { name, description, status } = req.body;
    const project = await Project.findOne({ where: { id: req.params.id, tenantId: req.user.tenantId }});

    if (!project) return res.status(404).json({ success: false, message: 'Project not found' });

    await project.update({ name, description, status });

    await AuditLog.create({
      action: 'UPDATE_PROJECT',
      entityType: 'Project',
      entityId: project.id,
      tenantId: req.user.tenantId,
      userId: req.user.id
    });

    res.json({ success: true, data: project });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.deleteProject = async (req, res) => {
  try {
    const project = await Project.findOne({ 
      where: { id: req.params.id, tenantId: req.user.tenantId } 
    });

    if (!project) return res.status(404).json({ success: false, message: 'Project not found' });

    await project.destroy();

    await AuditLog.create({
      action: 'DELETE_PROJECT',
      entityType: 'Project',
      entityId: req.params.id,
      tenantId: req.user.tenantId,
      userId: req.user.id
    });

    res.json({ success: true, message: 'Project deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};