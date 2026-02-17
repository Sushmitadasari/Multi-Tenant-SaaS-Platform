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

console.log('Connecting to DB with:', { ...config, password: '***' });

const pool = new Pool(config);

async function runMigrations() {
    try {
        const migrationFiles = fs.readdirSync(path.join(__dirname, '../migrations')).sort();

        for (const file of migrationFiles) {
            if (file.includes('006_add_subscription_plan') ||
                file.includes('007_add_tenant_limits') ||
                file.includes('008_add_tenant_id_to_users') ||
                file.includes('009_fix_users_schema') ||
                file.includes('010_fix_user_columns') ||
                file.includes('011_add_created_at_to_users') ||
                file.includes('012_drop_password_column')) {

                console.log(`Running migration: ${file}`);
                const sql = fs.readFileSync(path.join(__dirname, '../migrations', file), 'utf8');
                await pool.query(sql);
                console.log(`Executed: ${file}`);
            }
        }
        console.log('Done.');
    } catch (err) {
        console.error('Migration failed:', err);
    } finally {
        await pool.end();
    }
}

runMigrations();
