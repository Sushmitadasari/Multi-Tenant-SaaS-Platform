const { Pool } = require('pg');
require('dotenv').config();

// 1. Load the bcrypt library
let bcrypt;
try { bcrypt = require('bcryptjs'); } catch (e) { bcrypt = require('bcrypt'); }

const pool = new Pool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
});

(async () => {
  try {
    console.log('🔐 Generating proper hash for Admin@123...');
    const hash = await bcrypt.hash('Admin@123', 10);
    console.log('✅ Generated Hash:', hash);

    const client = await pool.connect();
    
    // We use standard string concatenation here to avoid any possible param issues
    const query = `UPDATE users SET password_hash = '${hash}' WHERE email = 'admin@demo.com'`;
    
    await client.query(query);
    console.log('🎉 PASSWORD FIXED SUCCESSFULLY for admin@demo.com');
    process.exit(0);
  } catch (e) {
    console.error('❌ Error:', e);
    process.exit(1);
  }
})();