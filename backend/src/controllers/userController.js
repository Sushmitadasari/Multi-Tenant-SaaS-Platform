const bcrypt = require('bcryptjs');
const { User, Tenant, AuditLog } = require('../models');

exports.createUser = async (req, res) => {
  try {
    if (req.user.role !== 'tenant_admin') {
      return res.status(403).json({ success: false, message: 'Only admins can add users' });
    }

    const tenant = await Tenant.findByPk(req.user.tenantId);
    const currentUserCount = await User.count({ where: { tenantId: req.user.tenantId } });

    if (currentUserCount >= tenant.maxUsers) {
      return res.status(403).json({ 
        success: false, 
        message: `User limit reached for plan (${tenant.maxUsers} max)` 
      });
    }

    const { fullName, email, password, role } = req.body;

    const userExists = await User.findOne({ where: { email, tenantId: req.user.tenantId } });
    if (userExists) {
      return res.status(400).json({ success: false, message: 'User already exists' });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const user = await User.create({
      fullName,
      email,
      password: hashedPassword,
      role: role || 'user',
      tenantId: req.user.tenantId
    });

    await AuditLog.create({
      action: 'CREATE_USER',
      entityType: 'User',
      entityId: user.id,
      tenantId: req.user.tenantId,
      userId: req.user.id
    });

    res.status(201).json({ success: true, data: user });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.listUsers = async (req, res) => {
  try {
    const users = await User.findAll({
      where: { tenantId: req.user.tenantId },
      attributes: { exclude: ['password'] }
    });
    res.json({ success: true, data: users });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.updateUser = async (req, res) => {
  try {
    const { fullName, role } = req.body;
    const user = await User.findOne({ where: { id: req.params.id, tenantId: req.user.tenantId }});
    
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });

    if (role && req.user.role !== 'tenant_admin') {
      return res.status(403).json({ success: false, message: 'Unauthorized to change role' });
    }

    await user.update({ fullName, role });

    await AuditLog.create({
      action: 'UPDATE_USER',
      entityType: 'User',
      entityId: user.id,
      tenantId: req.user.tenantId,
      userId: req.user.id
    });

    res.json({ success: true, data: user });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.deleteUser = async (req, res) => {
  try {
    if (req.user.role !== 'tenant_admin') {
      return res.status(403).json({ success: false, message: 'Unauthorized' });
    }

    // --- MANDATORY FIX: Prevent self-deletion ---
    if (req.params.id === req.user.id) {
        return res.status(403).json({ success: false, message: 'Cannot delete yourself' });
    }
    // --------------------------------------------

    const userToDelete = await User.findOne({ 
      where: { id: req.params.id, tenantId: req.user.tenantId } 
    });

    if (!userToDelete) return res.status(404).json({ success: false, message: 'User not found' });

    await userToDelete.destroy();

    await AuditLog.create({
      action: 'DELETE_USER',
      entityType: 'User',
      entityId: req.params.id,
      tenantId: req.user.tenantId,
      userId: req.user.id
    });

    res.json({ success: true, message: 'User removed from team' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};