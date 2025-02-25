# Contributing to Voltaic

Welcome to Voltaic, a web-application for the Neurogen project. Thank you for your contributions to the project! Here are a few guidelines to help you get started with contributing.

## Table of Contents

* [How to Contribute](#how-to-contribute)
* [Setting Up the Project](#setting-up-the-project)
* [Coding Standards](#coding-standards)
* [Commit Message Guidelines](#commit-message-guidelines)
* [Submitting Pull Requests](#submitting-pull-requests)

## How to Contribute

### Reporting Bugs

If you find a bug, please report it by opening an issue on the [GitHub repository](https://github.com/AccurateIC/Voltaic). Provide as much detail as possible to help us understand and resolve the issue.

### Suggesting Features

Feature requests are welcome! If you have an idea for a new feature, please open an issue with a detailed description of your proposal.

### Improving Documentation

Documentation improvements are always welcome. If you find any errors or areas that could be clarified, please submit a pull request.

## Setting Up the Project

### Prerequisites

- Node.js (latest LTS version)
- npm
- sqlite

### Frontend Setup

1. Navigate to the `frontend` directory:
   ```bash
   cd frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm run dev
   ```

### Backend Setup

1. Navigate to the `backend` directory:
   ```bash
   cd backend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Setup the environment variables. Copy `.env.example` to `.env` and configure it as needed.

4. Run database migrations:
   ```bash
   node ace migration:fresh
   ```

5. Run database seeders to populate the database:
   ```bash
   node ace db:seed
   ```

6. Start the development server:
   ```bash
   npm run dev
   ```

## Coding Standards

- Follow the existing code style and conventions.
- Write clear and concise comments.
- Ensure your code is well-structured and easy to read.

### Frontend

- Use React for building user interfaces.
- Style using Tailwind CSS and DaisyUI.
- Use Recharts for data visualization.

### Backend

- Use AdonisJS framework.
- Use Lucid ORM for database interactions.
- Validate inputs using Vine JS.

## Commit Message Guidelines

We follow the [Conventional Commits](https://www.conventionalcommits.org/en/v1.0.0/) convention for commit messages. Here are the types of commits you can use:

- `feat`: New feature (e.g., `feat: add user login endpoint`)
- `fix`: Bug fix (e.g., `fix: resolve null pointer exception`)
- `docs`: Documentation changes (e.g., `docs: update API usage guide`)
- `style`: Code style/formatting (e.g., `style: format CSS files`)
- `refactor`: Code restructuring without new features/fixes (e.g., `refactor: simplify auth middleware`)
- `test`: Test-related changes (e.g., `test: add unit tests for utils`)
- `perf`: Performance improvements (e.g., `perf: optimize image compression`)
- `ci`: CI/CD pipeline changes (e.g., `ci: add GitHub Actions workflow`)
- `build`: Build system/dependency changes (e.g., `build: update webpack config`)
- `revert`: Revert a previous commit (e.g., `revert: remove experimental feature X`)
- `security`: Security-related fixes (e.g., `security: patch SQLi vulnerability`)

## Submitting Pull Requests

1. Fork the repository and create your branch from `dev`.
2. Ensure your code follows the coding standards and passes all tests.
3. Commit your changes with a descriptive message following the commit message guidelines.
4. Push your changes to your forked repository.
5. Open a pull request on the dev repository.

## License

By contributing, you agree that your contributions will be licensed under the same license as the project.

Thank you for contributing!
