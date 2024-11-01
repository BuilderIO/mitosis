import { ToHtmlOptions } from '@/generators/html/types';
import { NodePath, types } from '@babel/core';
import { pipe } from 'fp-ts/lib/function';
import { camelCase, kebabCase } from 'lodash';
import traverse from 'neotraverse/legacy';
import { format } from 'prettier/standalone';
import { SELF_CLOSING_HTML_TAGS } from '../../constants/html_tags';
import { babelTransformExpression } from '../../helpers/babel-transform';
import { dashCase } from '../../helpers/dash-case';
import { fastClone } from '../../helpers/fast-clone';
import { getPropFunctions } from '../../helpers/get-prop-functions';
import { getProps } from '../../helpers/get-props';
import { getPropsRef } from '../../helpers/get-props-ref';
import { getRefs } from '../../helpers/get-refs';
import { getStateObjectStringFromComponent } from '../../helpers/get-state-object-string';
import { hasBindingsText } from '../../helpers/has-bindings-text';
import { hasComponent } from '../../helpers/has-component';
import { hasProps } from '../../helpers/has-props';
import { hasStatefulDom } from '../../helpers/has-stateful-dom';
import isChildren from '../../helpers/is-children';
import { isHtmlAttribute } from '../../helpers/is-html-attribute';
import { isMitosisNode } from '../../helpers/is-mitosis-node';
import { mapRefs } from '../../helpers/map-refs';
import { initializeOptions } from '../../helpers/merge-options';
import { getForArguments } from '../../helpers/nodes/for';
import { removeSurroundingBlock } from '../../helpers/remove-surrounding-block';
import { renderPreComponent } from '../../helpers/render-imports';
import { stripMetaProperties } from '../../helpers/strip-meta-properties';
import {
  DO_NOT_USE_ARGS,
  DO_NOT_USE_CONTEXT_VARS_TRANSFORMS,
  DO_NOT_USE_VARS_TRANSFORMS,
  StripStateAndPropsRefsOptions,
  stripStateAndPropsRefs,
} from '../../helpers/strip-state-and-props-refs';
import { collectCss } from '../../helpers/styles/collect-css';
import {
  runPostCodePlugins,
  runPostJsonPlugins,
  runPreCodePlugins,
  runPreJsonPlugins,
} from '../../modules/plugins';
import { MitosisComponent } from '../../types/mitosis-component';
import { MitosisNode, checkIsForNode } from '../../types/mitosis-node';
import { TranspilerGenerator } from '../../types/transpiler';
import { stringifySingleScopeOnMount } from '../helpers/on-mount';

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
  contextVars?: string[];
  context?: string;
  scopeVars?: ScopeVars;
  childComponents?: string[];
  outputs?: string[];
  props?: Set<string>;
  ComponentName?: string;
}

const isAttribute = (key: string): boolean => {
  return /-/.test(key);
};

const ATTRIBUTE_KEY_EXCEPTIONS_MAP: { [key: string]: string } = {
  class: 'className',
  innerHtml: 'innerHTML',
};

const updateKeyIfException = (key: string): string => {
  return ATTRIBUTE_KEY_EXCEPTIONS_MAP[key] ?? key;
};

const generateSetElementAttributeCode = (
  key: string,
  tagName: string,
  useValue: string,
  options: InternalToHtmlOptions,
  meta: any = {},
): string => {
  if (options?.experimental?.props) {
    return options?.experimental?.props(key, useValue, options);
  }
  const isKey = key === 'key';
  const ignoreKey = /^(innerHTML|key|class|value)$/.test(key);
  const isTextarea = key === 'value' && tagName === 'textarea';
  const isDataSet = /^data-/.test(key);
  const isComponent = Boolean(meta?.component);
  const isHtmlAttr = isHtmlAttribute(key, tagName);
  const setAttr = !ignoreKey && (isHtmlAttr || !isTextarea || isAttribute(key));
  return [
    // is html attribute or dash-case
    setAttr ? `;el.setAttribute("${key}", ${useValue});` : '',

    // not attr or dataset or html attr
    !setAttr || !(isHtmlAttr || isDataSet || !isComponent || isKey)
      ? `el.${updateKeyIfException(camelCase(key))} = ${useValue};`
      : '',

    // is component but not html attribute
    isComponent && !isHtmlAttr
      ? // custom-element is created but we're in the middle of the update loop
        `
      if (el.props) {
        ;el.props.${camelCase(key)} = ${useValue};
        if (el.update) {
          ;el.update();
        }
      } else {
        ;el.props = {};
        ;el.props.${camelCase(key)} = ${useValue};
      }
      `
      : '',
  ].join('\n');
};

const addUpdateAfterSet = (json: MitosisComponent, options: InternalToHtmlOptions) => {
  traverse(json).forEach(function (item) {
    if (isMitosisNode(item)) {
      for (const key in item.bindings) {
        const value = item.bindings[key]?.code;

        if (value) {
          const newValue = addUpdateAfterSetInCode(value, options);
          if (newValue !== value) {
            item.bindings[key]!.code = newValue;
          }
        }
      }
    }
  });
};

const getChildComponents = (json: MitosisComponent, options: InternalToHtmlOptions) => {
  const childComponents: string[] = [];
  json.imports.forEach(({ imports }) => {
    Object.keys(imports).forEach((key) => {
      if (imports[key] === 'default') {
        childComponents.push(key);
      }
    });
  });
  return childComponents;
};

const getScopeVars = (parentScopeVars: ScopeVars, value: string | boolean) => {
  return parentScopeVars.filter((scopeVar) => {
    if (typeof value === 'boolean') {
      return value;
    }
    const checkVar = new RegExp('(\\.\\.\\.|,| |;|\\(|^|!)' + scopeVar + '(\\.|,| |;|\\)|$)', 'g');
    return checkVar.test(value);
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
    return json.children.map((item) => blockToHtml(item, options, blockOptions)).join('\n');
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

const createGlobalId = (name: string, options: InternalToHtmlOptions) => {
  const newNameNum = (options.namesMap[name] || 0) + 1;
  options.namesMap[name] = newNameNum;
  return `${name}${options.prefix ? `-${options.prefix}` : ''}-${newNameNum}`;
};

const deprecatedStripStateAndPropsRefs = (
  code: string,
  {
    context,
    contextVars,
    domRefs,
    includeProps,
    includeState,
    outputVars,
    replaceWith,
    stateVars,
  }: StripStateAndPropsRefsOptions & DO_NOT_USE_ARGS,
) => {
  return pipe(
    stripStateAndPropsRefs(code, {
      includeProps,
      includeState,
      replaceWith,
    }),
    (newCode) =>
      DO_NOT_USE_VARS_TRANSFORMS(newCode, {
        context,
        contextVars,
        domRefs,
        outputVars,
        stateVars,
      }),
  );
};

// TODO: overloaded function
const updateReferencesInCode = (
  code: string,
  options: InternalToHtmlOptions,
  blockOptions: BlockOptions = {},
): string => {
  const contextVars = blockOptions.contextVars || [];
  const context = blockOptions?.context || 'this.';
  if (options?.experimental?.updateReferencesInCode) {
    return options?.experimental?.updateReferencesInCode(code, options, {
      stripStateAndPropsRefs: deprecatedStripStateAndPropsRefs,
    });
  }
  if (options.format === 'class') {
    return pipe(
      stripStateAndPropsRefs(code, {
        includeProps: false,
        includeState: true,
        replaceWith: context + 'state.',
      }),
      (newCode) =>
        stripStateAndPropsRefs(newCode, {
          // TODO: replace with `this.` and add setters that call this.update()
          includeProps: true,
          includeState: false,
          replaceWith: context + 'props.',
        }),
      (newCode) => DO_NOT_USE_CONTEXT_VARS_TRANSFORMS({ code: newCode, context, contextVars }),
    );
  }
  return code;
};

const addOnChangeJs = (id: string, options: InternalToHtmlOptions, code: string) => {
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
  const ComponentName = blockOptions.ComponentName;
  const scopeVars = blockOptions?.scopeVars || [];
  const childComponents = blockOptions?.childComponents || [];

  const hasData = Object.keys(json.bindings).length;
  const hasDomState = /input|textarea|select/.test(json.name);
  let elId = '';
  if (hasData) {
    elId = getId(json, options);
    json.properties['data-el'] = elId;
  }
  if (hasDomState) {
    json.properties['data-dom-state'] = createGlobalId(
      (ComponentName ? ComponentName + '-' : '') + json.name,
      options,
    );
  }

  if (mappers[json.name]) {
    return mappers[json.name](json, options, blockOptions);
  }

  if (isChildren({ node: json })) {
    return `<slot></slot>`;
  }

  if (json.properties._text) {
    return json.properties._text;
  }
  if (json.bindings._text?.code) {
    // TO-DO: textContent might be better performance-wise
    addOnChangeJs(
      elId,
      options,
      `
      ${addScopeVars(
        scopeVars,
        json.bindings._text.code as string,
        (scopeVar: string) =>
          `const ${scopeVar} = ${
            options.format === 'class' ? 'this.' : ''
          }getScope(el, "${scopeVar}");`,
      )}
      ${options.format === 'class' ? 'this.' : ''}renderTextNode(el, ${json.bindings._text.code});`,
    );

    return `<template data-el="${elId}"><!-- ${json.bindings._text?.code} --></template>`;
  }

  let str = '';

  if (checkIsForNode(json)) {
    const forArguments = getForArguments(json);
    const localScopeVars: ScopeVars = [...scopeVars, ...forArguments];
    const argsStr = forArguments.map((arg) => `"${arg}"`).join(',');
    addOnChangeJs(
      elId,
      options,
      // TODO: be smarter about rendering, deleting old items and adding new ones by
      // querying dom potentially
      `
        let array = ${json.bindings.each?.code};
        ${options.format === 'class' ? 'this.' : ''}renderLoop(el, array, ${argsStr});
      `,
    );
    // TODO: decide on how to handle this...
    str += `
      <template data-el="${elId}">`;
    if (json.children) {
      str += json.children
        .map((item) =>
          blockToHtml(item, options, {
            ...blockOptions,
            scopeVars: localScopeVars,
          }),
        )
        .join('\n');
    }
    str += '</template>';
  } else if (json.name === 'Show') {
    const whenCondition = (json.bindings.when?.code as string).replace(/;$/, '');
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
            }getScope(el, "${scopeVar}");`,
        )}
        const whenCondition = ${whenCondition};
        if (whenCondition) {
          ${options.format === 'class' ? 'this.' : ''}showContent(el)
        }
      `,
    );

    str += `<template data-el="${elId}">`;
    if (json.children) {
      str += json.children.map((item) => blockToHtml(item, options, blockOptions)).join('\n');
    }

    str += '</template>';
  } else {
    const component = childComponents.find((impName) => impName === json.name);
    const elSelector = component ? kebabCase(json.name) : json.name;
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
      const value = (json.properties[key] || '').replace(/"/g, '&quot;').replace(/\n/g, '\\n');
      str += ` ${key}="${value}" `;
    }

    // batch all local vars within the bindings
    let batchScopeVars: any = {};
    let injectOnce = false;
    let startInjectVar = '%%START_VARS%%';

    for (const key in json.bindings) {
      if (json.bindings[key]?.type === 'spread' || key === 'css') {
        continue;
      }
      const value = json.bindings[key]?.code as string;
      const cusArg = json.bindings[key]?.arguments || ['event'];
      // TODO: proper babel transform to replace. Util for this
      const useValue = value;

      if (key.startsWith('on')) {
        let event = key.replace('on', '').toLowerCase();
        const fnName = camelCase(`on-${elId}-${event}`);
        const codeContent: string = removeSurroundingBlock(
          updateReferencesInCode(useValue, options, blockOptions),
        );
        const asyncKeyword = json.bindings[key]?.async ? 'async ' : '';
        options.js += `
          // Event handler for '${event}' event on ${elId}
          ${
            options.format === 'class'
              ? `this.${fnName} = ${asyncKeyword}(${cusArg.join(',')}) => {`
              : `${asyncKeyword}function ${fnName} (${cusArg.join(',')}) {`
          }
              ${addScopeVars(
                scopeVars,
                codeContent,
                (scopeVar: string) =>
                  `const ${scopeVar} = ${
                    options.format === 'class' ? 'this.' : ''
                  }getScope(event.currentTarget, "${scopeVar}");`,
              )}
            ${codeContent}
          }
        `;
        const fnIdentifier = `${options.format === 'class' ? 'this.' : ''}${fnName}`;

        addOnChangeJs(
          elId,
          options,
          `
            ;el.removeEventListener('${event}', ${fnIdentifier});
            ;el.addEventListener('${event}', ${fnIdentifier});
          `,
        );
      } else if (key === 'ref') {
        str += ` data-ref="${ComponentName}-${useValue}" `;
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
                }getScope(el, "${scopeVar}");`,
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
            ${generateSetElementAttributeCode(key, elSelector, useValue, options, {
              component,
            })}
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
            }getScope(el, "${scopeVar}");`,
        )}
        `,
      );
    }

    if (SELF_CLOSING_HTML_TAGS.has(json.name)) {
      return str + ' />';
    }
    str += '>';
    if (json.children) {
      str += json.children.map((item) => blockToHtml(item, options, blockOptions)).join('\n');
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
  code = '',
  options: InternalToHtmlOptions,
  useString = options.format === 'class' ? 'this.update' : 'update',
) {
  let updates = 0;
  return babelTransformExpression(code, {
    AssignmentExpression(path: babel.NodePath<babel.types.AssignmentExpression>) {
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
              useString = options?.experimental?.addUpdateAfterSetInCode(useString, options, {
                node,
                code,
                types,
              });
            }
            path.insertAfter(types.callExpression(types.identifier(useString), []));
          }
        }
      }
    },
  });
}

const htmlDecode = (html: string) => html.replace(/&quot;/gi, '"');

// TODO: props support via custom elements
export const componentToHtml: TranspilerGenerator<ToHtmlOptions> =
  (_options = {}) =>
  ({ component }) => {
    const options: InternalToHtmlOptions = initializeOptions({
      target: 'html',
      component,
      defaults: {
        ..._options,
        onChangeJsById: {},
        js: '',
        namesMap: {},
        format: 'script',
      },
    });
    let json = fastClone(component);
    if (options.plugins) {
      json = runPreJsonPlugins({ json, plugins: options.plugins });
    }
    addUpdateAfterSet(json, options);
    const componentHasProps = hasProps(json);

    const hasLoop = hasComponent('For', json);
    const hasShow = hasComponent('Show', json);
    const hasTextBinding = hasBindingsText(json);

    if (options.plugins) {
      json = runPostJsonPlugins({ json, plugins: options.plugins });
    }
    const css = collectCss(json, {
      prefix: options.prefix,
    });

    let str = json.children.map((item) => blockToHtml(item, options)).join('\n');

    if (css.trim().length) {
      str += `<style>${css}</style>`;
    }

    const hasChangeListeners = Boolean(Object.keys(options.onChangeJsById).length);
    const hasGeneratedJs = Boolean(options.js.trim().length);

    if (hasChangeListeners || hasGeneratedJs || json.hooks.onMount.length || hasLoop) {
      // TODO: collectJs helper for here and liquid
      str += `
      <script>
      (() => {
        const state = ${getStateObjectStringFromComponent(json, {
          valueMapper: (value) =>
            addUpdateAfterSetInCode(updateReferencesInCode(value, options), options),
        })};
        ${componentHasProps ? `let props = {};` : ''}
        let context = null;
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
          ${Object.keys(options.onChangeJsById)
            .map((key) => {
              const value = options.onChangeJsById[key];
              if (!value) {
                return '';
              }
              return `
              document.querySelectorAll("[data-el='${key}']").forEach((el) => {
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
                    updateReferencesInCode(hook.code, options),
                    options,
                  );
                  return code + '\n';
                }, '')}
                `
          }

          pendingUpdate = false;
        }

        ${options.js}

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
                addUpdateAfterSetInCode(json.hooks?.onInit?.code, options),
                options,
              )}
              onInitOnce = true;
            }
            `
        }

        ${
          !json.hooks.onMount.length
            ? ''
            : // TODO: make prettier by grabbing only the function body
              `
              // onMount
              ${updateReferencesInCode(
                addUpdateAfterSetInCode(stringifySingleScopeOnMount(json), options),
                options,
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
              if (el?.context) {
                child.context = el.context;
              }
              nodesToDestroy.push(child);
            });
            el.after(elementFragment);
          }

        `
        }
        ${
          !hasTextBinding
            ? ''
            : `
          // Helper text DOM nodes
          function renderTextNode(el, text) {
            const textNode = document.createTextNode(text);
            if (el?.scope) {
              textNode.scope = el.scope
            }
            if (el?.context) {
              child.context = el.context;
            }
            el.after(textNode);
            nodesToDestroy.push(el.nextSibling);
          }
          `
        }
        ${
          !hasLoop
            ? ''
            : `
          // Helper to render loops
          function renderLoop(template, array, itemName, itemIndex, collectionName) {
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
                if (template.context) {
                  child.context = template.context;
                }
                this.nodesToDestroy.push(child);
                collection.unshift(child);
              });
              collection.forEach(child => template.after(child));
            }
          }

          function getScope(el, name) {
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
      str = runPreCodePlugins({ json, code: str, plugins: options.plugins });
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
      str = runPostCodePlugins({ json, code: str, plugins: options.plugins });
    }
    return str;
  };

// TODO: props support via custom elements
export const componentToCustomElement: TranspilerGenerator<ToHtmlOptions> =
  (_options = {}) =>
  ({ component }) => {
    const ComponentName = component.name;
    const kebabName = kebabCase(ComponentName);

    const options: InternalToHtmlOptions = initializeOptions({
      target: 'customElement',
      component,
      defaults: {
        prefix: kebabName,
        ..._options,
        onChangeJsById: {},
        js: '',
        namesMap: {},
        format: 'class',
      },
    });
    let json = fastClone(component);
    if (options.plugins) {
      json = runPreJsonPlugins({ json, plugins: options.plugins });
    }

    const [forwardProp, hasPropRef] = getPropsRef(json, true);

    const contextVars = Object.keys(json?.context?.get || {});
    const childComponents = getChildComponents(json, options);
    const componentHasProps = hasProps(json);
    const componentHasStatefulDom = hasStatefulDom(json);
    const props = getProps(json);
    // prevent jsx props from showing up as @Input
    if (hasPropRef) {
      props.delete(forwardProp);
    }
    const outputs = getPropFunctions(json);
    const domRefs = getRefs(json);
    const jsRefs = Object.keys(json.refs).filter((ref) => !domRefs.has(ref));
    mapRefs(json, (refName) => `self._${refName}`);
    const context: string[] = contextVars.map((variableName) => {
      const token = json?.context?.get[variableName].name;
      if (options?.experimental?.htmlContext) {
        return options?.experimental?.htmlContext(variableName, token);
      }
      return `this.${variableName} = this.getContext(this._root, ${token})`;
    });

    const setContext = [];
    for (const key in json.context.set) {
      const { name, value, ref } = json.context.set[key];
      setContext.push({ name, value, ref });
    }

    addUpdateAfterSet(json, options);

    const hasContext = context.length;
    const hasLoop = hasComponent('For', json);
    const hasScope = hasLoop;
    const hasShow = hasComponent('Show', json);

    if (options.plugins) {
      json = runPostJsonPlugins({ json, plugins: options.plugins });
    }
    let css = '';
    if (options?.experimental?.css) {
      css = options?.experimental?.css(json, options, {
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
      .map((item) =>
        blockToHtml(item, options, {
          childComponents,
          props,
          outputs,
          ComponentName,
          contextVars,
        }),
      )
      .join('\n');
    if (options?.experimental?.childrenHtml) {
      html = options?.experimental?.childrenHtml(html, kebabName, json, options);
    }

    if (options?.experimental?.cssHtml) {
      html += options?.experimental?.cssHtml(css);
    } else if (css.length) {
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
      ${json.types ? json.types.join('\n') : ''}
      ${renderPreComponent({
        explicitImportFileExtension: options.explicitImportFileExtension,
        component: json,
        target: 'customElement',
      })}
      /**
       * Usage:
       *
       *  <${kebabName}></${kebabName}>
       *
       */
      class ${ComponentName} extends ${
      options?.experimental?.classExtends
        ? options?.experimental?.classExtends(json, options)
        : 'HTMLElement'
    } {
        ${Array.from(domRefs)
          .map((ref) => {
            return `
        get _${ref}() {
          return this._root.querySelector("[data-ref='${ComponentName}-${ref}']")
        }
            `;
          })
          .join('\n')}

        get _root() {
          return this.shadowRoot || this;
        }

        constructor() {
          super();
          const self = this;
          ${
            // TODO: more than one context not injector
            setContext.length === 1 && setContext?.[0]?.ref
              ? `this.context = ${setContext[0].ref}`
              : ''
          }

          ${!json.hooks?.onInit?.code ? '' : 'this.onInitOnce = false;'}

          this.state = ${getStateObjectStringFromComponent(json, {
            valueMapper: (value) =>
              pipe(
                stripStateAndPropsRefs(addUpdateAfterSetInCode(value, options, 'self.update'), {
                  includeProps: false,
                  includeState: true,
                  // TODO: if it's an arrow function it's this.state.
                  replaceWith: 'self.state.',
                }),
                (newCode) =>
                  stripStateAndPropsRefs(newCode, {
                    // TODO: replace with `this.` and add setters that call this.update()
                    includeProps: true,
                    includeState: false,
                    replaceWith: 'self.props.',
                  }),
                (code) =>
                  DO_NOT_USE_CONTEXT_VARS_TRANSFORMS({
                    code,
                    contextVars,
                    // correctly ref the class not state object
                    context: 'self.',
                  }),
              ),
          })};
          if (!this.props) {
            this.props = {};
          }
          ${
            !componentHasProps
              ? ''
              : `
          this.componentProps = [${Array.from(props)
            .map((prop) => `"${prop}"`)
            .join(',')}];
          `
          }

          ${
            !json.hooks.onUpdate?.length
              ? ''
              : `
            this.updateDeps = [${json.hooks.onUpdate
              ?.map((hook) => updateReferencesInCode(hook?.deps || '[]', options))
              .join(',')}];
            `
          }

          // used to keep track of all nodes created by show/for
          this.nodesToDestroy = [];
          // batch updates
          this.pendingUpdate = false;
          ${
            options?.experimental?.componentConstructor
              ? options?.experimental?.componentConstructor(json, options)
              : ''
          }

          ${options.js}

          ${jsRefs
            .map((ref) => {
              // const typeParameter = json['refs'][ref]?.typeParameter || '';
              const argument = json['refs'][ref]?.argument || 'null';
              return `this._${ref} = ${argument}`;
            })
            .join('\n')}

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
              options?.experimental?.disconnectedCallback
                ? options?.experimental?.disconnectedCallback(json, options)
                : `
            // onUnMount
            ${updateReferencesInCode(
              addUpdateAfterSetInCode(json.hooks.onUnMount.code, options),
              options,
              {
                contextVars,
              },
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

        connectedCallback() {
          ${context.join('\n')}
          ${
            !componentHasProps
              ? ''
              : `
          this.getAttributeNames().forEach((attr) => {
            const jsVar = attr.replace(/-/g, '');
            const regexp = new RegExp(jsVar, 'i');
            this.componentProps.forEach(prop => {
              if (regexp.test(prop)) {
                const attrValue = this.getAttribute(attr);
                if (this.props[prop] !== attrValue) {
                  this.props[prop] = attrValue;
                }
              }
            });
          });
          `
          }
          ${
            options?.experimental?.connectedCallbackUpdate
              ? options?.experimental?.connectedCallbackUpdate(json, html, options)
              : `
              this._root.innerHTML = \`
      ${html}\`;
              this.pendingUpdate = true;
              ${!json.hooks?.onInit?.code ? '' : 'this.onInit();'}
              this.render();
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
                      addUpdateAfterSetInCode(json.hooks?.onInit?.code, options),
                      options,
                      {
                        contextVars,
                      },
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
              if (el?.context) {
                child.context = el.context;
              }
              this.nodesToDestroy.push(child);
            });
            el.after(elementFragment);
          }`
        }
        ${
          !options?.experimental?.attributeChangedCallback
            ? ''
            : `
          attributeChangedCallback(name, oldValue, newValue) {
            ${options?.experimental?.attributeChangedCallback(
              ['name', 'oldValue', 'newValue'],
              json,
              options,
            )}
          }
          `
        }

        onMount() {
          ${
            !json.hooks.onMount.length
              ? ''
              : // TODO: make prettier by grabbing only the function body
                `
                // onMount
                ${updateReferencesInCode(
                  addUpdateAfterSetInCode(stringifySingleScopeOnMount(json), options),
                  options,
                  {
                    contextVars,
                  },
                )}
                `
          }
        }

        onUpdate() {
          ${
            !json.hooks.onUpdate?.length
              ? ''
              : `
              const self = this;
            ${json.hooks.onUpdate.reduce((code, hook, index) => {
              // create check update
              if (hook?.deps) {
                code += `
                ;(function (__prev, __next) {
                  const __hasChange = __prev.find((val, index) => val !== __next[index]);
                  if (__hasChange !== undefined) {
                    ${updateReferencesInCode(hook.code, options, {
                      contextVars,
                      context: 'self.',
                    })}
                    self.updateDeps[${index}] = __next;
                  }
                }(self.updateDeps[${index}], ${updateReferencesInCode(hook?.deps || '[]', options, {
                  contextVars,
                  context: 'self.',
                })}));
                `;
              } else {
                code += `
                ${updateReferencesInCode(hook.code, options, {
                  contextVars,
                  context: 'self.',
                })}
                `;
              }
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
          this.render();
          this.onUpdate();
          this.pendingUpdate = false;
        }

        render() {
          ${
            !componentHasStatefulDom
              ? ''
              : `
          // grab previous input state
          const preStateful = this.getStateful(this._root);
          const preValues = this.prepareHydrate(preStateful);
          `
          }

          // re-rendering needs to ensure that all nodes generated by for/show are refreshed
          this.destroyAnyNodes();
          this.updateBindings();

          ${
            !componentHasStatefulDom
              ? ''
              : `
          // hydrate input state
          if (preValues.length) {
            const nextStateful = this.getStateful(this._root);
            this.hydrateDom(preValues, nextStateful);
          }
          `
          }
        }
        ${
          !componentHasStatefulDom
            ? ''
            : `
            getStateful(el) {
              const stateful = el.querySelectorAll('[data-dom-state]');
              return stateful ? Array.from(stateful) : [];
            }
            prepareHydrate(stateful) {
              return stateful.map(el => {
                return {
                  id: el.dataset.domState,
                  value: el.value,
                  active: document.activeElement === el,
                  selectionStart: el.selectionStart
                };
              });
            }
            hydrateDom(preValues, stateful) {
              return stateful.map((el, index) => {
                const prev = preValues.find((prev) => el.dataset.domState === prev.id);
                if (prev) {
                  el.value = prev.value;
                  if (prev.active) {
                     el.focus();
                     el.selectionStart = prev.selectionStart;
                  }
                }
              });
            }
          `
        }

        updateBindings() {
          ${Object.keys(options.onChangeJsById)
            .map((key) => {
              const value = options.onChangeJsById[key];
              if (!value) {
                return '';
              }
              let code = '';
              if (options?.experimental?.updateBindings) {
                key = options?.experimental?.updateBindings?.key(key, value, options);
                code = options?.experimental?.updateBindings?.code(key, value, options);
              } else {
                code = updateReferencesInCode(value, options, {
                  contextVars,
                });
              }
              return `
              ${
                options?.experimental?.generateQuerySelectorAll
                  ? `
              ${options?.experimental?.generateQuerySelectorAll(key, code)}
              `
                  : `
              this._root.querySelectorAll("[data-el='${key}']").forEach((el) => {
                ${code}
              })
              `
              }
            `;
            })
            .join('\n\n')}
        }

        // Helper to render content
        renderTextNode(el, text) {
          const textNode = document.createTextNode(text);
          if (el?.scope) {
            textNode.scope = el.scope;
          }
          if (el?.context) {
            textNode.context = el.context;
          }
          el.after(textNode);
          this.nodesToDestroy.push(el.nextSibling);
        }
        ${
          !hasContext
            ? ''
            : `
            // get Context Helper
            getContext(el, token) {
              do {
                let value;
                if (el?.context?.get) {
                  value = el.context.get(token);
                } else if (el?.context?.[token]) {
                  value = el.context[token];
                }
                if (value !== undefined) {
                  return value;
                }
              } while ((el = el.parentNode));
            }
            `
        }
        ${
          !hasScope
            ? ''
            : `
            // scope helper
            getScope(el, name) {
              do {
                let value = el?.scope?.[name]
                if (value !== undefined) {
                  return value
                }
              } while ((el = el.parentNode));
            }
            `
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
                if (template.context) {
                  child.context = context;
                }
                this.nodesToDestroy.push(child);
                collection.unshift(child)
              });
            }
            collection.forEach(child => template.after(child));
          }
        `
        }
      }

      ${
        options?.experimental?.customElementsDefine
          ? options?.experimental?.customElementsDefine(kebabName, component, options)
          : `customElements.define('${kebabName}', ${ComponentName});`
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
      str = runPostCodePlugins({ json, code: str, plugins: options.plugins });
    }

    return str;
  };
