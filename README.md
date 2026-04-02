# Finance Data Processing & Access Control API

A robust RESTful backend API built to support a finance dashboard system. It features secure user authentication, granular Role-Based Access Control (RBAC), financial record management, and data aggregation for dashboard analytics.

## 📋 Table of Contents
- [Core Features](#core-features)
- [System Architecture](#system-architecture)
- [Prerequisites & Setup](#prerequisites--setup)
- [Environment Variables](#environment-variables)
- [API Documentation](#api-documentation)
- [Design Decisions & Assumptions](#design-decisions--assumptions)
- [Folder Structure](#folder-structure)

---

## 🚀 Tech Stack

- **Runtime:** Node.js
- **Framework:** Express.js
- **Language:** TypeScript (Strict Mode, Node16 Module Resolution)
- **Database:** SQLite (Chosen for seamless local evaluation)
- **ORM:** Prisma 7 (Using `@prisma/adapter-better-sqlite3`)
- **Validation:** Zod (Strict runtime schema validation)
- **Authentication:** JSON Web Tokens (JWT) & bcryptjs

---

## ✨ Core Features

1. **User & Role Management (RBAC)**
   - Secure registration and login utilizing JWT and password hashing.
   - Granular access control based on three roles:
     - **ADMIN:** Full system access (Manage users, full CRUD on records).
     - **ANALYST:** Read-only access to records and full access to dashboard analytics.
     - **VIEWER:** Can only view basic data (cannot modify records or access deep analytics).
   - User account status management (`ACTIVE` / `INACTIVE`) to handle soft-disable logic.

2. **Financial Records Management**
   - Complete CRUD operations for financial transactions.
   - Dynamic filtering by `type` (INCOME/EXPENSE), `category`, and `date` ranges.
   - Strict Zod payload validation to ensure data integrity.

3. **Dashboard Analytics APIs**
   - Utilizes database-level aggregations (via Prisma) for performance.
   - Calculates total income, total expenses, and net balance.
   - Provides category-wise financial breakdowns.
   - Fetches recent transactional activity.

---

## 🏗️ System Architecture

The application follows a standard modular architecture, ensuring a clean separation of concerns:

- **Routes:** Map HTTP methods and endpoints to specific controllers, protected by authentication and authorization middlewares.
- **Controllers:** Handle incoming requests, orchestrate Zod validation, and format HTTP responses.
- **Services/DB Layer:** Prisma ORM directly interfaces with the SQLite database to execute optimized queries and aggregations.
- **Middlewares:** Centralized logic for JWT verification, RBAC enforcement, and global error handling.

---

## ⚙️ Prerequisites & Setup

### 1. Prerequisites
Ensure you have the following installed on your machine:
- [Node.js](https://nodejs.org/) (v18.0.0 or higher recommended)
- npm (comes with Node.js)

### Installation

Clone the repository and install the dependencies:
```
git clone https://github.com/The-morning-star23/finance-dashboard-api.git
cd finance-dashboard-api
npm install
```

### Setup Environment Variables
Create a `.env` file in the root of the project and add the following configuration:
```
DATABASE_URL="file:./dev.db"
JWT_SECRET="super_secret_finance_key_2026"
PORT=3000
```

### Initialize the Database
Push the Prisma schema to generate the SQLite database file and create the TypeScript client:
```
npx prisma db push
npx prisma generate
```

### Run the Application
Start the development server using ts-node-dev:
```
npm run dev
```
The server will boot up at http://localhost:3000.

## 📖 API Documentation

All routes (except /api/auth/register and /api/auth/login) require a valid JWT passed in the Authorization header:
```
Authorization: Bearer <TOKEN>
```

### Auth

| Method | Endpoint | Description | Access |
|--------|----------|-------------|--------|
| POST | /api/auth/register | Register a new user | Public |
| POST | /api/auth/login | Authenticate and receive JWT | Public |

### Users

| Method | Endpoint | Description | Access |
|--------|----------|-------------|--------|
| GET | /api/users | List all users | ADMIN |
| PATCH | /api/users/:id | Update user role/status | ADMIN |

### Financial Records

| Method | Endpoint | Description | Access |
|--------|----------|-------------|--------|
| POST | /api/records | Create a new record | ADMIN |
| GET | /api/records | Get all records (Supports query filters) | ADMIN, ANALYST, VIEWER |
| PUT | /api/records/:id | Update an existing record | ADMIN |
| DELETE | /api/records/:id | Delete a record | ADMIN |

### Dashboard

| Method | Endpoint | Description | Access |
|--------|----------|-------------|--------|
| GET | /api/dashboard/summary | Get financial aggregates & analytics | ADMIN, ANALYST |

## 🧠 Design Decisions & Assumptions
To successfully balance the requirements of the assignment with maintainability and ease of evaluation, the following decisions were made:

### Database Choice (SQLite)
SQLite was chosen to provide a "zero-configuration" evaluation experience. It allows the evaluator to pull the repo, push the schema, and run the app immediately without provisioning a PostgreSQL or MySQL server.

### Prisma 7 Adapter API
Utilized the newest Prisma 7 architecture with @prisma/adapter-better-sqlite3. This required specific instantiation logic in the utils/db.ts file to ensure the environment variables loaded prior to engine execution.

### Validation (Zod vs Joi/Class-Validator)
Zod was selected for its native TypeScript inference. It allows the API to fail fast on malformed bodies (returning a 400 status) before interacting with the database layer.

### Soft Deletion / Status Management
Instead of deleting users, a status field (ACTIVE/INACTIVE) is utilized. The authentication controller prevents inactive users from logging in, preserving referential integrity for their past financial records.

## 📂 Folder Structure
```
finance-dashboard-api/
├── prisma/
│   └── schema.prisma         # Database schema
├── src/
│   ├── controllers/          # Request handling & business logic
│   ├── middlewares/          # JWT Auth, RBAC, Error Handling
│   ├── routes/               # API route definitions
│   ├── utils/                # Database instance & helpers
│   └── index.ts              # Express application entry point
├── .env                      # Environment variables (ignored in Git)
├── package.json              
├── prisma.config.ts          # Prisma 7 configuration
└── tsconfig.json             # TypeScript configuration
```