const { Tenant, AuditLog } = require('../models');

exports.getTenant = async (req, res) => {
  try {
    if (req.user.role !== 'super_admin' && req.user.tenantId !== req.params.id) {
      return res.status(403).json({ success: false, message: 'Unauthorized' });
    }

    const tenant = await Tenant.findByPk(req.params.id);
    if (!tenant) return res.status(404).json({ success: false, message: 'Tenant not found' });

    res.json({ success: true, data: tenant });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.listTenants = async (req, res) => {
  try {
    if (req.user.role !== 'super_admin') {
      return res.status(403).json({ success: false, message: 'Unauthorized' });
    }

    // --- MANDATORY FIX: Pagination Implementation ---
    const { page = 1, limit = 10, status, subscriptionPlan } = req.query;
    const offset = (page - 1) * limit;
    
    // Build filter object
    const whereClause = {};
    if (status) whereClause.status = status;
    if (subscriptionPlan) whereClause.subscriptionPlan = subscriptionPlan;

    const { count, rows } = await Tenant.findAndCountAll({
        where: whereClause,
        limit: parseInt(limit),
        offset: parseInt(offset),
        order: [['createdAt', 'DESC']]
    });

    res.json({ 
        success: true, 
        data: {
            tenants: rows,
            pagination: {
                total: count,
                currentPage: parseInt(page),
                totalPages: Math.ceil(count / limit),
                limit: parseInt(limit)
            }
        } 
    });
    // ------------------------------------------------
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.updateTenant = async (req, res) => {
  try {
    const { name, status, subscriptionPlan, maxUsers, maxProjects } = req.body;
    const tenant = await Tenant.findByPk(req.params.id);

    if (!tenant) return res.status(404).json({ success: false, message: 'Tenant not found' });

    if (req.user.role === 'tenant_admin') {
      if (req.user.tenantId !== req.params.id) return res.status(403).json({ success: false, message: 'Unauthorized' });
      await tenant.update({ name });
    } else if (req.user.role === 'super_admin') {
      await tenant.update({ name, status, subscriptionPlan, maxUsers, maxProjects });
    } else {
      return res.status(403).json({ success: false, message: 'Unauthorized' });
    }

    await AuditLog.create({
      action: 'UPDATE_TENANT',
      entityType: 'Tenant',
      entityId: tenant.id,
      tenantId: tenant.id,
      userId: req.user.id,
      details: req.body
    });

    res.json({ success: true, data: tenant });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};