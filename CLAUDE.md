# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is an ESLint plugin designed to catch common mistakes made by AI code generators (LLMs) that human developers would typically avoid. The goal is to enforce code quality standards specifically for AI-generated code.

## Development Commands

```bash
# Build the plugin (compiles TypeScript to dist/)
npm run build

# Run tests
npm run test

# Type-check without emitting files
npm run type-check
```

## Architecture

**Module System**: Pure ES Modules (ESM) - no CommonJS allowed
**Language**: TypeScript with strict type checking
**Plugin Format**: ESLint flat config format

### Key Files

- `src/index.ts` - Main plugin entry point, exports plugin object with rules and recommended config
- `src/rules/` - Individual rule implementations using `@typescript-eslint/utils`
- `tests/setup.ts` - Configures RuleTester to use Vitest
- `tests/rules/` - Rule tests using `@typescript-eslint/rule-tester`

### Rule Implementation Pattern

Each rule follows this structure:
- Uses `ESLintUtils.RuleCreator` from `@typescript-eslint/utils`
- Leverages TypeScript AST (TSESTree) for analysis
- Implements pure helper functions for code analysis (e.g., `isBareWrapper`, `areArgumentsPassedThrough`)
- Includes documentation URL: `https://github.com/elioshinsky/eslint-for-ai/blob/main/docs/rules/{name}.md`

### Testing Approach

- Uses Vitest with `@typescript-eslint/rule-tester`
- Tests follow valid/invalid pattern with specific test cases
- **TDD is required**: write tests first, then implementation
- Tests are deterministic - no mocking of pure functions

## Adding New Rules

1. Create test file in `tests/rules/{rule-name}.test.ts`
2. Use `npm run test` for TDD workflow
3. Create rule file in `src/rules/{rule-name}.ts`
4. Import and register in `src/index.ts` (add to `rules` object and `recommended.rules`)
5. Follow the helper function pattern for AST analysis

## Code Conventions

This codebase enforces strict TypeScript and ESLint rules:

- **No explicit `any`** - proper typing required
- **Type over interface** - always use `type`, not `interface`
- **Functions over classes** - default to functions and types unless classes are necessary
- **Type imports** - use inline `type` keyword for type-only imports
- **Top-level imports only** - no dynamic imports/requires
- **No console.log** - use `process.stdout.write()` or `process.stderr.write()`
- **Pure ESM** - no CommonJS syntax

## Build and Distribution

- TypeScript compiles to `dist/` directory
- Only `dist/` is published to npm
- Main entry: `./dist/index.js`
- Types: `./dist/index.d.ts`
- `tsconfig.build.json` excludes tests from build output
