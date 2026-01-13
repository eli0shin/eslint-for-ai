import { ESLintUtils, type TSESTree, AST_NODE_TYPES } from '@typescript-eslint/utils';

const createRule = ESLintUtils.RuleCreator(
  (name) => `https://github.com/elioshinsky/eslint-for-ai/blob/main/docs/rules/${name}.md`
);

function isInsideTestCallback(node: TSESTree.Node): boolean {
  let current: TSESTree.Node | undefined = node.parent;

  while (current) {
    if (
      (current.type === AST_NODE_TYPES.ArrowFunctionExpression ||
        current.type === AST_NODE_TYPES.FunctionExpression) &&
      current.parent.type === AST_NODE_TYPES.CallExpression
    ) {
      const callExpr = current.parent;
      const callee = callExpr.callee;

      if (callee.type === AST_NODE_TYPES.Identifier) {
        if (callee.name === 'test' || callee.name === 'it') {
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

function isInsideConditional(node: TSESTree.Node): boolean {
  let current: TSESTree.Node | undefined = node.parent;

  while (current) {
    // Stop at test callback boundary
    if (
      (current.type === AST_NODE_TYPES.ArrowFunctionExpression ||
        current.type === AST_NODE_TYPES.FunctionExpression) &&
      current.parent.type === AST_NODE_TYPES.CallExpression
    ) {
      const callExpr = current.parent;
      if (callExpr.callee.type === AST_NODE_TYPES.Identifier) {
        if (callExpr.callee.name === 'test' || callExpr.callee.name === 'it') {
          break;
        }
      }
    }

    // Check for conditional structures
    if (current.type === AST_NODE_TYPES.IfStatement) {
      return true;
    }

    if (current.type === AST_NODE_TYPES.ConditionalExpression) {
      return true;
    }

    if (current.type === AST_NODE_TYPES.SwitchCase) {
      return true;
    }

    current = current.parent;
  }
  return false;
}

function isExpectMatcherCall(node: TSESTree.CallExpression): boolean {
  const { callee } = node;

  // Only match expect().matcher() or expect().not.matcher() patterns
  // Don't match bare expect() calls to avoid double reporting
  if (callee.type === AST_NODE_TYPES.MemberExpression) {
    let obj: TSESTree.Node = callee.object;

    // Handle expect().not.matcher() - walk through member expressions
    while (obj.type === AST_NODE_TYPES.MemberExpression) {
      obj = obj.object;
    }

    if (obj.type === AST_NODE_TYPES.CallExpression) {
      if (obj.callee.type === AST_NODE_TYPES.Identifier && obj.callee.name === 'expect') {
        return true;
      }
    }
  }

  return false;
}

export default createRule({
  name: 'no-conditional-expect',
  meta: {
    type: 'problem',
    docs: {
      description: 'Disallow expect() calls inside conditionals in tests',
    },
    messages: {
      conditionalExpect: 'Unexpected expect() inside conditional. All assertions should execute unconditionally.',
    },
    schema: [],
  },
  defaultOptions: [],
  create(context) {
    return {
      CallExpression(node) {
        if (!isInsideTestCallback(node)) {
          return;
        }

        if (isExpectMatcherCall(node) && isInsideConditional(node)) {
          context.report({
            node,
            messageId: 'conditionalExpect',
          });
        }
      },
    };
  },
});
