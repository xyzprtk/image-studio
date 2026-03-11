# Contributing to Vibe Studio

Thank you for your interest in contributing to Vibe Studio.

## How to Contribute

### Reporting Bugs

1. Check if the bug has already been reported
2. Create a detailed bug report including:
   - Clear title and description
   - Steps to reproduce
   - Expected vs actual behavior
   - Screenshots if applicable

### Suggesting Features

1. Open a discussion before creating a feature request
2. Describe the feature and its use case
3. Explain why this feature would be valuable

### Pull Requests

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/my-feature`
3. Make your changes following the code style guidelines
4. Write tests if applicable
5. Commit with clear, descriptive messages
6. Push to your fork and submit a pull request

## Code Style Guidelines

### General

- Use functional components with TypeScript
- Prefer composition over inheritance
- Keep components small and focused
- Extract reusable logic into custom hooks

### Naming Conventions

| Type | Convention | Example |
|------|------------|---------|
| Components | PascalCase | `GeneratePage` |
| Files | kebab-case | `api-utils.ts` |
| Variables | camelCase | `isConfigured` |
| Constants | UPPER_SNAKE_CASE | `DEFAULT_TEMPLATES` |
| Boolean variables | Prefix with `is`, `has`, `can` | `isLoading` |

### Imports

Order imports as follows:
1. External libraries
2. Internal modules (`@/lib`, `@/store`)
3. Local components (`@/components`)

Group imports with empty lines between groups.

### Types

- Always define explicit types for props and function parameters
- Use interfaces for object shapes
- Use types for unions and aliases
- Export types from `@/lib/types`

### CSS & Tailwind

- Use CSS variables from `globals.css` for colors
- Use the `cn()` utility for conditional class merging
- Keep styles consistent with design tokens
- Follow the existing pattern in component files

### Error Handling

- Wrap async operations in try-catch
- Display user-friendly error messages
- Log errors appropriately for debugging

## Development Workflow

### Setting Up Development Environment

```bash
# Clone the repository
git clone https://github.com/your-username/image-studio.git
cd image-studio

# Install dependencies
npm install

# Start development server
npm run dev
```

### Before Submitting

1. Run the linter: `npm run lint`
2. Run type checking: `npx tsc --noEmit`
3. Verify the build: `npm run build`
4. Test your changes in the browser

### Commit Messages

Use clear, descriptive commit messages:
- `Add: new provider support for Replicate`
- `Fix: dropdown not closing on mobile`
- `Refactor: extract API logic to separate module`
- `Style: update sidebar tooltip positioning`

## Code Review Process

- Pull requests require review before merging
- Address feedback promptly
- Keep changes focused and atomic

## Questions?

Open an issue for questions about contributing.
