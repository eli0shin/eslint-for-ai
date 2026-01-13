import { ESLintUtils, type TSESTree, AST_NODE_TYPES } from '@typescript-eslint/utils';
import { isNode } from '../utils/ast.js';
import { isTestFrameworkCall } from '../utils/test-detection.js';

const createRule = ESLintUtils.RuleCreator(
  (name) => `https://github.com/elioshinsky/eslint-for-ai/blob/main/docs/rules/${name}.md`
);

const MOCK_ASSERTION_MATCHERS = new Set([
  'toHaveBeenCalled',
  'toHaveBeenCalledWith',
  'toHaveBeenCalledTimes',
  'toHaveBeenLastCalledWith',
  'toHaveBeenNthCalledWith',
]);

type TestCallbackFunction = TSESTree.ArrowFunctionExpression | TSESTree.FunctionExpression;

function isTestFunction(node: TSESTree.CallExpression): boolean {
  const result = isTestFrameworkCall(node.callee);
  // Only match test/it, not describe (describe blocks don't have assertions)
  return result !== null && (result.name === 'test' || result.name === 'it');
}

function getTestCallback(node: TSESTree.CallExpression): TestCallbackFunction | null {
  // test('name', () => { ... })
  // First arg is test name, second is callback
  const callbackArg = node.arguments[1];

  if (
    callbackArg.type === AST_NODE_TYPES.ArrowFunctionExpression ||
    callbackArg.type === AST_NODE_TYPES.FunctionExpression
  ) {
    return callbackArg;
  }

  return null;
}

function isMockAssertion(node: TSESTree.CallExpression): boolean {
  // Check if this is an expect().matcher() call
  // Pattern: expect(something).matcher() or expect(something).not.matcher()

  const { callee } = node;

  if (callee.type !== AST_NODE_TYPES.MemberExpression) {
    return false;
  }

  // Get the matcher name (the property being accessed)
  const matcher = callee.property;

  if (matcher.type !== AST_NODE_TYPES.Identifier) {
    return false;
  }

  // Check if it's a mock assertion matcher
  return MOCK_ASSERTION_MATCHERS.has(matcher.name);
}

function findExpectCalls(callback: TestCallbackFunction): TSESTree.CallExpression[] {
  const expectCalls: TSESTree.CallExpression[] = [];

  const walk = (node: TSESTree.Node): void => {
    if (node.type === AST_NODE_TYPES.CallExpression) {
      // Check if this is an expect().matcher() call
      const { callee } = node;

      // expect().matcher() or expect().not.matcher() pattern
      if (callee.type === AST_NODE_TYPES.MemberExpression) {
        let expectCallNode: TSESTree.Node | null = null;

        // expect().matcher() - direct pattern
        if (callee.object.type === AST_NODE_TYPES.CallExpression) {
          expectCallNode = callee.object;
        }
        // expect().not.matcher() - nested pattern
        else if (callee.object.type === AST_NODE_TYPES.MemberExpression) {
          if (callee.object.object.type === AST_NODE_TYPES.CallExpression) {
            expectCallNode = callee.object.object;
          }
        }

        // Check if we found an expect() call
        if (expectCallNode?.type === AST_NODE_TYPES.CallExpression) {
          const innerCallee = expectCallNode.callee;
          if (innerCallee.type === AST_NODE_TYPES.Identifier && innerCallee.name === 'expect') {
            expectCalls.push(node);
          }
        }
      }
    }

    // Recursively walk child nodes, avoiding parent references
    for (const [key, child] of Object.entries(node)) {
      // Skip parent to avoid circular references
      if (key === 'parent') {
        continue;
      }

      if (child && typeof child === 'object') {
        if (Array.isArray(child)) {
          for (const item of child) {
            if (isNode(item)) {
              walk(item);
            }
          }
        } else if (isNode(child)) {
          walk(child);
        }
      }
    }
  };

  walk(callback.body);

  return expectCalls;
}

function findAssertions(callback: TestCallbackFunction): { mockAssertions: number; behaviorAssertions: number } {
  const expectCalls = findExpectCalls(callback);

  let mockAssertions = 0;
  let behaviorAssertions = 0;

  for (const call of expectCalls) {
    if (isMockAssertion(call)) {
      mockAssertions++;
    } else {
      behaviorAssertions++;
    }
  }

  return { mockAssertions, behaviorAssertions };
}

export default createRule({
  name: 'no-mock-only-test',
  meta: {
    type: 'problem',
    docs: {
      description: 'Disallow tests that only assert on mock function calls without testing actual behavior',
    },
    messages: {
      mockOnlyTest: 'Test only asserts on mock function calls. Add assertions on actual behavior (return values, state changes, etc.).',
    },
    schema: [],
  },
  defaultOptions: [],
  create(context) {
    return {
      CallExpression(node) {
        if (!isTestFunction(node)) {
          return;
        }

        const callback = getTestCallback(node);
        if (!callback) {
          return;
        }

        const { mockAssertions, behaviorAssertions } = findAssertions(callback);

        // Report if there are mock assertions but no behavior assertions
        if (mockAssertions > 0 && behaviorAssertions === 0) {
          context.report({
            node,
            messageId: 'mockOnlyTest',
          });
        }
      },
    };
  },
});
