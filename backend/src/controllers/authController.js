const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { User, Tenant, sequelize, AuditLog } = require('../models');

// Helper to generate JWT
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET || 'secret', {
    expiresIn: '30d',
  });
};

exports.registerTenant = async (req, res) => {
  const transaction = await sequelize.transaction();
  try {
    const { tenantName, subdomain, adminEmail, adminPassword, adminFullName } = req.body;

    const existingTenant = await Tenant.findOne({ where: { subdomain } });
    if (existingTenant) {
      await transaction.rollback();
      return res.status(409).json({ success: false, message: 'Subdomain already exists' });
    }

    const tenant = await Tenant.create({
      name: tenantName,
      subdomain,
      subscriptionPlan: 'free',
      maxUsers: 5,
      maxProjects: 3
    }, { transaction });

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(adminPassword, salt);

    const admin = await User.create({
      fullName: adminFullName,
      email: adminEmail,
      password: hashedPassword,
      role: 'tenant_admin',
      tenantId: tenant.id
    }, { transaction });

    await transaction.commit();

    await AuditLog.create({
      action: 'REGISTER_TENANT',
      entityType: 'Tenant',
      entityId: tenant.id,
      tenantId: tenant.id,
      userId: admin.id,
      ipAddress: req.ip
    });

    res.status(201).json({
      success: true,
      message: 'Tenant registered successfully',
      data: { tenant, admin }
    });
  } catch (error) {
    if (transaction) await transaction.rollback();
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.register = async (req, res) => {
  // This endpoint adds a user to an EXISTING tenant
  try {
    const { fullName, email, password, tenantSubdomain } = req.body;

    const tenant = await Tenant.findOne({ where: { subdomain: tenantSubdomain } });
    if (!tenant) {
      return res.status(404).json({ success: false, message: 'Workspace not found' });
    }

    const userExists = await User.findOne({ where: { email, tenantId: tenant.id } });
    if (userExists) {
      return res.status(400).json({ success: false, message: 'User already exists in this workspace' });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const user = await User.create({
      fullName,
      email,
      password: hashedPassword,
      tenantId: tenant.id,
      role: 'user'
    });

    res.status(201).json({
      success: true,
      data: {
        id: user.id,
        fullName: user.fullName,
        email: user.email,
        role: user.role,
        token: generateToken(user.id)
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password, tenantSubdomain } = req.body;

    // 0. Validation
    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Please provide email and password' });
    }

    // 1. Find User by Email (Global Lookup first to check role)
    const user = await User.findOne({ 
      where: { email },
      attributes: ['id', 'fullName', 'email', 'password', 'role', 'tenantId'],
      include: [{ model: Tenant, as: 'tenant' }] 
    });

    // 2. Generic Invalid Credentials (Security: Don't reveal if user exists)
    if (!user || !(await bcrypt.compare(password, user.password))) {
      // Log failure (Optional)
      if (user) {
         await AuditLog.create({
            action: 'LOGIN_FAILED',
            entityType: 'User',
            entityId: user.id,
            details: { reason: 'Invalid password' }
         });
      }
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    // 3. Tenant Logic
    if (user.role === 'super_admin') {
        // ✅ SUPER ADMIN BYPASS: Allow login regardless of subdomain
        // (They are global admins, so we ignore the tenant check)
    } else {
        // 🛑 REGULAR USER ENFORCEMENT
        // Must provide subdomain
        if (!tenantSubdomain) {
            return res.status(401).json({ success: false, message: 'Workspace subdomain required' });
        }

        // Find the requested tenant
        const requestTenant = await Tenant.findOne({ where: { subdomain: tenantSubdomain } });
        if (!requestTenant) {
            return res.status(404).json({ success: false, message: 'Workspace not found' });
        }

        // User MUST belong to this tenant
        if (user.tenantId !== requestTenant.id) {
             return res.status(401).json({ success: false, message: 'User does not belong to this workspace' });
        }

        // Check suspended status
        if (requestTenant.status === 'suspended') {
            return res.status(403).json({ success: false, message: 'Tenant is suspended' });
        }
    }

    // 4. Success - Log and Return Token
    await AuditLog.create({
      action: 'LOGIN',
      entityType: 'User',
      entityId: user.id,
      tenantId: user.tenantId,
      userId: user.id,
      ipAddress: req.ip
    });

    res.json({
      success: true,
      data: {
        id: user.id,
        fullName: user.fullName,
        email: user.email,
        role: user.role,
        tenant: user.tenant,
        token: generateToken(user.id)
      }
    });

  } catch (error) {
    console.error("Login Error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.logout = async (req, res) => {
  try {
    if (req.user) {
      await AuditLog.create({
        action: 'LOGOUT',
        entityType: 'User',
        entityId: req.user.id,
        tenantId: req.user.tenantId,
        userId: req.user.id,
        ipAddress: req.ip
      });
    }
    res.json({ success: true, message: 'Logged out successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getMe = async (req, res) => {
  try {
    const user = await User.findByPk(req.user.id, {
      attributes: { exclude: ['password'] },
      include: [{ model: Tenant, as: 'tenant' }]
    });
    res.json({ success: true, data: user });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};