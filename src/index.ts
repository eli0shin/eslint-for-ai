import noBareWrapper from './rules/no-bare-wrapper.js';
import noCodeAfterTryCatch from './rules/no-code-after-try-catch.js';
import noInterface from './rules/no-interface.js';
import noMockOnlyTest from './rules/no-mock-only-test.js';
import noStandaloneClass from './rules/no-standalone-class.js';

const plugin = {
  meta: {
    name: 'eslint-plugin-for-ai',
    version: '1.0.0',
  },
  rules: {
    'no-bare-wrapper': noBareWrapper,
    'no-code-after-try-catch': noCodeAfterTryCatch,
    'no-interface': noInterface,
    'no-mock-only-test': noMockOnlyTest,
    'no-standalone-class': noStandaloneClass,
  },
  configs: {
    recommended: {
      rules: {
        'for-ai/no-bare-wrapper': 'error',
        'for-ai/no-code-after-try-catch': 'error',
        'for-ai/no-interface': 'error',
        'for-ai/no-mock-only-test': 'error',
        'for-ai/no-standalone-class': 'error',
      },
    },
  },
};

export default plugin;
