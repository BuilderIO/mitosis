import { NodePath, types } from '@babel/core';
import { camelCase } from 'lodash';
import { kebabCase } from 'lodash';
import { format } from 'prettier/standalone';
import { hasProps } from '../helpers/has-props';
import traverse from 'traverse';
import { babelTransformExpression } from '../helpers/babel-transform';
import { collectCss } from '../helpers/collect-styles';
import { dashCase } from '../helpers/dash-case';
import { fastClone } from '../helpers/fast-clone';
import { getStateObjectStringFromComponent } from '../helpers/get-state-object-string';
import { hasComponent } from '../helpers/has-component';
import { isComponent } from '../helpers/is-component';
import { isMitosisNode } from '../helpers/is-mitosis-node';
import { replaceIdentifiers } from '../helpers/replace-idenifiers';
import { selfClosingTags } from '../parsers/jsx';
import { MitosisComponent } from '../types/mitosis-component';
import { MitosisNode } from '../types/mitosis-node';
import { stripStateAndPropsRefs } from '../helpers/strip-state-and-props-refs';
import {
  runPostCodePlugins,
  runPostJsonPlugins,
  runPreCodePlugins,
  runPreJsonPlugins,
} from '../modules/plugins';
import isChildren from '../helpers/is-children';
import { stripMetaProperties } from '../helpers/strip-meta-properties';
import { removeSurroundingBlock } from '../helpers/remove-surrounding-block';
import { renderPreComponent } from '../helpers/render-imports';

import { BaseTranspilerOptions, Transpiler } from '../types/config';

export interface ToHtmlOptions extends BaseTranspilerOptions {
  format?: 'class' | 'script';
  prefix?: string;
}

type ScopeVars = Array<string>;
type StringRecord = { [key: string]: string };
type NumberRecord = { [key: string]: number };
type InternalToHtmlOptions = ToHtmlOptions & {
  onChangeJsById: StringRecord;
  js: string;
  namesMap: NumberRecord;
  experimental?: any;
};
interface BlockOptions {
  scopeVars?: ScopeVars;
  childComponents?: string[];
}

const ATTRIBUTE_KEY_EXCEPTIONS_MAP: { [key: string]: string } = {
  class: 'className',
};

const updateKeyIfException = (key: string): string => {
  return ATTRIBUTE_KEY_EXCEPTIONS_MAP[key] ?? key;
};

const needsSetAttribute = (key: string): boolean => {
  if (key === 'id') {
    // we may want to set id on elements
    return true;
  }
  return [key.includes('-')].some(Boolean);
};

const generateSetElementAttributeCode = (
  key: string,
  useValue: string,
  options: InternalToHtmlOptions,
): string => {
  if (options?.experimental?.props) {
    return options?.experimental?.props(key, useValue, options);
  }
  // TODO: better ways to detect child components
  return needsSetAttribute(key)
    ? `;el.setAttribute("${key}", ${useValue});
    if (el.props) {
      ;el.props.${camelCase(key)} = ${useValue};
      ;el.update();
    }
    `
    : `;el.${updateKeyIfException(key)} = ${useValue};
    if (el.props) {
      ;el.props.${camelCase(key)} = ${useValue};
      ;el.update();
    }
    `;
};

const addUpdateAfterSet = (
  json: MitosisComponent,
  options: InternalToHtmlOptions,
) => {
  traverse(json).forEach(function (item) {
    if (isMitosisNode(item)) {
      for (const key in item.bindings) {
        const value = item.bindings[key] as string;

        const newValue = addUpdateAfterSetInCode(value, options);
        if (newValue !== value) {
          item.bindings[key] = newValue;
        }
      }
    }
  });
};

const getScopeVars = (parentScopeVars: ScopeVars, value: string | boolean) => {
  return parentScopeVars.filter((scopeVar) => {
    if (typeof value === 'boolean') {
      return value;
    }
    return new RegExp(scopeVar).test(value);
  });
};
const addScopeVars = (
  parentScopeVars: ScopeVars,
  value: string | boolean,
  fn: (scope: string) => string,
) => {
  return `${getScopeVars(parentScopeVars, value)
    .map((scopeVar) => {
      return fn(scopeVar);
    })
    .join('\n')}`;
};

const mappers: {
  [key: string]: (
    json: MitosisNode,
    options: InternalToHtmlOptions,
    blockOptions: BlockOptions,
  ) => string;
} = {
  Fragment: (json, options, blockOptions) => {
    return json.children
      .map((item) => blockToHtml(item, options, blockOptions))
      .join('\n');
  },
};

const getId = (json: MitosisNode, options: InternalToHtmlOptions) => {
  const name = json.properties.$name
    ? dashCase(json.properties.$name)
    : /^h\d$/.test(json.name || '') // don't dashcase h1 into h-1
    ? json.name
    : dashCase(json.name || 'div');

  const newNameNum = (options.namesMap[name] || 0) + 1;
  options.namesMap[name] = newNameNum;
  return `${name}${options.prefix ? `-${options.prefix}` : ''}${
    name !== json.name && newNameNum === 1 ? '' : `-${newNameNum}`
  }`;
};

// TODO: overloaded function
const updateReferencesInCode = (
  code: string,
  options: InternalToHtmlOptions,
) => {
  if (options?.experimental?.updateReferencesInCode) {
    return options?.experimental?.updateReferencesInCode(code, options, {
      stripStateAndPropsRefs,
    });
  }
  if (options.format === 'class') {
    return stripStateAndPropsRefs(
      stripStateAndPropsRefs(code, {
        includeProps: false,
        includeState: true,
        replaceWith: 'this.state.',
      }),
      {
        // TODO: replace with `this.` and add setters that call this.update()
        includeProps: true,
        includeState: false,
        replaceWith: 'this.props.',
      },
    );
  }
  return code;
};

const addOnChangeJs = (
  id: string,
  options: InternalToHtmlOptions,
  code: string,
) => {
  if (!options.onChangeJsById[id]) {
    options.onChangeJsById[id] = '';
  }
  options.onChangeJsById[id] += code;
};

// TODO: spread support
const blockToHtml = (
  json: MitosisNode,
  options: InternalToHtmlOptions,
  blockOptions: BlockOptions = {},
) => {
  const scopeVars = blockOptions?.scopeVars || [];
  const childComponents = blockOptions?.childComponents || [];

  const hasData = Object.keys(json.bindings).length;
  let elId = '';
  if (hasData) {
    elId = getId(json, options);
    json.properties['data-name'] = elId;
  }
  if (options?.experimental?.getId) {
    elId = options?.experimental?.getId(elId, json, options, {
      hasData,
      getId,
    });
    json.properties['data-name'] = options?.experimental?.dataName(
      elId,
      json,
      options,
      {
        hasData,
        getId,
      },
    );
  }
  if (options?.experimental?.mappers?.[json.name]) {
    return options?.experimental?.mappers?.[json.name](
      json,
      options,
      elId,
      scopeVars,
      blockToHtml,
      addScopeVars,
      addOnChangeJs,
    );
  }

  if (mappers[json.name]) {
    return mappers[json.name](json, options, { scopeVars, childComponents });
  }

  if (isChildren(json)) {
    return `<slot></slot>`;
  }

  if (json.properties._text) {
    return json.properties._text;
  }
  if (json.bindings._text) {
    // TO-DO: textContent might be better performance-wise
    addOnChangeJs(
      elId,
      options,
      `
      ${addScopeVars(
        scopeVars,
        json.bindings._text,
        (scopeVar: string) =>
          `const ${scopeVar} = ${
            options.format === 'class' ? 'this.' : ''
          }getContext(el, "${scopeVar}");`,
      )}
      ${options.format === 'class' ? 'this.' : ''}renderTextNode(el, ${
        json.bindings._text
      });`,
    );

    return `<template data-name="${elId}"><!-- ${
      json.bindings._text as string
    } --></template>`;
  }

  let str = '';

  if (json.name === 'For') {
    const forArguments = json?.scope?.For || [];
    const localScopeVars: ScopeVars = [...scopeVars, ...forArguments];
    const argsStr = forArguments.map((arg) => `"${arg}"`).join(',');
    addOnChangeJs(
      elId,
      options,
      // TODO: be smarter about rendering, deleting old items and adding new ones by
      // querying dom potentially
      `
        let array = ${json.bindings.each};
        ${
          options.format === 'class' ? 'this.' : ''
        }renderLoop(el, array, ${argsStr});
      `,
    );
    // TODO: decide on how to handle this...
    str += `
      <template data-name="${elId}">`;
    if (json.children) {
      str += json.children
        .map((item) =>
          blockToHtml(item, options, {
            scopeVars: localScopeVars,
            childComponents,
          }),
        )
        .join('\n');
    }
    str += '</template>';
  } else if (json.name === 'Show') {
    const whenCondition = (json.bindings.when as string).replace(/;$/, '');
    addOnChangeJs(
      elId,
      options,
      `
        ${addScopeVars(
          scopeVars,
          whenCondition,
          (scopeVar: string) =>
            `const ${scopeVar} = ${
              options.format === 'class' ? 'this.' : ''
            }getContext(el, "${scopeVar}");`,
        )}
        const whenCondition = ${whenCondition};
        if (whenCondition) {
          ${options.format === 'class' ? 'this.' : ''}showContent(el)
        }
      `,
    );

    str += `<template data-name="${elId}">`;
    if (json.children) {
      str += json.children
        .map((item) =>
          blockToHtml(item, options, { scopeVars, childComponents }),
        )
        .join('\n');
    }

    str += '</template>';
  } else {
    const elSelector = childComponents.find((impName) => impName === json.name)
      ? kebabCase(json.name)
      : json.name;
    str += `<${elSelector} `;

    // For now, spread is not supported
    // if (json.bindings._spread === '_spread') {
    //   str += `
    //       {% for _attr in ${json.bindings._spread} %}
    //         {{ _attr[0] }}="{{ _attr[1] }}"
    //       {% endfor %}
    //     `;
    // }

    for (const key in json.properties) {
      if (key === 'innerHTML') {
        continue;
      }
      if (key.startsWith('$')) {
        continue;
      }
      const value = (json.properties[key] || '')
        .replace(/"/g, '&quot;')
        .replace(/\n/g, '\\n');
      str += ` ${key}="${value}" `;
    }

    // batch all local vars within the bindings
    let batchScopeVars: any = {};
    let injectOnce = false;
    let startInjectVar = '%%START_VARS%%';

    for (const key in json.bindings) {
      if (key === '_spread' || key === 'ref' || key === 'css') {
        continue;
      }
      const value = json.bindings[key] as string;
      // TODO: proper babel transform to replace. Util for this
      const useValue = value;

      if (key.startsWith('on')) {
        let event = key.replace('on', '').toLowerCase();
        if (!isComponent(json) && event === 'change') {
          event = 'input';
        }
        const fnName = camelCase(`on-${elId}-${event}`);
        const codeContent: string = removeSurroundingBlock(
          updateReferencesInCode(useValue, options),
        );
        options.js += `
          // Event handler for '${event}' event on ${elId}
          ${
            options.format === 'class'
              ? `this.${fnName} = (event) => {`
              : `function ${fnName} (event) {`
          }
              ${addScopeVars(
                scopeVars,
                codeContent,
                (scopeVar: string) =>
                  `const ${scopeVar} = ${
                    options.format === 'class' ? 'this.' : ''
                  }getContext(event.currentTarget, "${scopeVar}");`,
              )}
            ${codeContent}
          }
        `;
        const fnIdentifier = `${
          options.format === 'class' ? 'this.' : ''
        }${fnName}`;

        addOnChangeJs(
          elId,
          options,
          `
            ;el.removeEventListener('${event}', ${fnIdentifier});
            ;el.addEventListener('${event}', ${fnIdentifier});
          `,
        );
      } else {
        if (key === 'style') {
          addOnChangeJs(
            elId,
            options,
            `
            ${addScopeVars(
              scopeVars,
              useValue as string,
              (scopeVar: string) =>
                `const ${scopeVar} = ${
                  options.format === 'class' ? 'this.' : ''
                }getContext(el, "${scopeVar}");`,
            )}
            ;Object.assign(el.style, ${useValue});`,
          );
        } else {
          // gather all local vars to inject later
          getScopeVars(scopeVars, useValue).forEach((key) => {
            // unique keys
            batchScopeVars[key] = true;
          });
          addOnChangeJs(
            elId,
            options,
            `
            ${injectOnce ? '' : startInjectVar}
            ${generateSetElementAttributeCode(key, useValue, options)}
            `,
          );
          if (!injectOnce) {
            injectOnce = true;
          }
        }
      }
    }

    // batch inject local vars in the beginning of the function block
    const codeBlock = options.onChangeJsById[elId];
    const testInjectVar = new RegExp(startInjectVar);
    if (codeBlock && testInjectVar.test(codeBlock)) {
      const localScopeVars = Object.keys(batchScopeVars);
      options.onChangeJsById[elId] = (codeBlock as string).replace(
        startInjectVar,
        `
        ${addScopeVars(
          localScopeVars,
          true,
          (scopeVar: string) =>
            `const ${scopeVar} = ${
              options.format === 'class' ? 'this.' : ''
            }getContext(el, "${scopeVar}");`,
        )}
        `,
      );
    }

    if (selfClosingTags.has(json.name)) {
      return str + ' />';
    }
    str += '>';
    if (json.children) {
      str += json.children
        .map((item) =>
          blockToHtml(item, options, { scopeVars, childComponents }),
        )
        .join('\n');
    }
    if (json.properties.innerHTML) {
      // Maybe put some kind of safety here for broken HTML such as no close tag
      str += htmlDecode(json.properties.innerHTML);
    }

    str += `</${elSelector}>`;
  }
  return str;
};

function addUpdateAfterSetInCode(
  code: string,
  options: InternalToHtmlOptions,
  useString = options.format === 'class' ? 'this.update' : 'update',
) {
  let updates = 0;
  return babelTransformExpression(code, {
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
            let parent: NodePath<any> | null = path;

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

            // Uncomment to debug infinite loops:
            // if (updates++ > 1000) {
            //   console.error('Infinite assignment detected');
            //   return;
            // }
            if (options?.experimental?.addUpdateAfterSetInCode) {
              useString = options?.experimental?.addUpdateAfterSetInCode(
                useString,
                options,
                {
                  node,
                  code,
                  types,
                },
              );
            }
            path.insertAfter(
              types.callExpression(types.identifier(useString), []),
            );
          }
        }
      }
    },
  });
}

const htmlDecode = (html: string) => html.replace(/&quot;/gi, '"');

// TODO: props support via custom elements
export const componentToHtml =
  (options: ToHtmlOptions = {}): Transpiler =>
  ({ component }) => {
    const useOptions: InternalToHtmlOptions = {
      ...options,
      onChangeJsById: {},
      js: '',
      namesMap: {},
      format: 'script',
    };
    let json = fastClone(component);
    if (options.plugins) {
      json = runPreJsonPlugins(json, options.plugins);
    }
    addUpdateAfterSet(json, useOptions);
    const componentHasProps = hasProps(json);

    const hasLoop = hasComponent('For', json);
    const hasShow = hasComponent('Show', json);

    if (options.plugins) {
      json = runPostJsonPlugins(json, options.plugins);
    }
    const css = collectCss(json, {
      prefix: options.prefix,
    });

    let str = json.children
      .map((item) => blockToHtml(item, useOptions))
      .join('\n');

    if (css.trim().length) {
      str += `<style>${css}</style>`;
    }

    const hasChangeListeners = Boolean(
      Object.keys(useOptions.onChangeJsById).length,
    );
    const hasGeneratedJs = Boolean(useOptions.js.trim().length);

    if (
      hasChangeListeners ||
      hasGeneratedJs ||
      json.hooks.onMount?.code ||
      hasLoop
    ) {
      // TODO: collectJs helper for here and liquid
      str += `
      <script>
      (() => {
        const state = ${getStateObjectStringFromComponent(json, {
          valueMapper: (value) =>
            addUpdateAfterSetInCode(
              updateReferencesInCode(value, useOptions),
              useOptions,
            ),
        })};
        ${componentHasProps ? `let props = {};` : ''}
        let nodesToDestroy = [];
        let pendingUpdate = false;
        ${!json.hooks?.onInit?.code ? '' : 'let onInitOnce = false;'}

        function destroyAnyNodes() {
          // destroy current view template refs before rendering again
          nodesToDestroy.forEach(el => el.remove());
          nodesToDestroy = [];
        }
        ${
          !hasChangeListeners
            ? ''
            : `
        
        // Function to update data bindings and loops
        // call update() when you mutate state and need the updates to reflect
        // in the dom
        function update() {
          if (pendingUpdate === true) {
            return;
          }
          pendingUpdate = true;
          ${Object.keys(useOptions.onChangeJsById)
            .map((key) => {
              const value = useOptions.onChangeJsById[key];
              if (!value) {
                return '';
              }
              return `
              document.querySelectorAll("[data-name='${key}']").forEach((el) => {
                ${value}
              });
            `;
            })
            .join('\n\n')}

          destroyAnyNodes();

          ${
            !json.hooks.onUpdate?.length
              ? ''
              : `
                ${json.hooks.onUpdate.reduce((code, hook) => {
                  code += addUpdateAfterSetInCode(
                    updateReferencesInCode(hook.code, useOptions),
                    useOptions,
                  );
                  return code + '\n';
                }, '')} 
                `
          }

          pendingUpdate = false;
        }

        ${useOptions.js}

        // Update with initial state on first load
        update();
        `
        }

        ${
          !json.hooks?.onInit?.code
            ? ''
            : `
            if (!onInitOnce) {
              ${updateReferencesInCode(
                addUpdateAfterSetInCode(
                  json.hooks?.onInit?.code as string,
                  useOptions,
                ),
                useOptions,
              )}
              onInitOnce = true;
            }
            `
        }

        ${
          !json.hooks.onMount?.code
            ? ''
            : // TODO: make prettier by grabbing only the function body
              `
              // onMount
              ${updateReferencesInCode(
                addUpdateAfterSetInCode(json.hooks.onMount.code, useOptions),
                useOptions,
              )} 
              `
        }

        ${
          !hasShow
            ? ''
            : `
          function showContent(el) {
            // https://developer.mozilla.org/en-US/docs/Web/API/HTMLTemplateElement/content
            // grabs the content of a node that is between <template> tags
            // iterates through child nodes to register all content including text elements
            // attaches the content after the template
  
  
            const elementFragment = el.content.cloneNode(true);
            const children = Array.from(elementFragment.childNodes)
            children.forEach(child => {
              if (el?.scope) {
                child.scope = el.scope;
              }
              nodesToDestroy.push(child);
            });
            el.after(elementFragment);
          }
  
        `
        }
        // Helper text DOM nodes
        function renderTextNode(el, text) {
          const textNode = document.createTextNode(text);
          if (el?.scope) {
            textNode.scope = el.scope
          }
          el.after(textNode);
          nodesToDestroy.push(el.nextSibling);
        }
        ${
          !hasLoop
            ? ''
            : `
          // Helper to render loops
          function renderLoop(template, array, itemName, itemIndex, collectionName) {
            for (let [index, value] of array.entries()) {
              const elementFragment = template.content.cloneNode(true);
              const localScope = {};
              let scope = localScope;
              if (template?.scope) {
                const getParent = {
                  get(target, prop, receiver) {
                    if (prop in target) {
                      return target[prop];
                    }
                    if (prop in template.scope) {
                      return template.scope[prop];
                    }
                    return target[prop];
                  }
                };
                scope = new Proxy(localScope, getParent);
              }
              Array.from(elementFragment.childNodes).reversrEach((child) => {
                if (itemName !== undefined) {
                  scope[itemName] = value;
                }
                if (itemIndex !== undefined) {
                  scope[itemIndex] = index;
                }
                if (collectionName !== undefined) {
                  scope[collectionName] = array;
                }
                child.scope = scope;
                this.nodesToDestroy.push(child);
                template.after(child);
              });
            }
          }

          function getContext(el, name) {
            do {
              let value = el?.scope?.[name]
              if (value !== undefined) {
                return value
              }
            } while ((el = el.parentNode));
          }
        `
        }
      })()
      </script>
    `;
    }

    if (options.plugins) {
      str = runPreCodePlugins(str, options.plugins);
    }
    if (options.prettier !== false) {
      try {
        str = format(str, {
          parser: 'html',
          htmlWhitespaceSensitivity: 'ignore',
          plugins: [
            // To support running in browsers
            require('prettier/parser-html'),
            require('prettier/parser-postcss'),
            require('prettier/parser-babel'),
          ],
        });
      } catch (err) {
        console.warn('Could not prettify', { string: str }, err);
      }
    }
    if (options.plugins) {
      str = runPostCodePlugins(str, options.plugins);
    }
    return str;
  };

// TODO: props support via custom elements
export const componentToCustomElement =
  (options: ToHtmlOptions = {}): Transpiler =>
  ({ component }) => {
    const kebabName = kebabCase(component.name);

    const useOptions: InternalToHtmlOptions = {
      prefix: kebabName,
      ...options,
      onChangeJsById: {},
      js: '',
      namesMap: {},
      format: 'class',
    };
    let json = fastClone(component);
    if (options.plugins) {
      json = runPreJsonPlugins(json, options.plugins);
    }
    const childComponents: string[] = [];
    json.imports.forEach(({ imports }) => {
      Object.keys(imports).forEach((key) => {
        if (imports[key] === 'default') {
          childComponents.push(key);
        }
      });
    });
    const componentHasProps = hasProps(json);
    addUpdateAfterSet(json, useOptions);

    const hasLoop = hasComponent('For', json);
    const hasShow = hasComponent('Show', json);

    if (options.plugins) {
      json = runPostJsonPlugins(json, options.plugins);
    }
    let css = '';
    if (useOptions?.experimental?.css) {
      css = useOptions?.experimental?.css(json, useOptions, {
        collectCss,
        prefix: options.prefix,
      });
    } else {
      css = collectCss(json, {
        prefix: options.prefix,
      });
    }

    stripMetaProperties(json);

    let html = json.children
      .map((item) => blockToHtml(item, useOptions, { childComponents }))
      .join('\n');
    if (useOptions?.experimental?.childrenHtml) {
      html = useOptions?.experimental?.childrenHtml(
        html,
        kebabName,
        json,
        useOptions,
      );
    }

    if (useOptions?.experimental?.cssHtml) {
      html += useOptions?.experimental?.cssHtml(css);
    } else {
      html += `<style>${css}</style>`;
    }

    if (options.prettier !== false) {
      try {
        html = format(html, {
          parser: 'html',
          htmlWhitespaceSensitivity: 'ignore',
          plugins: [
            // To support running in browsers
            require('prettier/parser-html'),
            require('prettier/parser-postcss'),
            require('prettier/parser-babel'),
            require('prettier/parser-typescript'),
          ],
        });
        html = html.trim().replace(/\n/g, '\n      ');
      } catch (err) {
        console.warn('Could not prettify', { string: html }, err);
      }
    }

    let str = `
      ${renderPreComponent(json)}
      /**
       * Usage:
       * 
       *  <${kebabName}></${kebabName}>
       * 
       */
      class ${component.name} extends ${
      useOptions?.experimental?.classExtends
        ? useOptions?.experimental?.classExtends(json, useOptions)
        : 'HTMLElement'
    } {
        constructor() {
          super();
          const self = this;
          ${!json.hooks?.onInit?.code ? '' : 'this.onInitOnce = false;'}
          this.state = ${getStateObjectStringFromComponent(json, {
            valueMapper: (value) => {
              return stripStateAndPropsRefs(
                stripStateAndPropsRefs(
                  addUpdateAfterSetInCode(value, useOptions, 'self.update'),
                  {
                    includeProps: false,
                    includeState: true,
                    // TODO: if it's an arrow function it's this.state.
                    replaceWith: 'self.state.',
                  },
                ),
                {
                  // TODO: replace with `this.` and add setters that call this.update()
                  includeProps: true,
                  includeState: false,
                  replaceWith: 'self.props.',
                },
              );
            },
          })};
          ${
            componentHasProps /* TODO: accept these as attributes/properties on the custom element */
              ? `this.props = {};`
              : ''
          }


          // used to keep track of all nodes created by show/for
          this.nodesToDestroy = [];
          // batch updates
          this.pendingUpdate = false;
          ${
            useOptions?.experimental?.componentConstructor
              ? useOptions?.experimental?.componentConstructor(json, useOptions)
              : ''
          }

          ${useOptions.js}

          if (${json.meta.useMetadata?.isAttachedToShadowDom}) {
            this.attachShadow({ mode: 'open' })
          }
        }


        ${
          !json.hooks.onUnMount?.code
            ? ''
            : `
          disconnectedCallback() {
            ${
              useOptions?.experimental?.disconnectedCallback
                ? useOptions?.experimental?.disconnectedCallback(
                    json,
                    useOptions,
                  )
                : `
            // onUnMount
            ${updateReferencesInCode(
              addUpdateAfterSetInCode(json.hooks.onUnMount.code, useOptions),
              useOptions,
            )}
            this.destroyAnyNodes(); // clean up nodes when component is destroyed
            ${!json.hooks?.onInit?.code ? '' : 'this.onInitOnce = false;'}
            `
            }
          }
          `
        }

        destroyAnyNodes() {
          // destroy current view template refs before rendering again
          this.nodesToDestroy.forEach(el => el.remove());
          this.nodesToDestroy = [];
        }

        get _root() {
          return this.shadowRoot || this;
        }

        connectedCallback() {
          ${
            useOptions?.experimental?.connectedCallbackUpdate
              ? useOptions?.experimental?.connectedCallbackUpdate(
                  json,
                  html,
                  useOptions,
                )
              : `
              this._root.innerHTML = \`
      ${html}\`;
              this.pendingUpdate = true;
              this.render();
              ${!json.hooks?.onInit?.code ? '' : 'this.onInit();'}
              this.onMount();
              this.pendingUpdate = false;
              this.update();
              `
          }
        }
        ${
          !json.hooks?.onInit?.code
            ? ''
            : `
            onInit() {
              ${
                !json.hooks?.onInit?.code
                  ? ''
                  : `
                  if (!this.onInitOnce) {
                    ${updateReferencesInCode(
                      addUpdateAfterSetInCode(
                        json.hooks?.onInit?.code as string,
                        useOptions,
                      ),
                      useOptions,
                    )}
                    this.onInitOnce = true;
                  }`
              }
            }
            `
        }

        ${
          !hasShow
            ? ''
            : `
          showContent(el) {
            // https://developer.mozilla.org/en-US/docs/Web/API/HTMLTemplateElement/content
            // grabs the content of a node that is between <template> tags
            // iterates through child nodes to register all content including text elements
            // attaches the content after the template
  
  
            const elementFragment = el.content.cloneNode(true);
            const children = Array.from(elementFragment.childNodes)
            children.forEach(child => {
              if (el?.scope) {
                child.scope = el.scope;
              }
              this.nodesToDestroy.push(child);
            });
            el.after(elementFragment);
          }`
        }
        ${
          !useOptions?.experimental?.attributeChangedCallback
            ? ''
            : `
          attributeChangedCallback(name, oldValue, newValue) {
            ${useOptions?.experimental?.attributeChangedCallback(
              ['name', 'oldValue', 'newValue'],
              json,
              useOptions,
            )}
          }
          `
        }

        onMount() {
          ${
            !json.hooks.onMount?.code
              ? ''
              : // TODO: make prettier by grabbing only the function body
                `
                // onMount
                ${updateReferencesInCode(
                  addUpdateAfterSetInCode(json.hooks.onMount.code, useOptions),
                  useOptions,
                )}
                `
          }
        }

        onUpdate() {
          ${
            !json.hooks.onUpdate?.length
              ? ''
              : `
            ${json.hooks.onUpdate.reduce((code, hook) => {
              code += updateReferencesInCode(hook.code, useOptions);
              return code + '\n';
            }, '')} 
            `
          }
        }

        update() {
          if (this.pendingUpdate === true) {
            return;
          }
          this.pendingUpdate = true;
          ${
            !useOptions?.experimental?.shouldComponentUpdateStart
              ? ''
              : `
            ${useOptions?.experimental?.shouldComponentUpdateStart(
              json,
              useOptions,
            )}
            `
          }
          this.render();
          this.onUpdate();
          ${
            !useOptions?.experimental?.shouldComponentUpdateEnd
              ? ''
              : `
            ${useOptions?.experimental?.shouldComponentUpdateEnd(
              json,
              useOptions,
            )}
            `
          }
          this.pendingUpdate = false;
        }

        render() {
          // re-rendering needs to ensure that all nodes generated by for/show are refreshed
          this.destroyAnyNodes();
          ${
            useOptions?.experimental?.updateBindings
              ? useOptions?.experimental?.updateBindings(json, useOptions)
              : 'this.updateBindings();'
          }
        }

        updateBindings() {
          ${Object.keys(useOptions.onChangeJsById)
            .map((key) => {
              const value = useOptions.onChangeJsById[key];
              if (!value) {
                return '';
              }
              let code = '';
              if (useOptions?.experimental?.updateBindings) {
                key = useOptions?.experimental?.updateBindings?.key(
                  key,
                  value,
                  useOptions,
                );
                code = useOptions?.experimental?.updateBindings?.code(
                  key,
                  value,
                  useOptions,
                );
              } else {
                code = updateReferencesInCode(value, useOptions);
              }
              return `
              ${
                useOptions?.experimental?.generateQuerySelectorAll
                  ? `
              ${useOptions?.experimental?.generateQuerySelectorAll(key, code)}
              `
                  : `              
              this._root.querySelectorAll("[data-name='${key}']").forEach((el) => {
                ${code}
              })
              `
              }
            `;
            })
            .join('\n\n')}
        }
        renderTextNode(el, text) {
          const textNode = document.createTextNode(text);
          if (el?.scope) {
            textNode.scope = el.scope;
          }
          el.after(textNode);
          this.nodesToDestroy.push(el.nextSibling);
        }

        ${
          !hasLoop
            ? ''
            : `

          // Helper to render loops
          renderLoop(template, array, itemName, itemIndex, collectionName) {
            const collection = [];
            for (let [index, value] of array.entries()) {
              const elementFragment = template.content.cloneNode(true);
              const children = Array.from(elementFragment.childNodes)
              const localScope = {};
              let scope = localScope;
              if (template?.scope) {
                const getParent = {
                  get(target, prop, receiver) {
                    if (prop in target) {
                      return target[prop];
                    }
                    if (prop in template.scope) {
                      return template.scope[prop];
                    }
                    return target[prop];
                  }
                };
                scope = new Proxy(localScope, getParent);
              }
              children.forEach((child) => {
                if (itemName !== undefined) {
                  scope[itemName] = value;
                }
                if (itemIndex !== undefined) {
                  scope[itemIndex] = index;
                }
                if (collectionName !== undefined) {
                  scope[collectionName] = array;
                }
                child.scope = scope;
                this.nodesToDestroy.push(child);
                collection.push(child)
              });
            }
            collection.reverse().forEach(child => template.after(child));
          }
        
          getContext(el, name) {
            do {
              let value = el?.scope?.[name]
              if (value !== undefined) {
                return value
              }
            } while ((el = el.parentNode));
          }
        `
        }
      }

      ${
        useOptions?.experimental?.customElementsDefine
          ? useOptions?.experimental?.customElementsDefine(
              kebabName,
              component,
              useOptions,
            )
          : `customElements.define('${kebabName}', ${component.name});`
      }
    `;

    if (options.plugins) {
      str = runPreCodePlugins(str, options.plugins);
    }
    if (options.prettier !== false) {
      try {
        str = format(str, {
          parser: 'typescript',
          plugins: [
            // To support running in browsers
            require('prettier/parser-html'),
            require('prettier/parser-postcss'),
            require('prettier/parser-babel'),
            require('prettier/parser-typescript'),
          ],
        });
      } catch (err) {
        console.warn('Could not prettify', { string: str }, err);
      }
    }
    if (options.plugins) {
      str = runPostCodePlugins(str, options.plugins);
    }

    return str;
  };
