const { Pool } = require('pg');
require('dotenv').config();

// Try to load bcrypt or bcryptjs (whichever you have installed)
let bcrypt;
try {
  bcrypt = require('bcryptjs');
} catch (e) {
  try {
    bcrypt = require('bcrypt');
  } catch (e) {
    console.error('❌ Error: Could not find bcrypt or bcryptjs. Please run "npm install bcryptjs"');
    process.exit(1);
  }
}

const pool = new Pool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
});

const initDb = async () => {
  try {
    console.log('⏳ Connecting to database...');
    const client = await pool.connect();
    console.log('✅ Connected.');

    // 1. Generate the REAL hash for "Admin@123"
    console.log('🔐 Generating secure password hashes...');
    const passwordHash = await bcrypt.hash('Admin@123', 10);

    console.log('⏳ Creating tables...');
    
    // 2. Create Tables
    await client.query(`
      CREATE TABLE IF NOT EXISTS tenants (
        id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        subdomain VARCHAR(255) UNIQUE NOT NULL,
        status VARCHAR(50) DEFAULT 'active',
        subscription_plan VARCHAR(50) DEFAULT 'free',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS users (
        id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
        tenant_id UUID REFERENCES tenants(id),
        email VARCHAR(255) NOT NULL,
        password_hash VARCHAR(255) NOT NULL,
        full_name VARCHAR(255),
        role VARCHAR(50) NOT NULL,
        is_active BOOLEAN DEFAULT true,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(tenant_id, email)
      );

      CREATE TABLE IF NOT EXISTS projects (
        id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
        tenant_id UUID REFERENCES tenants(id),
        name VARCHAR(255) NOT NULL,
        description TEXT,
        status VARCHAR(50) DEFAULT 'active',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS tasks (
        id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
        project_id UUID REFERENCES projects(id),
        tenant_id UUID REFERENCES tenants(id),
        title VARCHAR(255) NOT NULL,
        status VARCHAR(50) DEFAULT 'todo',
        priority VARCHAR(20) DEFAULT 'medium',
        assigned_to UUID REFERENCES users(id),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // 3. SEED DATA
    console.log('🌱 Seeding data...');

    // A. Create Demo Tenant
    await client.query(`
      INSERT INTO tenants (id, name, subdomain, status, subscription_plan)
      VALUES (
        '22222222-2222-2222-2222-222222222222',
        'Demo Company',
        'demo',
        'active',
        'pro'
      ) ON CONFLICT (subdomain) DO NOTHING;
    `);

    // B. Create Admin User (Using the REAL generated hash)
    await client.query(`
      INSERT INTO users (tenant_id, email, password_hash, full_name, role)
      VALUES (
        '22222222-2222-2222-2222-222222222222',
        'admin@demo.com',
        $1, 
        'Demo Admin',
        'tenant_admin'
      ) ON CONFLICT DO NOTHING;
    `, [passwordHash]);

    // C. Create Super Admin
    await client.query(`
      INSERT INTO users (tenant_id, email, password_hash, full_name, role)
      VALUES (
        NULL,
        'superadmin@system.com',
        $1,
        'System Super Admin',
        'super_admin'
      ) ON CONFLICT DO NOTHING;
    `, [passwordHash]);

     // D. Create a Project
    await client.query(`
      INSERT INTO projects (tenant_id, name, description, status)
      VALUES (
        '22222222-2222-2222-2222-222222222222',
        'Website Redesign',
        'Complete overhaul',
        'active'
      ) ON CONFLICT DO NOTHING;
    `);

    console.log('✅ Seed data inserted successfully!');
    client.release();
    process.exit(0);

  } catch (err) {
    console.error('❌ Error initializing database:', err.message);
    process.exit(1);
  }
};

initDb();