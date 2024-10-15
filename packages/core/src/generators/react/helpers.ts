import { updateGettersToFunctionsInCode } from '@/helpers/getters-to-functions';
import { isMitosisNode } from '@/helpers/is-mitosis-node';
import { stripStateAndPropsRefs } from '@/helpers/strip-state-and-props-refs';
import { MitosisComponent } from '@/types/mitosis-component';
import { MitosisNode } from '@/types/mitosis-node';
import { upperFirst } from 'lodash';
import traverse from 'neotraverse/legacy';
import { updateStateSettersInCode } from './state';
import { ToReactOptions } from './types';

export const processBinding = ({
  code,
  options,
  json,
}: {
  code: string;
  options: ToReactOptions;
  json: MitosisComponent;
}) => {
  const str = updateStateSettersInCode(code, options);
  const getterKeys = Object.keys(json.state).filter((item) => json.state[item]?.type === 'getter');
  const value = updateGettersToFunctionsInCode(str, getterKeys);

  return stripStateAndPropsRefs(value, {
    includeState: true,
    includeProps: false,
  });
};

export const openFrag = (options: ToReactOptions) => getFragment('open', options);
export const closeFrag = (options: ToReactOptions) => getFragment('close', options);
export function getFragment(type: 'open' | 'close', options: ToReactOptions) {
  const tagName = options.preact ? 'Fragment' : '';
  return type === 'open' ? `<${tagName}>` : `</${tagName}>`;
}
export const wrapInFragment = (json: MitosisComponent | MitosisNode) => json.children.length !== 1;

function getRefName(path: string) {
  return upperFirst(path) + 'Ref';
}

export function processTagReferences(json: MitosisComponent, _options: ToReactOptions) {
  const namesFound = new Set<string>();

  traverse(json).forEach((el) => {
    if (!isMitosisNode(el)) {
      return;
    }

    if (el.name.includes('state.')) {
      switch (json.state[el.name]?.type) {
        case 'getter': {
          const refName = getRefName(el.name);
          if (!namesFound.has(el.name)) {
            namesFound.add(el.name);
            json.hooks.init = {
              ...json.hooks.init,
              code: `
            ${json.hooks.init?.code || ''}
            const ${refName} = ${el.name};
            `,
            };
          }

          el.name = refName;
          break;
        }
        // NOTE: technically, it should be impossible for the tag to be a method or a function in Mitosis JSX syntax,
        // as that will fail JSX parsing.
        case 'method':
        case 'function':

        case 'property':
          const capitalizedName = upperFirst(el.name);

          if (capitalizedName !== el.name) {
            el.name = capitalizedName;
            json.state[capitalizedName] = { ...json.state[el.name]! };

            delete json.state[el.name];
          }

          break;
      }
    }
  });
}
