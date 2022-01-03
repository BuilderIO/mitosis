import dedent from 'dedent';
import { format } from 'prettier/standalone';
import { hasStyles } from '../helpers/collect-styles';
import { getRefs } from '../helpers/get-refs';
import { getStateObjectStringFromComponent } from '../helpers/get-state-object-string';
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
        node.bindings.component = node.name;
        node.name = 'Dynamic';
        found = true;
      }
    }
  });
  return found;
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
  if (typeof json.bindings.class === 'string') {
    dynamicClasses.push(json.bindings.class as any);
    delete json.bindings.class;
  }
  if (typeof json.bindings.className === 'string') {
    dynamicClasses.push(json.bindings.className as any);
    delete json.bindings.className;
  }
  if (typeof json.bindings.className === 'string') {
    dynamicClasses.push(json.bindings.className as any);
    delete json.bindings.className;
  }
  if (
    typeof json.bindings.css === 'string' &&
    json.bindings.css.trim().length > 4
  ) {
    dynamicClasses.push(`css(${json.bindings.css})`);
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
  if (json.bindings._text) {
    return `{${json.bindings._text}}`;
  }

  if (json.name === 'For') {
    const needsWrapper = json.children.length !== 1;
    return `<For each={${json.bindings.each}}>
    {(${json.properties._forName}, index) =>
      ${needsWrapper ? '<>' : ''}
        ${json.children.map((child) => blockToSolid(child, options))}}
      ${needsWrapper ? '</>' : ''}
    </For>`;
  }

  let str = '';

  if (json.name === 'Fragment') {
    str += '<';
  } else {
    str += `<${json.name} `;
  }

  const classString = collectClassString(json);
  if (classString) {
    str += ` class=${classString} `;
  }

  if (json.bindings._spread) {
    str += ` {...(${json.bindings._spread})} `;
  }

  for (const key in json.properties) {
    const value = json.properties[key];
    str += ` ${key}="${value}" `;
  }
  for (const key in json.bindings) {
    const value = json.bindings[key] as string;
    if (key === '_spread' || key === '_forName') {
      continue;
    }

    if (key.startsWith('on')) {
      const useKey =
        key === 'onChange' && json.name === 'input' ? 'onInput' : key;
      str += ` ${useKey}={event => ${value}} `;
    } else {
      str += ` ${key}={${value}} `;
    }
  }
  if (selfClosingTags.has(json.name)) {
    return str + ' />';
  }
  str += '>';
  if (json.children) {
    str += json.children.map((item) => blockToSolid(item, options)).join('\n');
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

export const componentToSolid = (options: ToSolidOptions = {}): Transpiler => ({
  component,
}) => {
  let json = fastClone(component);
  if (options.plugins) {
    json = runPreJsonPlugins(json, options.plugins);
  }
  const componentHasStyles = hasStyles(json);
  const addWrapper = json.children.length > 1;
  if (options.plugins) {
    json = runPostJsonPlugins(json, options.plugins);
  }
  stripMetaProperties(json);
  const foundDynamicComponents = processDynamicComponents(json, options);

  const stateString = getStateObjectStringFromComponent(json);
  const hasState = Boolean(Object.keys(component.state).length);
  const componentsUsed = getComponentsUsed(json);

  const hasShowComponent = componentsUsed.has('Show');
  const hasForComponent = componentsUsed.has('For');

  let str = dedent`
    ${
      !(hasShowComponent || hasForComponent)
        ? ''
        : `import { 
          ${!hasShowComponent ? '' : 'Show, '}
          ${!hasForComponent ? '' : 'For, '}
          ${!json.hooks.onMount ? '' : 'onMount, '}
         } from 'solid-js';`
    }
    ${!foundDynamicComponents ? '' : `import { Dynamic } from 'solid-js/web';`}
    ${!hasState ? '' : `import { createMutable } from 'solid-js/store';`}
    ${
      !componentHasStyles
        ? ''
        : `import { css } from "solid-styled-components";`
    }
    ${renderPreComponent(json)}

    export default function ${json.name}(props) {
      ${!hasState ? '' : `const state = createMutable(${stateString});`}
      
      ${getRefsString(json)}

      ${!json.hooks.onMount ? '' : `onMount(() => { ${json.hooks.onMount} })`}

      return (${addWrapper ? '<>' : ''}
        ${json.children.map((item) => blockToSolid(item, options)).join('\n')}
        ${addWrapper ? '</>' : ''})
    }

  `;

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
