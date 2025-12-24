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

function isStatement(node: TSESTree.Node): node is TSESTree.Statement {
  // Check if node is a valid statement type
  return (
    node.type === AST_NODE_TYPES.BlockStatement ||
    node.type === AST_NODE_TYPES.BreakStatement ||
    node.type === AST_NODE_TYPES.ContinueStatement ||
    node.type === AST_NODE_TYPES.DebuggerStatement ||
    node.type === AST_NODE_TYPES.DoWhileStatement ||
    node.type === AST_NODE_TYPES.EmptyStatement ||
    node.type === AST_NODE_TYPES.ExpressionStatement ||
    node.type === AST_NODE_TYPES.ForInStatement ||
    node.type === AST_NODE_TYPES.ForOfStatement ||
    node.type === AST_NODE_TYPES.ForStatement ||
    node.type === AST_NODE_TYPES.FunctionDeclaration ||
    node.type === AST_NODE_TYPES.IfStatement ||
    node.type === AST_NODE_TYPES.LabeledStatement ||
    node.type === AST_NODE_TYPES.ReturnStatement ||
    node.type === AST_NODE_TYPES.SwitchStatement ||
    node.type === AST_NODE_TYPES.ThrowStatement ||
    node.type === AST_NODE_TYPES.TryStatement ||
    node.type === AST_NODE_TYPES.VariableDeclaration ||
    node.type === AST_NODE_TYPES.WhileStatement ||
    node.type === AST_NODE_TYPES.WithStatement ||
    node.type === AST_NODE_TYPES.ClassDeclaration ||
    node.type === AST_NODE_TYPES.ExportAllDeclaration ||
    node.type === AST_NODE_TYPES.ExportDefaultDeclaration ||
    node.type === AST_NODE_TYPES.ExportNamedDeclaration ||
    node.type === AST_NODE_TYPES.ImportDeclaration
  );
}

function hasCodeAfterTryStatement(tryNode: TSESTree.TryStatement): boolean {
  const parent = tryNode.parent;

  // Check if parent is a block statement
  if (parent.type !== AST_NODE_TYPES.BlockStatement) {
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
    let current: TSESTree.Node = parent;

    // Walk up to find the function body
    for (;;) {
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

        while (statementNode.parent && statementNode.parent !== functionBody) {
          statementNode = statementNode.parent;
        }

        // Check if there are statements after this top-level statement
        const statements = functionBody.body;
        if (isStatement(statementNode)) {
          const statementIndex = statements.indexOf(statementNode);
          return statementIndex !== -1 && statementIndex < statements.length - 1;
        }
        return false;
      }

      if (!currentParent) {
        break;
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
