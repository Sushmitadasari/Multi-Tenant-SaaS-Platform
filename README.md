# ⚡ WORKFLOW. | Modern Multi-Tenant Project Engine

> **An enterprise-grade, containerized Project Orchestration System featuring a custom-engineered Obsidian-Emerald Interface.**

WORKFLOW. is a full-stack SaaS ecosystem engineered for high-performance organizations. Built with a robust **Multi-Tenant Architecture**, it ensures complete data isolation and secure scaling. This platform features a high-contrast industrial UI, moving away from generic templates to provide a focused, "command-center" experience for team collaboration.

![System Status](https://img.shields.io/badge/status-active-emerald)
![Environment](https://img.shields.io/badge/docker-containerized-white)


---

## 📽️ Project Walkthrough
**[🎥 View the Design & Architecture Showcase](https://youtu.be/h9bwxlI3I4I)**

---

## 🌟 Strategic Capabilities

1.  **🛡️ Advanced Tenant Siloing**
    * Uses a "Shared Schema, Logical Isolation" model.
    * Integrated data-access middleware enforces strict tenant boundaries at the database layer to prevent cross-organization leakage.
2.  **⚖️ Precision Access Control (RBAC)**
    * **System Root:** Full global visibility and tenant lifecycle management.
    * **Organization Admin:** Total governance over workspace users, projects, and permissions.
    * **Project Member:** Focused access to assigned tasks and collaborative assets.
3.  **📊 Real-Time Analytics Dashboard**
    * Custom-built visual telemetry for tracking project health.
    * Automated progress ring visualizations for project completion status.
4.  **🏗️ Containerized Deployment**
    * Full orchestration via Docker Compose.
    * Single-command initialization for the entire stack (PostgreSQL, Express, React).
5.  **✨ Neo-Brutalist Industrial UI**
    * High-contrast Dark Mode (Zinc-950) designed to reduce ocular fatigue.
    * Emerald-500 accent system for intuitive navigation and status monitoring.
    * Responsive Sidebar-based "Floating UI" architecture.

---

## 🛠️ Technology Architecture

### **Frontend Core**
* **Library:** React 18 (Vite Framework)
* **Design System:** Custom Tailwind CSS 3.4 implementation
* **State & Logic:** Advanced React Hooks & Context API
* **Icons:** Lucide-React Design Set

### **Backend Core**
* **Environment:** Node.js v18 (Alpine Optimized)
* **API Engine:** Express REST Framework
* **Data Layer:** PostgreSQL 15 & Sequelize ORM
* **Security:** JSON Web Tokens (JWT) & Bcrypt Encryption

---

## 🚀 Initialization & Deployment

### **Prerequisites**
* Docker Desktop (Engine version 20.10+)
* Git

### **Step-by-Step Launch**

**1. Clone the Source**
```bash
git clone [your-repository-url]
cd workflow-platform

```

**2. Boot the Ecosystem**
The following command builds the environment and triggers automatic database migrations and seeding.

```bash
docker-compose up -d --build

```

**3. Health Verification**

* **API Status:** [http://localhost:5000/api/health](https://www.google.com/search?q=http://localhost:5000/api/health)
* **Frontend Access:** [http://localhost:3000](https://www.google.com/search?q=http://localhost:3000)

---

## ⚙️ Configuration Parameters

The system is pre-tuned for evaluation. Environment variables are managed via the `docker-compose.yml` manifest.

| Variable | Context | Default |
| --- | --- | --- |
| `DB_HOST` | Database Service | `database` |
| `DB_NAME` | Schema Identity | `saas_db` |
| `JWT_SECRET` | Auth Token Signing | `custom_secure_key_...` |
| `FRONTEND_URL` | Security Policy (CORS) | `http://frontend:3000` |

---

## 📚 Core API Endpoints

| Method | Route | Description | Permission |
| --- | --- | --- | --- |
| `POST` | `/api/auth/login` | Account Authentication | Public |
| `POST` | `/api/auth/register-tenant` | Organization Provisioning | Public |
| `GET` | `/api/projects` | Project Manifest Sync | Member+ |
| `POST` | `/api/tasks` | Task Deployment | Admin |
| `GET` | `/api/users` | Personnel Audit | Admin |

---

## 🧪 Evaluation Credentials

The following identities are automatically provisioned during the database seed sequence:

### **1. Organization Admin**

* **Identity:** `admin@demo.com`
* **Passcode:** `Demo@123`
* **Workspace ID:** `demo`

### **2. Standard Member**

* **Identity:** `user1@demo.com`
* **Passcode:** `User@123`
* **Workspace ID:** `demo`

---

## 📂 System Topography

```bash
saas-platform/
├── backend/              # Node.js API Infrastructure
│   ├── src/
│   │   ├── middleware/   # Auth & Tenant Isolation Logic
│   │   ├── models/       # Relational Data Schemas
│   │   └── scripts/      # Auto-Seed & Migration Assets
├── frontend/             # React Design Layer
│   ├── src/
│   │   ├── components/   # Shared UI Modules
│   │   ├── pages/        # View Logic & Routing
│   │   └── api/          # Centralized Service Integration
├── docker-compose.yml    # System Orchestration Manifest
└── submission.json       # Automated Evaluation Metadata

