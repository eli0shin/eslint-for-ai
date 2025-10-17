# eslint-for-ai

ESLint rules that you would think are useless because any dev would know better than to write code like this but LLMs write stupid code all the time so these rules are for them.

## Installation

```bash
npm install --save-dev eslint-for-ai
```

## Usage

Add the plugin to your ESLint flat config:

```javascript
import forAiPlugin from 'eslint-for-ai';

export default [
  {
    files: ['**/*.ts', '**/*.tsx'],
    plugins: {
      'for-ai': forAiPlugin
    },
    rules: forAiPlugin.configs.recommended.rules
  }
];
```

Or configure rules individually:

```javascript
import forAiPlugin from 'eslint-for-ai';

export default [
  {
    files: ['**/*.ts', '**/*.tsx'],
    plugins: {
      'for-ai': forAiPlugin
    },
    rules: {
      'for-ai/no-bare-wrapper': 'error',
      'for-ai/no-code-after-try-catch': 'error',
      'for-ai/no-interface': 'error',
      'for-ai/no-standalone-class': 'error'
    }
  }
];
```

## Rules

- **`for-ai/no-bare-wrapper`** - Disallows functions that just call another function without additional logic
- **`for-ai/no-code-after-try-catch`** - Disallows code after try/catch/finally blocks in functions
- **`for-ai/no-interface`** - Disallows TypeScript interfaces (prefer type aliases)
- **`for-ai/no-standalone-class`** - Disallows classes that don't extend another class (prefer functions and types)
