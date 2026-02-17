const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const config = {
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: process.env.DB_NAME,
    password: process.env.DB_PASSWORD,
    port: process.env.DB_PORT,
};

const pool = new Pool(config);

async function verifyInsert() {
    try {
        console.log('Checking for tenant...');
        const tenantRes = await pool.query('SELECT id FROM tenants LIMIT 1');
        let tenantId;

        if (tenantRes.rows.length === 0) {
            console.log('Creating test tenant...');
            const newTenant = await pool.query(`
                INSERT INTO tenants (name, subdomain, subscription_plan) 
                VALUES ($1, $2, $3) 
                RETURNING id
            `, ['Test Tenant', `test-tenant-${Date.now()}`, 'free']);
            tenantId = newTenant.rows[0].id;
        } else {
            tenantId = tenantRes.rows[0].id;
        }

        const email = `testuser_${Date.now()}@example.com`;

        console.log(`Attempting insert for tenant ${tenantId}, email ${email}...`);

        const res = await pool.query(`
            INSERT INTO users (tenant_id, email, password_hash, full_name, role)
            VALUES ($1, $2, 'hash', 'Test User', 'user')
            RETURNING id, full_name, created_at
        `, [tenantId, email]);

        console.log('INSERT SUCCESS:', JSON.stringify(res.rows[0]));
        fs.writeFileSync('insert_result.txt', 'SUCCESS: ' + JSON.stringify(res.rows[0]));
    } catch (err) {
        console.error('INSERT FAILED:', err);
        fs.writeFileSync('insert_error.txt', 'FAILED: ' + err.message + '\n' + JSON.stringify(err, null, 2));
    } finally {
        await pool.end();
    }
}

verifyInsert();
