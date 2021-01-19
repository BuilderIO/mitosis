import { NodePath, types } from '@babel/core';
import { camelCase } from 'lodash';
import { format } from 'prettier/standalone';
import { hasProps } from '../helpers/has-props';
import traverse from 'traverse';
import { babelTransformExpression } from '../helpers/babel-transform';
import { collectCss } from '../helpers/collect-styles';
import { dashCase } from '../helpers/dash-case';
import { fastClone } from '../helpers/fast-clone';
import { getStateObjectString } from '../helpers/get-state-object-string';
import { hasComponent } from '../helpers/has-component';
import { isComponent } from '../helpers/is-component';
import { isJsxLiteNode } from '../helpers/is-jsx-lite-node';
import { replaceIdentifiers } from '../helpers/replace-idenifiers';
import { selfClosingTags } from '../parsers/jsx';
import { JSXLiteComponent } from '../types/jsx-lite-component';
import { JSXLiteNode } from '../types/jsx-lite-node';
import { stripStateAndPropsRefs } from '../helpers/strip-state-and-props-refs';
import {
  Plugin,
  runPostCodePlugins,
  runPostJsonPlugins,
  runPreCodePlugins,
  runPreJsonPlugins,
} from '../modules/plugins';
import isChildren from '../helpers/is-children';
import generate from '@babel/generator';

type ToHtmlOptions = {
  prettier?: boolean;
  format?: 'class' | 'script';
  plugins?: Plugin[];
};

type StringRecord = { [key: string]: string };
type NumberRecord = { [key: string]: number };
type InternalToHtmlOptions = ToHtmlOptions & {
  onChangeJsById: StringRecord;
  js: string;
  namesMap: NumberRecord;
};

const addUpdateAfterSet = (
  json: JSXLiteComponent,
  options: InternalToHtmlOptions,
) => {
  traverse(json).forEach(function (item) {
    if (isJsxLiteNode(item)) {
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

const getForNames = (json: JSXLiteComponent) => {
  const names: string[] = [];
  traverse(json).forEach(function (item) {
    if (isJsxLiteNode(item)) {
      if (item.name === 'For') {
        names.push(item.bindings._forName as string);
      }
    }
  });
  return names;
};

const replaceForNameIdentifiers = (
  json: JSXLiteComponent,
  options: InternalToHtmlOptions,
) => {
  // TODO: cache this. by reference? lru?
  const forNames = getForNames(json);

  traverse(json).forEach((item) => {
    if (isJsxLiteNode(item)) {
      for (const key in item.bindings) {
        if (key === 'css' || key === '_forName') {
          continue;
        }
        const value = item.bindings[key];
        if (typeof value === 'string') {
          item.bindings[key] = replaceIdentifiers(
            value,
            forNames,
            (name) =>
              `${
                options.format === 'class' ? 'this.' : ''
              }getContext(el, "${name}")`,
          ) as string;
        }
      }
    }
  });
};

const mappers: {
  [key: string]: (json: JSXLiteNode, options: InternalToHtmlOptions) => string;
} = {
  Fragment: (json, options) => {
    return json.children.map((item) => blockToHtml(item, options)).join('\n');
  },
};

const getId = (json: JSXLiteNode, options: InternalToHtmlOptions) => {
  const name = /^h\d$/.test(json.name || '') // don't dashcase h1 into h-1
    ? json.name
    : dashCase(json.name || 'div');

  const newNameNum = (options.namesMap[name] || 0) + 1;
  options.namesMap[name] = newNameNum;
  return `${name}-${newNameNum}`;
};

const updateReferencesInCode = (
  code: string,
  options: InternalToHtmlOptions,
) => {
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
const blockToHtml = (json: JSXLiteNode, options: InternalToHtmlOptions) => {
  const hasData = Object.keys(json.bindings).length;
  let elId = '';
  if (hasData) {
    elId = getId(json, options);
    json.properties['data-name'] = elId;
  }

  if (mappers[json.name]) {
    return mappers[json.name](json, options);
  }

  if (isChildren(json)) {
    return `<slot></slot>`;
  }

  if (json.properties._text) {
    return json.properties._text;
  }
  if (json.bindings._text) {
    addOnChangeJs(elId, options, `el.innerText = ${json.bindings._text};`);

    return `<span data-name="${elId}"></span>`;
  }

  let str = '';

  if (json.name === 'For') {
    const itemName = json.bindings._forName;
    addOnChangeJs(
      elId,
      options,
      // TODO: be smarter about rendering, deleting old items and adding new ones by
      // querying dom potentially
      `
        let array = ${json.bindings.each};
        let template = ${
          options.format === 'class' ? 'this' : 'document'
        }.querySelector('[data-template-for="${elId}"]');
        ${
          options.format === 'class' ? 'this.' : ''
        }renderLoop(el, array, template, "${itemName}");
      `,
    );
    // TODO: decide on how to handle this...
    str += `
      <span data-name="${elId}"></span>
      <template data-template-for="${elId}">`;
    if (json.children) {
      str += json.children.map((item) => blockToHtml(item, options)).join('\n');
    }
    str += '</template>';
  } else if (json.name === 'Show') {
    addOnChangeJs(
      elId,
      options,
      `el.style.display = ${(json.bindings.when as string).replace(
        /;$/,
        '',
      )} ? 'inline' : 'none'`,
    );

    str += `<span data-name="${elId}">`;
    if (json.children) {
      str += json.children.map((item) => blockToHtml(item, options)).join('\n');
    }

    str += '</span>';
  } else {
    str += `<${json.name} `;

    // For now, spread is not supported
    // if (json.bindings._spread === '_spread') {
    //   str += `
    //       {% for _attr in ${json.bindings._spread} %}
    //         {{ _attr[0] }}="{{ _attr[1] }}"
    //       {% endfor %}
    //     `;
    // }

    for (const key in json.properties) {
      const value = json.properties[key];
      str += ` ${key}="${value}" `;
    }

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
        options.js += `
          // Event handler for '${event}' event on ${elId}
          ${
            options.format === 'class'
              ? `this.${fnName} = (event) => {`
              : `function ${fnName} (event) {`
          }
            ${updateReferencesInCode(useValue, options)}
          }
        `;
        const fnIdentifier = `${
          options.format === 'class' ? 'this.' : ''
        }${fnName}`;
        addOnChangeJs(
          elId,
          options,
          `
            el.removeEventListener('${event}', ${fnIdentifier});
            el.addEventListener('${event}', ${fnIdentifier});
          `,
        );
      } else {
        const useAttribute = key.includes('-');
        addOnChangeJs(
          elId,
          options,
          useAttribute
            ? `el.setAttribute(${key}, ${useValue})`
            : `el.${key} = ${useValue}`,
        );
      }
    }
    if (selfClosingTags.has(json.name)) {
      return str + ' />';
    }
    str += '>';
    if (json.children) {
      str += json.children.map((item) => blockToHtml(item, options)).join('\n');
    }

    str += `</${json.name}>`;
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

            // Uncomment to debug infinite loops:
            // if (updates++ > 1000) {
            //   console.error('Infinite assignment detected');
            //   return;
            // }

            path.insertAfter(
              types.callExpression(types.identifier(useString), []),
            );
          }
        }
      }
    },
  });
}

// TODO: props support via custom elements
export const componentToHtml = (
  componentJson: JSXLiteComponent,
  options: ToHtmlOptions = {},
) => {
  const useOptions: InternalToHtmlOptions = {
    ...options,
    onChangeJsById: {},
    js: '',
    namesMap: {},
    format: 'script',
  };
  let json = fastClone(componentJson);
  if (options.plugins) {
    json = runPreJsonPlugins(json, options.plugins);
  }
  replaceForNameIdentifiers(json, useOptions);
  addUpdateAfterSet(json, useOptions);
  const componentHasProps = hasProps(json);

  const hasLoop = hasComponent('For', json);

  const hasState = Boolean(Object.keys(json.state).length);

  if (options.plugins) {
    json = runPostJsonPlugins(json, options.plugins);
  }
  const css = collectCss(json);
  let str = json.children
    .map((item) => blockToHtml(item, useOptions))
    .join('\n');

  if (css.trim().length) {
    str += `<style>${css}</style>`;
  }

  if (hasState) {
    // TODO: collectJs helper for here and liquid
    str += `
      <script>
        let state = ${getStateObjectString(json, {
          valueMapper: (value) =>
            addUpdateAfterSetInCode(
              updateReferencesInCode(value, useOptions),
              useOptions,
            ),
        })};
        ${componentHasProps ? `let props = {};` : ''}

        // Function to update data bindings and loops
        // call update() when you mutate state and need the updates to reflect
        // in the dom
        function update() {
          ${Object.keys(useOptions.onChangeJsById)
            .map((key) => {
              const value = useOptions.onChangeJsById[key];
              if (!value) {
                return '';
              }
              return `
              document.querySelectorAll("[data-name='${key}']").forEach((el) => {
                ${value}
              })
            `;
            })
            .join('\n\n')}
        }

        ${useOptions.js}

        // Update with initial state on first load
        update()

        ${
          !json.hooks.onMount
            ? ''
            : // TODO: make prettier by grabbing only the function body
              `
              // onMount
              (${json.hooks.onMount})()`
        }

        ${
          !hasLoop
            ? ''
            : `

          // Helper to render loops
          function renderLoop(el, array, template, itemName) {
            el.innerHTML = '';
            for (let value of array) {
              let tmp = document.createElement('span');
              tmp.innerHTML = template.innerHTML;
              Array.from(tmp.children).forEach(function (child) {
                contextMap.set(child, {
                  ...contextMap.get(child),
                  [itemName]: value
                });
                el.appendChild(child);
              });
            }
          }

          // Helper to pass context down for loops
          let contextMap = new WeakMap();
          function getContext(el, name) {
            let parent = el;
            do {
              let context = contextMap.get(parent);
              if (context && name in context) {
                return context[name];
              }
            } while (parent = parent.parentNode)
          }
        `
        }
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
export const componentToCustomElement = (
  componentJson: JSXLiteComponent,
  options: ToHtmlOptions = {},
) => {
  const useOptions: InternalToHtmlOptions = {
    ...options,
    onChangeJsById: {},
    js: '',
    namesMap: {},
    format: 'class',
  };
  let json = fastClone(componentJson);
  if (options.plugins) {
    json = runPreJsonPlugins(json, options.plugins);
  }
  const componentHasProps = hasProps(json);
  replaceForNameIdentifiers(json, useOptions);
  addUpdateAfterSet(json, useOptions);

  const hasLoop = hasComponent('For', json);

  if (options.plugins) {
    json = runPostJsonPlugins(json, options.plugins);
  }

  const css = collectCss(json);

  let html = json.children
    .map((item) => blockToHtml(item, useOptions))
    .join('\n');

  html += `<style>${css}</style>`;

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
      class ${componentJson.name} extends HTMLElement {
        constructor() {
          super();
          
          const self = this;
          this.state = ${getStateObjectString(json, {
            valueMapper: (value, type) => {
              let useValue = value.trim();
              const isMethod = Boolean(
                type === 'function' &&
                  !useValue.startsWith('function') &&
                  useValue.match(/^[a-z0-9]+\s*\(/gi),
              );

              if (isMethod) {
                useValue = `function ${useValue}`;
              }
              const returnVal = stripStateAndPropsRefs(
                stripStateAndPropsRefs(
                  addUpdateAfterSetInCode(useValue, useOptions, 'self.update'),
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
              return isMethod ? returnVal.replace('function', '') : returnVal;
            },
          })};
          ${
            componentHasProps /* TODO: accept these as attributes/properties on the custom element */
              ? `this.props = {};`
              : ''
          }

          ${
            !hasLoop
              ? ''
              : `
            // Helper to pass context down for loops
            this.contextMap = new WeakMap();
          `
          }

          ${useOptions.js}
        }

        connectedCallback() {
          this.innerHTML = \`
      ${html}\`;
          this.update();

          ${
            !json.hooks.onMount
              ? ''
              : // TODO: make prettier by grabbing only the function body
                `
                // onMount
                (${json.hooks.onMount})()`
          }
        }

        update() {
          ${Object.keys(useOptions.onChangeJsById)
            .map((key) => {
              const value = useOptions.onChangeJsById[key];
              if (!value) {
                return '';
              }
              return `
              this.querySelectorAll("[data-name='${key}']").forEach((el) => {
                ${updateReferencesInCode(value, useOptions)}
              })
            `;
            })
            .join('\n\n')}
        }

        ${
          !hasLoop
            ? ''
            : `

          // Helper to render loops
          renderLoop(el, array, template, itemName) {
            el.innerHTML = '';
            for (let value of array) {
              let tmp = document.createElement('span');
              tmp.innerHTML = template.innerHTML;
              Array.from(tmp.children).forEach((child) => {
                this.contextMap.set(child, {
                  ...this.contextMap.get(child),
                  [itemName]: value
                });
                el.appendChild(child);
              });
            }
          }

          getContext(el, name) {
            let parent = el;
            do {
              let context = this.contextMap.get(parent);
              if (context && name in context) {
                return context[name];
              }
            } while (parent = parent.parentNode)
          }
        `
        }
      }

      customElements.define('${componentJson.name
        .replace(/([a-z])([A-Z])/g, '$1-$2')
        .toLowerCase()}', ${componentJson.name});
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
