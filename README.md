# eslint-for-ai

ESLint rules that you would think are useless because any dev would know better than to write code like this but LLMs write stupid code all the time so these rules are for them.

## Installation

```bash
npm install --save-dev eslint-for-ai
```

## Requirements

- ESLint 9+ (flat config format)
- TypeScript project with `tsconfig.json`

## Usage

Add the plugin to your ESLint flat config:

```javascript
import forAi from 'eslint-for-ai';

export default [...forAi.configs.recommended];
```

The recommended config includes:
- Default ignores for `**/dist/**` and `**/node_modules/**`
- Type-aware linting enabled via `parserOptions.projectService`
- TypeScript-ESLint recommended + strict rules
- React and React Hooks rules
- Import organization rules
- 6 custom AI-focused rules

Or configure only the `for-ai` rules (without bundled plugins):

```javascript
import forAi from 'eslint-for-ai';

export default [
  {
    files: ['**/*.ts', '**/*.tsx'],
    plugins: {
      'for-ai': forAi,
    },
    rules: {
      'for-ai/no-bare-wrapper': 'error',
      'for-ai/no-code-after-try-catch': 'error',
      'for-ai/no-constant-assertion': 'error',
      'for-ai/no-interface': 'error',
      'for-ai/no-mock-only-test': 'error',
      'for-ai/no-standalone-class': 'error',
    },
  },
];
```

## Recommended TypeScript Configuration

Use these strict compiler options in your `tsconfig.json`:

| Option | Value | Description |
|--------|-------|-------------|
| `target` | `ESNext` | Latest ECMAScript features |
| `module` | `ESNext` | ES modules |
| `moduleResolution` | `bundler` | Modern bundler resolution |
| `lib` | `["ESNext"]` | ESNext library |
| `strict` | `true` | All strict type-checking options |
| `noFallthroughCasesInSwitch` | `true` | Report errors for fallthrough cases in switch |
| `noUncheckedIndexedAccess` | `true` | Add undefined to index signatures |
| `noImplicitOverride` | `true` | Require override keyword for overrides |
| `skipLibCheck` | `true` | Skip type checking of declaration files |
| `esModuleInterop` | `true` | CommonJS/ES module interop |
| `allowSyntheticDefaultImports` | `true` | Allow default imports from modules without default export |
| `forceConsistentCasingInFileNames` | `true` | Enforce consistent file name casing |
| `resolveJsonModule` | `true` | Allow importing JSON modules |
| `verbatimModuleSyntax` | `true` | Enforce explicit type imports/exports |
| `allowImportingTsExtensions` | `true` | Allow `.ts` extensions in imports |
| `declaration` | `true` | Generate `.d.ts` declaration files |
| `declarationMap` | `true` | Generate sourcemaps for declarations |
| `sourceMap` | `true` | Generate sourcemap files |
| `noEmit` | `true` | Type-check only, no output |

```json
{
  "compilerOptions": {
    "target": "ESNext",
    "module": "ESNext",
    "moduleResolution": "bundler",
    "lib": ["ESNext"],
    "strict": true,
    "noFallthroughCasesInSwitch": true,
    "noUncheckedIndexedAccess": true,
    "noImplicitOverride": true,
    "skipLibCheck": true,
    "esModuleInterop": true,
    "allowSyntheticDefaultImports": true,
    "forceConsistentCasingInFileNames": true,
    "resolveJsonModule": true,
    "verbatimModuleSyntax": true,
    "allowImportingTsExtensions": true,
    "declaration": true,
    "declarationMap": true,
    "sourceMap": true,
    "noEmit": true
  }
}
```

## Adding Test File Overrides

The recommended config enforces strict rules. For test files, you may want to relax some rules:

```javascript
import forAi from 'eslint-for-ai';

export default [
  // ... your main config ...
  
  // Test file overrides
  {
    files: ['**/*.test.ts', '**/*.spec.ts', 'tests/**/*.ts'],
    rules: {
      '@typescript-eslint/no-explicit-any': 'off',
      'no-console': 'off',
      '@typescript-eslint/no-non-null-assertion': 'off',
      '@typescript-eslint/no-unsafe-assignment': 'off',
      '@typescript-eslint/no-unsafe-call': 'off',
      '@typescript-eslint/no-unsafe-member-access': 'off',
      '@typescript-eslint/no-unsafe-return': 'off',
      '@typescript-eslint/no-unsafe-argument': 'off',
    },
  },
];
```

## Rules Reference

### eslint-for-ai Rules

| Rule | Description |
|------|-------------|
| `for-ai/no-bare-wrapper` | Disallows functions that just call another function without additional logic |
| `for-ai/no-code-after-try-catch` | Disallows code after try/catch/finally blocks in functions |
| `for-ai/no-constant-assertion` | Disallows constant type assertions that provide no value |
| `for-ai/no-interface` | Disallows TypeScript interfaces (prefer type aliases) |
| `for-ai/no-mock-only-test` | Disallows tests that only contain mocks without real assertions |
| `for-ai/no-standalone-class` | Disallows classes that don't extend another class (prefer functions and types) |

### Core ESLint Rules

| Rule | Value | Description |
|------|-------|-------------|
| `no-console` | `error` | Disallow console statements |
| `prefer-const` | `error` | Prefer const over let when possible |

### TypeScript Rules

| Rule | Value | Description |
|------|-------|-------------|
| `@typescript-eslint/no-explicit-any` | `error` | Disallow the `any` type |
| `@typescript-eslint/no-unsafe-assignment` | `error` | Disallow assigning any to variables |
| `@typescript-eslint/no-unsafe-call` | `error` | Disallow calling any typed values |
| `@typescript-eslint/no-unsafe-member-access` | `error` | Disallow member access on any typed values |
| `@typescript-eslint/no-unsafe-return` | `error` | Disallow returning any from functions |
| `@typescript-eslint/no-unsafe-argument` | `error` | Disallow any typed values as arguments |
| `@typescript-eslint/no-require-imports` | `error` | Disallow require() imports |
| `@typescript-eslint/consistent-type-imports` | `error` | Enforce type-only imports with inline style |
| `@typescript-eslint/no-import-type-side-effects` | `error` | Disallow import side effects in type-only imports |
| `@typescript-eslint/switch-exhaustiveness-check` | `error` | Require switch statements to be exhaustive |
| `@typescript-eslint/prefer-optional-chain` | `error` | Prefer optional chaining over && chains |
| `@typescript-eslint/no-unnecessary-type-assertion` | `error` | Disallow unnecessary type assertions |
| `@typescript-eslint/no-unnecessary-condition` | `error` | Disallow unnecessary conditionals |
| `@typescript-eslint/prefer-readonly` | `error` | Prefer readonly for unmodified private members |
| `@typescript-eslint/consistent-type-assertions` | `error` (never) | Ban type assertions entirely |
| `@typescript-eslint/no-useless-constructor` | `error` | Disallow unnecessary constructors |
| `@typescript-eslint/consistent-type-definitions` | `error` (type) | Enforce using type over interface |
| `@typescript-eslint/no-inferrable-types` | `error` | Disallow explicit types where they can be inferred |
| `@typescript-eslint/no-unused-vars` | `error` | Disallow unused variables (with `_` prefix exception) |

### Import Rules

| Rule | Value | Description |
|------|-------|-------------|
| `import-x/first` | `error` | All imports must be at the top |
| `import-x/no-dynamic-require` | `error` | Ban dynamic require() |
| `import-x/no-commonjs` | `error` | Ban CommonJS module.exports/require |
| `import-x/no-unresolved` | `error` | Ensure imports resolve |
| `import-x/no-duplicates` | `error` | No duplicate imports |
| `import-x/newline-after-import` | `error` | Require newline after imports |
| `import-x/no-amd` | `error` | Ban AMD define/require |
| `import-x/no-import-module-exports` | `error` | Ban import alongside module.exports |

### Banned Syntax Patterns

| Pattern | Message |
|---------|---------|
| `ImportExpression` | Dynamic imports are not allowed. Use top-level import declarations only. |
| Object literal with type annotation | Don't annotate initialized object variables. Prefer inference or use 'satisfies' instead. |

### React Rules

| Rule | Value | Description |
|------|-------|-------------|
| `react-hooks/rules-of-hooks` | `error` | Enforce React Hooks rules |
| `react-hooks/exhaustive-deps` | `error` | Enforce exhaustive dependencies |
| `react/no-array-index-key` | `error` | Disallow using array index as key |
| `react/react-in-jsx-scope` | `off` | Not needed with React 17+ |
| `react/no-unknown-property` | `off` | Let TypeScript handle prop validation |
| `react/prop-types` | `off` | TypeScript handles prop validation |
| `@eslint-react/no-unnecessary-use-callback` | `error` | Flag unnecessary useCallback |
| `@eslint-react/no-unnecessary-use-memo` | `error` | Flag unnecessary useMemo |
| `@eslint-react/no-unnecessary-use-prefix` | `error` | Flag unnecessary "use" prefix |
| `@eslint-react/no-unnecessary-key` | `error` | Flag unnecessary key prop |
| `@eslint-react/hooks-extra/no-direct-set-state-in-use-effect` | `error` | Prevent direct setState in useEffect |
| `@eslint-react/no-nested-component-definitions` | `error` | Disallow nested component definitions |
