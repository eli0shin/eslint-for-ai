// @ts-check
import tseslint from 'typescript-eslint';
import globals from 'globals';
import prettierConfig from 'eslint-config-prettier';
import forAiPlugin from './dist/index.js';

export default tseslint.config(
  // Global ignores
  {
    ignores: [
      'dist/',
      'node_modules/',
      '**/*.d.ts',
      'coverage/',
      '*.js',
      'tests/fixtures/**/*',
      'scripts/',
    ],
  },

  // Use our own recommended config (includes tseslint, import-x, react, etc.)
  ...forAiPlugin.configs.recommended,

  // Prettier configuration - disables ESLint rules that conflict with Prettier
  prettierConfig,

  // TypeScript files - project-specific settings
  {
    name: 'typescript-project-settings',
    files: ['**/*.ts'],
    languageOptions: {
      parserOptions: {
        projectService: true,
        tsconfigRootDir: import.meta.dirname,
      },
      globals: {
        ...globals.node,
        Bun: 'readonly',
      },
    },
    settings: {
      'import-x/resolver': {
        typescript: {
          alwaysTryTypes: true,
          project: './tsconfig.json',
        },
        node: true,
      },
      'import-x/extensions': ['.ts', '.tsx', '.js', '.jsx', '.mjs'],
      'import-x/external-module-folders': [
        'node_modules',
        'node_modules/@types',
      ],
      'import-x/core-modules': ['bun', 'bun:test', 'bun:jsc'],
    },
    rules: {
      // Project-specific overrides
      '@typescript-eslint/prefer-nullish-coalescing': 'off',
      '@typescript-eslint/no-non-null-assertion': 'off',
      '@typescript-eslint/no-unused-vars': 'off', // Use typescript compiler instead
      '@typescript-eslint/no-empty-interface': 'off',
      '@typescript-eslint/no-empty-function': 'off',
      'import-x/no-nodejs-modules': 'off', // Allow Node.js built-in modules
    },
  },

  // Test files configuration
  {
    name: 'test-files',
    files: ['**/*.test.ts', '**/*.spec.ts', 'tests/**/*.ts', 'test-setup.ts'],
    rules: {
      '@typescript-eslint/no-explicit-any': 'off', // Allow any in tests
      'no-console': 'off', // Allow console in tests
      '@typescript-eslint/no-non-null-assertion': 'off',
    },
  },

  // CLI entry point configuration - still enforce process.stdout/stderr.write
  {
    name: 'cli-files',
    files: ['src/cli.ts', 'src/index.ts'],
    rules: {
      // Keep no-console error to enforce proper CLI output methods
    },
  }
);
