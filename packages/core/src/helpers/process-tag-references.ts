import { camelCase, last, upperFirst } from 'lodash';
import traverse from 'traverse';
import { MitosisComponent } from '../types/mitosis-component';
import { isMitosisNode } from './is-mitosis-node';

function getRefName(path: string) {
  return upperFirst(camelCase(last(path.split('.')))) + 'Ref';
}

export function processTagReferences(json: MitosisComponent) {
  const namesFound = new Set<string>();

  traverse(json).forEach((el) => {
    if (isMitosisNode(el)) {
      if (el.name.includes('.')) {
        if (!namesFound.has(el.name)) {
          namesFound.add(el.name);
          if (typeof json.hooks.init?.code !== 'string') {
            json.hooks.init = { code: '' };
          }

          json.hooks.init.code += `
            const ${getRefName(el.name)} = ${el.name};
          `;
        }
        el.name = getRefName(el.name);
      }
    }
  });
}
