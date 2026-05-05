# 🚀 ProManage — Project Management Web App

A full-stack project management application with role-based access control (Admin/Member), built with **React**, **Node.js**, **Express**, and **Prisma (SQLite)**.

## ✨ Features

- **Authentication** — Secure JWT-based Signup & Login
- **Role-Based Access** — Admin creates projects; Members track tasks
- **Projects** — Create, view, and delete projects (Admin)
- **Tasks** — Create, assign, prioritize, set due dates, update status
- **Kanban Board** — Visual task tracking (Todo → In Progress → Done)
- **Dashboard** — Stats overview with progress bars and overdue alerts
- **Search** — Filter tasks by title or description
- **Toast Notifications** — Real-time feedback on all actions
- **Premium UI** — Dark mode, glassmorphism, micro-animations

## 🛠️ Tech Stack

| Layer | Tech |
|-------|------|
| Frontend | React (Vite), Vanilla CSS |
| Backend | Node.js, Express.js |
| Database | SQLite via Prisma ORM |
| Auth | JWT + bcryptjs |

## 📦 Setup

```bash
# Backend
cd backend
npm install
npx prisma db push
npx prisma generate
node server.js       # runs on http://localhost:5000

# Frontend
cd frontend
npm install
npm run dev          # runs on http://localhost:5173
```

## 📸 Screenshots

_Coming soon_

## 📄 License

MIT
