import { format } from 'prettier/standalone';
import { collectCss } from '../helpers/collect-styles';
import { fastClone } from '../helpers/fast-clone';
import { stripStateAndPropsRefs } from '../helpers/strip-state-and-props-refs';
import { selfClosingTags } from '../parsers/jsx';
import { MitosisNode } from '../types/mitosis-node';
import {
  runPostCodePlugins,
  runPostJsonPlugins,
  runPreCodePlugins,
  runPreJsonPlugins,
} from '../modules/plugins';
import { stripMetaProperties } from '../helpers/strip-meta-properties';
import { getStateObjectStringFromComponent } from '../helpers/get-state-object-string';
import { BaseTranspilerOptions, Transpiler } from '../types/config';

export interface ToLiquidOptions extends BaseTranspilerOptions {
  reactive?: boolean;
}

/**
 * Test if the binding expression would be likely to generate
 * valid or invalid liquid. If we generate invalid liquid tags
 * Shopify will reject our PUT to update the template
 */
export const isValidLiquidBinding = (str = '') => {
  const strictMatches = Boolean(
    // Test for our `context.shopify.liquid.*(expression), which
    // we regex out later to transform back into valid liquid expressions
    str.match(/(context|ctx)\s*(\.shopify\s*)?\.liquid\s*\./),
  );

  return (
    strictMatches ||
    // Test is the expression is simple and would map to Shopify bindings	    // Test for our `context.shopify.liquid.*(expression), which
    // e.g. `state.product.price` -> `{{product.price}}	    // we regex out later to transform back into valid liquid expressions
    Boolean(str.match(/^[a-z0-9_\.\s]+$/i))
  );
};

const mappers: {
  [key: string]: (json: MitosisNode, options: ToLiquidOptions) => string;
} = {
  Fragment: (json, options) => {
    return `<div>${json.children
      .map((item) => blockToLiquid(item, options))
      .join('\n')}</div>`;
  },
};

// TODO: spread support
const blockToLiquid = (
  json: MitosisNode,
  options: ToLiquidOptions = {},
): string => {
  if (mappers[json.name]) {
    return mappers[json.name](json, options);
  }

  // TODO: Add support for `{props.children}` bindings

  if (json.properties._text) {
    return json.properties._text;
  }

  if (json.bindings._text?.code) {
    if (!isValidLiquidBinding(json.bindings._text.code as string)) {
      return '';
    }
    return `{{${stripStateAndPropsRefs(json.bindings._text.code as string)}}}`;
  }

  let str = '';

  if (json.name === 'For') {
    if (
      !(
        isValidLiquidBinding(json.bindings.each?.code as string) &&
        isValidLiquidBinding(json.properties._forName as string)
      )
    ) {
      return str;
    }
    str += `{% for ${json.properties._forName} in ${stripStateAndPropsRefs(
      json.bindings.each?.code as string,
    )} %}`;
    if (json.children) {
      str += json.children
        .map((item) => blockToLiquid(item, options))
        .join('\n');
    }

    str += '{% endfor %}';
  } else if (json.name === 'Show') {
    if (!isValidLiquidBinding(json.bindings.when?.code as string)) {
      return str;
    }
    str += `{% if ${stripStateAndPropsRefs(
      json.bindings.when?.code as string,
    )} %}`;
    if (json.children) {
      str += json.children
        .map((item) => blockToLiquid(item, options))
        .join('\n');
    }

    str += '{% endif %}';
  } else {
    str += `<${json.name} `;

    if (
      json.bindings._spread?.code === '_spread' &&
      isValidLiquidBinding(json.bindings._spread.code)
    ) {
      str += `
          {% for _attr in ${json.bindings._spread.code} %}
            {{ _attr[0] }}="{{ _attr[1] }}"
          {% endfor %}
        `;
    }

    for (const key in json.properties) {
      const value = json.properties[key];
      str += ` ${key}="${value}" `;
    }

    for (const key in json.bindings) {
      if (key === '_spread' || key === 'ref' || key === 'css') {
        continue;
      }
      const { code: value } = json.bindings[key]!;
      // TODO: proper babel transform to replace. Util for this
      const useValue = stripStateAndPropsRefs(value);

      if (key.startsWith('on')) {
        // Do nothing
      } else if (isValidLiquidBinding(useValue)) {
        str += ` ${key}="{{${useValue}}}" `;
      }
    }
    if (selfClosingTags.has(json.name)) {
      return str + ' />';
    }
    str += '>';
    if (json.children) {
      str += json.children
        .map((item) => blockToLiquid(item, options))
        .join('\n');
    }

    str += `</${json.name}>`;
  }
  return str;
};

// TODO: add JS support similar to componentToHtml()
export const componentToLiquid =
  (options: ToLiquidOptions = {}): Transpiler =>
  ({ component }) => {
    let json = fastClone(component);
    if (options.plugins) {
      json = runPreJsonPlugins(json, options.plugins);
    }
    const css = collectCss(json);
    stripMetaProperties(json);
    if (options.plugins) {
      json = runPostJsonPlugins(json, options.plugins);
    }
    let str = json.children.map((item) => blockToLiquid(item)).join('\n');

    if (css.trim().length) {
      str += `<style>${css}</style>`;
    }

    if (options.reactive) {
      const stateObjectString = getStateObjectStringFromComponent(json);
      if (stateObjectString.trim().length > 4) {
        str += `<script reactive>
        export default {
          state: ${stateObjectString}
        }
      </script>`;
      }
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
