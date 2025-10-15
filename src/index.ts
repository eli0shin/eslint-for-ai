import noBareWrapper from './rules/no-bare-wrapper.js';

const plugin = {
  meta: {
    name: 'eslint-plugin-for-ai',
    version: '1.0.0',
  },
  configs: {},
  rules: {
    'no-bare-wrapper': noBareWrapper,
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
    },
  },
};

export default plugin;
