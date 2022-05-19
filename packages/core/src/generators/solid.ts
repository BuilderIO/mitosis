import dedent from 'dedent';
import { format } from 'prettier/standalone';
import { hasStyles } from '../helpers/collect-styles';
import { getRefs } from '../helpers/get-refs';
import {
  getMemberObjectString,
  getStateObjectStringFromComponent,
} from '../helpers/get-state-object-string';
import { renderPreComponent } from '../helpers/render-imports';
import { selfClosingTags } from '../parsers/jsx';
import { MitosisComponent } from '../types/mitosis-component';
import { MitosisNode } from '../types/mitosis-node';
import {
  runPostCodePlugins,
  runPostJsonPlugins,
  runPreCodePlugins,
  runPreJsonPlugins,
} from '../modules/plugins';
import { fastClone } from '../helpers/fast-clone';
import { stripMetaProperties } from '../helpers/strip-meta-properties';
import { getComponentsUsed } from '../helpers/get-components-used';
import traverse from 'traverse';
import { isMitosisNode } from '../helpers/is-mitosis-node';
import { BaseTranspilerOptions, Transpiler } from '../types/config';
import { filterEmptyTextNodes } from '../helpers/filter-empty-text-nodes';
import { createMitosisNode } from '../helpers/create-mitosis-node';
import { hasContext } from './helpers/context';
import { babelTransformExpression } from '../helpers/babel-transform';
import { types } from '@babel/core';
import { kebabCase } from 'lodash';

export interface ToSolidOptions extends BaseTranspilerOptions {}

// Transform <foo.bar key="value" /> to <component :is="foo.bar" key="value" />
function processDynamicComponents(
  json: MitosisComponent,
  options: ToSolidOptions,
) {
  let found = false;
  traverse(json).forEach((node) => {
    if (isMitosisNode(node)) {
      if (node.name.includes('.')) {
        (node.bindings.component as { code: string }).code = node.name;
        node.name = 'Dynamic';
        found = true;
      }
    }
  });
  return found;
}

function getContextString(
  component: MitosisComponent,
  options: ToSolidOptions,
) {
  let str = '';
  for (const key in component.context.get) {
    str += `
      const ${key} = useContext(${component.context.get[key].name});
    `;
  }

  return str;
}

// This should really be a preprocessor mapping the `class` attribute binding based on what other values have
// to make this more pluggable
const collectClassString = (json: MitosisNode): string | null => {
  const staticClasses: string[] = [];

  const hasStaticClasses = Boolean(staticClasses.length);
  if (json.properties.class) {
    staticClasses.push(json.properties.class);
    delete json.properties.class;
  }
  if (json.properties.className) {
    staticClasses.push(json.properties.className);
    delete json.properties.className;
  }

  const dynamicClasses: string[] = [];
  if (typeof json.bindings.class?.code === 'string') {
    dynamicClasses.push(json.bindings.class.code as any);
    delete json.bindings.class;
  }
  if (typeof json.bindings.className?.code === 'string') {
    dynamicClasses.push(json.bindings.className.code as any);
    delete json.bindings.className;
  }
  if (
    typeof json.bindings.css?.code === 'string' &&
    json.bindings.css.code.trim().length > 4
  ) {
    dynamicClasses.push(`css(${json.bindings.css.code})`);
  }
  delete json.bindings.css;
  const staticClassesString = staticClasses.join(' ');

  const dynamicClassesString = dynamicClasses.join(" + ' ' + ");

  const hasDynamicClasses = Boolean(dynamicClasses.length);

  if (hasStaticClasses && !hasDynamicClasses) {
    return `"${staticClassesString}"`;
  }

  if (hasDynamicClasses && !hasStaticClasses) {
    return `{${dynamicClassesString}}`;
  }

  if (hasDynamicClasses && hasStaticClasses) {
    return `{"${staticClassesString} " + ${dynamicClassesString}}`;
  }

  return null;
};

const blockToSolid = (
  json: MitosisNode,
  options: ToSolidOptions = {},
): string => {
  if (json.properties._text) {
    return json.properties._text;
  }
  if (json.bindings._text?.code) {
    return `{${json.bindings._text.code}}`;
  }

  if (json.name === 'For') {
    const needsWrapper = json.children.length !== 1;
    // The SolidJS `<For>` component has a special index() signal function.
    // https://www.solidjs.com/docs/latest#%3Cfor%3E
    return `<For each={${json.bindings.each?.code}}>
    {(${json.properties._forName}, _index) => {
      const index = _index();
      return ${needsWrapper ? '<>' : ''}${json.children
      .filter(filterEmptyTextNodes)
      .map((child) => blockToSolid(child, options))}}}
      ${needsWrapper ? '</>' : ''}
    </For>`;
  }

  let str = '';

  if (json.name === 'Fragment') {
    str += '<';
  } else {
    str += `<${json.name} `;
  }

  if (json.name === 'Show' && json.meta.else) {
    str += `fallback={${blockToSolid(json.meta.else as any, options)}}`;
  }

  const classString = collectClassString(json);
  if (classString) {
    str += ` class=${classString} `;
  }

  if (json.bindings._spread?.code) {
    str += ` {...(${json.bindings._spread.code})} `;
  }

  for (const key in json.properties) {
    const value = json.properties[key];
    str += ` ${key}="${value}" `;
  }
  for (const key in json.bindings) {
    const value = json.bindings[key];
    if (key === '_spread' || key === '_forName') {
      continue;
    }
    if (!value?.code) continue;

    if (key.startsWith('on')) {
      const useKey =
        key === 'onChange' && json.name === 'input' ? 'onInput' : key;
      str += ` ${useKey}={event => ${value.code}} `;
    } else {
      let useValue = value.code;
      if (key === 'style') {
        // Convert camelCase keys to kebab-case
        // TODO: support more than top level objects, may need
        // a runtime helper for expressions that are not a direct
        // object literal, such as ternaries and other expression
        // types
        useValue = babelTransformExpression(value.code, {
          ObjectExpression(path: babel.NodePath<babel.types.ObjectExpression>) {
            // TODO: limit to top level objects only
            for (const property of path.node.properties) {
              if (types.isObjectProperty(property)) {
                if (
                  types.isIdentifier(property.key) ||
                  types.isStringLiteral(property.key)
                ) {
                  const key = types.isIdentifier(property.key)
                    ? property.key.name
                    : property.key.value;
                  property.key = types.stringLiteral(kebabCase(key));
                }
              }
            }
          },
        });
      }
      str += ` ${key}={${useValue}} `;
    }
  }
  if (selfClosingTags.has(json.name)) {
    return str + ' />';
  }
  str += '>';
  if (json.children) {
    str += json.children
      .filter(filterEmptyTextNodes)
      .map((item) => blockToSolid(item, options))
      .join('\n');
  }

  if (json.name === 'Fragment') {
    str += '</>';
  } else {
    str += `</${json.name}>`;
  }

  return str;
};

const getRefsString = (json: MitosisComponent, refs = getRefs(json)) => {
  let str = '';

  for (const ref of Array.from(refs)) {
    str += `\nconst ${ref} = useRef();`;
  }

  return str;
};

function addProviderComponents(
  json: MitosisComponent,
  options: ToSolidOptions,
) {
  for (const key in json.context.set) {
    const { name, value } = json.context.set[key];
    json.children = [
      createMitosisNode({
        name: `${name}.Provider`,
        children: json.children,
        ...(value && {
          bindings: {
            value: { code: getMemberObjectString(value) },
          },
        }),
      }),
    ];
  }
}

export const componentToSolid =
  (options: ToSolidOptions = {}): Transpiler =>
  ({ component }) => {
    let json = fastClone(component);
    if (options.plugins) {
      json = runPreJsonPlugins(json, options.plugins);
    }
    addProviderComponents(json, options);
    const componentHasStyles = hasStyles(json);
    const addWrapper = json.children.filter(filterEmptyTextNodes).length !== 1;
    if (options.plugins) {
      json = runPostJsonPlugins(json, options.plugins);
    }
    stripMetaProperties(json);
    const foundDynamicComponents = processDynamicComponents(json, options);

    const stateString = getStateObjectStringFromComponent(json);
    const hasState = Boolean(Object.keys(component.state).length);
    const componentsUsed = getComponentsUsed(json);
    const componentHasContext = hasContext(json);

    const hasShowComponent = componentsUsed.has('Show');
    const hasForComponent = componentsUsed.has('For');

    const solidJSImports = [
      componentHasContext ? 'useContext' : undefined,
      hasShowComponent ? 'Show' : undefined,
      hasForComponent ? 'For' : undefined,
      json.hooks.onMount?.code ? 'onMount' : undefined,
    ].filter(Boolean);

    let str = dedent`
    ${
      solidJSImports.length > 0
        ? `import { 
          ${solidJSImports.map((item) => item).join(', ')}
         } from 'solid-js';`
        : ''
    }
    ${!foundDynamicComponents ? '' : `import { Dynamic } from 'solid-js/web';`}
    ${!hasState ? '' : `import { createMutable } from 'solid-js/store';`}
    ${
      !componentHasStyles
        ? ''
        : `import { css } from "solid-styled-components";`
    }
    ${renderPreComponent(json)}

    function ${json.name}(props) {
      ${!hasState ? '' : `const state = createMutable(${stateString});`}
      
      ${getRefsString(json)}
      ${getContextString(json, options)}

      ${
        !json.hooks.onMount?.code
          ? ''
          : `onMount(() => { ${json.hooks.onMount.code} })`
      }

      return (${addWrapper ? '<>' : ''}
        ${json.children
          .filter(filterEmptyTextNodes)
          .map((item) => blockToSolid(item, options))
          .join('\n')}
        ${addWrapper ? '</>' : ''})
    }

    export default ${json.name};
  `;

    // HACK: for some reason we are generating `state.state.foo` instead of `state.foo`
    // need a full fix, but this unblocks a lot in the short term
    str = str.replace(/state\.state\./g, 'state.');

    if (options.plugins) {
      str = runPreCodePlugins(str, options.plugins);
    }
    if (options.prettier !== false) {
      str = format(str, {
        parser: 'typescript',
        plugins: [require('prettier/parser-typescript')],
      });
    }
    if (options.plugins) {
      str = runPostCodePlugins(str, options.plugins);
    }
    return str;
  };
