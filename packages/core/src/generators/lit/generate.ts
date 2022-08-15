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

export interface ToLitOptions extends BaseTranspilerOptions {}

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
    : ${!json.meta.else ? 'null' : blockToLit(json.meta.else as any, options)}}`;
  }

  let str = '';

  const tagName = isUpperCase(json.name[0]) ? dashCase(json.name) : json.name;
  str += `<${tagName} `;

  const classString = collectClassString(json);
  if (classString) {
    str += ` class=${classString} `;
  }

  if (json.bindings._spread?.code) {
    // Lit currently does not support spread, it's been an open PR
    // for a year https://github.com/lit/lit/pull/1960/files
    // str += ` \${...(${json.bindings._spread.code})} `;
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
      str += ` ref="${code}" `;
    } else if (key.startsWith('on')) {
      let useKey = key === 'onChange' && json.name === 'input' ? 'onInput' : key;
      useKey = '@' + useKey.substring(2).toLowerCase();
      str += ` ${useKey}=\${${cusArgs.join(',')} => ${processBinding(code as string)}} `;
    } else {
      str += ` ${key}=\${${processBinding(code as string)}} `;
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
        console.warn('Could not format html', err);
        // If can't format HTML (this can happen with lit given it is tagged template strings),
        // at least remove excess space
        html = html.replace(/\n{3,}/g, '\n\n');
      }
    }

    let str = dedent`
    ${renderPreComponent({ component: json, target: 'lit' })}
    import { LitElement, html, css } from 'lit';
    import { customElement, property, state } from 'lit/decorators.js';

    ${json.types ? json.types.join('\n') : ''}

    @customElement('${json.meta.useMetadata?.tagName || dashCase(json.name)}')
    export default class ${json.name} extends LitElement {
      ${
        css.length
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
            : json.hooks.onUpdate.map((hook) => `updated() { ${processBinding(hook.code)} }`)
        }
    
      render() {
        return html\`
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
