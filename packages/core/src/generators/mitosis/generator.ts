import { ToMitosisOptions } from '@/generators/mitosis/types';
import { isMitosisNode } from '@/helpers/is-mitosis-node';
import {
  runPostCodePlugins,
  runPostJsonPlugins,
  runPreCodePlugins,
  runPreJsonPlugins,
} from '@/modules/plugins';
import json5 from 'json5';
import { format } from 'prettier/standalone';
import { HOOKS } from '../../constants/hooks';
import { SELF_CLOSING_HTML_TAGS } from '../../constants/html_tags';
import { dedent } from '../../helpers/dedent';
import { fastClone } from '../../helpers/fast-clone';
import { getComponents } from '../../helpers/get-components';
import { getRefs } from '../../helpers/get-refs';
import { getStateObjectStringFromComponent } from '../../helpers/get-state-object-string';
import { isRootTextNode } from '../../helpers/is-root-text-node';
import { mapRefs } from '../../helpers/map-refs';
import { renderPreComponent } from '../../helpers/render-imports';
import { checkHasState } from '../../helpers/state';
import { MitosisComponent } from '../../types/mitosis-component';
import { MitosisNode, checkIsForNode, checkIsShowNode } from '../../types/mitosis-node';
import { TranspilerGenerator } from '../../types/transpiler';
import { blockToReact, componentToReact } from '../react';

export const DEFAULT_FORMAT: ToMitosisOptions['format'] = 'legacy';

// Special isValidAttributeName for Mitosis so we can allow for $ in names
const isValidAttributeName = (str: string) => {
  return Boolean(str && /^[$a-z0-9\-_:]+$/i.test(str));
};

export const blockToMitosis = (
  json: MitosisNode,
  toMitosisOptions: Partial<ToMitosisOptions> = {},
  component: MitosisComponent,
  insideJsx: boolean,
): string => {
  const options: ToMitosisOptions = {
    format: DEFAULT_FORMAT,
    ...toMitosisOptions,
  };
  if (options.format === 'react') {
    return blockToReact(
      json,
      {
        format: 'lite',
        stateType: 'useState',
        stylesType: 'emotion',
        type: 'dom',
        prettier: options.prettier,
      },
      component,
      insideJsx,
    );
  }

  if (options.nativeConditionals && checkIsShowNode(json)) {
    const when = json.bindings.when?.code;
    const elseCase = json.meta.else as MitosisNode;
    const needsWrapper = json.children.length !== 1;

    const renderChildren = `${needsWrapper ? '<>' : ''}
      ${json.children
        .map((child) => blockToMitosis(child, options, component, needsWrapper))
        .join('\n')}
  ${needsWrapper ? '</>' : ''}`;

    const renderElse =
      elseCase && isMitosisNode(elseCase)
        ? blockToMitosis(elseCase, options, component, false)
        : 'null';
    return `${insideJsx ? '{' : ''}(${when}) ? ${renderChildren} : ${renderElse}${
      insideJsx ? '}' : ''
    }`;
  }

  if (checkIsForNode(json)) {
    const needsWrapper = json.children.length !== 1;
    if (options.nativeLoops) {
      const a = `${insideJsx ? '{' : ''}(${json.bindings.each?.code}).map(
      (${json.scope.forName}, ${json.scope.indexName || 'index'}) => (
      ${needsWrapper ? '<>' : ''}
        ${json.children
          .map((child) => blockToMitosis(child, options, component, needsWrapper))
          .join('\n')}
      ${needsWrapper ? '</>' : ''}
      ))${insideJsx ? '}' : ''}`;
      console.log(a);
      return a;
    }
    return `<For each={${json.bindings.each?.code}}>
    {(${json.scope.forName}, ${json.scope.indexName || 'index'}) =>
      ${needsWrapper ? '<>' : ''}
        ${json.children.map((child) => blockToMitosis(child, options, component, needsWrapper))}}
      ${needsWrapper ? '</>' : ''}
    </For>`;
  }

  if (json.properties._text) {
    return json.properties._text as string;
  }

  if (json.bindings._text?.code) {
    return `{${json.bindings._text?.code}}`;
  }

  let str = '';

  str += `<${json.name} `;

  for (const key in json.properties) {
    const value = (json.properties[key] || '').replace(/"/g, '&quot;').replace(/\n/g, '\\n');

    if (!isValidAttributeName(key)) {
      console.warn('Skipping invalid attribute name:', key);
    } else {
      str += ` ${key}="${value}" `;
    }
  }
  for (const key in json.bindings) {
    const value = json.bindings[key]?.code as string;

    if (json.slots?.[key]) {
      continue;
    }

    if (json.bindings[key]?.type === 'spread') {
      str += ` {...(${json.bindings[key]?.code})} `;
    } else if (key.startsWith('on')) {
      str += ` ${key}={event => ${value.replace(/\s*;$/, '')}} `;
    } else {
      if (!isValidAttributeName(key)) {
        console.warn('Skipping invalid attribute name:', key);
      } else {
        str += ` ${key}={${value}} `;
      }
    }
  }

  for (const key in json.slots) {
    const value = json.slots[key];
    str += ` ${key}={`;
    if (value.length > 1) {
      str += '<>';
    }
    str += json.slots[key]
      .map((item) => blockToMitosis(item, options, component, insideJsx))
      .join('\n');
    if (value.length > 1) {
      str += '</>';
    }
    str += `}`;
  }

  if (SELF_CLOSING_HTML_TAGS.has(json.name)) {
    return str + ' />';
  }

  // Self close by default if no children
  if (!json.children.length) {
    str += ' />';
    return str;
  }
  str += '>';

  if (json.children) {
    str += json.children.map((item) => blockToMitosis(item, options, component, true)).join('\n');
  }

  str += `</${json.name}>`;

  return str;
};

const getRefsString = (json: MitosisComponent, refs = Array.from(getRefs(json))) => {
  let str = '';

  for (const ref of refs) {
    const typeParameter = json['refs'][ref]?.typeParameter || '';
    const argument = json['refs'][ref]?.argument || '';
    str += `\nconst ${ref} = useRef${typeParameter ? `<${typeParameter}>` : ''}(${argument});`;
  }

  return str;
};

const mitosisCoreComponents = ['Show', 'For'];

export const componentToMitosis: TranspilerGenerator<Partial<ToMitosisOptions>> =
  (toMitosisOptions = {}) =>
  ({ component }) => {
    const options: ToMitosisOptions = {
      format: DEFAULT_FORMAT,
      ...toMitosisOptions,
    };

    if (options.format === 'react') {
      return componentToReact({
        format: 'lite',
        stateType: 'useState',
        stylesType: 'emotion',
        prettier: options.prettier,
      })({ component });
    }

    let json = fastClone(component);

    if (options.plugins) {
      json = runPreJsonPlugins({ json, plugins: options.plugins });
    }

    const domRefs = getRefs(component);
    // grab refs not used for bindings
    const jsRefs = Object.keys(component.refs).filter((ref) => domRefs.has(ref));

    const refs = [...jsRefs, ...Array.from(domRefs)];

    mapRefs(json, (refName) => {
      return `${refName}${domRefs.has(refName) ? `.current` : ''}`;
    });

    const addWrapper = json.children.length !== 1 || isRootTextNode(json);

    const components = Array.from(getComponents(json));
    const mitosisCoreComponents: string[] = [];
    if (!options.nativeConditionals) {
      mitosisCoreComponents.push('Show');
    }
    if (!options.nativeLoops) {
      mitosisCoreComponents.push('For');
    }

    const mitosisComponents = components.filter((item) => mitosisCoreComponents.includes(item));
    const otherComponents = components.filter((item) => !mitosisCoreComponents.includes(item));

    if (options.plugins) {
      json = runPostJsonPlugins({ json, plugins: options.plugins });
    }

    const hasState = checkHasState(component);

    const needsMitosisCoreImport = Boolean(hasState || refs.length || mitosisComponents.length);

    const stringifiedUseMetadata = json5.stringify(component.meta.useMetadata);

    // TODO: smart only pull in imports as needed
    let str = dedent`
    ${
      !needsMitosisCoreImport
        ? ''
        : `import { ${!hasState ? '' : 'useStore, '} ${
            !refs.length ? '' : 'useRef, '
          } ${mitosisComponents.join(', ')} } from '@builder.io/mitosis';`
    }
    ${!otherComponents.length ? '' : `import { ${otherComponents.join(',')} } from '@components';`}
    ${json.types ? json.types.join('\n') : ''}

    ${renderPreComponent({
      explicitImportFileExtension: options.explicitImportFileExtension,
      component: json,
      target: 'mitosis',
    })}

    ${
      stringifiedUseMetadata && stringifiedUseMetadata !== '{}'
        ? `${HOOKS.METADATA}(${stringifiedUseMetadata})`
        : ''
    }

    export default function ${component.name}(props) {
      ${!hasState ? '' : `const state = useStore(${getStateObjectStringFromComponent(json)});`}
      ${getRefsString(json, refs)}

      ${json.hooks.onMount.map((hook) => `onMount(() => { ${hook.code} })`)}

      ${!json.hooks.onUnMount?.code ? '' : `onUnMount(() => { ${json.hooks.onUnMount.code} })`}

      ${json.style ? `useStyle(\`${json.style}\`)` : ''}

      return (${addWrapper ? '<>' : ''}
        ${json.children
          .map((item) => blockToMitosis(item, options, component, addWrapper))
          .join('\n')}
        ${addWrapper ? '</>' : ''})
    }

  `;

    if (options.plugins) {
      str = runPreCodePlugins({ json, code: str, plugins: options.plugins });
    }
    if (options.prettier !== false) {
      try {
        str = format(str, {
          parser: 'typescript',
          plugins: [
            require('prettier/parser-typescript'), // To support running in browsers
          ],
        });
      } catch (err) {
        if (process.env.NODE_ENV !== 'test') {
          console.error('Format error for file:', str, JSON.stringify(json, null, 2));
        }
        throw err;
      }
    }
    if (options.plugins) {
      str = runPostCodePlugins({ json, code: str, plugins: options.plugins });
    }
    return str;
  };
