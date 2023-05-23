import { uniq } from 'fp-ts/lib/Array';
import * as S from 'fp-ts/string';
import hash from 'hash-sum';
import { format } from 'prettier/standalone';
import traverse from 'traverse';
import { createSingleBinding } from '../../helpers/bindings';
import { createMitosisNode } from '../../helpers/create-mitosis-node';
import { dedent } from '../../helpers/dedent';
import { fastClone } from '../../helpers/fast-clone';
import { filterEmptyTextNodes } from '../../helpers/filter-empty-text-nodes';
import { getComponentsUsed } from '../../helpers/get-components-used';
import { getRefs } from '../../helpers/get-refs';
import { stringifyContextValue } from '../../helpers/get-state-object-string';
import { isMitosisNode } from '../../helpers/is-mitosis-node';
import { isRootTextNode } from '../../helpers/is-root-text-node';
import { mergeOptions } from '../../helpers/merge-options';
import { checkIsDefined } from '../../helpers/nullable';
import { CODE_PROCESSOR_PLUGIN } from '../../helpers/plugins/process-code';
import { renderPreComponent } from '../../helpers/render-imports';
import { stripMetaProperties } from '../../helpers/strip-meta-properties';
import { collectCss } from '../../helpers/styles/collect-css';
import { hasCss } from '../../helpers/styles/helpers';
import {
  runPostCodePlugins,
  runPostJsonPlugins,
  runPreCodePlugins,
  runPreJsonPlugins,
} from '../../modules/plugins';
import { MitosisComponent } from '../../types/mitosis-component';
import { TranspilerGenerator } from '../../types/transpiler';
import { hasGetContext } from '../helpers/context';
import { blockToSolid } from './blocks';
import { getState } from './state';
import { updateStateCode } from './state/helpers';
import { ToSolidOptions } from './types';

// Transform <foo.bar key={value} /> to <Dynamic compnent={foo.bar} key={value} />
function processDynamicComponents(json: MitosisComponent, options: ToSolidOptions) {
  let found = false;
  traverse(json).forEach((node) => {
    if (isMitosisNode(node)) {
      if (node.name.includes('.') && !node.name.endsWith('.Provider')) {
        node.bindings.component = createSingleBinding({ code: node.name });
        node.name = 'Dynamic';
        found = true;
      }
    }
  });
  return found;
}

function getContextString(component: MitosisComponent, options: ToSolidOptions) {
  let str = '';
  for (const key in component.context.get) {
    str += `
      const ${key} = useContext(${component.context.get[key].name});
    `;
  }

  return str;
}

const getRefsString = (json: MitosisComponent, options: ToSolidOptions) =>
  Array.from(getRefs(json))
    .map((ref) => {
      const typeParameter = (options.typescript && json['refs'][ref]?.typeParameter) || '';
      return `let ${ref}${typeParameter ? ': ' + typeParameter : ''};`;
    })
    .join('\n');

function addProviderComponents(json: MitosisComponent, options: ToSolidOptions) {
  for (const key in json.context.set) {
    const { name, value } = json.context.set[key];
    json.children = [
      createMitosisNode({
        name: `${name}.Provider`,
        children: json.children,
        ...(value && {
          bindings: {
            value: createSingleBinding({ code: stringifyContextValue(value) }),
          },
        }),
      }),
    ];
  }
}

const DEFAULT_OPTIONS: ToSolidOptions = {
  state: 'signals',
  stylesType: 'styled-components',
  plugins: [],
};

export const componentToSolid: TranspilerGenerator<Partial<ToSolidOptions>> =
  (passedOptions) =>
  ({ component }) => {
    let json = fastClone(component);

    const options = mergeOptions(DEFAULT_OPTIONS, passedOptions);
    options.plugins = [
      ...(options.plugins || []),
      CODE_PROCESSOR_PLUGIN((codeType) => {
        switch (codeType) {
          case 'state':
          case 'dynamic-jsx-elements':
            return (c) => c;
          case 'bindings':
          case 'hooks':
          case 'hooks-deps':
          case 'properties':
            return updateStateCode({
              component: json,
              options,
              updateSetters: codeType === 'properties' ? false : true,
            });
        }
      }),
    ];

    if (options.plugins) {
      json = runPreJsonPlugins(json, options.plugins);
    }
    addProviderComponents(json, options);
    const componentHasStyles = hasCss(json);
    const addWrapper =
      json.children.filter(filterEmptyTextNodes).length !== 1 ||
      options.stylesType === 'style-tag' ||
      isRootTextNode(json);

    // we need to run this before we run the code processor plugin, so the dynamic component variables are transformed
    const foundDynamicComponents = processDynamicComponents(json, options);

    if (options.plugins) {
      json = runPostJsonPlugins(json, options.plugins);
    }
    stripMetaProperties(json);
    const css = options.stylesType === 'style-tag' && collectCss(json, { prefix: hash(json) });

    const state = getState({ json, options });
    const componentsUsed = getComponentsUsed(json);

    const hasShowComponent = componentsUsed.has('Show');
    const hasForComponent = componentsUsed.has('For');

    const solidJSImports = uniq(S.Eq)(
      [
        hasGetContext(json) ? 'useContext' : undefined,
        hasShowComponent ? 'Show' : undefined,
        hasForComponent ? 'For' : undefined,
        json.hooks.onMount?.code ? 'onMount' : undefined,
        ...(json.hooks.onUpdate?.length ? ['on', 'createEffect'] : []),
        ...(state?.import.solidjs ?? []),
      ].filter(checkIsDefined),
    );

    const storeImports = state?.import.store ?? [];

    const propType = json.propsTypeRef || 'any';
    const propsArgs = `props${options.typescript ? `:${propType}` : ''}`;

    let str = dedent`
    ${solidJSImports.length > 0 ? `import { ${solidJSImports.join(', ')} } from 'solid-js';` : ''}
    ${!foundDynamicComponents ? '' : `import { Dynamic } from 'solid-js/web';`}
    ${storeImports.length > 0 ? `import { ${storeImports.join(', ')} } from 'solid-js/store';` : ''}
    ${
      !componentHasStyles && options.stylesType === 'styled-components'
        ? ''
        : `import { css } from "solid-styled-components";`
    }
    ${json.types && options.typescript ? json.types.join('\n') : ''}
    ${renderPreComponent({ component: json, target: 'solid' })}

    function ${json.name}(${propsArgs}) {
      ${state?.str ?? ''}

      ${getRefsString(json, options)}
      ${getContextString(json, options)}

      ${!json.hooks.onMount?.code ? '' : `onMount(() => { ${json.hooks.onMount.code} })`}
      ${
        json.hooks.onUpdate
          ? json.hooks.onUpdate
              .map((hook, index) => {
                if (hook.deps) {
                  const hookName = `onUpdateFn_${index}`;
                  return `
                    function ${hookName}() { ${hook.code} };
                    createEffect(on(() => ${hook.deps}, ${hookName}));
                  `;
                } else {
                  // TO-DO: support `onUpdate` without `deps`
                  return '';
                }
              })
              .join('\n')
          : ''
      }

      return (${addWrapper ? '<>' : ''}
        ${json.children
          .filter(filterEmptyTextNodes)
          .map((item) => blockToSolid({ component, json: item, options }))
          .join('\n')}
        ${
          options.stylesType === 'style-tag' && css && css.trim().length > 4
            ? // We add the jsx attribute so prettier formats this nicely
              `<style jsx>{\`${css}\`}</style>`
            : ''
        }
        ${addWrapper ? '</>' : ''})
    }

    export default ${json.name};
  `;

    if (options.plugins) {
      str = runPreCodePlugins(str, options.plugins);
    }
    if (options.prettier !== false) {
      str = format(str, {
        parser: 'typescript',
        plugins: [require('prettier/parser-typescript'), require('prettier/parser-postcss')],
      });
    }
    if (options.plugins) {
      str = runPostCodePlugins(str, options.plugins);
    }
    return str;
  };
