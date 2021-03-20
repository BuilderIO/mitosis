import dedent from 'dedent';
import { format } from 'prettier/standalone';
import { getRefs } from '../helpers/get-refs';
import { renderPreComponent } from '../helpers/render-imports';
import { selfClosingTags } from '../parsers/jsx';
import { JSXLiteComponent } from '../types/jsx-lite-component';
import { JSXLiteNode } from '../types/jsx-lite-node';
import {
  Plugin,
  runPostCodePlugins,
  runPostJsonPlugins,
  runPreCodePlugins,
  runPreJsonPlugins,
} from '../modules/plugins';
import { fastClone } from '../helpers/fast-clone';
import { stripMetaProperties } from '../helpers/strip-meta-properties';
import { camelCase, kebabCase } from 'lodash';
import { capitalize } from 'src/helpers/capitalize';

// This should really be a preprocessor mapping the `class` attribute binding based on what other values have
// to make this more pluggable
const collectClassString = (json: JSXLiteNode): string | null => {
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
  if (typeof json.bindings.css === 'string') {
    dynamicClasses.push(`css(${json.bindings.css})`);
    delete json.bindings.css;
  }
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

type ToQootOptions = {
  prettier?: boolean;
  plugins?: Plugin[];
};
type InternalToQootOptions = {
  prettier?: boolean;
  plugins?: Plugin[];
  componentJson: JSXLiteComponent;
};
const blockToQoot = (json: JSXLiteNode, options: InternalToQootOptions) => {
  if (json.properties._text) {
    return json.properties._text;
  }
  if (json.bindings._text) {
    return `{${json.bindings._text}}`;
  }

  let str = '';

  str += `<${json.name} `;

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
      // TODO: this transformation can be a IR transform middleware for rendering
      // through any framework
      const useKey = key.replace('on', 'on:').toLowerCase();
      const componentName = getComponentName(options.componentJson, options);
      // TODO: fn name and args
      // on:click={QRL`ui:/Item/toggle?toggleState=.target.checked`}
      str += ` ${useKey}={QRL\`ui:/${componentName}/\`}`;
    } else {
      str += ` ${key}={${value}} `;
    }
  }
  if (selfClosingTags.has(json.name)) {
    return str + ' />';
  }
  str += '>';
  if (json.children) {
    str += json.children.map((item) => blockToQoot(item, options)).join('\n');
  }

  str += `</${json.name}>`;

  return str;
};

const getComponentName = (
  json: JSXLiteComponent,
  options: InternalToQootOptions,
) => {
  return capitalize(camelCase(json.name || 'my-component'));
};

// TODO
const getProvidersString = (
  componentJson: JSXLiteComponent,
  options: ToQootOptions = {},
): string => {
  return 'null';
};

// TODO
const getEventHandlerFiles = (
  componentJson: JSXLiteComponent,
  options: ToQootOptions = {},
): File[] => {
  const files: File[] = [];

  return files;
};

export type File = {
  path: string;
  contents: string;
};

export const componentToQoot = (
  componentJson: JSXLiteComponent,
  toQootOptions: ToQootOptions = {},
) => {
  let json = fastClone(componentJson);
  const options = {
    ...toQootOptions,
    componentJson: json,
  };
  if (options.plugins) {
    json = runPreJsonPlugins(json, options.plugins);
  }
  const addWrapper = json.children.length > 1;
  if (options.plugins) {
    json = runPostJsonPlugins(json, options.plugins);
  }
  const componentName = capitalize(
    camelCase(componentJson.name || 'my-component'),
  );
  stripMetaProperties(json);
  let str = dedent`
    import { inject, QRL } from 'qoot';
    ${renderPreComponent(json)}

    export default inject(${getProvidersString(json)}, () => {
      return (${addWrapper ? '<>' : ''}
        ${json.children.map((item) => blockToQoot(item, options)).join('\n')}
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
  return {
    files: [
      {
        path: `${componentName}/template.tsx`,
        contents: str,
      },
      {
        path: `${componentName}`,
        contents: dedent`
          import { jsxDeclareComponent, QRL } from 'qoot';
          export const ${componentName} = jsxDeclareComponent('${kebabCase(
          componentName,
        )}', QRL\`ui:/${componentName}/template\`);
        `,
      },
      ...getEventHandlerFiles(json, options),
    ],
  };
};
