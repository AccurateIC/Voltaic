# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

### Root Commands (run from project root)
- `pnpm run dev` - Start all services (builds packages first)
- `pnpm run dev:frontend` - Build packages + start frontend only
- `pnpm run dev:backend` - Build packages + start backend only
- `pnpm run dev:only` - Start all services without rebuilding packages
- `pnpm run build` - Build everything in dependency order
- `pnpm run build:packages` - Build only shared packages
- `pnpm run lint` - Lint all code across workspace
- `pnpm run type-check` - TypeScript checking across workspace
- `pnpm run test` - Run all tests across workspace
- `pnpm run clean` - Remove all build artifacts
- `pnpm run fresh` - Clean + reinstall + rebuild everything

### Backend-Specific Commands
- `pnpm --filter backend run dev` - Start backend dev server with HMR
- `pnpm --filter backend run build` - Build backend for production
- `pnpm --filter backend run test` - Run backend tests with Japa
- `pnpm --filter backend run migrate-fresh` - Reset database and run all migrations
- `pnpm --filter backend run seed` - Seed database with test data
- `pnpm --filter backend run tuyau` - Generate type-safe API client

### Frontend-Specific Commands
- `pnpm --filter frontend run dev` - Start frontend dev server with Vite
- `pnpm --filter frontend run build` - Build frontend for production
- `pnpm --filter frontend run preview` - Preview production build

### Package Development
- `pnpm --filter @voltaic/err run build` - Build error handling package
- `pnpm --filter @voltaic/err run dev` - Watch mode for package development

## Architecture Overview

### Monorepo Structure
This is a pnpm workspace monorepo with the following dependency graph:
```
@voltaic/err → backend
@voltaic/err → frontend
backend → frontend (via Tuyau API types)
```

### Key Architectural Decisions
- **ESM-first**: All packages use ES modules
- **Workspace dependencies**: Internal packages use `workspace:*` protocol
- **Type-safe APIs**: Backend exports types via Tuyau for frontend consumption
- **Shared error handling**: Common error utilities in `@voltaic/err` package

### Core Components

#### Backend (AdonisJS 6)
- **Location**: `apps/backend/`
- **Framework**: AdonisJS 6 with PostgreSQL and Lucid ORM
- **Key features**: Session auth, WebSockets (Transmit), auto-generated Swagger docs
- **API exports**: Type definitions exported to `backend/api` for frontend consumption
- **Database**: Uses migrations in `database/migrations/` and seeders in `database/seeders/`
- **Import aliases**: Uses `#` imports (e.g., `#models/*`, `#controllers/*`)

#### Frontend (React 19 + Vite)
- **Location**: `apps/frontend/`
- **Stack**: React 19, Vite, TailwindCSS, React Query, React Router
- **API integration**: Type-safe API calls via Tuyau client consuming backend types
- **Real-time**: WebSocket connection via Transmit client

#### Shared Packages
- **@voltaic/err**: Shared error handling utilities with `Result<T, E>` pattern and typed error catching

### Domain Model
The application manages generator set (genset) data with these core entities:
- **Users**: Role-based authentication system
- **Archive**: Time-series data storage for genset metrics
- **Physical Quantities**: Measurable properties (voltage, pressure, etc.)
- **Genset Properties**: Configuration of what properties each genset monitors
- **Notifications**: Alert system for anomalies and maintenance
- **PDM (Predictive Maintenance)**: Maintenance scheduling and notifications
- **RUL (Remaining Useful Life)**: Predictive analytics for equipment lifespan

### Build Process
1. **Packages build first**: `@voltaic/err` compiles with tsup
2. **Backend build**: AdonisJS build process, generates API types
3. **Frontend build**: Vite consumes backend types for type-safe API calls

## Important Development Notes

### Database Development
- Always run `pnpm --filter backend run migrate-fresh` after pulling schema changes
- Seeders populate test data for development
- Database models use Lucid ORM with decorators

### API Development
- After changing API routes/controllers, run `pnpm --filter backend run tuyau` to regenerate types
- Frontend automatically gets type safety for API calls via the generated types

### Package Dependencies
- When adding dependencies to apps, always check if they should be in the shared package instead
- The `@voltaic/err` package provides shared error handling patterns - use `Result<T, E>` for error handling

### Testing
- Backend uses Japa testing framework
- Frontend has placeholder test setup - actual tests need to be configured

## GitHub CLI Usage

The GitHub CLI (`gh`) is essential for managing pull requests, issues, and repository operations for this project. All GitHub operations should use the `gh` command for consistency and automation.

### Project Workflow

**Main Branch**: `dev` (not `main` or `master`)
**Feature Branches**: Create from `dev`, merge back to `dev`
**Current Branch**: `experiment-tuyau` (as shown in git status)

### Common GitHub CLI Commands

#### Pull Request Management
```bash
# Create a PR from current branch to dev
gh pr create --title "feat: your feature description" --body "Description of changes" --base dev

# List open PRs
gh pr list

# View specific PR details
gh pr view <pr-number>

# Check PR status and checks
gh pr status

# Merge a PR (when ready)
gh pr merge <pr-number> --squash --delete-branch

# Review a PR
gh pr review <pr-number> --approve
gh pr review <pr-number> --request-changes --body "Feedback here"
```

#### Issue Management
```bash
# Create an issue
gh issue create --title "Bug: description" --body "Detailed description"

# List open issues
gh issue list

# View issue details
gh issue view <issue-number>

# Close an issue
gh issue close <issue-number>
```

#### Repository Information
```bash
# View repository details
gh repo view

# Clone the repository
gh repo clone AccurateIC/Voltaic

# Check workflow runs
gh run list
gh run view <run-id>
```

### Development Workflow with GitHub CLI

#### Creating Feature Branches and PRs
```bash
# 1. Start from dev branch
git checkout dev
git pull origin dev

# 2. Create feature branch
git checkout -b feature/your-feature-name

# 3. Make changes and commit
# ... make your changes ...
git add .
git commit -m "feat: implement your feature"

# 4. Push branch
git push -u origin feature/your-feature-name

# 5. Create PR
gh pr create --title "feat: your feature description" \
  --body "## Summary
- Implemented X feature
- Added Y functionality
- Fixed Z issue

## Testing
- [ ] Frontend tests pass
- [ ] Backend tests pass
- [ ] Integration tests pass
- [ ] Manual testing completed

## Related Issues
Closes #123" \
  --base dev
```

#### Reviewing and Merging PRs
```bash
# Check out PR locally for testing
gh pr checkout <pr-number>

# Run tests
pnpm run test
pnpm run lint
pnpm run type-check

# Review the PR
gh pr review <pr-number> --approve --body "LGTM! Tests pass and code looks good."

# Merge when ready
gh pr merge <pr-number> --squash --delete-branch
```

### Project-Specific GitHub Considerations

#### Pre-merge Checklist
Before merging any PR, ensure:
- [ ] All tests pass (`pnpm run test`)
- [ ] Linting passes (`pnpm run lint`)
- [ ] Type checking passes (`pnpm run type-check`)
- [ ] Build succeeds (`pnpm run build`)
- [ ] Database migrations work if applicable
- [ ] Tuyau types are regenerated if backend changes (`pnpm --filter backend run tuyau`)

#### Branch Protection
The `dev` branch should have protection rules requiring:
- Pull request reviews
- Status checks to pass
- Up-to-date branches before merge

#### Issue and PR Templates
Consider using GitHub templates for consistent issue and PR creation:
- `.github/ISSUE_TEMPLATE/bug_report.md`
- `.github/ISSUE_TEMPLATE/feature_request.md`
- `.github/PULL_REQUEST_TEMPLATE.md`

### Automation Integration

#### GitHub Actions Integration
```bash
# Check workflow status
gh run list --branch <branch-name>

# View workflow details
gh run view <run-id>

# Re-run failed workflows
gh run rerun <run-id>
```

#### Release Management
```bash
# Create a release
gh release create v1.0.0 --title "Release v1.0.0" --notes "Release notes here"

# List releases
gh release list

# View release details
gh release view v1.0.0
```

### Important Notes

- Always target `dev` branch for PRs, not `main`
- Use descriptive commit messages following conventional commits
- Include comprehensive PR descriptions with testing checklist
- Use squash merges to keep commit history clean
- Delete feature branches after merge to keep repository tidy
- Run full test suite before requesting review


<!-- gemini -->
# Using Gemini CLI for Large Codebase Analysis

When analyzing large codebases or multiple files that might exceed context limits, use the Gemini CLI with its massive
context window. Use `gemini -p` to leverage Google Gemini's large context capacity.

## File and Directory Inclusion Syntax

Use the `@` syntax to include files and directories in your Gemini prompts. The paths should be relative to WHERE you run the
  gemini command:

### Examples:

**Single file analysis:**
gemini -p "@src/main.py Explain this file's purpose and structure"

Multiple files:
gemini -p "@package.json @src/index.js Analyze the dependencies used in the code"

Entire directory:
gemini -p "@src/ Summarize the architecture of this codebase"

Multiple directories:
gemini -p "@src/ @tests/ Analyze test coverage for the source code"

Current directory and subdirectories:
gemini -p "@./ Give me an overview of this entire project"

# Or use --all_files flag:
gemini --all_files -p "Analyze the project structure and dependencies"

Implementation Verification Examples

Check if a feature is implemented:
gemini -p "@src/ @lib/ Has dark mode been implemented in this codebase? Show me the relevant files and functions"

Verify authentication implementation:
gemini -p "@src/ @middleware/ Is JWT authentication implemented? List all auth-related endpoints and middleware"

Check for specific patterns:
gemini -p "@src/ Are there any React hooks that handle WebSocket connections? List them with file paths"

Verify error handling:
gemini -p "@src/ @api/ Is proper error handling implemented for all API endpoints? Show examples of try-catch blocks"

Check for rate limiting:
gemini -p "@backend/ @middleware/ Is rate limiting implemented for the API? Show the implementation details"

Verify caching strategy:
gemini -p "@src/ @lib/ @services/ Is Redis caching implemented? List all cache-related functions and their usage"

Check for specific security measures:
gemini -p "@src/ @api/ Are SQL injection protections implemented? Show how user inputs are sanitized"

Verify test coverage for features:
gemini -p "@src/payment/ @tests/ Is the payment processing module fully tested? List all test cases"

When to Use Gemini CLI

Use gemini -p when:
- Analyzing entire codebases or large directories
- Comparing multiple large files
- Need to understand project-wide patterns or architecture
- Current context window is insufficient for the task
- Working with files totaling more than 100KB
- Verifying if specific features, patterns, or security measures are implemented
- Checking for the presence of certain coding patterns across the entire codebase

Important Notes

- Paths in @ syntax are relative to your current working directory when invoking gemini
- The CLI will include file contents directly in the context
- No need for --yolo flag for read-only analysis
- Gemini's context window can handle entire codebases that would overflow Claude's context
- When checking implementations, be specific about what you're looking for to get accurate results
