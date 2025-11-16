# Three-Tier Branding Application

A complete three-tier application featuring a React frontend, Express.js backend API, and PostgreSQL database for managing branding themes.

## Architecture

```
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│   React App     │     │   Express API   │     │   PostgreSQL    │
│   (Port 5173)   │ ──► │   (Port 3001)   │ ──► │   Database      │
│   /branding     │     │   /backend      │     │                 │
└─────────────────┘     └─────────────────┘     └─────────────────┘
```

- **Frontend (Tier 1)**: React 19 + Material-UI branding wizard and dashboard
- **Backend (Tier 2)**: Express.js REST API for theme CRUD operations
- **Database (Tier 3)**: PostgreSQL with JSONB storage for theme data

## Prerequisites

- Node.js 18+
- PostgreSQL 13+
- npm or yarn

## Quick Start

### 1. Set Up Database

Create a PostgreSQL database:

```bash
createdb branding_db
```

Or using psql:

```sql
CREATE DATABASE branding_db;
```

### 2. Configure Backend

```bash
cd backend

# Copy environment file
cp .env.example .env

# Edit .env with your database connection
# DATABASE_URL=postgresql://user:password@localhost:5432/branding_db
```

### 3. Install Dependencies

```bash
# Install backend dependencies
cd backend
npm install

# Install frontend dependencies
cd ../branding
npm install
```

### 4. Initialize Database

```bash
cd backend
npm run db:init
```

This creates the `themes` table and seeds it with sample data.

### 5. Start the Application

**Terminal 1 - Backend:**
```bash
cd backend
npm run dev
```

The backend will start on http://localhost:3001

**Terminal 2 - Frontend:**
```bash
cd branding
npm run dev
```

The frontend will start on http://localhost:5173

## API Endpoints

### Themes API (`/api/v1/themes`)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/v1/themes` | Get all themes |
| GET | `/api/v1/themes/:id` | Get a single theme |
| POST | `/api/v1/themes` | Create a new theme |
| PUT | `/api/v1/themes/:id` | Update a theme |
| DELETE | `/api/v1/themes/:id` | Delete a theme |

### Example Theme JSON

```json
{
  "id": 1,
  "name": "Default Theme",
  "companyName": "Demo Company",
  "companyUrl": "https://demo.example.com",
  "theme": {
    "theme_color": "#1976d2",
    "primary_dark_color": "#1565c0",
    "extra_light_color": "#bbdefb",
    "text_color": "#000000",
    "font_family": "Roboto, Arial, sans-serif",
    "button": {
      "primary_color": "#1976d2",
      "secondary_color": "#9c27b0",
      "hover_color": "#1565c0",
      "border_color": "#cccccc"
    },
    "logos": {}
  },
  "capabilities": {
    "general_app_title": "My Bank"
  }
}
```

## Database Schema

```sql
CREATE TABLE themes (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  json_data JSONB NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

## Environment Variables

### Backend (.env)

```bash
DATABASE_URL=postgresql://user:password@localhost:5432/branding_db
PORT=3001
```

### Frontend (optional)

Create a `.env` file in `/branding`:

```bash
VITE_API_URL=http://localhost:3001
```

## Project Structure

```
three-tier-app-claude/
├── README.md                 # This file
├── backend/                  # Express.js API
│   ├── src/
│   │   ├── index.ts         # Main server entry
│   │   ├── db.ts            # Database connection
│   │   ├── routes/
│   │   │   └── themes.ts    # Theme CRUD routes
│   │   └── scripts/
│   │       └── initDb.ts    # Database initialization
│   ├── package.json
│   └── tsconfig.json
└── branding/                 # React frontend
    ├── src/
    │   ├── App.tsx          # Main app with API integration
    │   ├── services/
    │   │   ├── themeApi.ts  # API client for themes
    │   │   └── brandingStorage.ts
    │   ├── context/
    │   ├── components/
    │   └── pages/
    └── package.json
```

## Features

- **Theme Management**: Full CRUD operations for branding themes
- **Live Preview**: Real-time theme preview in the React dashboard
- **Fallback Support**: Gracefully falls back to localStorage if API is unavailable
- **CORS Enabled**: Backend configured for cross-origin requests
- **TypeScript**: Full type safety across both frontend and backend
- **Database-Ready**: JSONB storage for flexible theme data

## Development

### Backend Development

```bash
cd backend
npm run dev          # Start with hot reload
npm run build        # Build TypeScript
npm start            # Run production build
```

### Frontend Development

```bash
cd branding
npm run dev          # Start Vite dev server
npm run build        # Production build
npm test             # Run tests
npm run test:coverage # Coverage report
```

## Testing the Integration

1. Start both backend and frontend
2. Open http://localhost:5173
3. The app should load themes from the API
4. Use the branding wizard to create/modify themes
5. Changes are persisted to the PostgreSQL database

Check the browser console for API connection logs.

## Troubleshooting

**CORS Errors**: Ensure the backend is running on port 3001 and frontend on 5173

**Database Connection**: Verify DATABASE_URL in backend/.env is correct

**API Not Available**: The frontend will show a warning and fall back to localStorage

## License

MIT
