const { Pool } = require('pg');
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

async function verify() {
    try {
        const res = await pool.query(`
            SELECT column_name 
            FROM information_schema.columns 
            WHERE table_name = 'users' AND column_name = 'tenant_id';
        `);

        if (res.rows.length > 0) {
            console.log('[EXISTS] tenant_id in users');
        } else {
            console.log('[MISSING] tenant_id in users');
        }
    } catch (err) {
        console.error('Error verifying:', err);
    } finally {
        await pool.end();
    }
}

verify();
