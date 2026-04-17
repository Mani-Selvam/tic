# Neo Ticket System

A full-stack ticket management system built with the MERN stack (MongoDB, Express, React, Node.js).

## Architecture

- **Frontend**: React 18, Vite, React Router DOM, Recharts, custom CSS design system
- **Backend**: Node.js + Express.js, MongoDB + Mongoose, JWT authentication, Multer file uploads
- **Design**: Modern light theme with dark sidebar (#0f172a), indigo primary (#6366f1), Inter font, smooth animations

## Project Structure

```
.
├── src/
│   ├── Api/                 # API service layers
│   ├── Components/
│   │   ├── Login/           # Login page + AuthContext
│   │   └── MasterDash/      # Shared CRUD component (MasterPage.jsx) + master.css
│   ├── Data/Sidebar/        # Sidebar navigation config
│   ├── Layout/              # App shell (sidebar + topbar) — layout.css + index.jsx
│   ├── Pages/
│   │   ├── Dashboard/       # Dashboard with recharts (Area, Bar, Pie charts)
│   │   ├── Master/          # Company, Priority, Designation, User, Department, TicketStatus
│   │   └── Ticket/          # TicketList, CreateTicket, ShowTicket, WorkerDash, ClosedTicket
│   ├── Route/               # Route constants (AuthRoutes.jsx) + App router
│   └── index.css            # Global CSS tokens + animations
├── server/
│   ├── models/              # Mongoose schemas (User, Ticket, TicketStatus, etc.)
│   ├── routes/              # Express routes — tickets.js (multer upload fixed)
│   ├── middleware/          # auth.js JWT middleware
│   ├── db.js                # MongoDB connection
│   └── server.js            # Entry point (port 3001), serves /uploads static
├── vite.config.ts           # Vite + proxy /api → :3001, /uploads → :3001
└── package.json
```

## Running the Application

The `Start application` workflow runs:
```
node server/server.js & npm run dev
```
1. Express backend on port 3001
2. Vite dev server on port 5000 (proxies /api and /uploads to backend)

## Environment Variables

- `MONGO_URI` — MongoDB connection string (required, set as Replit secret)
- `VITE_API_URL` — Must be empty string (uses Vite proxy relative URLs)

## Key Configuration

- Frontend port: **5000** (webview)
- Backend port: **3001** (internal)
- Vite proxy: `/api/*` and `/uploads/*` → `http://localhost:3001`
- Multer uploads: saved to `server/uploads/` (fixed from workspace root)

## Test Credentials

- Mobile: `1234567890`
- Password: `123456`
- Role: Admin User

## UI Design System

| Token | Value |
|-------|-------|
| Background | `#f8fafc` |
| Card | `#ffffff` |
| Sidebar | `#0f172a` (deep navy) |
| Primary | `#6366f1` (indigo) |
| Primary gradient | `#6366f1` → `#8b5cf6` |
| Text | `#0f172a` |
| Text muted | `#64748b` |
| Border | `#e2e8f0` / `#f1f5f9` |
| Success | `#22c55e` |
| Warning | `#f59e0b` |
| Danger | `#ef4444` |
| Font | Inter, system-ui |

## Dashboard Charts (recharts)

- **AreaChart** — ticket activity over last 7 days
- **PieChart** — status distribution donut
- **BarChart** — priority breakdown
- Status tiles grid
- Recent tickets table (clickable → ShowTicket)
- Team members table
