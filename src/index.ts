import tseslint from "typescript-eslint";
import importX from "eslint-plugin-import-x";
import reactPlugin from "eslint-plugin-react";
import reactHooksPlugin from "eslint-plugin-react-hooks";
import eslintReact from "@eslint-react/eslint-plugin";

import noBareWrapper from "./rules/no-bare-wrapper.js";
import noCodeAfterTryCatch from "./rules/no-code-after-try-catch.js";
import noConstantAssertion from "./rules/no-constant-assertion.js";
import noInterface from "./rules/no-interface.js";
import noMockOnlyTest from "./rules/no-mock-only-test.js";
import noStandaloneClass from "./rules/no-standalone-class.js";

const plugin = {
  meta: {
    name: "eslint-plugin-for-ai",
    version: "1.0.0",
  },
  rules: {
    "no-bare-wrapper": noBareWrapper,
    "no-code-after-try-catch": noCodeAfterTryCatch,
    "no-constant-assertion": noConstantAssertion,
    "no-interface": noInterface,
    "no-mock-only-test": noMockOnlyTest,
    "no-standalone-class": noStandaloneClass,
  },
};

const recommended = tseslint.config(
  ...tseslint.configs.recommended,
  ...tseslint.configs.strict,
  eslintReact.configs.recommended,
  {
    files: ["**/*.ts", "**/*.tsx"],
    plugins: {
      "for-ai": plugin,
      "import-x": importX,
      react: reactPlugin,
      "react-hooks": reactHooksPlugin,
    },
    rules: {
      // ============================================
      // eslint-for-ai rules
      // ============================================
      "for-ai/no-bare-wrapper": "error",
      "for-ai/no-code-after-try-catch": "error",
      "for-ai/no-constant-assertion": "error",
      "for-ai/no-interface": "error",
      "for-ai/no-mock-only-test": "error",
      "for-ai/no-standalone-class": "error",

      // ============================================
      // Core ESLint rules
      // ============================================
      "no-console": "error",
      "prefer-const": "error",

      // ============================================
      // TypeScript rules
      // ============================================
      "@typescript-eslint/no-explicit-any": [
        "error",
        {
          fixToUnknown: false,
          ignoreRestArgs: false,
        },
      ],
      "@typescript-eslint/no-unsafe-assignment": "error",
      "@typescript-eslint/no-unsafe-call": "error",
      "@typescript-eslint/no-unsafe-member-access": "error",
      "@typescript-eslint/no-unsafe-return": "error",
      "@typescript-eslint/no-unsafe-argument": "error",
      "@typescript-eslint/no-require-imports": "error",
      "@typescript-eslint/consistent-type-imports": [
        "error",
        {
          prefer: "type-imports",
          fixStyle: "inline-type-imports",
        },
      ],
      "@typescript-eslint/no-import-type-side-effects": "error",
      "@typescript-eslint/switch-exhaustiveness-check": "error",
      "@typescript-eslint/prefer-optional-chain": "error",
      "@typescript-eslint/no-unnecessary-type-assertion": "error",
      "@typescript-eslint/no-unnecessary-condition": [
        "error",
        {
          checkTypePredicates: true,
          allowConstantLoopConditions: true,
        },
      ],
      "@typescript-eslint/prefer-readonly": "error",
      "@typescript-eslint/consistent-type-assertions": [
        "error",
        {
          assertionStyle: "never",
        },
      ],
      "@typescript-eslint/no-useless-constructor": "error",
      "@typescript-eslint/consistent-type-definitions": ["error", "type"],
      "@typescript-eslint/no-inferrable-types": "error",
      "@typescript-eslint/no-unused-vars": [
        "error",
        {
          argsIgnorePattern: "^_",
          varsIgnorePattern: "^_",
          caughtErrorsIgnorePattern: "^_",
        },
      ],

      // ============================================
      // Import rules
      // ============================================
      "import-x/first": "error",
      "import-x/no-dynamic-require": "error",
      "import-x/no-commonjs": "error",
      "import-x/no-unresolved": "error",
      "import-x/no-duplicates": "error",
      "import-x/newline-after-import": ["error", { count: 1 }],
      "import-x/no-amd": "error",
      "import-x/no-import-module-exports": "error",

      // ============================================
      // Banned syntax patterns
      // ============================================
      "no-restricted-syntax": [
        "error",
        {
          selector: "ImportExpression",
          message:
            "Dynamic imports are not allowed. Use top-level import declarations only.",
        },
        {
          selector:
            "VariableDeclarator[init.type='ObjectExpression'] > Identifier[typeAnnotation]",
          message:
            "Don't annotate initialized object variables. Prefer inference or use 'satisfies' instead.",
        },
      ],

      // ============================================
      // React rules
      // ============================================
      "react-hooks/rules-of-hooks": "error",
      "react-hooks/exhaustive-deps": "error",
      "react/no-array-index-key": "error",
      "react/react-in-jsx-scope": "off",
      "react/no-unknown-property": "off",
      "react/prop-types": "off",
      "@eslint-react/no-unnecessary-use-callback": "error",
      "@eslint-react/no-unnecessary-use-memo": "error",
      "@eslint-react/no-unnecessary-use-prefix": "error",
      "@eslint-react/no-unnecessary-key": "error",
      "@eslint-react/hooks-extra/no-direct-set-state-in-use-effect": "error",
      "@eslint-react/no-nested-component-definitions": "error",
    },
  },
);

export default {
  ...plugin,
  configs: {
    recommended,
  },
};
