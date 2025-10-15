import { ESLintUtils, type TSESTree } from '@typescript-eslint/utils';

const createRule = ESLintUtils.RuleCreator(
  (name) => `https://github.com/elioshinsky/eslint-for-ai/blob/main/docs/rules/${name}.md`
);

export default createRule({
  name: 'no-interface',
  meta: {
    type: 'suggestion',
    docs: {
      description: 'Disallow interface declarations',
    },
    messages: {
      noInterface: 'Interface "{{interfaceName}}" should be a type alias instead. Use "type {{interfaceName}} = { ... }" instead.',
    },
    schema: [],
  },
  defaultOptions: [],
  create(context) {
    return {
      TSInterfaceDeclaration(node: TSESTree.TSInterfaceDeclaration) {
        const interfaceName = node.id.name;

        context.report({
          node,
          messageId: 'noInterface',
          data: {
            interfaceName,
          },
        });
      },
    };
  },
});
