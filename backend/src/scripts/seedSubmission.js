const bcrypt = require('bcrypt');
const db = require('../config/db');

async function seedSubmissionData() {
  const client = await db.pool.connect();
  try {
    console.log('🌱 Seeding Submission Data...');
    await client.query('BEGIN');

    // 1. Create Super Admin
    const superHash = await bcrypt.hash('Admin@123', 10);
    // Check if exists first to avoid duplicate error
    const superCheck = await client.query("SELECT * FROM users WHERE email = 'superadmin@system.com'");
    if (superCheck.rows.length === 0) {
        await client.query(`
        INSERT INTO users (email, password_hash, full_name, role, tenant_id)
        VALUES ('superadmin@system.com', $1, 'Super Admin', 'super_admin', NULL)
        `, [superHash]);
        console.log('✅ Super Admin created');
    }

    // 2. Create Evaluation Tenant
    const tenantRes = await client.query(`
      INSERT INTO tenants (name, subdomain, status, subscription_plan)
      VALUES ('Evaluation Corp', 'eval', 'active', 'pro')
      ON CONFLICT (subdomain) DO UPDATE SET status = 'active'
      RETURNING id
    `);
    const tenantId = tenantRes.rows[0].id;

    // 3. Create Tenant Admin
    const adminHash = await bcrypt.hash('Demo@123', 10);
    const adminRes = await client.query(`
      INSERT INTO users (tenant_id, email, password_hash, full_name, role)
      VALUES ($1, 'admin@eval.com', $2, 'Eval Admin', 'tenant_admin')
      ON CONFLICT (tenant_id, email) DO NOTHING
      RETURNING id
    `, [tenantId, adminHash]);
    const adminId = adminRes.rows[0]?.id;

    // 4. Create Normal User
    const userHash = await bcrypt.hash('User@123', 10);
    await client.query(`
      INSERT INTO users (tenant_id, email, password_hash, full_name, role)
      VALUES ($1, 'user1@eval.com', $2, 'Eval User 1', 'user')
      ON CONFLICT (tenant_id, email) DO NOTHING
    `, [tenantId, userHash]);

    // 5. Create Project (If admin was just created)
    if (adminId) {
        await client.query(`
        INSERT INTO projects (tenant_id, name, description, status, created_by)
        VALUES ($1, 'Evaluation Project A', 'Project for automated testing', 'active', $2)
        `, [tenantId, adminId]);
    }

    await client.query('COMMIT');
    console.log('🎉 Submission Data Seeded Successfully!');
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('❌ Error seeding data:', error);
  } finally {
    client.release();
    process.exit();
  }
}

seedSubmissionData();