require('dotenv').config();
const fs = require('fs');
const path = require('path');
const sequelize = require('../config/database');

const migrate = async () => {
  try {
    console.log('🔄 Starting Database Migration (SQL Mode)...');

    // 1. Authenticate
    await sequelize.authenticate();
    console.log('✅ Database Connection Established.');

    // 2. Read Migration Files
    const migrationsDir = path.join(__dirname, '../../migrations');
    
    if (!fs.existsSync(migrationsDir)) {
       throw new Error(`Migrations directory not found at: ${migrationsDir}`);
    }

    const files = fs.readdirSync(migrationsDir)
      .filter(file => file.endsWith('.sql'))
      .sort(); // Ensures 001 runs before 002

    console.log(`📂 Found ${files.length} migration files.`);

    // 3. Execute Each File
    for (const file of files) {
      const filePath = path.join(migrationsDir, file);
      const sql = fs.readFileSync(filePath, 'utf8');
      
      console.log(`▶️ Executing: ${file}`);
      await sequelize.query(sql);
    }
    
    console.log('✅ All Migrations Completed Successfully.');
    process.exit(0);
  } catch (error) {
    console.error('❌ Migration Failed:', error);
    process.exit(1);
  }
};

migrate();