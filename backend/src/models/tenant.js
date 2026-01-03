const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Tenant = sequelize.define('Tenant', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false
  },
  subdomain: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true
  },
  status: {
    type: DataTypes.ENUM('active', 'suspended'),
    defaultValue: 'active'
  },
  subscriptionPlan: {
    type: DataTypes.ENUM('free', 'pro', 'enterprise'),
    defaultValue: 'free'
  },
  maxUsers: {
    type: DataTypes.INTEGER,
    defaultValue: 5
  },
  maxProjects: {
    type: DataTypes.INTEGER,
    defaultValue: 3
  }
}, {
  timestamps: true,
  tableName: 'tenants'
});

module.exports = Tenant;