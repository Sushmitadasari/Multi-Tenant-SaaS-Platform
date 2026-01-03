# Technical Specification

## 1. How the Project is Organized
The system is divided into two main parts: the **Backend** (the engine) and the **Frontend** (the dashboard).

### Backend (The Engine)
Everything here handles data and security:
- **Controllers:** The managers that decide what happens when a button is clicked.
- **Routes:** The "URL addresses" for the different features.
- **Middleware:** Security guards that check your ID (JWT) before letting you in.
- **Models:** The blueprints for how our data is stored.
- **Migrations & Seeds:** Tools to build the database tables and fill them with sample data.

### Frontend (The Dashboard)
Everything here is what the user see and interacts with:
- **Pages:** The main screens (Login, Dashboard, Projects).
- **Components:** Small reusable parts like buttons, forms, and navigation bars.
- **Services:** The "phone lines" used to send and receive data from the backend.

---

## 2. Setting Up for Development
We use **Docker** to make sure the app works exactly the same on everyone's computer.

### What you need:
- **Docker:** A tool to "package" the app.
- **Docker Compose:** A tool to run all the parts (database, backend, and frontend) at once.

---

## 3. Running the System (Docker Setup)
You don't need to install databases or servers manually. Just run one command:

`docker-compose up -d`

**When you run this, three things happen automatically:**
1.  **Database:** A PostgreSQL database starts up.
2.  **Backend:** The server starts and connects to the database.
3.  **Frontend:** The website becomes available in your browser.

The system is also smart enough to build your database tables and add "test data" automatically the very first time it starts.

| Service | Port | Description |
| :--- | :--- | :--- |
| **Database** | 5432 | Stores all company and task data. |
| **Backend** | 5000 | Processes the logic and security. |
| **Frontend** | 3000 | The website you see in your browser. |

---

## 4. Important Settings (Environment Variables)
We don't hardcode sensitive info like passwords. Instead, we use "Environment Variables." These are secret settings stored in a file called `.env` or inside `docker-compose.yml`. This keeps our "master keys" safe and allows us to change settings easily without rewriting the code.