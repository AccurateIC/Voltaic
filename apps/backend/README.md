# Backend - AdonisJS 6 API

Generator set monitoring API with PostgreSQL, session auth, and real-time updates.

## Quick Start

```bash
# Install dependencies (from monorepo root)
pnpm install

# Setup database
pnpm --filter backend run migrate-fresh
pnpm --filter backend run seed

# Start development server
pnpm --filter backend run dev
```

**Server:** http://localhost:3333

## Key Commands

```bash
pnpm --filter backend run dev          # Development server
pnpm --filter backend run build        # Production build
pnpm --filter backend run migrate-fresh # Reset database (dev only)
pnpm --filter backend run seed         # Seed test data
pnpm --filter backend run tuyau        # Generate API types
pnpm --filter backend run test         # Run tests
```

## Architecture

**Framework:** AdonisJS 6 (batteries-included Node.js framework)
**Database:** PostgreSQL with Lucid ORM
**Auth:** Session-based with Ally (OAuth support)
**Validation:** VineJS (faster than Zod)
**Real-time:** Transmit (Server-Sent Events)
**API Types:** Auto-generated with Tuyau

## Development Workflow

1. **Models & Migrations:** `node ace make:model ModelName -m`
2. **Controllers:** `node ace make:controller ControllerName -s -r`
3. **Validators:** `node ace make:validator ValidatorName`
4. **Routes:** Define in `start/routes.ts`
5. **Run Migrations:** `node ace migration:run`

## Documentation

- [AdonisJS](https://docs.adonisjs.com/guides/preface/introduction)
- [Lucid ORM](https://lucid.adonisjs.com/docs/introduction)
- [VineJS Validation](https://vinejs.dev/docs/introduction)
- [Transmit SSE](https://docs.adonisjs.com/guides/digging-deeper/transmit)
