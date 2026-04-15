# Neo Ticket System

A full-stack ticket management system built with the MERN stack (MongoDB, Express, React, Node.js).

## Architecture

- **Frontend**: React 18 + TypeScript, Vite, Tailwind CSS, Radix UI, TanStack Query, React Router DOM
- **Backend**: Node.js + Express.js, MongoDB + Mongoose, JWT authentication, Multer file uploads
- **Build Tool**: Vite

## Project Structure

```
.
├── src/                    # Frontend (React/TypeScript)
│   ├── Api/                # API service layers
│   ├── Components/         # Reusable UI components
│   ├── config/apiConfig.js # API base URL configuration
│   ├── Pages/              # Page components
│   └── main.tsx            # Frontend entry point
├── server/                 # Backend (Node.js/Express)
│   ├── controllers/        # Business logic
│   ├── middleware/         # Auth & upload middlewares
│   ├── models/             # Mongoose schemas
│   ├── routes/             # Express route definitions
│   ├── db.js               # MongoDB connection
│   └── server.js           # Main backend entry point (port 3001)
├── vite.config.ts          # Vite config with proxy to backend
├── start.sh                # Combined startup script
└── package.json
```

## Running the Application

The `Start application` workflow runs `bash start.sh` which:
1. Starts the Express backend on port 3001 (localhost only)
2. Starts the Vite dev server on port 5000 (proxies /api and /uploads to backend)

## Environment Variables / Secrets

- `MONGO_URI` — MongoDB connection string (required)

## Key Configuration

- Frontend port: **5000** (webview)
- Backend port: **3001** (console, localhost only)
- Vite proxy: `/api/*` and `/uploads/*` → `http://localhost:3001`
- API base URL in frontend: empty string (uses Vite proxy via relative paths)
