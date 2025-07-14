# Voltaic

**Generator set monitoring and predictive maintenance platform**

[![Node.js](https://img.shields.io/badge/Node.js-22%2B-green.svg)](https://nodejs.org/)
[![pnpm](https://img.shields.io/badge/pnpm-10%2B-orange.svg)](https://pnpm.io/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.8-blue.svg)](https://www.typescriptlang.org/)

## Overview

Full-stack TypeScript monorepo for generator set monitoring with time-series data collection, anomaly detection, and predictive maintenance capabilities.

**Tech Stack:**
- **Frontend**: React 19 + Vite + TailwindCSS + DaisyUI
- **Backend**: AdonisJS 6 + PostgreSQL + Lucid ORM
- **API**: Type-safe with Tuyau client generation
- **Build**: pnpm workspaces with dependency-aware builds

## Prerequisites

- **Node.js** `>= 22.14.0`
- **pnpm** `>= 10.12.4`
- **PostgreSQL** `>= 13`

```bash
# Install pnpm
npm install -g pnpm
```

## Quick Start

```bash
# Clone and install
git clone https://github.com/AccurateIC/Voltaic.git
cd Voltaic
pnpm install

# Setup environment
cp apps/backend/.env.example apps/backend/.env
cp apps/frontend/.env.example apps/frontend/.env

# Setup database
pnpm --filter backend run migrate-fresh
pnpm --filter backend run seed

# Start development
pnpm run dev
```

**Access:**
- Frontend: http://localhost:3000
- Backend API: http://localhost:3333

## Project Structure

```
apps/
├── backend/          # AdonisJS 6 API server
│   ├── app/         # Controllers, models, services
│   ├── database/    # Migrations & seeders
│   └── config/      # App configuration
└── frontend/        # React 19 SPA
    ├── src/         # Components, pages, hooks
    └── public/      # Static assets
packages/
└── err/             # Shared error handling utilities
```

**Dependencies:** `@voltaic/err` → `backend` → `frontend`

## Development

### Key Commands

```bash
# Development
pnpm run dev                    # Start all services
pnpm run dev:backend           # Backend only
pnpm run dev:frontend          # Frontend only

# Building
pnpm run build                 # Build everything
pnpm run build:packages        # Build shared packages only

# Quality
pnpm run lint                  # Lint all code
pnpm run type-check           # TypeScript checking
pnpm run test                 # Run tests

# Database (backend)
pnpm --filter backend run migrate-fresh  # Reset database
pnpm --filter backend run seed          # Seed test data
pnpm --filter backend run tuyau         # Generate API types
```

### Adding Dependencies

```bash
# To specific workspace
pnpm add <package> --filter <workspace>

# Examples
pnpm add lodash --filter frontend
pnpm add -D @types/node --filter backend
```

## Domain Model

**Core Entities:**
- **Archive**: Time-series data storage for genset metrics
- **Physical Quantities**: Measurable properties (voltage, pressure, etc.)
- **Genset Properties**: Configuration of monitored properties per genset
- **Notifications**: Alert system for anomalies and maintenance
- **PDM**: Predictive maintenance scheduling and notifications
- **RUL**: Remaining useful life analytics for equipment

**Features:**
- Real-time data monitoring and visualization
- Anomaly detection with configurable thresholds
- Predictive maintenance scheduling
- Historical data analysis and reporting
- User management with role-based access

## Architecture

**Build Order:** `@voltaic/err` → `backend` → `frontend`

**Key Decisions:**
- ESM-first with strict TypeScript
- Session-based authentication
- Type-safe API with Tuyau client generation
- Shared error handling patterns via `@voltaic/err`
- PostgreSQL for time-series data with proper indexing

## Deployment

```bash
# Production build
pnpm run build

# Environment setup
cp apps/backend/.env.example apps/backend/.env
cp apps/frontend/.env.example apps/frontend/.env
# Configure production values
```

**Required Environment Variables:**
- Backend: `NODE_ENV`, `APP_KEY`, `DB_*` settings
- Frontend: `VITE_API_URL`

## Contributing

1. Fork and create feature branch
2. Follow existing code patterns and TypeScript strict mode
3. Run `pnpm run lint && pnpm run type-check` before committing
4. Target PRs to `dev` branch (not `main`)

## Troubleshooting

**Build Issues:**
```bash
# Cannot find @voltaic/err
pnpm run build:packages

# Clean rebuild
pnpm run clean && pnpm run build

# Database connection errors
pnpm --filter backend run migrate-fresh
```

**Development Notes:**
- Main branch is `dev` (not `main`)
- Always run `pnpm --filter backend run migrate-fresh` after pulling schema changes
- Run `pnpm --filter backend run tuyau` after API changes to regenerate types
- See `AGENTS.md` for comprehensive development guide
