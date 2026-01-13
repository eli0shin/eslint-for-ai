import { ESLintUtils, type TSESTree, AST_NODE_TYPES } from '@typescript-eslint/utils';
import { isInsideTestCallback, isTestFrameworkCall } from '../utils/test-detection.js';

const createRule = ESLintUtils.RuleCreator(
  (name) => `https://github.com/elioshinsky/eslint-for-ai/blob/main/docs/rules/${name}.md`
);

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
      if (isTestFrameworkCall(callExpr.callee)) {
        break;
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

    // Check for logical operators (&&, ||) - right side is conditionally executed
    // e.g., condition && expect(value).toBe(true) - expect only runs if condition is truthy
    if (current.type === AST_NODE_TYPES.LogicalExpression) {
      return true;
    }

    current = current.parent;
  }
  return false;
}

/**
 * Checks if a node is an expect-related call that should be flagged in conditionals.
 * Matches:
 * - expect().matcher() - e.g., expect(value).toBe(true)
 * - expect().not.matcher() - e.g., expect(value).not.toBe(false)
 * - expect.assertions(n) - e.g., expect.assertions(1)
 * - expect.hasAssertions() - e.g., expect.hasAssertions()
 *
 * Does NOT match bare expect() calls to avoid double-reporting.
 * Bare expect() without a matcher is incomplete - it will be followed by a matcher
 * call (e.g., .toBe()), and we report on that matcher call instead.
 */
function isExpectMatcherCall(node: TSESTree.CallExpression): boolean {
  const { callee } = node;

  if (callee.type === AST_NODE_TYPES.MemberExpression) {
    // Check for expect.assertions() and expect.hasAssertions()
    if (
      callee.object.type === AST_NODE_TYPES.Identifier &&
      callee.object.name === 'expect' &&
      callee.property.type === AST_NODE_TYPES.Identifier &&
      (callee.property.name === 'assertions' || callee.property.name === 'hasAssertions')
    ) {
      return true;
    }

    // Check for expect().matcher() or expect().not.matcher() patterns
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
