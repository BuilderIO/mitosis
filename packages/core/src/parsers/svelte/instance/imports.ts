import type { ImportDeclaration } from 'estree';

export function parseImports(json: SveltosisComponent, node: ImportDeclaration) {
  const source = node.source?.value;
  if (source === 'svelte') return; // Do not import anything from svelte
  // ^ Maybe this should even be stricter and only allow relative imports and alias ones
  // as you can't import any other svelte specific libraries either...Or can we?

  const importSpecifiers = Object.values(node.specifiers).map((index) => {
    return {
      [index.local.name]: index.type === 'ImportDefaultSpecifier' ? 'default' : index.local.name,
    };
  });

  const imports = {};

  for (const specifier of importSpecifiers) {
    Object.assign(imports, specifier);
  }

  // only add imports which are actually used
  if (Object.keys(imports).length > 0) {
    json.imports = [
      ...json.imports,
      { imports, path: (source as string).replace('.svelte', '.lite') },
    ];
    // TODO: if import source already exist, combine them
    // e.g. import { lowercase } from 'lodash';
    // e.g. import { uppercase } from 'lodash';
    // should become import { lowercase, uppercase } from 'lodash';
  }
}
