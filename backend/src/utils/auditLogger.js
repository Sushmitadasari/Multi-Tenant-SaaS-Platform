const db = require('../config/db');

const logAction = async (tenantId, userId, action, entityType, entityId, ipAddress) => {
  try {
    const query = `
      INSERT INTO audit_logs (tenant_id, user_id, action, entity_type, entity_id, ip_address)
      VALUES ($1, $2, $3, $4, $5, $6)
    `;
    await db.query(query, [tenantId, userId, action, entityType, entityId, ipAddress]);
  } catch (error) {
    console.error('Audit Log Error:', error);
  }
};

module.exports = logAction;