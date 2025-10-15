import noBareWrapper from './rules/no-bare-wrapper.js';
import noInterface from './rules/no-interface.js';
import noStandaloneClass from './rules/no-standalone-class.js';

const plugin = {
  meta: {
    name: 'eslint-plugin-for-ai',
    version: '1.0.0',
  },
  configs: {},
  rules: {
    'no-bare-wrapper': noBareWrapper,
    'no-interface': noInterface,
    'no-standalone-class': noStandaloneClass,
  },
};

// Add recommended config
plugin.configs = {
  recommended: {
    plugins: {
      'for-ai': plugin,
    },
    rules: {
      'for-ai/no-bare-wrapper': 'error',
      'for-ai/no-interface': 'error',
      'for-ai/no-standalone-class': 'error',
    },
  },
};

export default plugin;
