import { ForNode } from '../../types/mitosis-node';
import { checkIsDefined } from '../nullable';

export const getForArguments = (
  node: ForNode,
  { excludeCollectionName }: { excludeCollectionName: boolean } = { excludeCollectionName: false },
): string[] => {
  return [
    node.scope.forName || 'item',
    node.scope.indexName,
    excludeCollectionName ? undefined : node.scope.collectionName,
  ].filter(checkIsDefined);
};
