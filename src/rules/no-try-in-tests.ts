import { ESLintUtils } from '@typescript-eslint/utils';
import { isInsideTestCallback } from '../utils/test-detection.js';

const createRule = ESLintUtils.RuleCreator(
  (name) => `https://github.com/elioshinsky/eslint-for-ai/blob/main/docs/rules/${name}.md`
);

export default createRule({
  name: 'no-try-in-tests',
  meta: {
    type: 'problem',
    docs: {
      description: 'Disallow try statements in test callbacks',
    },
    messages: {
      tryInTest: 'Try statements are not allowed in tests. Tests should let errors propagate to fail the test.',
    },
    schema: [],
  },
  defaultOptions: [],
  create(context) {
    return {
      TryStatement(node) {
        if (isInsideTestCallback(node)) {
          context.report({
            node,
            messageId: 'tryInTest',
          });
        }
      },
    };
  },
});
