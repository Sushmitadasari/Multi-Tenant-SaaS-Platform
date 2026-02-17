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

async function inspect() {
    try {
        const res = await pool.query(`
            SELECT column_name 
            FROM information_schema.columns 
            WHERE table_name = 'users';
        `);
        console.log('--- COLUMNS START ---');
        res.rows.forEach(row => console.log(row.column_name));
        console.log('--- COLUMNS END ---');
    } catch (err) {
        console.error(err);
    } finally {
        await pool.end();
    }
}

inspect();
