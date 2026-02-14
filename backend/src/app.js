const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const errorHandler = require('./middleware/errorMiddleware');
const db = require('./config/db');
const fs = require('fs');
const path = require('path');

const app = express();

// Middleware
app.use(express.json());
app.use(cors());
app.use(helmet());
app.use(morgan('dev'));

// Routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/tenants', require('./routes/tenantRoutes'));
app.use('/api', require('./routes/userRoutes'));
app.use('/api/projects', require('./routes/projectRoutes'));
app.use('/api', require('./routes/taskRoutes'));

// We will add other routes here later

// Health Check (Mandatory for Docker)
app.get('/api/health', async (req, res) => {
    try {
        await db.query('SELECT 1');
        res.json({ status: 'ok', database: 'connected' });
    } catch (err) {
        res.status(500).json({ status: 'error', database: 'disconnected' });
    }
});

// Automatic Migration Runner (Mandatory for Docker)
const runMigrations = async () => {
    try {
        const migrationFiles = fs.readdirSync(path.join(__dirname, '../migrations')).sort();
        for (const file of migrationFiles) {
            const sql = fs.readFileSync(path.join(__dirname, '../migrations', file), 'utf8');
            await db.query(sql);
            console.log(`Executed migration: ${file}`);
        }
        
        // Run Seeds
        if (fs.existsSync(path.join(__dirname, '../seeds/seed_data.sql'))) {
             const seedSql = fs.readFileSync(path.join(__dirname, '../seeds/seed_data.sql'), 'utf8');
             await db.query(seedSql);
             console.log('Executed seed data');
        }
    } catch (err) {
        console.error('Migration failed:', err);
    }
};

// Start Server Function
const startServer = async () => {
    await runMigrations();
    const PORT = process.env.PORT || 5000;
    app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
};

if (require.main === module) {
    startServer();
}

app.use(errorHandler);

module.exports = app;