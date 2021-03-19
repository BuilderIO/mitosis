import { NodePath, types } from '@babel/core';
import { camelCase } from 'lodash';
import { format } from 'prettier/standalone';
import { hasProps } from '../helpers/has-props';
import traverse from 'traverse';
import { babelTransformExpression } from '../helpers/babel-transform';
import { collectCss } from '../helpers/collect-styles';
import { dashCase } from '../helpers/dash-case';
import { fastClone } from '../helpers/fast-clone';
import { hasComponent } from '../helpers/has-component';
import { isComponent } from '../helpers/is-component';
import { isJsxLiteNode } from '../helpers/is-jsx-lite-node';
import { replaceIdentifiers } from '../helpers/replace-idenifiers';
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
import isChildren from '../helpers/is-children';

type ToQootOptions = {
  prettier?: boolean;
  plugins?: Plugin[];
  prefix?: string;
};

type StringRecord = { [key: string]: string };
type NumberRecord = { [key: string]: number };
type InternalToQootOptions = ToQootOptions & {
  onChangeJsById: StringRecord;
  js: string;
  namesMap: NumberRecord;
};

const addUpdateAfterSet = (
  json: JSXLiteComponent,
  options: InternalToQootOptions,
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
  options: InternalToQootOptions,
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
            (name) => `getContext(el, "${name}")`,
          ) as string;
        }
      }
    }
  });
};

const mappers: {
  [key: string]: (json: JSXLiteNode, options: InternalToQootOptions) => string;
} = {
  Fragment: (json, options) => {
    return json.children.map((item) => blockToQoot(item, options)).join('\n');
  },
};

const getId = (json: JSXLiteNode, options: InternalToQootOptions) => {
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

const updateReferencesInCode = (
  code: string,
  options: InternalToQootOptions,
) => {
  return code;
};

// TODO: spread support
const blockToQoot = (json: JSXLiteNode, options: InternalToQootOptions) => {
  const hasData = Object.keys(json.bindings).length;
  let elId = '';

  if (mappers[json.name]) {
    return mappers[json.name](json, options);
  }

  if (isChildren(json)) {
    return `<slot></slot>`;
  }

  if (json.properties._text) {
    return json.properties._text;
  }
  // TODO: how text bindings
  // if (json.bindings._text) {
  //   return `<span data-name="${elId}"><!-- ${(json.bindings
  //     ._text as string).replace(
  //     /getContext\(el, "([^"]+)"\)/g,
  //     '$1',
  //   )} --></span>`;
  // }

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
        let template = document.querySelector('[data-template-for="${elId}"]');
        renderLoop(el, array, template, "${itemName}");
      `,
    );
    // TODO: decide on how to handle this...
    str += `
      <span data-name="${elId}"></span>
      <template data-template-for="${elId}">`;
    if (json.children) {
      str += json.children.map((item) => blockToQoot(item, options)).join('\n');
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
      str += json.children.map((item) => blockToQoot(item, options)).join('\n');
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
          function ${fnName} (event) {
            ${updateReferencesInCode(useValue, options)}
          }
        `;
        const fnIdentifier = fnName;
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
            `;Object.assign(el.style, ${useValue});`,
          );
        } else {
          const useAttribute = key.includes('-');
          addOnChangeJs(
            elId,
            options,
            useAttribute
              ? `;el.setAttribute(${key}, ${useValue});`
              : `;el.${key} = ${useValue}`,
          );
        }
      }
    }
    if (selfClosingTags.has(json.name)) {
      return str + ' />';
    }
    str += '>';
    if (json.children) {
      str += json.children.map((item) => blockToQoot(item, options)).join('\n');
    }
    if (json.properties.innerHTML) {
      // Maybe put some kind of safety here for broken HTML such as no close tag
      str += htmlDecode(json.properties.innerHTML);
    }

    str += `</${json.name}>`;
  }
  return str;
};

function addUpdateAfterSetInCode(
  code: string,
  options: InternalToQootOptions,
  useString = 'markDirty(this)',
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

const htmlDecode = (html: string) => html.replace(/&quot;/gi, '"');

type OutputFile = {
  name: string;
  content: string;
};

// TODO: props support via custom elements
export const componentToQoot = (
  componentJson: JSXLiteComponent,
  options: ToQootOptions = {},
) => {
  const useOptions: InternalToQootOptions = {
    ...options,
    onChangeJsById: {},
    js: '',
    namesMap: {},
  };
  let json = fastClone(componentJson);
  if (options.plugins) {
    json = runPreJsonPlugins(json, options.plugins);
  }
  replaceForNameIdentifiers(json, useOptions);
  addUpdateAfterSet(json, useOptions);
  const componentHasProps = hasProps(json);

  const hasLoop = hasComponent('For', json);

  if (options.plugins) {
    json = runPostJsonPlugins(json, options.plugins);
  }
  const css = collectCss(json, {
    prefix: options.prefix,
  });

  let str = json.children
    .map((item) => blockToQoot(item, useOptions))
    .join('\n');

  if (css.trim().length) {
    str += `<style>${css}</style>`;
  }

  const hasChangeListeners = Boolean(
    Object.keys(useOptions.onChangeJsById).length,
  );
  const hasGeneratedJs = Boolean(useOptions.js.trim().length);

  const files: OutputFile[] = [];

  if (hasChangeListeners || hasGeneratedJs || json.hooks.onMount || hasLoop) {
    // TODO: gnerate state and functions
    // each function must reference state and other functions
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
  return {
    files: [
      {
        path: 'index.html',
        content: str,
      },
    ],
  };
};
