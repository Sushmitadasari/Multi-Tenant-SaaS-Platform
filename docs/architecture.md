# System Architecture

## Overview
The platform follows a **3-Tier Architecture** containerized with Docker.

1.  **Client Layer:** React 18 + Vite (Port 3000)
2.  **API Layer:** Node.js v18 + Express (Port 5000)
3.  **Data Layer:** PostgreSQL 15 (Port 5432) with Persistent Volumes

## 💾 Database Schema
* **Tenants:** Stores organization details and subscription limits.
* **Users:** Stores credentials (hashed) and links to `tenant_id`.
* **Projects:** Workspaces linked to a tenant.
* **Tasks:** Individual work items linked to a project and tenant.
* **AuditLogs:** Security tracking for critical actions.

## 🔒 Security & Data Isolation
* **Strategy:** Shared Database, Shared Schema.
* **Isolation Mechanism:**
    1.  User logs in -> Backend generates JWT containing `tenantId`.
    2.  Frontend includes JWT in `Authorization` header.
    3.  `authMiddleware` verifies token and attaches `req.user`.
    4.  **ALL** Database queries automatically append `WHERE tenantId = req.user.tenantId`.
    5.  This ensures no tenant can access another's data.

## 🐳 Docker Architecture
* **Multi-Stage Builds:** Used for Backend to minimize image size.
* **Networking:** All services communicate via the internal Docker network.
* **Volumes:** Named volume `db_data` persists PostgreSQL data on the host machine.

