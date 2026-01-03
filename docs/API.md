# API Documentation

Base URL: `http://localhost:5000`

## 🔐 Authentication

### 1. Register Tenant
* **Endpoint:** `POST /api/auth/register-tenant`
* **Access:** Public
* **Description:** Register a new organization and admin account.
* **Body:**
  ```json
  {
    "tenantName": "SpaceX",
    "subdomain": "spacex",
    "adminEmail": "elon@spacex.com",
    "adminPassword": "password123",
    "adminFullName": "Elon Musk"
  }

```

### 2. Login

* **Endpoint:** `POST /api/auth/login`
* **Access:** Public
* **Body:**
```json
{
  "email": "elon@spacex.com",
  "password": "password123",
  "tenantSubdomain": "spacex" // Optional for Super Admin
}

```


* **Response:** Returns JWT token and user info.

### 3. Get Current User

* **Endpoint:** `GET /api/auth/me`
* **Access:** Protected (Bearer Token)

### 4. Logout

* **Endpoint:** `POST /api/auth/logout`
* **Access:** Protected

---

## 🏢 Tenant Management

### 5. List All Tenants

* **Endpoint:** `GET /api/tenants`
* **Access:** Super Admin Only
* **Query Parameters:**
* `page` (default: 1)
* `limit` (default: 10)
* `status` (optional: 'active', 'suspended')
* `subscriptionPlan` (optional: 'free', 'pro', 'enterprise')


* **Response:**
```json
{
  "success": true,
  "data": {
    "tenants": [...],
    "pagination": { "total": 50, "currentPage": 1, "totalPages": 5 }
  }
}

```



### 6. Get Tenant Details

* **Endpoint:** `GET /api/tenants/:tenantId`
* **Access:** Super Admin or Tenant Admin (own tenant only)

### 7. Update Tenant

* **Endpoint:** `PUT /api/tenants/:tenantId`
* **Access:** Super Admin (all fields) or Tenant Admin (name only)

---

## 👥 User Management

### 8. Add User

* **Endpoint:** `POST /api/tenants/:tenantId/users`
* **Access:** Tenant Admin Only
* **Body:**
```json
{
  "fullName": "Engineer 1",
  "email": "eng@spacex.com",
  "password": "password123",
  "role": "user"
}

```



### 9. List Users

* **Endpoint:** `GET /api/tenants/:tenantId/users`
* **Access:** Protected

### 10. Update User

* **Endpoint:** `PUT /api/users/:userId`
* **Access:** Tenant Admin

### 11. Delete User

* **Endpoint:** `DELETE /api/users/:userId`
* **Access:** Tenant Admin
* **Note:** Tenant Admin cannot delete themselves.

---

## 🚀 Project Management

### 12. Create Project

* **Endpoint:** `POST /api/projects`
* **Access:** Tenant Admin
* **Body:**
```json
{
  "name": "Mars Mission",
  "description": "Colonize Mars",
  "status": "active"
}

```



### 13. List Projects

* **Endpoint:** `GET /api/projects`
* **Access:** Protected (Scoped to Tenant)

### 14. Get Project

* **Endpoint:** `GET /api/projects/:projectId`
* **Access:** Protected

### 15. Update Project

* **Endpoint:** `PUT /api/projects/:projectId`
* **Access:** Tenant Admin

### 16. Delete Project

* **Endpoint:** `DELETE /api/projects/:projectId`
* **Access:** Tenant Admin

---

## ✅ Task Management

### 17. Create Task

* **Endpoint:** `POST /api/projects/:projectId/tasks`
* **Access:** Protected
* **Body:**
```json
{
  "title": "Build Rocket",
  "status": "todo", // todo, in_progress, done
  "projectId": "uuid..."
}

```



### 18. List Tasks

* **Endpoint:** `GET /api/projects/:projectId/tasks`
* **Access:** Protected

### 19. Update Task

* **Endpoint:** `PUT /api/tasks/:taskId`
* **Access:** Protected

### 20. Update Task Status

* **Endpoint:** `PATCH /api/tasks/:taskId/status`
* **Access:** Protected
* **Body:** `{ "status": "done" }`