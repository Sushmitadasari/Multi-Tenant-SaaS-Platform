const sequelize = require('../config/database');
const Tenant = require('./tenant');
const User = require('./user');
const Project = require('./project');
const Task = require('./task');
const AuditLog = require('./auditLog');

// --- Relationships ---

// Tenant has many...
Tenant.hasMany(User, { foreignKey: 'tenantId', as: 'users' });
Tenant.hasMany(Project, { foreignKey: 'tenantId', as: 'projects' });
Tenant.hasMany(Task, { foreignKey: 'tenantId', as: 'tasks' });
Tenant.hasMany(AuditLog, { foreignKey: 'tenantId', as: 'auditLogs' });

// User relationships
User.belongsTo(Tenant, { foreignKey: 'tenantId', as: 'tenant' });
// FIX: Using 'createdById' to match the database column
User.hasMany(Project, { foreignKey: 'createdById', as: 'createdProjects' });
User.hasMany(Task, { foreignKey: 'assignedTo', as: 'assignedTasks' });

// Project relationships
Project.belongsTo(Tenant, { foreignKey: 'tenantId', as: 'tenant' });
// FIX: Using 'createdById' to match the database column
Project.belongsTo(User, { foreignKey: 'createdById', as: 'creator' });
Project.hasMany(Task, { foreignKey: 'projectId', as: 'tasks' });

// Task relationships
Task.belongsTo(Tenant, { foreignKey: 'tenantId', as: 'tenant' });
Task.belongsTo(Project, { foreignKey: 'projectId', as: 'project' });
Task.belongsTo(User, { foreignKey: 'assignedTo', as: 'assignee' });

module.exports = {
  sequelize,
  Tenant,
  User,
  Project,
  Task,
  AuditLog
};