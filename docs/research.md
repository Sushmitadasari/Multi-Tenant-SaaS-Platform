# Research: Multi-Tenancy Approaches

## Chosen Approach: Shared Database, Shared Schema
We chose the "Shared Database, Shared Schema" approach where every table has a `tenant_id` column.

**Pros:**
- Cost-effective (single DB instance).
- Easier to manage migrations.
- Simpler backup/restore for the whole system.

**Cons:**
- Stricter code-level security required (handled via Middleware).
- Data isolation is logical, not physical.

**Security:**
We use Row-Level Security logic in the application layer. A global middleware extracts `tenantId` from the JWT and injects it into every Sequelize query.
