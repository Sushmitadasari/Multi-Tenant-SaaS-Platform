# Product Requirements Document (PRD)

## 👤 User Personas
1.  **Super Admin:** System-level administrator with access to all tenants. Responsible for platform maintenance and plan management.
2.  **Tenant Admin:** Organization-level administrator. Responsible for managing their team (users), projects, and billing.
3.  **Standard User:** Team member who works on tasks and projects assigned to them.

## ✅ Functional Requirements

### Authentication & Authorization
1.  **FR-01:** System must allow new tenants to register with a unique subdomain.
2.  **FR-02:** System must support JWT-based stateless authentication with 24-hour expiry.
3.  **FR-03:** Users must be able to log in using their email, password, and tenant subdomain.
4.  **FR-04:** System must support Role-Based Access Control (RBAC) with three distinct roles.
5.  **FR-05:** Users must be able to logout, which invalidates their client-side session.

### Tenant Management
6.  **FR-06:** Super Admins must be able to view a paginated list of all registered tenants.
7.  **FR-07:** System must enforce strict data isolation; tenants cannot access other tenants' data.
8.  **FR-08:** Tenant Admins must be able to update their organization's name.

### User Management
9.  **FR-09:** Tenant Admins must be able to add new users to their organization.
10. **FR-10:** System must prevent Tenant Admins from deleting their own account (Self-Deletion prevention).
11. **FR-11:** System must enforce subscription limits on the number of users per tenant.

### Project & Task Management
12. **FR-12:** Tenant Admins must be able to create new projects.
13. **FR-13:** Users must be able to view projects only within their own tenant.
14. **FR-14:** Users must be able to create tasks within a specific project.
15. **FR-15:** Users must be able to update task status (Todo -> In Progress -> Done).
16. **FR-16:** System must enforce subscription limits on the number of projects per tenant.

## 🚀 Non-Functional Requirements
1.  **NFR-01 (Security):** All user passwords must be hashed using `bcrypt` before storage.
2.  **NFR-02 (Performance):** API responses should typically be returned within 200ms.
3.  **NFR-03 (Scalability):** The architecture must support horizontal scaling via Docker containers.
4.  **NFR-04 (Persistence):** Database data must be persisted using Docker Volumes to survive container restarts.
5.  **NFR-05 (Availability):** The system must include a health check endpoint for monitoring uptime.




