import dedent from 'dedent';
import { format } from 'prettier/standalone';
import { getStateObjectStringFromComponent } from '../../helpers/get-state-object-string';
import { renderPreComponent } from '../../helpers/render-imports';
import { selfClosingTags } from '../../parsers/jsx';
import { MitosisNode } from '../../types/mitosis-node';
import {
  runPostCodePlugins,
  runPostJsonPlugins,
  runPreCodePlugins,
  runPreJsonPlugins,
} from '../../modules/plugins';
import { fastClone } from '../../helpers/fast-clone';
import { stripMetaProperties } from '../../helpers/strip-meta-properties';
import { BaseTranspilerOptions, Transpiler } from '../../types/transpiler';
import { collectClassString } from './collect-class-string';
import { getProps } from '../../helpers/get-props';
import { stripStateAndPropsRefs } from '../../helpers/strip-state-and-props-refs';
import { filterEmptyTextNodes } from '../../helpers/filter-empty-text-nodes';
import { dashCase } from '../../helpers/dash-case';
import { collectCss } from '../../helpers/styles/collect-css';
import { indent } from '../../helpers/indent';
import { mapRefs } from '../../helpers/map-refs';
import { getRefs } from '../../helpers/get-refs';
import { camelCase } from 'lodash';
import { isUpperCase } from '../../helpers/is-upper-case';
import { has } from '../../helpers/has';

const getCustomTagName = (name: string, options: ToLitOptions) => {
  if (!name || !isUpperCase(name[0])) {
    return name;
  }

  const kebabCaseName = dashCase(name);
  if (!kebabCaseName.includes('-')) {
    // TODO: option to choose your prefix
    return 'my-' + kebabCaseName;
  }

  return kebabCaseName;
};

export interface ToLitOptions extends BaseTranspilerOptions {
  useShadowDom?: boolean;
}

const blockToLit = (json: MitosisNode, options: ToLitOptions = {}): string => {
  if (json.properties._text) {
    return json.properties._text;
  }
  if (json.bindings._text?.code) {
    return `\${${processBinding(json.bindings?._text.code as string)}}`;
  }

  if (json.name === 'For') {
    return `\${${processBinding(json.bindings.each?.code as string)}?.map((${
      json.properties._forName
    }, index) => (
      html\`${json.children
        .filter(filterEmptyTextNodes)
        .map((item) => blockToLit(item, options))
        .join('\n')}\`
    ))}`;
  } else if (json.name === 'Show') {
    return `\${${processBinding(json.bindings.when?.code as string)} ?
      html\`${json.children
        .filter(filterEmptyTextNodes)
        .map((item) => blockToLit(item, options))
        .join('\n')}\`
    : ${!json.meta.else ? 'null' : `html\`${blockToLit(json.meta.else as any, options)}\``}}`;
  }

  let str = '';

  const tagName = getCustomTagName(json.name, options);
  str += `<${tagName} `;

  const classString = collectClassString(json);
  if (classString) {
    str += ` class=${classString} `;
  }

  if (json.bindings._spread?.code) {
    str += ` \${spread(${json.bindings._spread.code})} `;
  }

  for (const key in json.properties) {
    const value = json.properties[key];
    str += ` ${key}="${value}" `;
  }
  for (const key in json.bindings) {
    const { code, arguments: cusArgs = ['event'] } = json.bindings[key]!;
    if (key === '_spread' || key === '_forName') {
      continue;
    }

    if (key === 'ref') {
      // TODO: maybe use ref directive instead
      // https://lit.dev/docs/templates/directives/#ref
      str += ` ref="${code}" `;
    } else if (key.startsWith('on')) {
      let useKey = key === 'onChange' && json.name === 'input' ? 'onInput' : key;
      useKey = '@' + useKey.substring(2).toLowerCase();
      str += ` ${useKey}=\${${cusArgs.join(',')} => ${processBinding(code as string)}} `;
    } else {
      const value = processBinding(code as string);
      // If they key includes a '-' it's an attribute, not a property
      if (key.includes('-')) {
        str += ` ${key}=\${${value}} `;
      } else {
        // TODO: handle boolean attributes too by matching list of html boolean attributes
        // https://lit.dev/docs/templates/expressions/#boolean-attribute-expressions
        str += ` .${key}=\${${value}} `;
      }
    }
  }
  if (selfClosingTags.has(json.name)) {
    return str + ' />';
  }
  str += '>';
  if (json.children) {
    str += json.children.map((item) => blockToLit(item, options)).join('\n');
  }

  str += `</${tagName}>`;

  return str;
};

function processBinding(code: string) {
  return stripStateAndPropsRefs(code, { replaceWith: 'this.' });
}

export const componentToLit =
  (options: ToLitOptions = {}): Transpiler =>
  ({ component }) => {
    let json = fastClone(component);
    if (options.plugins) {
      json = runPreJsonPlugins(json, options.plugins);
    }
    const props = getProps(component);
    let css = collectCss(json);

    const domRefs = getRefs(json);
    mapRefs(component, (refName) => `this.${camelCase(refName)}`);

    if (options.plugins) {
      json = runPostJsonPlugins(json, options.plugins);
    }
    stripMetaProperties(json);

    const dataString = getStateObjectStringFromComponent(json, {
      format: 'class',
      data: true,
      functions: false,
      getters: false,
      keyPrefix: '@state() ',
      valueMapper: (code) => processBinding(code),
    });

    const methodsString = getStateObjectStringFromComponent(json, {
      format: 'class',
      data: false,
      functions: true,
      getters: true,
      valueMapper: (code) => processBinding(code),
    });

    if (options.prettier !== false) {
      try {
        css = format(css, {
          parser: 'css',
          plugins: [require('prettier/parser-postcss')],
        });
      } catch (err) {
        console.warn('Could not format css', err);
      }
    }

    let html = json.children.map((item) => blockToLit(item, options)).join('\n');

    const hasSpread = has(json, (node) => Boolean(node.bindings._spread));

    if (options.prettier !== false) {
      try {
        css = format(css, {
          parser: 'css',
          plugins: [require('prettier/parser-postcss')],
        });
      } catch (err) {
        console.warn('Could not format css', err);
      }
      try {
        html = format(html, {
          parser: 'html',
          plugins: [require('prettier/parser-html')],
        });
      } catch (err) {
        // If can't format HTML (this can happen with lit given it is tagged template strings),
        // at least remove excess space
        html = html.replace(/\n{3,}/g, '\n\n');
      }
    }

    let str = dedent`
    ${renderPreComponent({ component: json, target: 'lit' })}
    import { LitElement, html, css } from 'lit';
    import { customElement, property, state, query } from 'lit/decorators.js';

    ${json.types ? json.types.join('\n') : ''}
    ${
      hasSpread
        ? `
      const spread = (properties) =>
        directive((part) => {
          for (const property in properties) {
            const value = properties[attr];
            part.element[property] = value;
          }
        });
    `
        : ''
    }

    @customElement('${json.meta.useMetadata?.tagName || getCustomTagName(json.name, options)}')
    export default class ${json.name} extends LitElement {
      ${
        options.useShadowDom
          ? ''
          : `
        createRenderRoot() {
          return this;
        }
        `
      }

      ${
        options.useShadowDom && css.length
          ? `static styles = css\`
      ${indent(css, 8)}\`;`
          : ''
      }

      ${Array.from(domRefs)
        .map(
          (refName) => `
          @query('[ref="${refName}"]')
          ${camelCase(refName)}!: HTMLElement;
          `,
        )
        .join('\n')}
    
  
      ${Array.from(props)
        .map((item) => `@property() ${item}: any`)
        .join('\n')}

        ${dataString}
        ${methodsString}
      
        ${
          !json.hooks.onMount?.code
            ? ''
            : `connectedCallback() { ${processBinding(json.hooks.onMount.code)} }`
        }
        ${
          !json.hooks.onUnMount?.code
            ? ''
            : `disconnectedCallback() { ${processBinding(json.hooks.onUnMount.code)} }`
        }
        ${
          !json.hooks.onUpdate?.length
            ? ''
            : `updated() { 
              ${json.hooks.onUpdate.map((hook) => processBinding(hook.code)).join('\n\n')} 
            }`
        }
    
      render() {
        return html\`
          ${options.useShadowDom || !css.length ? '' : `<style>${css}</style>`}
          ${indent(html, 8)}
        \`
      }
    }
  `;

    if (options.plugins) {
      str = runPreCodePlugins(str, options.plugins);
    }
    if (options.prettier !== false) {
      try {
        str = format(str, {
          parser: 'typescript',
          plugins: [require('prettier/parser-typescript')],
        });
      } catch (err) {
        console.warn('Could not format Lit typescript', err);
      }
    }
    if (options.plugins) {
      str = runPostCodePlugins(str, options.plugins);
    }
    return str;
  };
