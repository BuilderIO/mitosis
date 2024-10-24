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
  shouldUpdateGetters = true,
}: {
  code: string;
  options: ToReactOptions;
  json: MitosisComponent;
  shouldUpdateGetters?: boolean;
}) => {
  const str = updateStateSettersInCode(code, options);
  const getterKeys = Object.keys(json.state).filter((item) => json.state[item]?.type === 'getter');
  const value = shouldUpdateGetters ? updateGettersToFunctionsInCode(str, getterKeys) : str;

  if (options.stateType !== 'useState' && options.stateType !== 'variables') {
    return value;
  }

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

export function processTagReferences(json: MitosisComponent, options: ToReactOptions) {
  const namesFound = new Set<string>();

  traverse(json).forEach((el) => {
    if (!isMitosisNode(el)) {
      return;
    }

    const processedRefName = el.name.includes('-')
      ? el.name
      : processBinding({
          code: el.name,
          options,
          json,
          shouldUpdateGetters: false,
        });

    if (el.name.startsWith('state.')) {
      const refState = json.state[processedRefName];
      switch (refState?.type) {
        case 'getter': {
          const refName = upperFirst(processedRefName) + 'Ref';
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
          const capitalizedName = upperFirst(processedRefName);

          if (capitalizedName !== processedRefName) {
            el.name = capitalizedName;
            json.state[capitalizedName] = { ...refState! };

            delete json.state[processedRefName];
          } else {
            el.name = processedRefName;
          }

          break;
      }
    } else {
      el.name = processedRefName;
    }
  });
}
