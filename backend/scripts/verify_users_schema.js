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
        const expectedColumns = [
            'id', 'tenant_id', 'email', 'password_hash',
            'full_name', 'role', 'is_active', 'created_at', 'updated_at'
        ];

        for (const col of expectedColumns) {
            const res = await pool.query(`
                SELECT column_name 
                FROM information_schema.columns 
                WHERE table_name = 'users' AND column_name = $1;
            `, [col]);

            if (res.rows.length > 0) {
                console.log(`[EXISTS] ${col}`);
            } else {
                console.log(`[MISSING] ${col}`);
            }
        }
    } catch (err) {
        console.error('Error verifying:', err);
    } finally {
        await pool.end();
    }
}

verify();
