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
import { collectClassString } from '../stencil/collect-class-string';
import { stripStateAndPropsRefs } from '../../helpers/strip-state-and-props-refs';
import { filterEmptyTextNodes } from '../../helpers/filter-empty-text-nodes';
import { collectCss } from '../../helpers/styles/collect-css';
import { indent } from '../../helpers/indent';
import { mapRefs } from '../../helpers/map-refs';
import { dashCase } from '../../helpers/dash-case';

export interface ToMarkoOptions extends BaseTranspilerOptions {}

// Having issues with this, so off for now
const USE_MARKO_PRETTIER = false;

const blockToMarko = (json: MitosisNode, options: ToMarkoOptions = {}): string => {
  if (json.properties._text) {
    return json.properties._text;
  }
  if (json.bindings._text?.code) {
    return `\${${processBinding(json.bindings?._text.code as string)}}`;
  }

  if (json.name === 'Fragment') {
    return json.children.map((child) => blockToMarko(child, options)).join('\n');
  }

  if (json.name === 'For') {
    return `<for|${json.properties._forName}| of=(${processBinding(
      json.bindings.each?.code as string,
    )})>
      ${json.children
        .filter(filterEmptyTextNodes)
        .map((item) => blockToMarko(item, options))
        .join('\n')}
    </for>`;
  } else if (json.name === 'Show') {
    return `<if(${processBinding(json.bindings.when?.code as string)})>
      ${json.children
        .filter(filterEmptyTextNodes)
        .map((item) => blockToMarko(item, options))
        .join('\n')}</if>
    ${!json.meta.else ? '' : `<else>${blockToMarko(json.meta.else as any, options)}</else>`}`;
  }

  let str = '';

  str += `<${json.name} `;

  const classString = collectClassString(json);
  if (classString) {
    str += ` class=${classString} `;
  }

  if (json.bindings._spread?.code) {
    str += ` ...(${json.bindings._spread.code}) `;
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
      str += ` ref=((el) => this.${code} = el) `;
    } else if (key.startsWith('on')) {
      const useKey = key === 'onChange' && json.name === 'input' ? 'onInput' : key;
      str += ` ${dashCase(useKey)}=(${cusArgs.join(',')} => ${processBinding(code as string)}) `;
    } else {
      str += ` ${key}=(${processBinding(code as string)}) `;
    }
  }
  if (selfClosingTags.has(json.name)) {
    return str + ' />';
  }
  str += '>';
  if (json.children) {
    str += json.children.map((item) => blockToMarko(item, options)).join('\n');
  }

  str += `</${json.name}>`;

  return str;
};

function processBinding(code: string, type: 'attribute' | 'class' = 'attribute') {
  return stripStateAndPropsRefs(
    stripStateAndPropsRefs(code, {
      replaceWith: type === 'class' ? 'this.input.' : 'input.',
      includeProps: true,
      includeState: false,
    }),
    {
      replaceWith: type === 'class' ? 'this.state.' : 'state.',
      includeProps: false,
      includeState: true,
    },
  );
}

export const componentToMarko =
  (options: ToMarkoOptions = {}): Transpiler =>
  ({ component }) => {
    let json = fastClone(component);
    if (options.plugins) {
      json = runPreJsonPlugins(json, options.plugins);
    }
    let css = collectCss(json);

    mapRefs(component, (refName) => `this.${refName}`);

    if (options.plugins) {
      json = runPostJsonPlugins(json, options.plugins);
    }
    stripMetaProperties(json);

    const dataString = getStateObjectStringFromComponent(json, {
      format: 'object',
      data: true,
      functions: true,
      getters: true,
      valueMapper: (code) => processBinding(code, 'class'),
    });

    const methodsString = '';

    const hasState = dataString.length > 5;

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
    ${renderPreComponent({ component: json, target: 'marko' })}

    class {
        ${methodsString}

        ${
          !hasState
            ? ''
            : `onCreate() {
          this.state = ${dataString}
        }`
        }
      
        ${
          !json.hooks.onMount?.code
            ? ''
            : `onMount() { ${processBinding(json.hooks.onMount.code)} }`
        }
        ${
          !json.hooks.onUnMount?.code
            ? ''
            : `onDestroy() { ${processBinding(json.hooks.onUnMount.code)} }`
        }
        ${
          !json.hooks.onUpdate?.length
            ? ''
            : json.hooks.onUpdate.map((hook) => `onRender() { ${processBinding(hook.code)} }`)
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

    // Convert on-click=(...) -> on-click(...)
    htmlString = htmlString.replace(/(on-[a-z]+)=\(/g, (_match, group) => group + '(');

    let finalStr = `
${jsString}
${cssString}
${htmlString}
    `
      .replace(/\n{3,}/g, '\n\n')
      .trim();

    if (options.plugins) {
      finalStr = runPreCodePlugins(finalStr, options.plugins);
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
      finalStr = runPostCodePlugins(finalStr, options.plugins);
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
    .replace(/<if _="([\s\S]+)"\s*>/g, (_match, group) => {
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
