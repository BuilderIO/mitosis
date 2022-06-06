import { MitosisNode } from '../types/mitosis-node';

export function getBindingsCode(children: MitosisNode[]): string[] {
  const bindings: string[] = [];
  children.forEach((child) => {
    if (child.bindings) {
      Object.keys(child.bindings).forEach((key) => {
        bindings.push(child.bindings[key]!.code);
      });
    }
    if (child.children) {
      bindings.push(...getBindingsCode(child.children));
    }
  });

  return bindings;
}
