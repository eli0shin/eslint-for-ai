import noBareWrapper from './rules/no-bare-wrapper.js';
import noInterface from './rules/no-interface.js';
import noStandaloneClass from './rules/no-standalone-class.js';

const rules = {
  'no-bare-wrapper': noBareWrapper,
  'no-interface': noInterface,
  'no-standalone-class': noStandaloneClass,
};

const plugin = {
  meta: {
    name: 'eslint-plugin-for-ai',
    version: '1.0.0',
  },
  rules,
  configs: {
    recommended: {
      plugins: {
        'for-ai': undefined as never, // Will be set to plugin itself at runtime
      },
      rules: {
        'for-ai/no-bare-wrapper': 'error',
        'for-ai/no-interface': 'error',
        'for-ai/no-standalone-class': 'error',
      },
    },
  },
};

// Set the circular reference
plugin.configs.recommended.plugins['for-ai'] = plugin as never;

export default plugin;
