import { ESLintUtils, type TSESTree, AST_NODE_TYPES } from '@typescript-eslint/utils';

const createRule = ESLintUtils.RuleCreator(
  (name) => `https://github.com/elioshinsky/eslint-for-ai/blob/main/docs/rules/${name}.md`
);

type FunctionNode =
  | TSESTree.FunctionDeclaration
  | TSESTree.FunctionExpression
  | TSESTree.ArrowFunctionExpression;

function getFunctionName(node: FunctionNode): string {
  // Check if the function has an id (named function)
  if (node.id?.type === AST_NODE_TYPES.Identifier) {
    return node.id.name;
  }

  const parent = node.parent;

  // Arrow function assigned to a variable
  if (node.type === AST_NODE_TYPES.ArrowFunctionExpression) {
    if (parent?.type === AST_NODE_TYPES.VariableDeclarator && parent.id.type === AST_NODE_TYPES.Identifier) {
      return parent.id.name;
    }
    return 'arrow function';
  }

  // Method definition in a class
  if (parent?.type === AST_NODE_TYPES.MethodDefinition) {
    if (parent.key.type === AST_NODE_TYPES.Identifier) {
      return parent.key.name;
    }
  }

  return 'anonymous function';
}

function getCallExpressionName(node: TSESTree.CallExpression): string {
  const { callee } = node;

  if (callee.type === AST_NODE_TYPES.Identifier) {
    return callee.name;
  }

  if (callee.type === AST_NODE_TYPES.MemberExpression) {
    const parts: string[] = [];
    let current: TSESTree.MemberExpression | TSESTree.Expression = callee;

    while (current.type === AST_NODE_TYPES.MemberExpression) {
      if (current.property.type === AST_NODE_TYPES.Identifier) {
        parts.unshift(current.property.name);
      }
      current = current.object;
    }

    if (current.type === AST_NODE_TYPES.ThisExpression) {
      parts.unshift('this');
    } else if (current.type === AST_NODE_TYPES.Identifier) {
      parts.unshift(current.name);
    }

    return parts.join('.');
  }

  return 'unknown';
}

function areArgumentsPassedThrough(
  params: TSESTree.Parameter[],
  args: TSESTree.CallExpressionArgument[]
): boolean {
  if (params.length !== args.length) {
    return false;
  }

  for (let i = 0; i < params.length; i++) {
    const param = params[i];
    const arg = args[i];

    if (param.type !== AST_NODE_TYPES.Identifier || arg.type !== AST_NODE_TYPES.Identifier) {
      return false;
    }

    if (param.name !== arg.name) {
      return false;
    }
  }

  return true;
}

function isBareWrapper(node: FunctionNode): { isBare: boolean; callExpression?: TSESTree.CallExpression } {
  const body = node.body;

  // Arrow function with expression body: const x = (a) => foo(a)
  if (body.type !== AST_NODE_TYPES.BlockStatement) {
    if (body.type === AST_NODE_TYPES.CallExpression) {
      if (areArgumentsPassedThrough(node.params, body.arguments)) {
        return { isBare: true, callExpression: body };
      }
    }
    return { isBare: false };
  }

  // Function with block body
  const statements = body.body;

  // Must have exactly one statement
  if (statements.length !== 1) {
    return { isBare: false };
  }

  const statement = statements[0];

  // Must be a return statement
  if (statement.type !== AST_NODE_TYPES.ReturnStatement) {
    return { isBare: false };
  }

  const returnValue = statement.argument;

  // Return value must be a call expression
  if (!returnValue || returnValue.type !== AST_NODE_TYPES.CallExpression) {
    return { isBare: false };
  }

  // Check if arguments are passed through unchanged
  if (areArgumentsPassedThrough(node.params, returnValue.arguments)) {
    return { isBare: true, callExpression: returnValue };
  }

  return { isBare: false };
}

export default createRule({
  name: 'no-bare-wrapper',
  meta: {
    type: 'suggestion',
    docs: {
      description: 'Disallow functions that do nothing other than call another function with their own inputs',
    },
    messages: {
      bareWrapper: 'Function "{{functionName}}" is a bare wrapper around "{{wrappedFunction}}". Call {{wrappedFunction}} directly or add additional logic.',
    },
    schema: [],
  },
  defaultOptions: [],
  create(context) {
    function checkFunction(node: FunctionNode) {
      const { isBare, callExpression } = isBareWrapper(node);

      if (isBare && callExpression) {
        const functionName = getFunctionName(node);
        const wrappedFunction = getCallExpressionName(callExpression);

        context.report({
          node,
          messageId: 'bareWrapper',
          data: {
            functionName,
            wrappedFunction,
          },
        });
      }
    }

    return {
      FunctionDeclaration: checkFunction,
      FunctionExpression: checkFunction,
      ArrowFunctionExpression: checkFunction,
    };
  },
});
