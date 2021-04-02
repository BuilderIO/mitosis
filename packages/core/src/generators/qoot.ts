import dedent from 'dedent';
import { camelCase, kebabCase, size, trim } from 'lodash';
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
import { removeSurroundingBlock } from '../helpers/remove-surrounding-block';
import { getStateObjectString } from '../helpers/get-state-object-string';
import { stripStateAndPropsRefs } from '../helpers/strip-state-and-props-refs';
import { babelTransformExpression } from '../helpers/babel-transform';
import { NodePath, types } from '@babel/core';
import { collectCss } from '../helpers/collect-styles';

const qootImport = (options: InternalToQootOptions) =>
  options.qootLib || 'qoot';

function addMarkDirtyAfterSetInCode(
  code: string,
  options: InternalToQootOptions,
  useString = 'markDirty(this)',
) {
  return babelTransformExpression(code, {
    UpdateExpression(path: babel.NodePath<babel.types.UpdateExpression>) {
      const { node } = path;
      if (types.isMemberExpression(node.argument)) {
        if (types.isIdentifier(node.argument.object)) {
          // TODO: utillity to properly trace this reference to the beginning
          if (node.argument.object.name === 'state') {
            // TODO: ultimately do updates by property, e.g. updateName()
            // that updates any attributes dependent on name, etcç
            let parent: NodePath<any> = path;

            // `_temp = ` assignments are created sometimes when we insertAfter
            // for simple expressions. this causes us to re-process the same expression
            // in an infinite loop
            while ((parent = parent.parentPath)) {
              if (
                types.isAssignmentExpression(parent.node) &&
                types.isIdentifier(parent.node.left) &&
                parent.node.left.name.startsWith('_temp')
              ) {
                return;
              }
            }

            path.insertAfter(types.identifier(useString));
          }
        }
      }
    },
    AssignmentExpression(
      path: babel.NodePath<babel.types.AssignmentExpression>,
    ) {
      const { node } = path;
      if (types.isMemberExpression(node.left)) {
        if (types.isIdentifier(node.left.object)) {
          // TODO: utillity to properly trace this reference to the beginning
          if (node.left.object.name === 'state') {
            // TODO: ultimately do updates by property, e.g. updateName()
            // that updates any attributes dependent on name, etcç
            let parent: NodePath<any> = path;

            // `_temp = ` assignments are created sometimes when we insertAfter
            // for simple expressions. this causes us to re-process the same expression
            // in an infinite loop
            while ((parent = parent.parentPath)) {
              if (
                types.isAssignmentExpression(parent.node) &&
                types.isIdentifier(parent.node.left) &&
                parent.node.left.name.startsWith('_temp')
              ) {
                return;
              }
            }

            path.insertAfter(types.identifier(useString));
          }
        }
      }
    },
  });
}

const processBinding = (binding: string, options: InternalToQootOptions) =>
  stripStateAndPropsRefs(addMarkDirtyAfterSetInCode(binding, options), {
    replaceWith: 'this.',
  })
    // Remove trailing semicolon
    .trim()
    .replace(/;$/, '');

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
    return `{${processBinding(json.bindings.when as string, options)} ? (
      <>${json.children
        .filter(filterEmptyTextNodes)
        .map((item) => blockToQoot(item, options))
        .join('\n')}</>
    ) : undefined}`;
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

const elId = (node: JSXLiteNode, options: InternalToQootOptions) => {
  if (node.meta.id) {
    return node.meta.id;
  }
  const id = getId(node, options);
  node.meta.id = id;
  return id;
};

type NumberRecord = { [key: string]: number };
type ToQootOptions = {
  prettier?: boolean;
  plugins?: Plugin[];
  qootLib?: string;
  qrlPrefix?: string;
  format?: 'builder' | 'default';
};
type InternalToQootOptions = ToQootOptions & {
  componentJson: JSXLiteComponent;
  namesMap: NumberRecord;
  qrlPrefix: string;
};
const blockToQoot = (json: JSXLiteNode, options: InternalToQootOptions) => {
  if (NODE_MAPPERS[json.name]) {
    return NODE_MAPPERS[json.name](json, options);
  }
  if (json.bindings._text) {
    return `{${processBinding(json.bindings._text, options)}}`;
  }
  if (json.properties._text) {
    return json.properties._text;
  }

  let str = '';

  str += `<${json.name} `;

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

  const eventBindings: Record<string, string> = {};
  for (const key in json.bindings) {
    const value = json.bindings[key] as string;
    if (key.startsWith('_') || key.startsWith('$')) {
      continue;
    }

    if (key.startsWith('on')) {
      const useKey = key.replace('on', 'on:').toLowerCase();
      const componentName = getComponentName(options.componentJson, options);

      eventBindings[useKey] = `QRL\`${
        options.qrlPrefix
      }/${componentName}/on${elId(json, options)}${key.slice(2)}?event=.\``;
    } else {
      str += ` ${key}={${value}} `;
    }
  }

  if (size(eventBindings)) {
    str += ` $={{ `;

    for (const event in eventBindings) {
      str += `'${event}': ${eventBindings[event]},`;
    }

    str += '}} ';
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

const formatCode = (
  str: string,
  options: InternalToQootOptions,
  type: 'typescript' | 'css' = 'typescript',
) => {
  if (options.prettier !== false) {
    try {
      str = format(str, {
        parser: type,
        plugins: [
          require('prettier/parser-typescript'),
          require('prettier/parser-postcss'),
        ],
      });
    } catch (err) {
      console.warn('Error formatting code', err);
    }
  }
  return str;
};

const getEventHandlerFiles = (
  componentJson: JSXLiteComponent,
  options: InternalToQootOptions,
): File[] => {
  const files: File[] = [];

  traverse(componentJson).forEach(function (item) {
    if (isJsxLiteNode(item)) {
      for (const binding in item.bindings) {
        if (binding.startsWith('on')) {
          const componentName = getComponentName(componentJson, options);
          let str = formatCode(
            `import {
              injectEventHandler,
              provideQrlExp,
              markDirty
            } from '${qootImport(options)}';
            import { ${componentName}Component } from './component.js'
            
            export default injectEventHandler(
              ${componentName}Component,
              provideQrlExp<Event>('event'),
              async function (this: ${componentName}Component, event: Event) {
                ${removeSurroundingBlock(
                  processBinding(item.bindings[binding] as string, options),
                )}
              }
            )
          `,
            options,
          );

          str = formatCode(str, options);
          files.push({
            path: `${componentName}/on${elId(item, options)}${binding.slice(
              2,
            )}.ts`,
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
): { files: File[] } => {
  let json = fastClone(componentJson);
  const options = {
    qrlPrefix: 'ui:',
    ...toQootOptions,
    namesMap: {},
    componentJson: json,
  };
  if (options.plugins) {
    json = runPreJsonPlugins(json, options.plugins);
  }

  let css = collectCss(json, { classProperty: 'class' });
  css = formatCode(css, options, 'css');
  const hasCss = Boolean(css.trim().length);

  const addWrapper = json.children.length > 1 || hasCss;
  if (options.plugins) {
    json = runPostJsonPlugins(json, options.plugins);
  }
  const componentName = capitalize(
    camelCase(componentJson.name || 'my-component'),
  );
  stripMetaProperties(json);
  let str = dedent`
    import { injectMethod, QRL, jsxFactory } from '${qootImport(options)}';
    import { ${componentName}Component } from './component.js'
    ${renderPreComponent({
      ...json,
      imports: json.imports.map((item) => {
        if (item.path.endsWith('.lite')) {
          const clone = fastClone(item);
          const name = clone.path
            .split(/[\.\/]/)
            // Get the -1 index of array
            .slice(-2, -1)
            .pop();
          const pascalName = capitalize(camelCase(name));
          clone.path = `../${pascalName}/public.js`;
          for (const key in clone.imports) {
            const value = clone.imports[key];
            if (value === 'default') {
              clone.imports[key] = pascalName;
            }
          }
          return clone;
        }
        return item;
      }),
    })}

    export default injectMethod(${componentName}Component, function (this: ${componentName}Component) {
      return (${addWrapper ? '<>' : ''}
        ${
          !hasCss
            ? ''
            : `<style>{\`
    ${css}\`}</style>`
        }
        ${json.children.map((item) => blockToQoot(item, options)).join('\n')}
        ${addWrapper ? '</>' : ''})
    })
  `;

  if (options.plugins) {
    str = runPreCodePlugins(str, options.plugins);
  }
  str = formatCode(str, options);
  if (options.plugins) {
    str = runPostCodePlugins(str, options.plugins);
  }

  const dataString = getStateObjectString(json, {
    format: 'class',
    valueMapper: (code) => processBinding(code, options),
  });

  return {
    files: [
      {
        path: `${componentName}/template.tsx`,
        contents: str,
      },
      {
        path: `${componentName}/public.ts`,
        contents: formatCode(
          `
          import { jsxDeclareComponent, QRL } from '${qootImport(options)}';
          
          export const ${componentName} = jsxDeclareComponent('${kebabCase(
            componentName,
          )}', QRL\`${options.qrlPrefix}/${componentName}/template\`);
        `,
          options,
        ),
      },
      {
        path: `${componentName}/component.ts`,
        contents: formatCode(
          (() => {
            let str = `
              ${options.format === 'builder' ? '' : 'export '}class ${
              options.format === 'builder' ? '_' : ''
            }${componentName}Component extends Component<any, any> {
                ${
                  options.format === 'builder'
                    ? ''
                    : `static $templateQRL = '${options.qrlPrefix}/${componentName}/template'`
                }

                ${dataString}

                ${
                  !json.hooks.onMount
                    ? ''
                    : `
                      constructor(...args) {
                        super(...args);

                        ${processBinding(json.hooks.onMount, options)}
                        }
                      `
                }

                $newState() {
                  return {} // TODO
                }
              }
              ${
                options.format !== 'builder'
                  ? ''
                  : `
              export const ${componentName}Component = new Proxy(_${componentName}Component, {
                get(target, prop) {
                  if (prop === '$templateQRL') {
                    return '${options.qrlPrefix}/${componentName}/template'
                  }
                  return Reflect.get(...arguments)
                }
              })
              `
              }
            `;

            str = `
              import { Component, QRL ${
                str.includes('markDirty(') ? ', markDirty' : ''
              } } from '${qootImport(options)}';
              ${str}
            `;

            return str;
          })(),
          options,
        ),
      },
      ...getEventHandlerFiles(json, options),
    ],
  };
};
