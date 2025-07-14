# Gemini Project Analysis

This document provides a summary of the project structure, technologies, and commands for the Gemini CLI.

## Project Overview

This is a pnpm monorepo containing a web application with a separate backend and frontend.

- **Backend:** An AdonisJS v6 API server located in `apps/backend`.
- **Frontend:** A React application built with Vite, located in `apps/frontend`.
- **Shared Packages:** Shared code is located in the `packages` directory. Currently, there is one shared package: `@voltaic/err`.

## Technologies

### Backend (`apps/backend`)

- **Framework:** AdonisJS v6
- **Language:** TypeScript
- **ORM:** Lucid
- **Database:** PostgreSQL
- **API Documentation:** `adonis-autoswagger`
- **Testing:** Japa

### Frontend (`apps/frontend`)

- **Framework:** React 19
- **Bundler:** Vite
- **Language:** TypeScript
- **Styling:** Tailwind CSS v4 with DaisyUI
- **Data Fetching:** TanStack Query (React Query)
- **Routing:** React Router

### Tooling

- **Package Manager:** pnpm
- **Linting:** ESLint
- **Formatting:** Prettier
- **Type-checking:** TypeScript

## Commands

The following commands are available from the root of the project:

- `pnpm install`: Install dependencies for all packages and applications.
- `pnpm dev`: Start both the backend and frontend applications in development mode.
- `pnpm dev:frontend`: Start only the frontend application in development mode.
- `pnpm dev:backend`: Start only the backend application in development mode.
- `pnpm build`: Build all packages and applications.
- `pnpm build:packages`: Build only the shared packages.
- `pnpm build:apps`: Build only the applications.
- `pnpm lint`: Lint all code.
- `pnpm lint:fix`: Lint and automatically fix issues.
- `pnpm format`: Format all code with Prettier.
- `pnpm format:check`: Check for formatting issues.
- `pnpm type-check`: Run TypeScript to check for type errors in all packages.
- `pnpm test`: Run tests for all packages.
- `pnpm fresh`: Clean all dependencies and reinstall them, then build the project.

### Backend Commands (`apps/backend`)

- `pnpm --filter backend <command>`

- `start`: Start the built server.
- `build`: Build the application.
- `dev`: Start the development server with HMR.
- `test`: Run tests.
- `migrate-fresh`: Reset the database and run all migrations.
- `seed`: Seed the database with initial data.
- `lint`: Lint the backend code.
- `type-check`: Type-check the backend code.

### Frontend Commands (`apps/frontend`)

- `pnpm --filter frontend <command>`

- `dev`: Start the development server.
- `build`: Build the application for production.
- `preview`: Preview the production build locally.
- `lint`: Lint the frontend code.
- `type-check`: Type-check the frontend code.

## Code Conventions

- **Formatting:** Prettier is used for code formatting.
- **Linting:** ESLint is used for code linting, with specific configurations for AdonisJS and React.
- **TypeScript:** The entire codebase is written in TypeScript.
- **Monorepo:** The project is structured as a monorepo using pnpm workspaces.
- **Imports:** The backend uses path aliases defined in `tsconfig.json` and the `imports` field in `package.json` (e.g., `#controllers/*`).

## Supplementary Tools

### Claude CLI (`@anthropic-ai/claude-code`)

The environment has the Claude CLI available under the `claude` command. I can use this tool to get a second opinion on code or to leverage its specific analysis capabilities.

#### Workflow for Analysis

I have successfully experimented with the following workflow:

1.  **Read File:** Use my `read_file` tool to get the contents of a source file.
2.  **Prompt Claude:** Execute the `claude` command with the `--print` flag. The prompt should contain the file's content and the question I want to ask.

**Example Command Structure:**

`claude -p "Explain this code: [PASTE FILE CONTENT HERE]" --print`

This approach allows me to get an analysis from Claude without running into the environment's shell restrictions.

#### My Role

While I can't use the interactive features of the Claude CLI, I can effectively use it as a non-interactive analysis tool. I can formulate prompts, send code to it, and use its output to inform my own work, such as refactoring code, explaining complex sections, or generating documentation. This provides a valuable way to augment my own analysis.

#### Code Generation

I can also use the Claude CLI to generate new code that is consistent with the project's patterns.

**Workflow for Generation:**

1.  **Analyze Existing Patterns:** If necessary, I will first read an existing, relevant file to understand the required structure and conventions.
2.  **Formulate a Descriptive Prompt:** I will create a concise prompt that describes the desired code, its structure, and its fields. I should not include full file contents as examples due to environment restrictions.
3.  **Execute and Refine:** I will execute the `claude` command with the `--print` flag and use the generated code as a starting point for my work.

**Example Prompt for Generation:**

`claude -p "Generate an AdonisJS VineJS validator named 'myValidator'. It should use 'vine.compile(vine.object({...}))' and contain a field 'name' (string) and 'age' (number)." --print`


<!-- claude -->
## External Help

- You may use the `claude` cli if you need help with consulting with code as claude is one of the best coding models. 

### Examples:

- **Single File:** claude -p "@src/main.py Explain this file's purpose and structure"

- **Multiple Files:** claude -p "@package.json @apps/frontend/src/main.jsx Analyze the two files"
