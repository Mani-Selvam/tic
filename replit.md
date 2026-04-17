# Ticket Management System

## Overview
A full-stack ticket management system for managing workplace requests, approvals, and work logs. Features a modern web interface for users and administrators to create, track, and manage tickets through various stages.

## Architecture

### Frontend (Port 5000)
- **React 18** with **Vite** build system
- **Tailwind CSS** + **Radix UI** for components
- **TanStack Query** for data fetching
- **React Router Dom** for routing
- **React Hook Form** + **Zod** for form validation
- **Framer Motion** for animations

### Backend (Port 3001)
- **Node.js** + **Express 5**
- **MongoDB** + **Mongoose** for data persistence
- **JWT** for authentication
- **Multer** for file uploads
- **Bcrypt** for password hashing

## Project Layout
```
├── src/                  # React frontend
│   ├── Api/              # API service layer
│   ├── Components/       # Reusable UI components
│   ├── Layout/           # Page layout wrappers
│   ├── Pages/            # Route-level pages
│   │   ├── Master/       # Company, Dept, Designation, User mgmt
│   │   └── Ticket/       # Ticket CRUD and management
│   ├── Data/             # Static config (sidebar, etc.)
│   └── App.jsx           # Main routing
├── server/               # Express backend
│   ├── controllers/      # Request handlers
│   ├── models/           # Mongoose schemas
│   ├── routes/           # API endpoint definitions
│   ├── middleware/        # Auth and other middleware
│   ├── uploads/          # File upload storage
│   ├── db.js             # MongoDB connection
│   └── server.js         # Entry point
├── vite.config.ts        # Vite config (proxy to :3001, host 0.0.0.0)
├── start.sh              # Starts both server and Vite dev server
└── package.json          # npm dependencies
```

## Running the App
- **Development**: `bash start.sh` (starts both backend on :3001 and frontend on :5000)
- **Frontend only**: `npm run dev`
- **Build**: `npm run build`

## Environment Variables (.env)
- `MONGO_URI` - MongoDB Atlas connection string
- `JWT_SECRET` - JWT signing secret
- `VITE_API_URL` - API base URL (for frontend)

## Deployment
- **Target**: Autoscale
- **Build**: `npm run build` (builds React frontend to `dist/`)
- **Run**: `NODE_ENV=production node server/server.js` (Express serves static frontend + API)

## API Routes
- `/api/auth` - Authentication (login/register)
- `/api/companies` - Company management
- `/api/users` - User management
- `/api/departments` - Department management
- `/api/designations` - Designation management
- `/api/tickets` - Ticket CRUD
- `/api/ticket-status` - Ticket status management
- `/api/priorities` - Priority management
- `/api/approvals` - Approval workflow
- `/api/work-analysis` - Work analytics
- `/api/work-logs` - Work log tracking
- `/uploads` - Static file serving for uploads

## Package Manager
npm (package-lock.json present)
