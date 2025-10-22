import { ESLintUtils, type TSESTree, AST_NODE_TYPES, type ParserServicesWithTypeInformation } from '@typescript-eslint/utils';
import { findVariable } from '@typescript-eslint/utils/ast-utils';
import { getParserServices } from '@typescript-eslint/utils/eslint-utils';
import type { Scope } from '@typescript-eslint/utils/ts-eslint';
import ts from 'typescript';

const createRule = ESLintUtils.RuleCreator(
  (name) => `https://github.com/elioshinsky/eslint-for-ai/blob/main/docs/rules/${name}.md`
);

type TestCallbackFunction = TSESTree.ArrowFunctionExpression | TSESTree.FunctionExpression;

function isTestFunction(node: TSESTree.CallExpression): boolean {
  const { callee } = node;

  if (callee.type === AST_NODE_TYPES.Identifier) {
    return callee.name === 'test' || callee.name === 'it';
  }

  return false;
}

function getTestCallback(node: TSESTree.CallExpression): TestCallbackFunction | null {
  const callbackArg = node.arguments[1];

  if (!callbackArg) {
    return null;
  }

  if (
    callbackArg.type === AST_NODE_TYPES.ArrowFunctionExpression ||
    callbackArg.type === AST_NODE_TYPES.FunctionExpression
  ) {
    return callbackArg;
  }

  return null;
}

function findExpectCalls(callback: TestCallbackFunction): TSESTree.CallExpression[] {
  const expectCalls: TSESTree.CallExpression[] = [];

  const walk = (node: TSESTree.Node): void => {
    if (node.type === AST_NODE_TYPES.CallExpression) {
      const { callee } = node;

      if (callee.type === AST_NODE_TYPES.MemberExpression) {
        let expectCallNode: TSESTree.Node | null = null;

        if (callee.object.type === AST_NODE_TYPES.CallExpression) {
          expectCallNode = callee.object;
        } else if (callee.object.type === AST_NODE_TYPES.MemberExpression) {
          if (callee.object.object.type === AST_NODE_TYPES.CallExpression) {
            expectCallNode = callee.object.object;
          }
        }

        if (expectCallNode?.type === AST_NODE_TYPES.CallExpression) {
          const innerCallee = expectCallNode.callee;
          if (innerCallee.type === AST_NODE_TYPES.Identifier && innerCallee.name === 'expect') {
            expectCalls.push(node);
          }
        }
      }
    }

    for (const key of Object.keys(node)) {
      if (key === 'parent') {
        continue;
      }

      const child = (node as unknown as Record<string, unknown>)[key];

      if (child && typeof child === 'object') {
        if (Array.isArray(child)) {
          for (const item of child) {
            if (item && typeof item === 'object' && 'type' in item) {
              walk(item as TSESTree.Node);
            }
          }
        } else if ('type' in child) {
          walk(child as TSESTree.Node);
        }
      }
    }
  };

  walk(callback.body);

  return expectCalls;
}

function extractExpectArgument(expectCall: TSESTree.CallExpression): TSESTree.Node | null {
  const { callee } = expectCall;

  if (callee.type !== AST_NODE_TYPES.MemberExpression) {
    return null;
  }

  let expectCallNode: TSESTree.Node | null = null;

  if (callee.object.type === AST_NODE_TYPES.CallExpression) {
    expectCallNode = callee.object;
  } else if (callee.object.type === AST_NODE_TYPES.MemberExpression) {
    if (callee.object.object.type === AST_NODE_TYPES.CallExpression) {
      expectCallNode = callee.object.object;
    }
  }

  if (expectCallNode?.type === AST_NODE_TYPES.CallExpression) {
    return expectCallNode.arguments[0] ?? null;
  }

  return null;
}

function getValueDescription(node: TSESTree.Node): string {
  if (node.type === AST_NODE_TYPES.Literal) {
    if (node.value === null) {
      return 'null';
    }
    if (typeof node.value === 'string') {
      return `'${node.value}'`;
    }
    return String(node.value);
  }

  if (node.type === AST_NODE_TYPES.Identifier) {
    return `variable '${node.name}'`;
  }

  if (node.type === AST_NODE_TYPES.MemberExpression) {
    const object = getValueDescription(node.object);
    if (node.property.type === AST_NODE_TYPES.Identifier && !node.computed) {
      return `${object}.${node.property.name}`;
    }
  }

  return 'constant';
}

type ParserServices = ParserServicesWithTypeInformation;

function isConstantMemberExpression(
  node: TSESTree.MemberExpression,
  scope: Scope.Scope,
  parserServices: ParserServices,
  currentFileName: string,
  visited: Set<TSESTree.Node>
): boolean {
  if (!isConstantValue(node.object, scope, parserServices, currentFileName, visited)) {
    return false;
  }

  if (node.object.type === AST_NODE_TYPES.ObjectExpression) {
    if (node.computed) {
      if (!isConstantValue(node.property, scope, parserServices, currentFileName, visited)) {
        return false;
      }
    }

    if (node.property.type === AST_NODE_TYPES.Identifier && !node.computed) {
      const prop = node.object.properties.find((p) => {
        if (p.type === AST_NODE_TYPES.Property && !p.computed) {
          if (p.key.type === AST_NODE_TYPES.Identifier) {
            return p.key.name === node.property.name;
          }
        }
        return false;
      });

      if (prop && prop.type === AST_NODE_TYPES.Property) {
        return isConstantValue(prop.value, scope, parserServices, currentFileName, visited);
      }
    }
  }

  if (node.object.type === AST_NODE_TYPES.ArrayExpression) {
    if (node.computed && node.property.type === AST_NODE_TYPES.Literal && typeof node.property.value === 'number') {
      const element = node.object.elements[node.property.value];
      if (element) {
        return isConstantValue(element, scope, parserServices, currentFileName, visited);
      }
    }
  }

  if (node.object.type === AST_NODE_TYPES.MemberExpression) {
    if (node.computed) {
      return isConstantValue(node.property, scope, parserServices, currentFileName, new Set());
    }
    return true;
  }

  if (node.object.type === AST_NODE_TYPES.Identifier) {
    const variable = findVariable(scope, node.object);
    if (!variable || variable.defs.length === 0) {
      return false;
    }

    const def = variable.defs[0];
    if (def.type === 'Parameter') {
      return false;
    }

    if (def.type === 'Variable' && def.node.type === AST_NODE_TYPES.VariableDeclarator) {
      const init = def.node.init;
      if (!init) {
        return false;
      }

      if (init.type === AST_NODE_TYPES.ObjectExpression || init.type === AST_NODE_TYPES.ArrayExpression) {
        const memberAccess = createMemberAccessOnNode(init, node);
        if (memberAccess) {
          return isConstantValue(memberAccess, scope, parserServices, currentFileName, new Set());
        }
        return false;
      }
    }
  }

  return false;
}

function createMemberAccessOnNode(
  base: TSESTree.ObjectExpression | TSESTree.ArrayExpression,
  memberExpr: TSESTree.MemberExpression
): TSESTree.Node | null {
  if (base.type === AST_NODE_TYPES.ObjectExpression) {
    if (memberExpr.property.type === AST_NODE_TYPES.Identifier && !memberExpr.computed) {
      const propertyName = memberExpr.property.name;
      const prop = base.properties.find((p) => {
        if (p.type === AST_NODE_TYPES.Property && !p.computed) {
          if (p.key.type === AST_NODE_TYPES.Identifier) {
            return p.key.name === propertyName;
          }
        }
        return false;
      });

      if (prop && prop.type === AST_NODE_TYPES.Property) {
        return prop.value;
      }
    }
  }

  if (base.type === AST_NODE_TYPES.ArrayExpression) {
    if (memberExpr.computed && memberExpr.property.type === AST_NODE_TYPES.Literal && typeof memberExpr.property.value === 'number') {
      return base.elements[memberExpr.property.value] ?? null;
    }
  }

  return null;
}

function resolveImportSpecifier(
  importDecl: TSESTree.ImportDeclaration,
  currentFileName: string,
  parserServices: ParserServices
): string | null {
  const specifier = importDecl.source.value;
  const program = parserServices.program;
  const host = ts.createCompilerHost(program.getCompilerOptions());

  const resolved = ts.resolveModuleName(
    specifier,
    currentFileName,
    program.getCompilerOptions(),
    host
  );

  return resolved.resolvedModule?.resolvedFileName ?? null;
}

function findExportedValue(
  fileName: string,
  exportName: string,
  parserServices: ParserServices
): TSESTree.Node | null {
  const program = parserServices.program;
  const sourceFile = program.getSourceFile(fileName);

  if (!sourceFile) {
    return null;
  }

  const symbol = (sourceFile as unknown as { symbol?: ts.Symbol }).symbol;
  if (!symbol) {
    return null;
  }

  const typeChecker = program.getTypeChecker();
  const exports = typeChecker.getExportsOfModule(symbol);

  const exportSymbol = exports.find((s: ts.Symbol) => s.getName() === exportName);
  if (!exportSymbol) {
    return null;
  }

  const declarations = exportSymbol.getDeclarations();
  if (!declarations || declarations.length === 0) {
    return null;
  }

  const decl = declarations[0];
  const tsNode = ts.isVariableDeclaration(decl) ? decl.initializer : undefined;

  if (!tsNode) {
    return null;
  }

  const esTreeNode = parserServices.tsNodeToESTreeNodeMap.get(tsNode);
  return esTreeNode ?? null;
}

function traceImportToSource(
  def: Scope.Definition,
  currentFileName: string,
  scope: Scope.Scope,
  parserServices: ParserServices,
  visited: Set<TSESTree.Node>
): boolean {
  if (def.type !== 'ImportBinding') {
    return false;
  }

  const importDecl = def.parent;
  if (importDecl.type !== AST_NODE_TYPES.ImportDeclaration) {
    return false;
  }

  const resolvedPath = resolveImportSpecifier(importDecl, currentFileName, parserServices);
  if (!resolvedPath) {
    return false;
  }

  let importedName: string;

  if (def.node.type === AST_NODE_TYPES.ImportSpecifier) {
    importedName = (def.node.imported as TSESTree.Identifier).name;
  } else if (def.node.type === AST_NODE_TYPES.ImportDefaultSpecifier) {
    importedName = 'default';
  } else {
    return false;
  }

  const exportedValue = findExportedValue(resolvedPath, importedName, parserServices);
  if (!exportedValue) {
    return false;
  }

  return isConstantValue(exportedValue, scope, parserServices, currentFileName, visited);
}

function traceIdentifierToValue(
  identifier: TSESTree.Identifier,
  scope: Scope.Scope,
  parserServices: ParserServices,
  currentFileName: string,
  visited: Set<TSESTree.Node>
): boolean {
  const variable = findVariable(scope, identifier);

  if (!variable || variable.defs.length === 0) {
    return false;
  }

  const def = variable.defs[0];

  if (def.type === 'Parameter') {
    return false;
  }

  if (def.type === 'ImportBinding') {
    return traceImportToSource(def, currentFileName, scope, parserServices, visited);
  }

  if (def.type === 'Variable' && def.node.type === AST_NODE_TYPES.VariableDeclarator) {
    const init = def.node.init;
    if (!init) {
      return false;
    }

    if (def.node.id.type === AST_NODE_TYPES.ObjectPattern) {
      if (init.type === AST_NODE_TYPES.ObjectExpression) {
        const property = def.node.id.properties.find((p) => {
          if (p.type === AST_NODE_TYPES.Property && p.value.type === AST_NODE_TYPES.Identifier) {
            return p.value.name === identifier.name;
          }
          return false;
        });

        if (property && property.type === AST_NODE_TYPES.Property) {
          const key = property.key;
          if (key.type === AST_NODE_TYPES.Identifier) {
            const objProp = init.properties.find((p) => {
              if (p.type === AST_NODE_TYPES.Property && p.key.type === AST_NODE_TYPES.Identifier) {
                return p.key.name === key.name;
              }
              return false;
            });

            if (objProp && objProp.type === AST_NODE_TYPES.Property) {
              return isConstantValue(objProp.value, scope, parserServices, currentFileName, visited);
            }
          }
        }
      }

      return isConstantValue(init, scope, parserServices, currentFileName, visited);
    }

    if (def.node.id.type === AST_NODE_TYPES.ArrayPattern) {
      if (init.type === AST_NODE_TYPES.ArrayExpression) {
        const index = def.node.id.elements.findIndex((e) => {
          if (e && e.type === AST_NODE_TYPES.Identifier) {
            return e.name === identifier.name;
          }
          return false;
        });

        if (index >= 0) {
          const element = init.elements[index];
          if (element) {
            return isConstantValue(element, scope, parserServices, currentFileName, visited);
          }
        }
      }

      return isConstantValue(init, scope, parserServices, currentFileName, visited);
    }

    return isConstantValue(init, scope, parserServices, currentFileName, visited);
  }

  return false;
}

function isConstantValue(
  node: TSESTree.Node,
  scope: Scope.Scope,
  parserServices: ParserServices,
  currentFileName: string,
  visited: Set<TSESTree.Node>
): boolean {
  if (node.type === AST_NODE_TYPES.Literal) {
    return true;
  }

  if (visited.has(node)) {
    return false;
  }

  visited.add(node);

  if (node.type === AST_NODE_TYPES.TemplateLiteral) {
    return node.expressions.every((expr) => isConstantValue(expr, scope, parserServices, currentFileName, visited));
  }

  if (node.type === AST_NODE_TYPES.Identifier) {
    if (node.name === 'undefined') {
      return true;
    }
    return traceIdentifierToValue(node, scope, parserServices, currentFileName, visited);
  }

  if (node.type === AST_NODE_TYPES.MemberExpression) {
    return isConstantMemberExpression(node, scope, parserServices, currentFileName, visited);
  }

  if (node.type === AST_NODE_TYPES.ArrayExpression) {
    return node.elements.every((el) => {
      if (el === null) {
        return true;
      }
      if (el.type === AST_NODE_TYPES.SpreadElement) {
        return false;
      }
      return isConstantValue(el, scope, parserServices, currentFileName, visited);
    });
  }

  if (node.type === AST_NODE_TYPES.ObjectExpression) {
    return node.properties.every((prop) => {
      if (prop.type === AST_NODE_TYPES.SpreadElement) {
        return false;
      }
      return isConstantValue(prop.value, scope, parserServices, currentFileName, visited);
    });
  }

  if (
    node.type === AST_NODE_TYPES.CallExpression ||
    node.type === AST_NODE_TYPES.ArrowFunctionExpression ||
    node.type === AST_NODE_TYPES.FunctionExpression
  ) {
    return false;
  }

  return false;
}

export default createRule({
  name: 'no-constant-assertion',
  meta: {
    type: 'problem',
    docs: {
      description: 'Disallow assertions on constant values that always produce the same result',
    },
    messages: {
      constantAssertion: 'Assertion on constant value {{value}} always produces the same result',
    },
    schema: [],
  },
  defaultOptions: [],
  create(context) {
    const parserServices = getParserServices(context);
    const sourceCode = context.sourceCode;

    return {
      CallExpression(node) {
        if (!isTestFunction(node)) {
          return;
        }

        const callback = getTestCallback(node);
        if (!callback) {
          return;
        }

        const expectCalls = findExpectCalls(callback);

        for (const expectCall of expectCalls) {
          const arg = extractExpectArgument(expectCall);
          if (!arg) {
            continue;
          }

          const scope = sourceCode.getScope(arg);
          const visited = new Set<TSESTree.Node>();

          if (isConstantValue(arg, scope, parserServices, context.filename, visited)) {
            context.report({
              node: expectCall,
              messageId: 'constantAssertion',
              data: {
                value: getValueDescription(arg),
              },
            });
          }
        }
      },
    };
  },
});
