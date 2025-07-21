# AGENTS.md - Development Guide for AI Coding Agents

## Build/Test Commands (run from project root)
- `pnpm run dev` - Start all services (builds packages first)
- `pnpm run dev:frontend` - Build packages + start frontend only
- `pnpm run dev:backend` - Build packages + start backend only
- `pnpm run dev:only` - Start all services without rebuilding packages
- `pnpm run build` - Build everything in dependency order
- `pnpm run build:packages` - Build only shared packages
- `pnpm run tuyau` - Generate backend routes and types to be used in frontend
- `pnpm run lint` - Lint all code across workspace
- `pnpm run type-check` - TypeScript checking across workspace
- `pnpm run test` - Run all tests across workspace
- `pnpm --filter backend run test` - Run single backend test suite (uses Japa)
- `pnpm --filter backend run migrate-fresh` - Reset database and run migrations
- `pnpm --filter backend run seed` - Seed database with test data
- `pnpm --filter backend run tuyau` - Generate type-safe API client after backend changes

## Code Style Guidelines
- **Imports**: Backend uses `#` aliases (`#models/*`, `#controllers/*`), frontend uses relative paths
- **Formatting**: Prettier with 120 char width, 2 spaces, double quotes, trailing commas
- **Types**: Full TypeScript, explicit return types on functions, use `Result<T, E>` pattern from `@voltaic/err`
- **Naming**: camelCase for variables/functions, PascalCase for classes/components, kebab-case for files
- **Error Handling**: Use `catchErrTyped()` from `@voltaic/err` package for async operations
- **Backend**: AdonisJS 6 patterns, Lucid ORM models, session auth, explicit HttpContext typing
- **Frontend**: React 19 with hooks, TailwindCSS + DaisyUI, React Query for API calls
- **Database**: Always run migrations after schema changes, use seeders for test data

## Project Structure
```
apps/
  backend/          # AdonisJS 6 API server
    app/
      controllers/  # HTTP route handlers
      models/       # Lucid ORM models
      services/     # Business logic
      middleware/   # Request middleware
      validators/   # Input validation
    database/
      migrations/   # Database schema changes
      seeders/      # Test data
  frontend/         # React 19 + Vite SPA
    src/
      components/   # React components
      pages/        # Route components
      api/          # API client code
      types/        # TypeScript definitions
packages/
  err/              # Shared error handling utilities
```

## Architecture Notes
- Monorepo with `@voltaic/err` → backend → frontend dependency chain
- Backend exports types via Tuyau for frontend type safety
- ESM-first, workspace dependencies use `workspace:*` protocol

## Domain Model
- **Users**: Role-based authentication system
- **Archive**: Time-series data storage for genset metrics
- **Physical Quantities**: Measurable properties (voltage, pressure, etc.)
- **Genset Properties**: Configuration of what properties each genset monitors
- **Notifications**: Alert system for anomalies and maintenance
- **PDM (Predictive Maintenance)**: Maintenance scheduling and notifications
- **RUL (Remaining Useful Life)**: Predictive analytics for equipment lifespan

## Important Development Notes
- Always run `pnpm --filter backend run migrate-fresh` after pulling schema changes (in development only, cant do fresh migrations in prod)
- After changing API routes/controllers, run `pnpm --filter backend run tuyau` to regenerate types
- Use `Result<T, E>` pattern from `@voltaic/err` for error handling
- Main branch is `dev` (not `main` or `master`) - target PRs to `dev`
