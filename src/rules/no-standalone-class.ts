import { ESLintUtils, type TSESTree } from '@typescript-eslint/utils';

const createRule = ESLintUtils.RuleCreator(
  (name) => `https://github.com/elioshinsky/eslint-for-ai/blob/main/docs/rules/${name}.md`
);

export default createRule({
  name: 'no-standalone-class',
  meta: {
    type: 'suggestion',
    docs: {
      description: 'Disallow classes that do not extend another class',
    },
    messages: {
      standaloneClass: 'Class "{{className}}" does not extend another class. Use functions and types instead, or extend an existing class.',
    },
    schema: [],
  },
  defaultOptions: [],
  create(context) {
    return {
      ClassDeclaration(node: TSESTree.ClassDeclaration) {
        // Allow classes that extend another class
        if (node.superClass) {
          return;
        }

        // Get the class name
        const className = node.id?.name ?? 'anonymous class';

        context.report({
          node,
          messageId: 'standaloneClass',
          data: {
            className,
          },
        });
      },
    };
  },
});
