import type { TSESTree } from '@typescript-eslint/utils';

export function isNode(value: unknown): value is TSESTree.Node {
  return typeof value === 'object' && value !== null && 'type' in value;
}
