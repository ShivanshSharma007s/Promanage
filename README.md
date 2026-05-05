# 🚀 ProManage — Project Management Web App

A high-performance, premium full-stack project management application built for teams. Manage projects, track tasks on a Kanban board, and monitor progress with a sleek, dark-themed dashboard.

## ✨ Key Features

- **🔐 Secure Authentication** — JWT-based Login & Signup with bcrypt password hashing.
- **🛡️ Role-Based Access** — Support for **Admin** (can create projects/tasks) and **Member** roles.
- **📊 Interactive Dashboard** — Real-time stats (Total Projects, Tasks, Overdue count, Team size).
- **📋 Kanban Board** — Drag-style status management (Todo → In Progress → Done).
- **🏷️ Smart Task Tracking** — Priority levels (High/Medium/Low), Due Dates, and Assignees.
- **🔍 Global Search** — Instant filtering of tasks across the workspace.
- **✨ Premium UI** — Built with Vanilla CSS featuring Glassmorphism, animations, and a fully responsive design.
- **🔔 Real-time Toasts** — Immediate feedback for every action (Create, Delete, Update).

## 🛠️ Tech Stack

- **Frontend:** React (Vite), Lucide-React Icons, Axios
- **Backend:** Node.js, Express.js
- **ORM:** Prisma (v6) with SQLite
- **Auth:** JSON Web Tokens (JWT)
- **Deployment:** Production-ready for Railway (Docker-based)

## 🚀 Local Installation

### 1. Clone the repository
```bash
git clone https://github.com/ShivanshSharma007s/Promanage.git
cd Promanage
```

### 2. Setup Backend
```bash
cd backend
npm install
# Setup environment variables (.env)
# PORT=5000
# DATABASE_URL="file:./dev.db"
# JWT_SECRET="your_secret_key"
npx prisma db push
npx prisma generate
node server.js
```

### 3. Setup Frontend
```bash
cd ../frontend
npm install
npm run dev
```

## 🌐 Railway Deployment

This project is pre-configured for **Railway** using a `Dockerfile`.

1. Connect your GitHub repo to a new Railway project.
2. Add the following **Environment Variables** in Railway:
   - `PORT`: `8080`
   - `DATABASE_URL`: `file:./dev.db`
   - `JWT_SECRET`: `your_random_secret_string`
3. Generate a Domain in the **Settings** tab.
4. Your app is live!

## 📄 License
Distributed under the MIT License.
