# Voltaic

<div align="center">

![Voltaic Logo](https://via.placeholder.com/200x100/1a73e8/ffffff?text=VOLTAIC)

**A modern TypeScript monorepo for Voltaic Web (Gen Set)**

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Node.js](https://img.shields.io/badge/Node.js-18%2B-green.svg)](https://nodejs.org/)
[![pnpm](https://img.shields.io/badge/pnpm-8%2B-orange.svg)](https://pnpm.io/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.8-blue.svg)](https://www.typescriptlang.org/)

</div>

## 📖 Table of Contents

- [Overview](#-overview)
- [Prerequisites](#-prerequisites)
- [Quick Start](#-quick-start)
- [Project Structure](#-project-structure)
- [Development](#-development)
- [Scripts Reference](#-scripts-reference)
- [Architecture](#-architecture)
- [Deployment](#-deployment)
- [Contributing](#-contributing)
- [Troubleshooting](#-troubleshooting)

## 🚀 Overview

Voltaic is a full-stack TypeScript monorepo designed for building scalable web applications with generator set management capabilities. Built with modern tools and best practices, it provides a robust foundation for both development and production environments.

### Key Features

- 🏗️ **Monorepo Architecture** - Organized workspace with pnpm for efficient dependency management
- 🔧 **TypeScript First** - Full type safety across all packages and applications
- ⚡ **Modern Stack** - AdonisJS backend, React frontend, shared utilities
- 🎯 **Developer Experience** - Hot reload, linting, formatting, and testing configured
- 📦 **Workspace Management** - Smart build ordering and dependency resolution
- 🔄 **Type-Safe APIs** - End-to-end type safety with Tuyau

### Tech Stack

| Layer | Technology | Purpose |
|-------|------------|---------|
| **Frontend** | React 19 + Vite + TailwindCSS | Modern UI with fast development |
| **Backend** | AdonisJS 6 + PostgreSQL | Robust API with ORM |
| **Shared** | TypeScript + Custom Packages | Type-safe utilities |
| **Build** | pnpm Workspaces + tsup | Efficient monorepo management |

## 📋 Prerequisites

Ensure you have the following installed:

- **Node.js** `>= 18.0.0` - [Download](https://nodejs.org/)
- **pnpm** `>= 8.0.0` - Package manager
- **PostgreSQL** `>= 13` - Database (for backend)

### Installing pnpm

```bash
# Using npm
npm install -g pnpm

# Using curl (Unix)
curl -fsSL https://get.pnpm.io/install.sh | sh -

# Using PowerShell (Windows)
iwr https://get.pnpm.io/install.ps1 -useb | iex
```

## 🚀 Quick Start

### 1. Clone and Install

```bash
# Clone the repository
git clone https://github.com/AccurateIC/Voltaic.git
cd Voltaic

# Install all dependencies
pnpm install
```

### 2. Environment Setup

```bash
# Copy environment files
cp apps/backend/.env.example apps/backend/.env
cp apps/frontend/.env.example apps/frontend/.env

# Configure database and other settings in .env files
```

### 3. Database Setup

```bash
# Run database migrations
pnpm --filter backend run migrate-fresh

# Seed database (optional)
pnpm --filter backend run seed
```

### 4. Build and Start

```bash
# Build all packages and start development
pnpm run dev

# Or start specific services
pnpm run dev:backend   # Backend only
pnpm run dev:frontend  # Frontend only
```

🎉 **You're ready!** The application will be available at:
- Frontend: http://localhost:3000
- Backend API: http://localhost:3333

## 📁 Project Structure

```
Voltaic/
├── 📁 apps/
│   ├── 📁 backend/              # AdonisJS API server
│   │   ├── 📁 app/             # Application logic
│   │   ├── 📁 config/          # Configuration files
│   │   ├── 📁 database/        # Migrations & seeders
│   │   └── 📄 package.json
│   └── 📁 frontend/            # React web application
│       ├── 📁 src/             # Source code
│       ├── 📁 public/          # Static assets
│       └── 📄 package.json
├── 📁 packages/
│   └── 📁 err/                 # Shared error handling utilities
│       ├── 📁 src/             # TypeScript source
│       ├── 📁 dist/            # Compiled output
│       └── 📄 package.json
├── 📄 package.json             # Root configuration
├── 📄 pnpm-workspace.yaml      # Workspace definition
├── 📄 tsconfig.json           # TypeScript configuration
└── 📄 README.md
```

### Package Descriptions

| Package | Description | Dependencies |
|---------|-------------|--------------|
| `@voltaic/err` | Error handling utilities and types | - |
| `backend` | AdonisJS API with PostgreSQL | `@voltaic/err` |
| `frontend` | React SPA with TailwindCSS | `@voltaic/err`, `backend` |

## 🛠️ Development

### Development Workflow

1. **Start Development** - `pnpm run dev` for all services
2. **Make Changes** - Edit code with hot reload
3. **Run Tests** - `pnpm run test`
4. **Build** - `pnpm run build` for production builds

### Working with Packages

#### Adding Dependencies

```bash
# Add to root (dev tools, shared config)
pnpm add -D <package> -w

# Add to specific workspace
pnpm add <package> --filter <workspace-name>

# Examples
pnpm add lodash --filter frontend
pnpm add -D @types/node --filter backend
```

#### Creating New Packages

```bash
# Create package structure
mkdir -p packages/new-package/src
cd packages/new-package

# Initialize package.json
pnpm init

# Add to workspace (automatically detected via pnpm-workspace.yaml)
```

### Backend Development

The backend is built with AdonisJS 6 and includes:

- **Authentication** - Session-based auth with Ally (OAuth)
- **Database** - PostgreSQL with Lucid ORM
- **API Types** - Auto-generated with Tuyau
- **Real-time** - WebSocket support with Transmit
- **Documentation** - Auto-generated Swagger docs

```bash
# Backend-specific commands
pnpm --filter backend run dev          # Start dev server
pnpm --filter backend run build        # Build for production
pnpm --filter backend run migrate-fresh # Reset & run migrations
pnpm --filter backend run seed         # Seed database
pnpm --filter backend run tuyau        # Generate API types
```

### Frontend Development

The frontend is a React 19 application with:

- **Vite** - Fast development and building
- **TailwindCSS** - Utility-first styling
- **React Query** - Server state management
- **React Router** - Client-side routing
- **Type Safety** - Full TypeScript integration

```bash
# Frontend-specific commands
pnpm --filter frontend run dev          # Start dev server
pnpm --filter frontend run build        # Build for production
pnpm --filter frontend run preview      # Preview production build
```

## 📜 Scripts Reference

### Root Level Commands

| Command | Description | Use Case |
|---------|-------------|----------|
| `pnpm run dev` | Start all apps in development | Full stack development |
| `pnpm run dev:frontend` | Build packages + start frontend | Frontend-focused development |
| `pnpm run dev:backend` | Build packages + start backend | Backend-focused development |
| `pnpm run dev:only` | Start all apps (skip package build) | Quick restart after builds |
| `pnpm run build` | Build everything in dependency order | Production deployment |
| `pnpm run build:packages` | Build only shared packages | Package development |
| `pnpm run build:apps` | Build only applications | App deployment |
| `pnpm run clean` | Remove all build artifacts | Clean slate |
| `pnpm run fresh` | Clean + reinstall + rebuild | Nuclear option |

### Quality Assurance

| Command | Description |
|---------|-------------|
| `pnpm run lint` | Lint all code |
| `pnpm run lint:fix` | Fix linting issues |
| `pnpm run format` | Format code with Prettier |
| `pnpm run format:check` | Check code formatting |
| `pnpm run type-check` | TypeScript type checking |
| `pnpm run test` | Run all tests |

### Maintenance

| Command | Description |
|---------|-------------|
| `pnpm run clean:dist` | Remove build directories |
| `pnpm run clean:deps` | Remove node_modules |
| `pnpm update --recursive` | Update all dependencies |

## 🏗️ Architecture

### Dependency Graph

```mermaid
graph TD
    A[@voltaic/err] --> B[backend]
    A --> C[frontend]
    B --> C
```

The build system respects this dependency order, ensuring packages are always built before their dependents.

### Build Pipeline

1. **Package Build** - `@voltaic/err` compiles with tsup
2. **Backend Build** - AdonisJS build process
3. **Frontend Build** - Vite production build
4. **Type Generation** - Tuyau generates API types

### Key Design Decisions

- **ESM First** - All packages use ES modules for modern Node.js
- **Workspace Dependencies** - Internal packages use `workspace:*` protocol
- **TypeScript Strict** - Strict mode enabled for maximum type safety
- **Monorepo Benefits** - Shared tooling, consistent versions, atomic changes

## 🚀 Deployment

### Production Build

```bash
# Build everything for production
pnpm run build

# Build specific components
pnpm run build:backend   # Backend only
pnpm run build:frontend  # Frontend only
```

### Environment Variables

Ensure these are set in production:

**Backend** (`apps/backend/.env`):
```env
NODE_ENV=production
APP_KEY=your-secret-key
DB_HOST=localhost
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=password
DB_DATABASE=voltaic
```

**Frontend** (`apps/frontend/.env`):
```env
VITE_API_URL=https://api.yourdomain.com
VITE_APP_NAME=Voltaic
```

### Docker Deployment

```dockerfile
# Multi-stage build example
FROM node:18-alpine AS builder
RUN npm install -g pnpm
COPY . .
RUN pnpm install && pnpm run build

FROM node:18-alpine AS runner
# Copy built assets and run
```

## 🤝 Contributing

We welcome contributions! Please follow these guidelines:

### Development Setup

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Follow the development workflow above
4. Ensure all tests pass: `pnpm run test`
5. Check code quality: `pnpm run lint && pnpm run format`

### Code Standards

- **TypeScript** - Use strict typing, avoid `any`
- **ESLint** - Follow configured rules
- **Prettier** - Auto-format on save
- **Commits** - Use conventional commit format

### Pull Request Process

1. Update documentation if needed
2. Add tests for new features
3. Ensure CI passes
4. Request review from maintainers

## 🐛 Troubleshooting

### Common Issues

#### Build Failures

**Problem**: `Cannot find module '@voltaic/err'`
```bash
# Solution: Build packages first
pnpm run build:packages
```

**Problem**: TypeScript errors in workspace dependencies
```bash
# Solution: Clean and rebuild
pnpm run clean && pnpm run build
```

#### Development Issues

**Problem**: Vite can't resolve workspace packages
```bash
# Solution: Ensure packages are built
pnpm run build:packages
pnpm run dev:frontend:only
```

**Problem**: Database connection errors
```bash
# Solution: Check PostgreSQL and environment
pnpm --filter backend run migrate-fresh
```

#### Performance Issues

**Problem**: Slow installs or builds
```bash
# Solution: Clean pnpm cache
pnpm store prune
pnpm run fresh
```

### Debug Commands

```bash
# Check workspace structure
pnpm list --depth 0

# Verify dependencies
pnpm list --filter "workspace:*"

# Audit security
pnpm audit

# Check for outdated packages
pnpm outdated --recursive
```

### Getting Help

- 📖 Check this documentation first
- 🐛 Search existing [issues](https://github.com/AccurateIC/Voltaic/issues)
- 💬 Open a new issue with detailed information
- 📧 Contact maintainers for urgent issues

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 👏 Acknowledgments

- [AdonisJS](https://adonisjs.com/) - The Node.js framework
- [React](https://react.dev/) - The UI library
- [pnpm](https://pnpm.io/) - Fast, disk space efficient package manager
- [Vite](https://vitejs.dev/) - Next generation frontend tooling

---

<div align="center">

**Built with ❤️ by the Voltaic Team**

[Website](https://voltaic.dev) • [Documentation](https://docs.voltaic.dev) • [Issues](https://github.com/AccurateIC/Voltaic/issues)

</div>