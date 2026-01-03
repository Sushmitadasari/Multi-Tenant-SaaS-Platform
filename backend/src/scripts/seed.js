require('dotenv').config();
const bcrypt = require('bcryptjs');
const sequelize = require('../config/database');
const { User, Tenant, Project, Task } = require('../models');

const seed = async () => {
  try {
    console.log('Starting Database Seeding...');

    // 1. Create Tenant (Matches submission.json "Demo Company")
    const [tenant] = await Tenant.findOrCreate({
      where: { subdomain: 'demo' },
      defaults: {
        name: 'Demo Company',
        subscriptionPlan: 'pro',
        status: 'active'
      }
    });
    console.log('✅ Tenant Created:', tenant.name);

    // 2. Create Super Admin (Matches submission.json)
    const salt = await bcrypt.genSalt(10);
    const superAdminPass = await bcrypt.hash('Admin@123', salt);
    
    await User.findOrCreate({
      where: { email: 'superadmin@system.com' },
      defaults: {
        fullName: 'System Super Admin',
        password: superAdminPass,
        role: 'super_admin',
        tenantId: null 
      }
    });
    console.log('✅ Super Admin Created');

    // 3. Create Tenant Admin (Matches submission.json)
    const adminPass = await bcrypt.hash('Demo@123', salt);
    const [tenantAdmin] = await User.findOrCreate({
      where: { email: 'admin@demo.com', tenantId: tenant.id },
      defaults: {
        fullName: 'Demo Admin',
        password: adminPass,
        role: 'tenant_admin'
      }
    });
    console.log('✅ Tenant Admin Created');

    // 4. Create Regular Users (Matches submission.json)
    const userPass = await bcrypt.hash('User@123', salt);
    
    await User.findOrCreate({
      where: { email: 'user1@demo.com', tenantId: tenant.id },
      defaults: { fullName: 'Demo User 1', password: userPass, role: 'user' }
    });

    await User.findOrCreate({
      where: { email: 'user2@demo.com', tenantId: tenant.id },
      defaults: { fullName: 'Demo User 2', password: userPass, role: 'user' }
    });
    console.log('✅ Regular Users Created');

    // 5. Create Sample Projects (Matches submission.json)
    // Project Alpha
    const [projectAlpha] = await Project.findOrCreate({
      where: { name: 'Project Alpha', tenantId: tenant.id },
      defaults: {
        description: 'First demo project',
        status: 'active',
        createdById: tenantAdmin.id
      }
    });

    // Project Beta (ADDED THIS to match submission.json)
    const [projectBeta] = await Project.findOrCreate({
        where: { name: 'Project Beta', tenantId: tenant.id },
        defaults: {
          description: 'Second demo project',
          status: 'active',
          createdById: tenantAdmin.id
        }
    });
    console.log('✅ Projects Created (Alpha & Beta)');

    // 6. Create Sample Tasks for Project Alpha
    if (projectAlpha) {
        await Task.findOrCreate({
            where: { title: 'Design Homepage', projectId: projectAlpha.id },
            defaults: { status: 'done', tenantId: tenant.id }
        });
        await Task.findOrCreate({
            where: { title: 'Implement Auth', projectId: projectAlpha.id },
            defaults: { status: 'in_progress', tenantId: tenant.id }
        });
    }

    // Create Sample Task for Project Beta (Optional but good for completeness)
    if (projectBeta) {
        await Task.findOrCreate({
            where: { title: 'Initial Planning', projectId: projectBeta.id },
            defaults: { status: 'todo', tenantId: tenant.id }
        });
    }

    console.log('✅ Tasks Created');
    console.log('🚀 Seeding Completed Successfully.');
    process.exit(0);
  } catch (error) {
    console.error('❌ Seeding Failed:', error);
    process.exit(1);
  }
};

seed();