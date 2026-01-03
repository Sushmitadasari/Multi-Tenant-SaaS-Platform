# Technical Specification

## Project Structure

### Backend (`/backend`)
* **src/config/**: Database configuration and environment setup.
* **src/controllers/**: Logic for API endpoints (Auth, Projects, Tasks, Tenants, Users).
* **src/middleware/**: Authentication (`authMiddleware.js`) and error handling.
* **src/models/**: Sequelize models (`User`, `Tenant`, `Project`, `Task`, `AuditLog`).
* **src/routes/**: Express route definitions mapping URLs to controllers.
* **src/scripts/**: Database migration and seeding scripts.
* **Dockerfile**: **Optimized Multi-stage Docker build** for the Node.js API (Builder vs Runtime stages).

### Frontend (`/frontend`)
* **src/components/**: Reusable UI components (Layout, Navbar, etc.).
* **src/pages/**: Main application views (Dashboard, Login, Register, Projects, etc.).
* **src/api.js**: Centralized Axios instance for making API requests.
* **Dockerfile**: Docker configuration for the React/Vite application.

---

## Development Setup Guide

### Prerequisites
* Docker & Docker Compose
* Git

### Installation & Running (Docker)
The entire application is containerized for a one-command startup.

1.  **Clone the repository.**
2.  **Run Docker Compose:**
    ```bash
    docker-compose up -d --build
    ```
3.  **Access the App:**
    * **Frontend:** [http://localhost:3000](http://localhost:3000)
    * **Backend Health Check:** [http://localhost:5000/api/health](http://localhost:5000/api/health)

*Note: The `backend` container automatically runs database migrations and seeds initial data upon startup.*

### Environment Variables
Managed via `docker-compose.yml`:
* `POSTGRES_USER` / `POSTGRES_PASSWORD` / `POSTGRES_DB`
* `JWT_SECRET`
* `FRONTEND_URL` (for CORS)


---

### 4. Update `docs/architecture.md`

**The Issue:** It was a bit too simple.
**The Fix:** Add the specific tech stack versions and the "Data Isolation" details.


