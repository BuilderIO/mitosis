import { dashCase } from '@/helpers/dash-case';
import { dedent } from '@/helpers/dedent';
import { fastClone } from '@/helpers/fast-clone';
import { filterEmptyTextNodes } from '@/helpers/filter-empty-text-nodes';
import { getProps } from '@/helpers/get-props';
import { getRefs } from '@/helpers/get-refs';
import { getStateObjectStringFromComponent } from '@/helpers/get-state-object-string';
import { has } from '@/helpers/has';
import { indent } from '@/helpers/indent';
import { isUpperCase } from '@/helpers/is-upper-case';
import { mapRefs } from '@/helpers/map-refs';
import { initializeOptions } from '@/helpers/merge-options';
import { renderPreComponent } from '@/helpers/render-imports';
import { stripMetaProperties } from '@/helpers/strip-meta-properties';
import { stripStateAndPropsRefs } from '@/helpers/strip-state-and-props-refs';
import { collectCss } from '@/helpers/styles/collect-css';
import { checkIsForNode, MitosisNode } from '@/types/mitosis-node';
import { BaseTranspilerOptions, TranspilerGenerator } from '@/types/transpiler';
import { camelCase, some } from 'lodash';
import { format } from 'prettier/standalone';
import { SELF_CLOSING_HTML_TAGS } from '../../constants/html_tags';
import {
  runPostCodePlugins,
  runPostJsonPlugins,
  runPreCodePlugins,
  runPreJsonPlugins,
} from '../../modules/plugins';
import { stringifySingleScopeOnMount } from '../helpers/on-mount';
import { collectClassString } from './collect-class-string';

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

  if (checkIsForNode(json)) {
    return `\${${processBinding(json.bindings.each?.code as string)}?.map((${
      json.scope.forName
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

  for (const key in json.properties) {
    const value = json.properties[key];
    str += ` ${key}="${value}" `;
  }
  for (const key in json.bindings) {
    const { code, arguments: cusArgs = ['event'], type } = json.bindings[key]!;

    if (type === 'spread') {
      str += ` \${spread(${code})} `;
    } else if (key === 'ref') {
      // TODO: maybe use ref directive instead
      // https://lit.dev/docs/templates/directives/#ref
      str += ` ref="${code}" `;
    } else if (key.startsWith('on')) {
      const useKey = '@' + key.substring(2).toLowerCase();
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
  if (SELF_CLOSING_HTML_TAGS.has(json.name)) {
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

export const componentToLit: TranspilerGenerator<ToLitOptions> =
  (_options = {}) =>
  ({ component }) => {
    const options = initializeOptions({ target: 'lit', component, defaults: _options });

    let json = fastClone(component);
    if (options.plugins) {
      json = runPreJsonPlugins({ json, plugins: options.plugins });
    }
    const props = getProps(component);
    let css = collectCss(json);

    const domRefs = getRefs(json);
    mapRefs(component, (refName) => `this.${camelCase(refName)}`);

    if (options.plugins) {
      json = runPostJsonPlugins({ json, plugins: options.plugins });
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

    const hasSpread = has(json, (node) => some(node.bindings, { type: 'spread' }));

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
    ${renderPreComponent({
      explicitImportFileExtension: options.explicitImportFileExtension,
      component: json,
      target: 'lit',
    })}
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
          json.hooks.onMount.length === 0
            ? ''
            : `connectedCallback() { ${processBinding(stringifySingleScopeOnMount(json))} }`
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
      str = runPreCodePlugins({ json, code: str, plugins: options.plugins });
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
      str = runPostCodePlugins({ json, code: str, plugins: options.plugins });
    }
    return str;
  };
