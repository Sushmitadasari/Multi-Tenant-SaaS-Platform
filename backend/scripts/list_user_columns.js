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

async function listColumns() {
    try {
        const res = await pool.query(`
            SELECT column_name, data_type, is_nullable
            FROM information_schema.columns 
            WHERE table_name = 'users';
        `);

        console.log('Columns in users table:');
        res.rows.forEach(row => {
            console.log(`- ${row.column_name} (${row.data_type}, nullable: ${row.is_nullable})`);
        });
    } catch (err) {
        console.error('Error listing columns:', err);
    } finally {
        await pool.end();
    }
}

listColumns();
