import { SELF_CLOSING_HTML_TAGS } from '@/constants/html_tags';
import { ToMarkoOptions } from '@/generators/marko/types';
import { dashCase } from '@/helpers/dash-case';
import { dedent } from '@/helpers/dedent';
import { checkIsEvent } from '@/helpers/event-handlers';
import { fastClone } from '@/helpers/fast-clone';
import { filterEmptyTextNodes } from '@/helpers/filter-empty-text-nodes';
import { getRefs } from '@/helpers/get-refs';
import { getStateObjectStringFromComponent } from '@/helpers/get-state-object-string';
import { hasProps } from '@/helpers/has-props';
import { indent } from '@/helpers/indent';
import { mapRefs } from '@/helpers/map-refs';
import { initializeOptions } from '@/helpers/merge-options';
import { getForArguments } from '@/helpers/nodes/for';
import { renderPreComponent } from '@/helpers/render-imports';
import { stripMetaProperties } from '@/helpers/strip-meta-properties';
import { stripStateAndPropsRefs } from '@/helpers/strip-state-and-props-refs';
import { collectCss } from '@/helpers/styles/collect-css';
import {
  runPostCodePlugins,
  runPostJsonPlugins,
  runPreCodePlugins,
  runPreJsonPlugins,
} from '@/modules/plugins';
import { MitosisComponent } from '@/types/mitosis-component';
import { MitosisNode, checkIsForNode } from '@/types/mitosis-node';
import { TranspilerGenerator } from '@/types/transpiler';
import hash from 'hash-sum';
import { camelCase } from 'lodash';
import { format } from 'prettier/standalone';
import { stringifySingleScopeOnMount } from '../helpers/on-mount';

interface InternalToMarkoOptions extends ToMarkoOptions {
  component: MitosisComponent;
}

// Having issues with this, so off for now
const USE_MARKO_PRETTIER = false;

/**
 * Return the names of properties (basic literal values) on state
 */
function getStatePropertyNames(json: MitosisComponent) {
  return Object.keys(json.state).filter((key) => json.state[key]?.type === 'property');
}

const blockToMarko = (json: MitosisNode, options: InternalToMarkoOptions): string => {
  if (json.properties._text) {
    return json.properties._text;
  }
  if (json.bindings._text?.code) {
    return `\${${processBinding(options.component, json.bindings?._text.code as string)}}`;
  }

  if (json.name === 'Fragment') {
    return json.children.map((child) => blockToMarko(child, options)).join('\n');
  }

  if (checkIsForNode(json)) {
    const forArguments = getForArguments(json).join(',');
    return `<for|${forArguments}| of=(${processBinding(
      options.component,
      json.bindings.each?.code as string,
    )})>
      ${json.children
        .filter(filterEmptyTextNodes)
        .map((item) => blockToMarko(item, options))
        .join('\n')}
    </for>`;
  } else if (json.name === 'Show') {
    return `<if(${processBinding(options.component, json.bindings.when?.code as string)})>
      ${json.children
        .filter(filterEmptyTextNodes)
        .map((item) => blockToMarko(item, options))
        .join('\n')}</if>
    ${!json.meta.else ? '' : `<else>${blockToMarko(json.meta.else as any, options)}</else>`}`;
  }

  let str = '';

  str += `<${json.name} `;

  for (const key in json.properties) {
    const value = json.properties[key];
    str += ` ${key}="${value}" `;
  }
  for (const key in json.bindings) {
    const { code, arguments: cusArgs = ['event'], type, async } = json.bindings[key]!;

    if (type === 'spread') {
      str += ` ...(${code}) `;
    } else if (key === 'ref') {
      str += ` key="${camelCase(code)}" `;
    } else if (checkIsEvent(key)) {
      const asyncKeyword = async ? 'async ' : '';
      const useKey = key === 'onChange' && json.name === 'input' ? 'onInput' : key;
      str += ` ${dashCase(useKey)}=(${asyncKeyword}(${cusArgs.join(',')}) => ${processBinding(
        options.component,
        code as string,
      )}) `;
    } else if (key !== 'innerHTML') {
      str += ` ${key}=(${processBinding(options.component, code as string)}) `;
    }
  }
  if (SELF_CLOSING_HTML_TAGS.has(json.name)) {
    return str + ' />';
  }
  str += '>';

  if (json.bindings.innerHTML?.code) {
    str += `$!{${processBinding(options.component, json.bindings.innerHTML.code as string)}}`;
  }

  if (json.children) {
    str += json.children.map((item) => blockToMarko(item, options)).join('\n');
  }

  str += `</${json.name}>`;

  return str;
};

function processBinding(
  json: MitosisComponent,
  code: string,
  type: 'attribute' | 'class' | 'state' = 'attribute',
) {
  try {
    return stripStateAndPropsRefs(
      stripStateAndPropsRefs(code, {
        replaceWith: type === 'state' ? 'input.' : type === 'class' ? 'this.input.' : 'input.',
        includeProps: true,
        includeState: false,
      }),
      {
        replaceWith: (key) => {
          const isProperty = getStatePropertyNames(json).includes(key);
          if (isProperty) {
            return (type === 'state' || type === 'class' ? 'this.state.' : 'state.') + key;
          }
          return (type === 'class' || type === 'state' ? 'this.' : 'component.') + key;
        },
        includeProps: false,
        includeState: true,
      },
    );
  } catch (error) {
    console.error('Marko: could not process binding', code);
    return code;
  }
}

export const componentToMarko: TranspilerGenerator<ToMarkoOptions> =
  (userOptions = {}) =>
  ({ component }) => {
    let json = fastClone(component);
    const options = initializeOptions<InternalToMarkoOptions>({
      target: 'marko',
      component,
      defaults: {
        ...userOptions,
        component: json,
      },
    });

    if (options.plugins) {
      json = runPreJsonPlugins({ json, plugins: options.plugins });
    }
    let css = collectCss(json, {
      prefix: hash(json),
    });

    const domRefs = getRefs(json);
    mapRefs(json, (refName) => `this.${camelCase(refName)}`);

    if (options.plugins) {
      json = runPostJsonPlugins({ json, plugins: options.plugins });
    }
    stripMetaProperties(json);

    const dataString = getStateObjectStringFromComponent(json, {
      format: 'object',
      data: true,
      functions: false,
      getters: false,
      valueMapper: (code) => processBinding(json, code, 'state'),
    });

    const thisHasProps = hasProps(json);

    const methodsString = getStateObjectStringFromComponent(json, {
      format: 'class',
      data: false,
      functions: true,
      getters: true,
      valueMapper: (code) => processBinding(json, code, 'class'),
    });

    const hasState = dataString.trim().length > 5;

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

    let jsString = dedent`
    ${renderPreComponent({
      explicitImportFileExtension: options.explicitImportFileExtension,
      component: json,
      target: 'marko',
    })}

    class {
        ${methodsString}

        ${
          !hasState
            ? ''
            : `onCreate(${thisHasProps ? 'input' : ''}) {
          this.state = ${dataString}
        }`
        }

        ${Array.from(domRefs)
          .map(
            (refName) => `get ${camelCase(refName)}() {
            return this.getEl('${camelCase(refName)}')
          }`,
          )
          .join('\n')}

        ${
          !json.hooks.onMount.length
            ? ''
            : `onMount() { ${processBinding(json, stringifySingleScopeOnMount(json), 'class')} }`
        }
        ${
          !json.hooks.onUnMount?.code
            ? ''
            : `onDestroy() { ${processBinding(json, json.hooks.onUnMount.code, 'class')} }`
        }
        ${
          !json.hooks.onUpdate?.length
            ? ''
            : `onRender() { ${json.hooks.onUpdate
                .map((hook) => processBinding(json, hook.code, 'class'))
                .join('\n\n')} }`
        }
    }
  `;

    let htmlString = json.children.map((item) => blockToMarko(item, options)).join('\n');
    const cssString = css.length
      ? `style {
  ${indent(css, 2).trim()}
}`
      : '';

    if (options.prettier !== false && !USE_MARKO_PRETTIER) {
      try {
        htmlString = markoFormatHtml(htmlString);
      } catch (err) {
        console.warn('Could not format html', err);
      }
      try {
        jsString = format(jsString, {
          parser: 'typescript',
          plugins: [require('prettier/parser-typescript')],
        });
      } catch (err) {
        console.warn('Could not format js', err);
      }
    }

    htmlString = htmlString
      // Convert on-click=(...) -> on-click(...)
      .replace(/(on-[a-z]+)=\(/g, (_match, group) => group + '(')
      // Fix a weird edge case where </if> becomes </if \n > which is invalid in marko
      .replace(/<\/([a-z]+)\s+>/gi, '</$1>');

    let finalStr = `
${jsString}
${cssString}
${htmlString}
    `
      .replace(/\n{3,}/g, '\n\n')
      .trim();

    if (options.plugins) {
      finalStr = runPreCodePlugins({ json, code: finalStr, plugins: options.plugins });
    }

    if (USE_MARKO_PRETTIER && options.prettier !== false) {
      // Commented out for now as there are strange module import issues as
      // a result, causing builds to fail
      // format(finalStr, {
      //   parser: 'marko',
      //   plugins: [require('prettier-plugin-marko')],
      // });
    }

    if (options.plugins) {
      finalStr = runPostCodePlugins({ json, code: finalStr, plugins: options.plugins });
    }
    return finalStr;
  };

/**
 * Convert marko expressions to valid html
 *
 * <div on-click=(() => doSomething())> -> <div on-click="() => doSomething()">
 */
export function preprocessHtml(htmlString: string) {
  return (
    htmlString
      // Convert <for|foo| to <for |foo|, otherwise HTML will think the tag is not just <for> and complain
      // when we close it with </for>
      .replace(/<for\|/g, '<for |')
      // Convert <if(foo) to <if _="foo", otherwise HTML will think the tag is not just <if> and complain
      // when we close it with </if>
      .replace(/<if\(([\s\S]+?)\)\s*>/g, (_match, group) => {
        return `<if _="${encodeAttributeValue(group)}">`;
      })
      .replace(/=\(([\s\S]*?)\)(\s*[a-z\/>])/g, (_match, group, after) => {
        return `="(${encodeAttributeValue(group)})"${after}`;
      })
  );
}

/**
 * Convert HTML back to marko expressions
 *
 * <div on-click="() => doSomething()"> -> <div on-click=(() => doSomething())>
 */
export function postprocessHtml(htmlString: string) {
  return htmlString
    .replace(/<for \|/g, '<for|')
    .replace(/<if _="([\s\S]+?)"\s*>/g, (_match, group) => {
      return `<if(${decodeAttributeValue(group)})>`;
    })
    .replace(/="\(([\s\S]*?)\)"(\s*[a-z\/>])/g, (_match, group, after) => {
      return `=(${decodeAttributeValue(group)})${after}`;
    });
}

// Encode quotes and spaces for HTML attribute values
function encodeAttributeValue(value: string) {
  return value.replace(/"/g, '&quot;').replace(/\n/g, '&#10;');
}

// Decode quotes and spaces for HTML attribute values
function decodeAttributeValue(value: string) {
  return value.replace(/&quot;/g, '"').replace(/&#10;/g, '\n');
}

/**
 * Format Marko HTML using the built-in HTML parser for prettier,
 * given issues with Marko's plugin
 */
export function markoFormatHtml(htmlString: string) {
  return postprocessHtml(
    format(preprocessHtml(htmlString), {
      parser: 'html',
      plugins: [require('prettier/parser-html')],
    }),
  );
}
