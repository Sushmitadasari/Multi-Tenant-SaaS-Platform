const bcrypt = require('bcrypt'); // Switched back to 'bcrypt'
const jwt = require('jsonwebtoken');
const db = require('../config/db');
const logAction = require('../utils/auditLogger');

// API 1: Register Tenant
exports.registerTenant = async (req, res) => {
  const { tenantName, subdomain, adminEmail, adminPassword, adminFullName } = req.body;
  const client = await db.pool.connect();

  try {
    await client.query('BEGIN');

    // Check if subdomain exists
    const subCheck = await client.query('SELECT id FROM tenants WHERE subdomain = $1', [subdomain]);
    if (subCheck.rows.length > 0) {
        await client.query('ROLLBACK');
        return res.status(409).json({ success: false, message: 'Subdomain already exists' });
    }

    // 1. Create Tenant
    const tenantRes = await client.query(
      `INSERT INTO tenants (name, subdomain, subscription_plan, max_users, max_projects)
       VALUES ($1, $2, 'free', 5, 3) RETURNING id`,
      [tenantName, subdomain]
    );
    const tenantId = tenantRes.rows[0].id;

    // 2. Create Admin User
    const hashedPassword = await bcrypt.hash(adminPassword, 10);
    const userRes = await client.query(
      `INSERT INTO users (tenant_id, email, password_hash, full_name, role)
       VALUES ($1, $2, $3, $4, 'tenant_admin') RETURNING id, email, full_name, role`,
      [tenantId, adminEmail, hashedPassword, adminFullName]
    );

    await client.query('COMMIT');

    logAction(tenantId, userRes.rows[0].id, 'REGISTER_TENANT', 'tenant', tenantId, req.ip);

    res.status(201).json({
      success: true,
      message: 'Tenant registered successfully',
      data: {
        tenantId: tenantId,
        subdomain: subdomain,
        adminUser: userRes.rows[0]
      }
    });

  } catch (error) {
    await client.query('ROLLBACK');
    res.status(500).json({ success: false, message: error.message });
  } finally {
    client.release();
  }
};

// API 2: Login
exports.login = async (req, res) => {
  const { email, password, tenantSubdomain } = req.body;

  try {
    let tenant = null;
    let user = null;

    // 1. SUPER ADMIN CHECK (No Tenant Required)
    if (email === 'superadmin@system.com') {
      const userRes = await db.query(
        "SELECT * FROM users WHERE email = $1 AND role = 'super_admin'",
        [email]
      );
      user = userRes.rows[0];

      if (!user) {
        return res.status(401).json({ success: false, message: 'Invalid credentials' });
      }
    } 
    // 2. REGULAR USER / TENANT ADMIN CHECK
    else {
      // Find Tenant
      if (tenantSubdomain) {
        const tRes = await db.query('SELECT id, status FROM tenants WHERE subdomain = $1', [tenantSubdomain]);
        tenant = tRes.rows[0];
      }

      if (!tenant) {
        return res.status(404).json({ success: false, message: 'Tenant not found' });
      }

      if (tenant.status !== 'active') {
        return res.status(403).json({ success: false, message: 'Tenant is suspended or inactive' });
      }

      // Find User within that Tenant
      const userRes = await db.query(
        'SELECT * FROM users WHERE email = $1 AND tenant_id = $2',
        [email, tenant.id]
      );
      user = userRes.rows[0];
    }

    // 3. Verify Password
    if (!user || !(await bcrypt.compare(password, user.password_hash))) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    // 4. Generate Token
    const token = jwt.sign(
      { 
        userId: user.id, 
        tenantId: user.tenant_id, 
        role: user.role 
      },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    if (user.tenant_id) {
        logAction(user.tenant_id, user.id, 'LOGIN', 'user', user.id, req.ip);
    }

    res.status(200).json({
      success: true,
      data: {
        user: {
          id: user.id,
          email: user.email,
          fullName: user.full_name,
          role: user.role,
          tenantId: user.tenant_id
        },
        token,
        expiresIn: 86400
      }
    });

  } catch (error) {
    console.error('Login Error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// API 3: Get Me
exports.getMe = async (req, res) => {
  try {
    const userRes = await db.query('SELECT id, email, full_name, role, is_active FROM users WHERE id = $1', [req.user.userId]);
    
    let tenantData = null;
    if (req.user.tenantId) {
        const tenantRes = await db.query('SELECT id, name, subdomain, subscription_plan, max_users, max_projects FROM tenants WHERE id = $1', [req.user.tenantId]);
        tenantData = tenantRes.rows[0];
    }

    if (userRes.rows.length === 0) return res.status(404).json({ success: false, message: 'User not found' });

    res.status(200).json({
      success: true,
      data: {
        ...userRes.rows[0],
        tenant: tenantData
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// API 4: Logout
exports.logout = (req, res) => {
    if (req.user && req.user.tenantId) {
        logAction(req.user.tenantId, req.user.userId, 'LOGOUT', 'user', req.user.userId, req.ip);
    }
    res.status(200).json({ success: true, message: 'Logged out successfully' });
};