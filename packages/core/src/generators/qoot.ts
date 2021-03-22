import dedent from 'dedent';
import { camelCase, kebabCase } from 'lodash';
import { format } from 'prettier/standalone';
import { isJsxLiteNode } from '../helpers/is-jsx-lite-node';
import traverse from 'traverse';
import { capitalize } from '../helpers/capitalize';
import { fastClone } from '../helpers/fast-clone';
import { renderPreComponent } from '../helpers/render-imports';
import { stripMetaProperties } from '../helpers/strip-meta-properties';
import { filterEmptyTextNodes } from '../helpers/filter-empty-text-nodes';
import {
  Plugin,
  runPostCodePlugins,
  runPostJsonPlugins,
  runPreCodePlugins,
  runPreJsonPlugins,
} from '../modules/plugins';
import { selfClosingTags } from '../parsers/jsx';
import { JSXLiteComponent } from '../types/jsx-lite-component';
import { JSXLiteNode } from '../types/jsx-lite-node';

const processBinding = (binding: string, options: InternalToQootOptions) =>
  binding;

const NODE_MAPPERS: {
  [key: string]: (json: JSXLiteNode, options: InternalToQootOptions) => string;
} = {
  Fragment(json, options) {
    return `<>${json.children
      .map((item) => blockToQoot(item, options))
      .join('\n')}</>`;
  },
  For(json, options) {
    return `{${processBinding(json.bindings.each as string, options)}.map(${
      json.bindings._forName
    } => (
      <>${json.children
        .filter(filterEmptyTextNodes)
        .map((item) => blockToQoot(item, options))
        .join('\n')}</>
    ))}`;
  },
  Show(json, options) {
    return `{Boolean(${processBinding(
      json.bindings.when as string,
      options,
    )}) && (
      <>${json.children
        .filter(filterEmptyTextNodes)
        .map((item) => blockToQoot(item, options))
        .join('\n')}</>
    )}`;
  },
};

const getId = (json: JSXLiteNode, options: InternalToQootOptions) => {
  const name = json.properties.$name
    ? camelCase(json.properties.$name)
    : /^h\d$/.test(json.name || '') // don't dashcase h1 into h-1
    ? json.name
    : camelCase(json.name || 'div');

  const newNameNum = (options.namesMap[name] || 0) + 1;
  options.namesMap[name] = newNameNum;
  return capitalize(`${name}${newNameNum === 1 ? '' : `${newNameNum}`}`);
};

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

type NumberRecord = { [key: string]: number };
type ToQootOptions = {
  prettier?: boolean;
  plugins?: Plugin[];
};
type InternalToQootOptions = {
  prettier?: boolean;
  plugins?: Plugin[];
  componentJson: JSXLiteComponent;
  namesMap: NumberRecord;
};
const blockToQoot = (json: JSXLiteNode, options: InternalToQootOptions) => {
  if (NODE_MAPPERS[json.name]) {
    return NODE_MAPPERS[json.name](json, options);
  }
  if (json.properties._text) {
    return json.properties._text;
  }
  if (json.bindings._text) {
    return `{${json.bindings._text}}`;
  }

  let str = '';

  const id = getId(json, options);
  json.meta.id = id;

  str += `<${json.name} `;

  const classString = collectClassString(json);
  if (classString) {
    str += ` class=${classString} `;
  }

  if (json.bindings._spread) {
    str += ` {...(${json.bindings._spread})} `;
  }

  for (const key in json.properties) {
    if (key.startsWith('_') || key.startsWith('$')) {
      continue;
    }
    const value = json.properties[key];
    str += ` ${key}="${value}" `;
  }
  for (const key in json.bindings) {
    const value = json.bindings[key] as string;
    if (key.startsWith('_') || key.startsWith('$')) {
      continue;
    }

    if (key.startsWith('on')) {
      // TODO: this transformation can be a IR transform middleware for rendering
      // through any framework
      // TODO: for now use _ instead of : until I find what voodoo magic allows
      // colons in attribute names in TSX
      const useKey = key.replace('on', 'on_').toLowerCase();
      const componentName = getComponentName(options.componentJson, options);
      // TODO: args
      // on:click={QRL`ui:/Item/toggle?toggleState=.target.checked`}
      str += ` ${useKey}={QRL\`ui:/${componentName}/on${id}${key.slice(2)}\`}`;
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
  options: InternalToQootOptions,
): string => {
  return 'null';
};

// TODO
const getEventHandlerFiles = (
  componentJson: JSXLiteComponent,
  options: InternalToQootOptions,
): File[] => {
  const files: File[] = [];

  traverse(componentJson).forEach(function(item) {
    if (isJsxLiteNode(item)) {
      for (const binding in item.bindings) {
        if (binding.startsWith('on')) {
          let str = dedent`
            import {
              injectEventHandler,
              provideComponentProp,
              provideQrlExp,
              provideService,
            } from 'qoot';
            
            export default injectEventHandler(
              // TODO: providers
              null,
              // Handler
              // TODO: replace refs
              async function (event) 
                ${item.bindings[binding]}
              
            )
          `;

          str = format(str, {
            parser: 'typescript',
            plugins: [require('prettier/parser-typescript')],
          });
          files.push({
            path: `${getComponentName(componentJson, options)}/on${
              item.meta.id
            }${binding.slice(2)}.ts`,
            contents: str,
          });
        }
      }
    }
  });

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
    namesMap: {},
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

    export default inject(${getProvidersString(json, options)}, () => {
      return (${addWrapper ? '<>' : ''}
        ${json.children.map((item) => blockToQoot(item, options)).join('\n')}
        ${addWrapper ? '</>' : ''})
    })
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
        path: `${componentName}/public.ts`,
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
