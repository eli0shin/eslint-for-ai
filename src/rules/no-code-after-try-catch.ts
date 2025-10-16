import { ESLintUtils, type TSESTree, AST_NODE_TYPES } from '@typescript-eslint/utils';

const createRule = ESLintUtils.RuleCreator(
  (name) => `https://github.com/elioshinsky/eslint-for-ai/blob/main/docs/rules/${name}.md`
);

type FunctionNode =
  | TSESTree.FunctionDeclaration
  | TSESTree.FunctionExpression
  | TSESTree.ArrowFunctionExpression;

function isFunctionNode(node: TSESTree.Node | undefined): node is FunctionNode {
  if (!node) return false;
  return (
    node.type === AST_NODE_TYPES.FunctionDeclaration ||
    node.type === AST_NODE_TYPES.FunctionExpression ||
    node.type === AST_NODE_TYPES.ArrowFunctionExpression
  );
}

function blockEndsWithReturnOrThrow(block: TSESTree.BlockStatement): boolean {
  if (block.body.length === 0) {
    return false;
  }

  const lastStatement = block.body[block.body.length - 1];
  return (
    lastStatement.type === AST_NODE_TYPES.ReturnStatement ||
    lastStatement.type === AST_NODE_TYPES.ThrowStatement
  );
}

function tryStatementReturnsInAllPaths(tryNode: TSESTree.TryStatement): boolean {
  // Check if try block ends with return/throw
  if (!blockEndsWithReturnOrThrow(tryNode.block)) {
    return false;
  }

  // Check if catch block ends with return/throw
  if (tryNode.handler && !blockEndsWithReturnOrThrow(tryNode.handler.body)) {
    return false;
  }

  return true;
}

function hasCodeAfterTryStatement(tryNode: TSESTree.TryStatement): boolean {
  const parent = tryNode.parent;

  // Check if parent is a block statement
  if (!parent || parent.type !== AST_NODE_TYPES.BlockStatement) {
    return false;
  }

  // Case 1: Try/catch is a direct child of function body
  if (isFunctionNode(parent.parent)) {
    const statements = parent.body;
    const tryIndex = statements.indexOf(tryNode);
    return tryIndex !== -1 && tryIndex < statements.length - 1;
  }

  // Case 2: Try/catch is nested, but both try and catch return/throw
  // Find the function body and check if there's code after the containing statement
  if (tryStatementReturnsInAllPaths(tryNode)) {
    let current: TSESTree.Node | undefined = parent;

    // Walk up to find the function body
    while (current) {
      if (isFunctionNode(current)) {
        break;
      }

      const currentParent: TSESTree.Node | undefined = current.parent;

      // If we found the function body block
      if (currentParent && isFunctionNode(currentParent) && current.type === AST_NODE_TYPES.BlockStatement) {
        // Find the statement in the function body that contains our try/catch
        const functionBody = current;

        // Walk back down from tryNode to find the top-level statement in the function body
        let statementNode: TSESTree.Node = tryNode;
        let statementParent: TSESTree.Node | undefined = statementNode.parent;

        while (statementParent && statementParent !== functionBody) {
          statementNode = statementParent;
          statementParent = statementNode.parent;
        }

        // Check if there are statements after this top-level statement
        const statements = functionBody.body;
        const statementIndex = statements.indexOf(statementNode as TSESTree.Statement);
        return statementIndex !== -1 && statementIndex < statements.length - 1;
      }

      current = currentParent;
    }
  }

  return false;
}

export default createRule({
  name: 'no-code-after-try-catch',
  meta: {
    type: 'problem',
    docs: {
      description: 'Disallow code after try/catch/finally blocks in functions',
    },
    messages: {
      codeAfterTryCatch:
        'Code after try/catch/finally block. This appears to be an incorrect fallback. Either return from within the try/catch blocks or refactor the code.',
    },
    schema: [],
  },
  defaultOptions: [],
  create(context) {
    return {
      TryStatement(node) {
        if (hasCodeAfterTryStatement(node)) {
          context.report({
            node,
            messageId: 'codeAfterTryCatch',
          });
        }
      },
    };
  },
});
