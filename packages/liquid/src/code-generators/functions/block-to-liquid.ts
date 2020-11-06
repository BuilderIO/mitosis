import { BuilderElement } from '@builder.io/sdk';
import { size, set, last, uniq, identity } from 'lodash';
import { sizes, sizeNames } from '../constants/sizes';
import { Options } from '../interfaces/options';
import { StringMap } from '../interfaces/string-map';
import { mapToCss } from './map-to-css';
import { fastClone } from './fast-clone';
import { getComponentInfo } from '../constants/components';

import '../components/text';
import '../components/columns';
import '../components/image';
import '../components/assign';
import '../components/fragment';
import '../components/capture';
import '../components/section';
import '../components/button';
import '../components/symbol';
import '../components/condition';
import '../components/unless';
import '../components/paginate';
import '../components/for';
import '../components/custom-code';
import '../components/state-provider';
import '../components/form';
import '../components/widgets/accordion';
import '../components/widgets/carousel';
import '../components/shopify-section';
import '../components/shopify-section-ref';
import '../components/liquid-block';
import '../components/theme-provider';
import '../components/raw-img';
import '../components/wrapper-tag';
import '../components/static-content';

// These are legacy and can hopefully be removed
import '../components/forms/form';
import '../components/forms/label';
import '../components/forms/input';
import '../components/forms/submit-button';

import { isValidLiquidBinding } from './is-valid-liquid-binding';
import { mapToAttributes } from './map-to-attributes';

const voidElements = new Set([
  'area',
  'base',
  'br',
  'col',
  'embed',
  'hr',
  'img',
  'input',
  'link',
  'meta',
  'param',
  'source',
  'track',
  'wbr',
]);

const isLiquidRender = (binding: string) => {
  return binding.replace(/\s/g, '').match('.liquid.render');
};

const isLiquidConditional = (binding: string) => {
  return binding.replace(/\s/g, '').match('.liquid.condition');
};

const getConditionalAttr = (value: string, noEnd = false): string => {
  const closingTag = noEnd ? '' : '{% endif %}';
  return (
    value
      .split('/*start*/')
      .reverse()
      .filter(st => st.includes('liquid'))
      .map(statement => statement.replace(/`/g, '"'))
      .map(statement => {
        const expression = statement.startsWith('!')
          ? 'else'
          : !statement.includes('!')
          ? 'if'
          : '';
        const condition =
          expression === 'if'
            ? statement.match(/context\.(shopify\.)?liquid\.condition\("([^"]*)"/)?.[2]
            : '';
        const index = statement.indexOf('&&');
        const branchValue =
          index > -1 ? getConditionalAttr(statement.substr(index + 2), true) : getValue(statement);

        if (expression) {
          return `{% ${expression} ${condition} %} ${branchValue}`;
        }
        return branchValue + '{% endif %}';
      })
      .join('') + closingTag
  );
};

const removeShopifyContext = (str: string) => {
  const usesSingleQuotes = Boolean(str.match(/\.\s*(get|render)\('/));
  if (usesSingleQuotes) {
    return str.replace(
      /(context|state)\s*\.\s*(shopify\s*\.)?\s*liquid\s*\.\s*(get|render)\s*\(\s*(\\'|')([^']+)(\\'|')\s*.*\)/g,
      '$5'
    );
  }
  return str.replace(
    /(context|state)\s*\.\s*(shopify\s*\.)?\s*liquid\s*\.\s*(get|render)\s*\(\s*(\\"|")([^"]+)(\\"|")\s*.*\)/g,
    '$5'
  );
};

const getValue = (condition: string) => {
  const value = condition.match(/\? (.*) :/)?.[1];
  if (value) {
    return removeShopifyContext(value.replace(/{{'(.*?)'}}/g, '$1').replace(/'/g, ''));
  }
};

/**
 * Extract a liquid expression from our JS structure - i.e. transform
 * "context.shopify.liquid.condition('some | liquid')" to "some | liquid"
 */
export const getLiquidConditionExpresion = (expression: string) => {
  const matched = expression.match(
    /context\s*\.\s*(shopify\s*\.)?\s*liquid\s*\.\s*condition\s*\(\s*['"]([\s\S]*?)['"]\s*,\s*state\s*\)\s*/i
  )?.[2];

  return matched || 'null';
};

// TODO: move most or all of this to transformers and functions
const convertBinding = (binding: string, options: Options) => {
  let value = binding;
  const isShopifyContext = value.replace(/\s/g, '').includes('.liquid');

  if (!isValidLiquidBinding(binding, options)) {
    return '';
  }

  if (isLiquidConditional(value)) {
    value = getConditionalAttr(value);
  } else if (isShopifyContext) {
    value = removeShopifyContext(value);
  }

  if (options.looseBindings) {
    // We use state, Shopify uses global vars, so convert
    // state.product.title to {{ product.title}}, etc
    if (value.includes('state.')) {
      value = value.replace(/state\./g, '');
    }

    if (value.includes('context.')) {
      value = value.replace(/context\./g, '');
    }
  }

  return value;
};

export function blockToLiquid(json: BuilderElement, options: Options = {}): string {
  const block = fastClone(json);

  const bindings = {
    ...block.bindings,
    ...(block as any).code?.bindings,
  };

  const hasInvalidHide = bindings.hide && !isValidLiquidBinding(bindings.hide, options);
  const hasInvalidShow = bindings.show && !isValidLiquidBinding(bindings.show, options);
  const hasInvalidRepeat =
    block.repeat &&
    block.repeat.collection &&
    !isValidLiquidBinding(block.repeat.collection, options);

  if (hasInvalidHide || hasInvalidShow || hasInvalidRepeat) {
    return '';
  }

  const styles: StringMap = {};

  if (bindings && !options.static) {
    for (const key in bindings) {
      const binding = bindings[key];
      if (!key || !binding || key === 'hide') {
        continue;
      }

      const value = convertBinding(binding, options);

      let valueString;
      if (!value) {
        valueString = '';
      } else if (isLiquidRender(binding) || isLiquidConditional(binding)) {
        valueString = value;
      } else {
        valueString = `{{ ${value} }}`;
      }

      // Preserve default styles for those bound
      if (!value && key.startsWith('style')) {
        continue;
      }

      if (key.startsWith('properties.') || !key.includes('.')) {
        if (!block.properties) {
          block.properties = {};
        }
        const name = key.startsWith('properties.') ? key.replace(/^\s*properties\s*\./, '') : key;
        set(block.properties, name, valueString);
      } else if (key.startsWith('component.options.') || key.startsWith('options.')) {
        const name = key.replace(/^.*?options\./, '');
        if (!block.component) {
          continue;
        }
        if (!block.component.options) {
          block.component.options = {};
        }
        set(block.component.options, name, valueString);
      } else if (key.startsWith('style.')) {
        const name = key.replace('style.', '');
        set(styles, name, valueString);
      } else if (key === 'attr.style') {
        if (!block.properties) {
          block.properties = {};
        }
        set(block.properties, 'style', valueString);
      }
    }
  }

  // TODO: bindings with {{}} as values
  const css = blockCss(block, options);

  const stylesList: string[] = [];
  if (size(styles)) {
    stylesList.push(mapToCss(styles, 0));
  }
  if (block.properties?.style) {
    stylesList.push(block.properties.style);
  }

  const bindingClass = block.bindings?.class && convertBinding(block.bindings.class, options);
  const classes = uniq([
    'builder-block',
    block.id,
    block.class,
    bindingClass,
    block.properties?.class,
  ]).filter(identity);

  const componentInfo = block.component && getComponentInfo(block.component.name);

  const attributes = mapToAttributes({
    ...block.properties,
    ['builder-id']: block.id,
    class: classes.join(' '),
    ...(size(stylesList) && {
      style: stylesList.join(';'),
    }),
    ...(componentInfo?.preserveFullBuilderId && {
      'builder-full-id': block.id,
    }),
  });

  const tag = block.tagName || (block.properties && block.properties.href ? 'a' : 'div');

  if (options.openingTagOnly) {
    return `<${tag}${attributes ? ' ' + attributes : ''}>`;
  }

  if (block.component && !componentInfo) {
    console.warn(`Could not find component: ${block.component.name}`);
  }

  let collectionName =
    block.repeat && last((block.repeat.collection || '').trim().split('(')[0].trim().split('.'));

  if (collectionName) {
    collectionName = convertBinding(collectionName, options);
  }

  const componentStr =
    componentInfo && componentInfo.noWrap
      ? componentInfo.component(block, options, attributes)
      : `
      <${tag}${attributes ? ' ' + attributes : ''}>
        ${
          (componentInfo && componentInfo.component(block, options)) ||
          (block.children &&
            block.children
              .map((child: BuilderElement) => blockToLiquid(child, options))
              .join('\n')) ||
          ''
        }
      ${!voidElements.has(tag) ? `</${tag}>` : ''}`;

  if (options.componentOnly) {
    return componentStr;
  }

  return `
    ${css.trim() ? `<style>${css}</style>` : ''}
    ${
      !options.static &&
      block.repeat &&
      block.repeat.collection &&
      isValidLiquidBinding(block.repeat.collection, options)
        ? `{% for ${block.repeat.itemName || collectionName + '_item'} in ${convertBinding(
            block.repeat.collection,
            options
          )} %}`
        : ''
    }
    ${
      !options.static && bindings.hide
        ? `{% unless  ${
            !isValidLiquidBinding(bindings.hide, options)
              ? 'false'
              : convertBinding(bindings.hide, options)
          } %}`
        : ''
    }
    ${
      !options.static && bindings.show
        ? `{% if  ${
            !isValidLiquidBinding(bindings.show, options)
              ? 'false'
              : convertBinding(bindings.show, options)
          } %}`
        : ''
    }
    ${componentStr}
    ${!options.static && bindings.hide ? '{% endunless %}' : ''}
    ${!options.static && bindings.show ? '{% endif %}' : ''}
    ${!options.static && block.repeat && block.repeat.collection ? '{% endfor %}' : ''}
  `;
}

// TODO: make these core functions and share with react, vue, etc
// TODO: apply style bindings and default animation
function blockCss(block: BuilderElement, options: Options = {}) {
  // TODO: handle style bindings
  const self = block;

  const baseStyles: Partial<CSSStyleDeclaration> = {
    ...(self.responsiveStyles && self.responsiveStyles.large),
  };

  let css = options.emailMode
    ? ''
    : `.builder-block.${self.id} {${mapToCss(baseStyles as StringMap)}}`;

  const reversedNames = sizeNames.slice().reverse();
  if (self.responsiveStyles) {
    for (const size of reversedNames) {
      if (options.emailMode && size === 'large') {
        continue;
      }
      if (
        size !== 'large' &&
        size !== 'xsmall' &&
        self.responsiveStyles[size] &&
        Object.keys(self.responsiveStyles[size] as any).length
      ) {
        // TODO: this will not work as expected for a couple things that are handled specially,
        // e.g. width
        css += `\n@media only screen and (max-width: ${sizes[size].max}px) { \n${
          options.emailMode ? '.' : '.builder-block.'
        }${self.id + (options.emailMode ? '-subject' : '')} {${mapToCss(
          self.responsiveStyles[size] as any,
          4,
          options.emailMode
        )} } }`;
      }
    }
  }
  return css;
}
