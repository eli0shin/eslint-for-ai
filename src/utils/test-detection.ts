import { type TSESTree, AST_NODE_TYPES } from '@typescript-eslint/utils';

const TEST_FUNCTION_NAMES = new Set(['test', 'it', 'describe']);

type TestFrameworkCallResult = {
  name: string;
};

/**
 * Checks if a callee node represents a test framework function call.
 * Handles:
 * - Direct calls: test(), it(), describe()
 * - Member expressions: test.skip(), test.only(), it.skip(), it.only(), etc.
 * - Parameterized tests: test.each([...])(), describe.each([...])()
 */
export function isTestFrameworkCall(callee: TSESTree.Node): TestFrameworkCallResult | null {
  // Case 1: Direct identifier - test(), it(), describe()
  if (callee.type === AST_NODE_TYPES.Identifier) {
    if (TEST_FUNCTION_NAMES.has(callee.name)) {
      return { name: callee.name };
    }
  }

  // Case 2: Member expression - test.skip(), test.only(), it.skip(), it.only(), etc.
  if (callee.type === AST_NODE_TYPES.MemberExpression) {
    if (callee.object.type === AST_NODE_TYPES.Identifier) {
      if (TEST_FUNCTION_NAMES.has(callee.object.name)) {
        return { name: callee.object.name };
      }
    }
  }

  // Case 3: CallExpression - test.each([...])('name', callback), describe.each([...])()
  // The outer call's callee is the result of test.each([...])
  if (callee.type === AST_NODE_TYPES.CallExpression) {
    const innerCallee = callee.callee;
    // Check if the inner callee is test.each, it.each, describe.each
    if (innerCallee.type === AST_NODE_TYPES.MemberExpression) {
      if (innerCallee.object.type === AST_NODE_TYPES.Identifier) {
        if (TEST_FUNCTION_NAMES.has(innerCallee.object.name)) {
          return { name: innerCallee.object.name };
        }
      }
    }
  }

  return null;
}

/**
 * Checks if a node is inside a test/it/describe callback.
 * Walks up the AST tree looking for test framework function callbacks.
 * Stops at function boundaries (FunctionDeclaration) since helper functions
 * defined inside test blocks should be allowed to have try-catch.
 */
export function isInsideTestCallback(node: TSESTree.Node): boolean {
  let current: TSESTree.Node | undefined = node.parent;

  while (current) {
    // Stop at FunctionDeclaration boundary - helper functions inside describe
    // blocks should not be flagged
    if (current.type === AST_NODE_TYPES.FunctionDeclaration) {
      return false;
    }

    // Check if we're in a function that is the callback of test()/it()/describe()
    if (
      (current.type === AST_NODE_TYPES.ArrowFunctionExpression ||
        current.type === AST_NODE_TYPES.FunctionExpression) &&
      current.parent.type === AST_NODE_TYPES.CallExpression
    ) {
      const callExpr = current.parent;
      const frameworkCall = isTestFrameworkCall(callExpr.callee);

      if (frameworkCall) {
        // Verify this is the second argument (the callback)
        if (callExpr.arguments[1] === current) {
          return true;
        }
      }

      // If we're in a function expression that's NOT a test callback, stop
      // This handles cases like helper arrow functions inside describe blocks
      return false;
    }
    current = current.parent;
  }
  return false;
}
