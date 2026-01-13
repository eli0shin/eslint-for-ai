import { ESLintUtils, type TSESTree, AST_NODE_TYPES } from '@typescript-eslint/utils';

const createRule = ESLintUtils.RuleCreator(
  (name) => `https://github.com/elioshinsky/eslint-for-ai/blob/main/docs/rules/${name}.md`
);

function isInsideTestCallback(node: TSESTree.Node): boolean {
  let current: TSESTree.Node | undefined = node.parent;

  while (current) {
    // Check if we're in a function that is the callback of test()/it()
    if (
      (current.type === AST_NODE_TYPES.ArrowFunctionExpression ||
        current.type === AST_NODE_TYPES.FunctionExpression) &&
      current.parent?.type === AST_NODE_TYPES.CallExpression
    ) {
      const callExpr = current.parent;
      const callee = callExpr.callee;

      if (callee.type === AST_NODE_TYPES.Identifier) {
        if (callee.name === 'test' || callee.name === 'it') {
          // Verify this is the second argument (the callback)
          if (callExpr.arguments[1] === current) {
            return true;
          }
        }
      }
    }
    current = current.parent;
  }
  return false;
}

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
