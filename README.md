
# ⚡ WORKSPACE.ONE | Enterprise Multi-Tenant SaaS Platform

> **A production-grade, containerized Project Governance System built for scalable organizations with strict tenant isolation and precision access control.**

WORKSPACE.ONE is a full-stack SaaS ecosystem engineered for high-performance teams. Designed using a **Shared-Database, Logical Isolation Architecture**, it ensures secure tenant siloing, subscription enforcement, and role-based governance — all deployed via Docker for seamless orchestration.

![System Status](https://img.shields.io/badge/status-production--ready-emerald)
![Architecture](https://img.shields.io/badge/architecture-multi--tenant-blue)
![Deployment](https://img.shields.io/badge/deployment-dockerized-black)

---

## 📽️ System Demonstration

🎥 **Architecture & Feature Walkthrough**


---

# 🌟 Strategic Capabilities

## 🛡️ Advanced Multi-Tenant Isolation

* Implements **Shared Schema + tenant_id Row-Level Segregation**
* Middleware-enforced tenant scoping across all service layers
* Prevents cross-organization data access
* Indexed tenant filtering for query optimization

---

## 🔐 Precision Role-Based Access Control (RBAC)

| Role              | Capabilities                            |
| ----------------- | --------------------------------------- |
| **Super Admin**   | Global visibility, tenant provisioning  |
| **Tenant Admin**  | Workspace governance, user management   |
| **Standard User** | Project participation & task management |

Access validation occurs via:

* JWT authentication middleware
* Role authorization guards
* Tenant-bound query enforcement

---

## 📊 Project & Task Orchestration Engine

* Project lifecycle management
* Kanban-based workflow (Todo → In Progress → Completed)
* Real-time progress monitoring
* Role-sensitive task assignment

---

## 💳 Subscription-Aware SaaS Logic

* Free vs Pro plan enforcement
* Dynamic user & project limits
* Upgrade gating at service layer
* Monetization-ready architecture

---

## 🏗️ Containerized Infrastructure

Fully orchestrated using Docker Compose:

* PostgreSQL 15 (Database Service)
* Express.js (API Layer)
* React SPA (Frontend Client)

Single-command deployment for complete stack initialization.

---

# 🛠️ Technology Architecture

## 🔹 Frontend Core

* **Framework:** React 18
* **Routing:** React Router v6
* **HTTP Client:** Axios
* **UI Layer:** Bootstrap 5
* **State Management:** Context API + Hooks

---

## 🔹 Backend Core

* **Runtime:** Node.js
* **Framework:** Express.js
* **Database:** PostgreSQL 15
* **ORM:** Sequelize
* **Authentication:** JWT
* **Security:** Bcrypt Hashing, CORS Middleware

---

# 🧠 Architectural Blueprint

## 🔹 Client Layer

React SPA → RESTful API Calls → JWT Token Authentication

## 🔹 Server Layer

Express Middleware Stack:

* Auth Verification
* Role Validation
* Tenant Filtering
* Subscription Enforcement

## 🔹 Data Layer

Single Shared Database
Logical Isolation via:

```sql
WHERE tenant_id = authenticated_user.tenant_id
```

Indexed tenant_id ensures scalability under high concurrency.

---

# 🚀 Initialization & Deployment

## ✅ Prerequisites

* Docker Desktop (20.10+)
* Git

---

## 1️⃣ Clone Repository

```bash
git clone https://github.com/Sushmitadasari/Multi-Tenant-SaaS-Platform
cd saas-platform
```

---

## 2️⃣ Boot the System

```bash
docker-compose up -d --build
```

---

## 3️⃣ Run Database Migrations

```bash
docker-compose exec backend npm run migrate
```

---

## 4️⃣ Seed Initial Data

```bash
docker-compose exec backend npm run seed
```

---

## 🌐 Access Points

| Service      | URL                                                                  |
| ------------ | -------------------------------------------------------------------- |
| Frontend     | [http://localhost:3000](http://localhost:3000)                       |
| Backend API  | [http://localhost:5000](http://localhost:5000)                       |
| Health Check | [http://localhost:5000/api/health](http://localhost:5000/api/health) |

---

# 🔑 Evaluation Credentials

### 🏢 Tenant Admin

* **Email:** [admin@demo.com](mailto:admin@demo.com)
* **Password:** Demo@123
* **Workspace:** demo

### 👤 Standard User

* **Email:** [user1@demo.com](mailto:user1@demo.com)
* **Password:** User@123
* **Workspace:** demo

---

# ⚙️ Environment Variables

Configured via `docker-compose.yml`

| Variable     | Purpose                      |
| ------------ | ---------------------------- |
| DATABASE_URL | PostgreSQL connection string |
| JWT_SECRET   | Token signing secret         |
| FRONTEND_URL | CORS configuration           |
| PORT         | Backend server port          |

---

# 📂 Project Structure

```
saas-platform/
│
├── backend/
│   ├── src/
│   │   ├── controllers/
│   │   ├── middleware/
│   │   ├── models/
│   │   └── services/
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   └── api/
│
├── docker-compose.yml
└── README.md
```

---

# 📈 Scalability Considerations

* Indexing on tenant_id
* Horizontal container scaling
* Redis caching layer (future enhancement)
* Schema-per-tenant migration path for enterprise scale
* Centralized logging & audit tracking

---

# 🧪 Security Posture

* Password hashing with bcrypt
* Stateless JWT authentication
* Role-scoped authorization
* Tenant-enforced database queries
* CORS configuration isolation
* Audit logging for sensitive operations

---

# 🎯 Business Value

This platform demonstrates:

* Real-world SaaS architecture
* Secure multi-tenant implementation
* Subscription monetization logic
* Production-grade container deployment
* Enterprise-ready RBAC enforcement

---
