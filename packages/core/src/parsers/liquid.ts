import { BuilderElement } from '@builder.io/sdk';
import axiosRaw from 'axios';
import { Liquid, ParseStream, ITemplate } from 'liquidjs';
import {
  attempt,
  capitalize,
  cloneDeep,
  compact,
  flatten,
  get,
  isError,
  isNull,
  kebabCase,
  last,
  mergeWith,
  omit,
  snakeCase,
  set,
  size,
  identity,
  uniq,
} from 'lodash';
import hash from 'object-hash';
import * as htmlParser from 'prettier/parser-html';
import { format } from 'prettier/standalone';
import traverse from 'traverse';
import * as compiler from 'vue-template-compiler';
import { fastClone } from '../helpers/fast-clone';
import { isValidLiquidBinding } from '../generators/liquid';
import { mapToAttributes } from '../helpers/map-to-attributes';
import { StringMap } from '../types/string-map';
import { mapToCss } from '../helpers/map-to-css';
import { createBuilderElement } from '..';

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

// TODO: move to core
type Size = 'large' | 'medium' | 'small' | 'xsmall';
const sizeNames: Size[] = ['xsmall', 'small', 'medium', 'large'];
const sizes = {
  xsmall: {
    min: 0,
    default: 0,
    max: 0,
  },
  small: {
    min: 320,
    default: 321,
    max: 640,
  },
  medium: {
    min: 641,
    default: 642,
    max: 991,
  },
  large: {
    min: 990,
    default: 991,
    max: 1200,
  },
  getWidthForSize(size: Size) {
    return this[size].default;
  },
  getSizeForWidth(width: number) {
    for (const size of sizeNames) {
      const value = this[size];
      if (width <= value.max) {
        return size;
      }
    }
    return 'large';
  },
};

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
      .filter((st) => st.includes('liquid'))
      .map((statement) => statement.replace(/`/g, '"'))
      .map((statement) => {
        const expression = statement.startsWith('!')
          ? 'else'
          : !statement.includes('!')
          ? 'if'
          : '';
        const condition =
          expression === 'if'
            ? statement.match(
                /context\.(shopify\.)?liquid\.condition\("([^"]*)"/,
              )?.[2]
            : '';
        const index = statement.indexOf('&&');
        const branchValue =
          index > -1
            ? getConditionalAttr(statement.substr(index + 2), true)
            : getValue(statement);

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
      '$5',
    );
  }
  return str.replace(
    /(context|state)\s*\.\s*(shopify\s*\.)?\s*liquid\s*\.\s*(get|render)\s*\(\s*(\\"|")([^"]+)(\\"|")\s*.*\)/g,
    '$5',
  );
};

const getValue = (condition: string) => {
  const value = condition.match(/\? (.*) :/)?.[1];
  if (value) {
    return removeShopifyContext(
      value.replace(/{{'(.*?)'}}/g, '$1').replace(/'/g, ''),
    );
  }
};

/**
 * Extract a liquid expression from our JS structure - i.e. transform
 * "context.shopify.liquid.condition('some | liquid')" to "some | liquid"
 */
export const getLiquidConditionExpresion = (expression: string) => {
  const matched = expression.match(
    /context\s*\.\s*(shopify\s*\.)?\s*liquid\s*\.\s*condition\s*\(\s*['"]([\s\S]*?)['"]\s*,\s*state\s*\)\s*/i,
  )?.[2];

  return matched || 'null';
};

// TODO: move most or all of this to transformers and functions
const convertBinding = (binding: string, options: Options) => {
  let value = binding;
  const isShopifyContext = value.replace(/\s/g, '').includes('.liquid');

  if (!isValidLiquidBinding(binding)) {
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

interface Options {
  emailMode?: boolean;
  extractCss?: boolean;
  minify?: boolean;
  includeJson?: boolean;
  skipPrettier?: boolean;
  wrap?: boolean;
  useBuilderSignature?: boolean;
  componentOnly?: boolean;
  openingTagOnly?: boolean;
  // Render static HTML, removing bindings and content with conditions or repeats
  static?: boolean;
  // If true, will try to convert `state.*` to just `*`
  // Not recommended, only for backwards compatability for Bloomwell's product page
  looseBindings?: boolean;
}

export function blockToLiquid(
  json: BuilderElement,
  options: Options = {},
): string {
  const block = fastClone(json);

  const bindings = {
    ...block.bindings,
    ...(block as any).code?.bindings,
  };

  const hasInvalidHide = bindings.hide && !isValidLiquidBinding(bindings.hide);
  const hasInvalidShow = bindings.show && !isValidLiquidBinding(bindings.show);
  const hasInvalidRepeat =
    block.repeat &&
    block.repeat.collection &&
    !isValidLiquidBinding(block.repeat.collection);

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
        const name = key.startsWith('properties.')
          ? key.replace(/^\s*properties\s*\./, '')
          : key;
        set(block.properties, name, valueString);
      } else if (
        key.startsWith('component.options.') ||
        key.startsWith('options.')
      ) {
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

  const bindingClass =
    block.bindings?.class && convertBinding(block.bindings.class, options);
  const classes = uniq([
    // 'builder-block',
    block.id,
    block.class,
    bindingClass,
    block.properties?.class,
  ]).filter(identity);

  const componentInfo = null;

  const attributes = mapToAttributes({
    ...block.properties,
    // ['builder-id']: block.id,
    class: classes.join(' '),
    ...(size(stylesList) && {
      style: stylesList.join(';'),
    }),
  });

  const tag =
    block.tagName || (block.properties && block.properties.href ? 'a' : 'div');

  if (options.openingTagOnly) {
    return `<${tag}${attributes ? ' ' + attributes : ''}>`;
  }

  if (block.component && !componentInfo) {
    console.warn(`Could not find component: ${block.component.name}`);
  }

  let collectionName =
    block.repeat &&
    last(
      (block.repeat.collection || '')
        .trim()
        .split('(')[0]
        .trim()
        .split('.'),
    );

  if (collectionName) {
    collectionName = convertBinding(collectionName, options);
  }

  return `
    ${css.trim() ? `<style>${css}</style>` : ''}
    ${
      !options.static &&
      block.repeat &&
      block.repeat.collection &&
      isValidLiquidBinding(block.repeat.collection)
        ? `{% for ${block.repeat.itemName ||
            collectionName + '_item'} in ${convertBinding(
            block.repeat.collection,
            options,
          )} %}`
        : ''
    }
    ${
      !options.static && bindings.hide
        ? `{% unless  ${
            !isValidLiquidBinding(bindings.hide)
              ? 'false'
              : convertBinding(bindings.hide, options)
          } %}`
        : ''
    }
    ${
      !options.static && bindings.show
        ? `{% if  ${
            !isValidLiquidBinding(bindings.show)
              ? 'false'
              : convertBinding(bindings.show, options)
          } %}`
        : ''
    }
    ${!options.static && bindings.hide ? '{% endunless %}' : ''}
    ${!options.static && bindings.show ? '{% endif %}' : ''}
    ${
      !options.static && block.repeat && block.repeat.collection
        ? '{% endfor %}'
        : ''
    }
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
        css += `\n@media only screen and (max-width: ${
          sizes[size].max
        }px) { \n${options.emailMode ? '.' : '.builder-block.'}${self.id +
          (options.emailMode ? '-subject' : '')} {${mapToCss(
          self.responsiveStyles[size] as any,
          4,
          options.emailMode,
        )} } }`;
      }
    }
  }
  return css;
}

export function humanCase(str: string) {
  return capitalize(
    kebabCase(str)
      .replace(/[- ]+/g, ' ')
      .trim(),
  );
}

const { setupCache } = require('axios-cache-adapter/dist/cache.node.js');
const axiosCache = setupCache({
  exclude: { query: false },
});

// Webpack workaround to conditionally require certain external modules
// only on the server and not bundle them on the client
let serverOnlyRequire: NodeRequire;
try {
  // tslint:disable-next-line:no-eval
  serverOnlyRequire = eval('require');
} catch (err) {
  // all good
  serverOnlyRequire = (() => null) as any;
}

const http = serverOnlyRequire('http');
const https = serverOnlyRequire('https');
const httpAgent = (http && new http.Agent({ keepAlive: true })) || undefined;
const httpsAgent = (https && new https.Agent({ keepAlive: true })) || undefined;

const serializedBlockTagName = 'builder-serialized-block';
const serializedBlockCloseTag = `</${serializedBlockTagName}>`;

const serializeBlock = (el: Partial<BuilderElement>, close = true) => {
  let str = `<${serializedBlockTagName} block='${htmlEncode(
    JSON.stringify(el),
  )}'>`;

  if (close) {
    str += serializedBlockCloseTag;
  }

  return str;
};

// returns a new object from soource with a new array for each key (e.g blocks) that has key_order (e.g block_order)
const mapArrays = (source: any) => {
  if (!source) {
    return source;
  }
  const newArrays = Object.keys(source).reduce((acc: any, key: string) => {
    const orderKey = `${key.slice(0, -1)}_order`;
    if (source[orderKey]) {
      return {
        [key]: source[orderKey].map((id: number) => source[key][id]),
        ...acc,
      };
    }
    return acc;
  }, {});

  return {
    ...source,
    ...newArrays,
  };
};

// Create `axios` instance passing the newly created `cache.adapter`
const axios = axiosRaw.create({
  httpAgent,
  httpsAgent,
  timeout: 30000,
  adapter: axiosCache.adapter,
});

interface IfTemplate extends ITemplate {
  impl: {
    branches: {
      negate?: boolean;
      cond: string;
      templates: ITemplate[];
    }[];
    elseTemplates: ITemplate[];
  };
}

interface CaseTemplate extends ITemplate {
  impl: {
    cond: string;
    cases: WhenTemplate[];
    elseTemplates: ITemplate[];
  };
}

interface WhenTemplate extends ITemplate {
  val: string;
  templates: ITemplate[];
}

interface OutputTemplate extends ITemplate {
  value: {
    filters: any[]; // TODO
    initial: string;
  };
}

interface ForTemplate extends ITemplate {
  impl: {
    templates: ITemplate[];
    elseTemplates: ITemplate[];
  };
}

// Same structure
interface UnlessTemplate extends ITemplate {
  impl: {
    cond: string;
    templates: ITemplate[];
    elseTemplates: ITemplate[];
  };
}

interface HtmlTemplate extends ITemplate {
  str: string;
}

interface BlockTemplate extends ITemplate {
  impl: {
    name: string;
    templates: ITemplate[];
    args: string;
  };
}

interface CaptureTemplate extends ITemplate {
  impl: {
    variable: string;
    templates: ITemplate[];
  };
}

type Condition = { expression: string; negate?: boolean };

const isSerializedBlock = (str: string) => {
  return str.includes(`<${serializedBlockTagName}`);
};

const deserializeBlock = (str: string) => {
  const parts: string[] = [];
  let attribute = str;
  let matches = str.match(/<builder-serialized-block block='([^']*)'/);
  while (matches?.[1]) {
    parts.push(attribute.substring(0, matches.index));
    parts.push(
      blockToLiquid(JSON.parse(htmlDecode(matches[1])), {
        componentOnly: true,
      } as any),
    );
    attribute = attribute.substring(
      matches.index! + matches[0].length + serializedBlockCloseTag.length + 1,
    );
    matches = attribute.match(/<builder-serialized-block block='([^']*)'/);
  }

  return parts.join('');
};

const stringWithBindingsToLiquid = (str: string) => {
  const separated = separateTagsAndText(str).map((item) => item.text);
  let liquidStr = '';
  for (const item of separated) {
    const tag = parseTag(item);
    if (tag && tag.value) {
      try {
        const parsedValue = JSON.parse(tag.value);
        if (parsedValue.fullRaw) {
          liquidStr += parsedValue.fullRaw;
        } else {
          console.warn('Tag missing fullRaw', tag);
        }
      } catch (err) {
        console.error('Could not parse tag value', tag, err);
      }
    } else if (isSerializedBlock(item)) {
      const block: string | Error = attempt(() => deserializeBlock(item));
      if (!isError(block)) {
        liquidStr += block;
      } else {
        console.warn('Error deserializing binding to liquid ', block);
      }
    } else {
      liquidStr += item;
    }
  }
  return liquidStr;
};

const isSimpleLiquidBinding = (str = '') =>
  Boolean(str.match(/^[a-z0-9_\.\s]+$/i));

const liquidBindingTemplate = (str: string) =>
  isSimpleLiquidBinding(str)
    ? str
    : `liquid.get("${str.replace(/\n+/g, ' ').replace(/"/g, '\\"')}")`;

const liquidRenderTemplate = (str: string) =>
  isSimpleLiquidBinding(str)
    ? str
    : `liquid("${str.replace(/\n+/g, ' ').replace(/"/g, '\\"')}")`;

const liquidConditionTemplate = (str: string) =>
  isSimpleLiquidBinding(str)
    ? str
    : `liquid("${str.replace(/\n+/g, ' ').replace(/"/g, '\\"')}")`;

const isIfTemplate = (template: ITemplate): template is IfTemplate =>
  template.token.type === 'tag' && (template.token as any).name === 'if';
const isUnlessTemplate = (template: ITemplate): template is UnlessTemplate =>
  template.token.type === 'tag' && (template.token as any).name === 'unless';
const isForTemplate = (template: ITemplate): template is ForTemplate =>
  template.token.type === 'tag' && (template.token as any).name === 'for';
const isBlockTemplate = (template: ITemplate): template is ForTemplate =>
  template.token.type === 'tag' && (template.token as any).name === 'for';
const isHtmlTemplate = (template: ITemplate): template is HtmlTemplate =>
  template.token.type === 'html';
const isCaseTemplate = (template: ITemplate): template is CaseTemplate =>
  template.token.type === 'tag' && (template.token as any).name === 'case';
const isOutputTemplate = (template: ITemplate): template is OutputTemplate =>
  template.token.type === 'output';

const isElement = (node: compiler.ASTNode): node is compiler.ASTElement =>
  node.type === 1;
const isTextNode = (node: compiler.ASTNode): node is compiler.ASTText =>
  node.type === 3 || node.type === 2;

// Custom common HTML symbol encoding so not to confuse with actual encoded HTML
const htmlEncode = (html: string) =>
  html.replace(/'/g, '_APOS_').replace(/"/g, '_QUOT_');

const htmlDecode = (html: string) =>
  html.replace(/_APOS_/g, "'").replace(/_QUOT_/g, '"');

const createHtmlAttribute = (attribute: string, attributeValue: any = null) => {
  let encodedValue = '';
  if (attributeValue) {
    encodedValue = `='${htmlEncode(JSON.stringify(attributeValue))}'`;
  }

  return `[${attribute}]${encodedValue}`;
};

const COMMA_TOKEN = '__bldr_comma__';

const parseArgList = (args: string) =>
  args
    // find all the string arguments (wrapped with ' or "), then replace any commas
    // this allows us to split the args on "," without worrying about breaking any strings
    .replace(/('[^']*'|"[^"]*")/g, (str: string) =>
      str.replace(/,/g, COMMA_TOKEN),
    )
    .split(',')
    // now that we the arg list is broken up, we can re-add the escaped commas to each item
    .map((item: string) =>
      item.replace(new RegExp(COMMA_TOKEN, 'g'), ',').trim(),
    );
const errorLinesRe = /\((\d*):(\d*)\)/;

const getErrorInfo = (message: string) => {
  const matched = message.match(errorLinesRe);
  return (
    matched && {
      line: matched[1],
      col: matched[2],
    }
  );
};

const getSubstringTill = (col: number, line: number, str: string) => {
  const lines = str.split('\n');
  return (
    lines.slice(0, line - 1).join('\n') + lines[line - 1].substring(0, col - 1)
  );
};

const transpileUnlessToIf = (unlessTemplate: UnlessTemplate): IfTemplate => {
  const cond = unlessTemplate.impl.cond;
  const value = `if ${cond}`;
  const raw = `{% ${value} %}`;
  return {
    ...unlessTemplate,
    impl: {
      branches: [
        {
          negate: true,
          cond,
          templates: unlessTemplate.impl.templates,
        },
      ],
      elseTemplates: unlessTemplate.impl.elseTemplates,
    },
    token: {
      ...unlessTemplate.token,
      raw,
      value,
    },
  };
};

export const parsedLiquidToHtml = async (
  templates: ITemplate[],
  options: LiquidToBuilderOptions,
) => {
  let html = '';
  const themeAsset = await getShopifyAsset(
    'config/settings_data.json',
    options,
  );
  const themeSettings =
    typeof themeAsset === 'string' && attempt(() => JSON.parse(themeAsset));

  for (const item of templates) {
    await processTemplate(item);
  }

  async function processTemplate(
    template: ITemplate,
    priorConditions: Condition[] = [],
  ) {
    if (isHtmlTemplate(template)) {
      html += template.str;
    } else if (isIfTemplate(template) || isUnlessTemplate(template)) {
      const psuedoTemplate: IfTemplate = isIfTemplate(template)
        ? template
        : transpileUnlessToIf(template);
      const currentConditions = priorConditions.concat({
        expression: psuedoTemplate.token.raw,
        negate: isUnlessTemplate(template),
      });
      const isInsideAttribute = new RegExp(
        `<[^>]*${template.token.value}`,
      ).test(template.token.input);

      for (
        let index = 0;
        index < psuedoTemplate.impl.branches.length;
        index++
      ) {
        const item = psuedoTemplate.impl.branches[index];

        if (index === 0) {
          html += createHtmlAttribute('if', {
            fullRaw: psuedoTemplate.token.raw,
            cond: item.cond,
            ...(item.negate && { negate: true }),
            hash: hash(currentConditions),
          });
        } else {
          html += createHtmlAttribute('elsif', {
            fullRaw: `{% elsif ${item.cond} %}`,
            cond: item.cond,
            hash: hash(currentConditions),
          });
        }
        if (isInsideAttribute) {
          for (const tpl of item.templates) {
            await processTemplate(tpl, currentConditions);
          }
        } else {
          html += await processInnerTemplates(
            item.templates,
            options,
            currentConditions,
          );
        }
      }
      if (
        psuedoTemplate.impl.elseTemplates &&
        psuedoTemplate.impl.elseTemplates.length
      ) {
        html += createHtmlAttribute('else', {
          fullRaw: '{% else %}',
        });
        if (isInsideAttribute) {
          for (const tpl of psuedoTemplate.impl.elseTemplates) {
            await processTemplate(tpl);
          }
        } else {
          html += await processInnerTemplates(
            psuedoTemplate.impl.elseTemplates,
            options,
            priorConditions.concat({
              expression: psuedoTemplate.token.raw,
              negate: !isUnlessTemplate(template),
            }),
            hash(currentConditions),
          );
        }
      }

      html += createHtmlAttribute('endif', {
        fullRaw: `{% endif %}`,
      });
    } else if (isCaseTemplate(template)) {
      let firstCond = '';
      // Rewrite the case statement as an if statement
      for (let index = 0; index < template.impl.cases.length; index++) {
        const item = template.impl.cases[index];
        const condition = `${template.impl.cond} == ${item.val}`;

        if (index === 0) {
          firstCond = condition;
          html += createHtmlAttribute('if', {
            fullRaw: `{% if ${condition} %}`,
            cond: condition,
            hash: hash(condition),
          });
          for (const tpl of item.templates) {
            await processTemplate(tpl);
          }
        } else {
          html += createHtmlAttribute('elsif', {
            fullRaw: `{% elsif ${condition} %}`,
            cond: condition,
            hash: hash(firstCond),
          });
          for (const tpl of item.templates) {
            await processTemplate(tpl);
          }
        }
      }
      if (template.impl.elseTemplates && template.impl.elseTemplates.length) {
        html += createHtmlAttribute('else', {
          fullRaw: '{% else %}',
          hash: hash(firstCond),
        });
        for (const tpl of template.impl.elseTemplates) {
          await processTemplate(tpl);
        }
      }
      html += createHtmlAttribute('endif', {
        fullRaw: `{% endif %}`,
      });
    } else if (isForTemplate(template)) {
      html += createHtmlAttribute('for', {
        ...template.impl,
        fullRaw: template.token.raw,
        templates: undefined,
        elseTemplates: undefined,
        liquid: undefined,
      });
      for (const tpl of template.impl.templates) {
        await processTemplate(tpl);
      }
      html += createHtmlAttribute('endfor', {
        fullRaw: `{% endfor %}`,
      });
    } else if (isOutputTemplate(template)) {
      html += createHtmlAttribute('output', {
        ...template.value,
        raw: template.token.value,
        fullRaw: `{{${template.token.value}}}`,
      });
    } else {
      // TODO: preprocess liquid to expand forms, sections, etc OR do at html phase
      const name = (template as any).name || '';
      const args = (template as any).token.args || '';

      if (name === 'form') {
        html += createHtmlAttribute('form', {
          ...(template as BlockTemplate).impl,
          fullRaw: template.token.raw,
          templates: undefined,
          elseTemplates: undefined,
          liquid: undefined,
        });

        for (const tpl of (template as BlockTemplate).impl.templates) {
          await processTemplate(tpl);
        }

        html += createHtmlAttribute('endform', {
          fullRaw: `{% endform %}`,
        });
      } else if (name === 'assign') {
        const block = {
          component: {
            name: 'Shopify:Assign',
            options: {
              expression: args || '',
            },
          },
        };
        html += serializeBlock(block);
      } else if (name === 'capture') {
        let rawExpression = '';

        for (const templateToken of (template as CaptureTemplate).impl
          .templates) {
          if (
            (templateToken as any).name === 'raw' &&
            (templateToken as any).impl?.tokens
          ) {
            for (const rawToken of (templateToken as any).impl.tokens) {
              rawExpression += rawToken.raw;
            }
          } else {
            rawExpression += templateToken.token.raw;
          }
        }

        const block = {
          component: {
            name: 'Shopify:Capture',
            options: {
              variableName: args,
              expression: rawExpression.trim(),
            },
          },
        };
        html += serializeBlock(block);
      } else if (name === 'schema') {
        const parsedSchema = JSON.parse(
          (template as any).impl.templates[0].token.value.replace(/\\n/g, ''),
        );

        html += serializeBlock({
          layerName: `Schema`,
          component: {
            name: 'Builder:StateProvider',
            options: parsedSchema,
          },
        });
      } else if (name === 'comment') {
        // Do nothing, we don't need to record comments that came from liquid
      } else if (name === 'liquid') {
        // https://shopify.dev/docs/themes/liquid/reference/tags/theme-tags#liquid
        const liquidTagStringPieces = args
          .trim()
          .replace(/^liquid/gi, '')
          .split('\n');
        const wrappedLiquidTags = liquidTagStringPieces
          .map((unwrappedTag: string) => {
            const trimmedTag = unwrappedTag.trim();
            if (trimmedTag) {
              return `{% ${trimmedTag} %}`;
            }

            return null;
          })
          .filter((liquidTag: string | null) => !!liquidTag);

        html += await parsedLiquidToHtml(
          await liquidToAst(
            await preprocessLiquid(wrappedLiquidTags.join('')),
            options,
          ),
          options,
        );
      } else if (name === 'javascript') {
        // TODO: custom code block or special Shopify component
      } else if (name === 'stylesheet') {
        // TODO: custom code block or special Shopify component
      } else if (name === 'section') {
        const matched = args.match(/['"]([^'"]+)['"]/);
        const path = matched && matched[1];
        if (path) {
          const currentAsset = await getShopifyAsset(
            `sections/${path}.liquid`,
            options,
          );

          if (
            currentAsset &&
            !isError(currentAsset) &&
            themeSettings &&
            !isError(themeSettings)
          ) {
            let schemaObject: any = {};
            const schemaDefault = currentAsset.match(
              /{%-? schema -?%}([\s\S]*?){%-? endschema -?%}/,
            );
            const defaultSchemaObject: any = {};
            if (schemaDefault?.length) {
              try {
                const rawSchemaObject = JSON.parse(schemaDefault[1].trim());
                schemaObject = rawSchemaObject;
                rawSchemaObject.settings.forEach((setting: any) => {
                  defaultSchemaObject[setting.id as string] = setting.default;
                });
              } catch (e) {
                console.error('Failed to parse schema.', e);
              }
            }

            if (!themeSettings.current.sections[path]) {
              themeSettings.current.sections[path] = {};
            }

            const sectionSettingsState = Object.assign(
              {},
              defaultSchemaObject,
              themeSettings.current.sections[path].settings,
            );

            themeSettings.current.sections[
              path
            ].settings = sectionSettingsState;

            if (options.importSections === false) {
              html += serializeBlock({
                layerName: `${humanCase(
                  path.replace('-template', ''),
                )} section`,
                component: {
                  name: 'Shopify:SectionRef',
                  options: {
                    section: `sections/${path}.liquid`,
                  },
                },
                // TODO: provide collection, etc here
                ...((path === 'product-template' || path === 'product') && {
                  properties: {
                    'data-slot': 'shopify:productPage',
                  },
                }),
                ...((path === 'collection-template' ||
                  path === 'collection') && {
                  properties: {
                    'data-slot': 'shopify:collectionPage',
                  },
                }),
              });
            } else {
              html += serializeBlock(
                {
                  layerName: `Section: sections/${path}.liquid`,
                  meta: {
                    identifier: 'ShopifySection',
                  },
                  component: {
                    name: 'Shopify:Section',
                    options: {
                      template: path,
                      shopifyMetafields: [
                        {
                          path: 'state.section',
                          as: `_section_${snakeCase(path)}`,
                        },
                      ],
                      state: {
                        section: mapArrays(
                          themeSettings.current.sections[path],
                        ),
                        _sourceFile: `sections/${path}.liquid`,
                      },
                    },
                  },
                },
                false,
              );

              html += await parsedLiquidToHtml(
                await liquidToAst(
                  await preprocessLiquid(currentAsset),
                  options,
                ),
                options,
              );
              html += serializedBlockCloseTag;
            }
          } else {
            // maybe should throw and block the importing ?
            console.warn('Could not get section', currentAsset, template);
          }
        } else {
          console.warn('section with no path ', args);
        }
        // TODO: full render tag support (e.g. with `as` etc support)
      } else if (name === 'include' || name === 'render') {
        // Handle me...
        const name = (args as string).match(/['"]([^'"]+)['"]/);
        const path = name && name[1];
        const directory = 'snippets';

        if (options.importSnippets === false) {
          html += serializeBlock({
            meta: {
              importedSnippet: args,
            },
            layerName: `${humanCase(path || '')} block`,
            tagName: 'span',
            component: {
              name: 'Custom Code',
              options: {
                code: template.token.raw,
                replaceNodes: true,
              },
            },
          });
        } else {
          const keyValsRe = /,\s*([^:]+):([^,]+)/g;
          const assigns: { [key: string]: string | undefined } = {};
          (args as string).replace(keyValsRe, (match, key, value) => {
            assigns[key] = value;
            return '';
          });
          let assignString = '';
          for (const key in assigns) {
            if (assigns.hasOwnProperty(key)) {
              // TODO: use StateProvider for this. With getters?
              assignString += `\n{% assign ${key} = ${assigns[key]} %}`;
            }
          }
          // TODO: scope this somehow?
          // TODO: later support keping this separate as a form of symbol

          const { auth, themeId } = options;
          if (auth && path && themeId) {
            const { publicKey, token } = auth;
            if (publicKey && token) {
              html += serializeBlock(
                {
                  layerName: `Include: ${directory}/${path}.liquid`,
                  component: {
                    name: 'Builder:StateProvider',
                    options: {
                      state: {
                        _sourceFile: `${directory}/${path}.liquid`,
                      },
                    },
                  },
                },
                false,
              );
              const currentAsset = await getShopifyAsset(
                `${directory}/${path}.liquid`,
                options,
              );

              if (currentAsset) {
                const value = assignString + '\n' + (currentAsset || '');
                html += await parsedLiquidToHtml(
                  await liquidToAst(await preprocessLiquid(value), options),
                  options,
                );
              }
              html += serializedBlockCloseTag;
            }
          }
        }
      } else if (name === 'paginate') {
        // {% paginate collection.product by section.settings.product_per_page %}
        // ...
        // {% endpaginate %}

        html += createHtmlAttribute('paginate', {
          ...(template as BlockTemplate).impl,
          fullRaw: template.token.raw,
          templates: undefined,
          elseTemplates: undefined,
          liquid: undefined,
        });

        for (const tpl of (template as BlockTemplate).impl.templates) {
          await processTemplate(tpl);
        }

        html += createHtmlAttribute('endpaginate', {
          fullRaw: `{% endpaginate %}`,
        });
      } else if (name === 'cycle') {
        let args = (template.token as any).args;
        // TODO: we don't currently support grouping in cycle tags, more details on how to support here:
        // https://shopify.dev/docs/themes/liquid/reference/tags/iteration-tags#cycle-tag-parameters
        let cycleGroup;
        if (args.indexOf(':') > -1) {
          cycleGroup = args.split(':')[0];
          args = args.split(':')[1];
        }

        const argList = parseArgList(args);

        let newHtml = '';
        for (let i = 0; i < argList.length; i++) {
          // first, check to make sure the cycle index isn't greating than the forloop
          // then, calculate the check the remainder of current loop index divided by cycle length
          // if it's equal to the current cycle index, display the cycle value
          newHtml += `
            {% assign remainder = forloop.index0| modulo:${argList.length} %}
            {% if forloop.length >= ${i}  and remainder == ${i} %}
              {{${argList[i]}}}
            {% endif %}`;
        }

        html += await parsedLiquidToHtml(
          await liquidToAst(await preprocessLiquid(newHtml), options),
          options,
        );
      } else {
        // TODO: make generic [liquid]="..." or something else
        console.warn('No match for', name, args);
        // It's a block
        // FIXME
        // html += `<liquid name="${name}" args="${args}">${await parsedLiquidToHtml(
        //   (template as any).impl.templates || [],
        //   options
        // )}</liquid>`;
      }
    }
  }

  return html;
};

const flattenExpressions = (conditionsArray: Condition[], value: string) => {
  return (
    conditionsArray
      .map((c) => (c.negate ? `${c.expression} {% else %}` : c.expression))
      .join(' ') +
    value +
    conditionsArray.map(() => `{% endif %}`)
  );
};

async function processInnerTemplates(
  templates: ITemplate[],
  options: LiquidToBuilderOptions,
  priorConditions: Condition[],
  overrideHash?: string,
) {
  const selfCloseTags = new Set([
    'input',
    'link',
    'br',
    'base',
    'hr',
    'meta',
    'img',
    'area',
    'col',
    'embed',
    'param',
    'source',
    'track',
    'wbr',
  ]);

  const html = await parsedLiquidToHtml(templates, options);

  const processHtml = (str: string) => {
    let result = '';
    try {
      // TODO: remove comments from inside str, it breaks things
      const parsedHtml = htmlParser.parsers.html.parse(
        str,
        htmlParser.parsers,
        {} as any,
      );
      for (const node of parsedHtml.children) {
        if (node.type === 'text') {
          result += node.value;
        } else if (
          isNull(node.endSourceSpan) &&
          !selfCloseTags.has(node.name)
        ) {
          const block = {
            tagName: node.name,
            bindings: {},
            properties: {},
            // not working
            noWrap: true,
            meta: {
              renderIf: flattenExpressions(priorConditions, 'true'),
              psuedoNode: {
                attrsList: node.attrs?.map(({ name, value }: any) => ({
                  name,
                  value,
                })),
                attrsMap: node.attrMap,
                name: node.name,
                type: 1,
              },
            },
            component: {
              name: 'TempTag',
              options: {
                name: 'opencondtag',
                tag: node.name,
                hash: overrideHash || hash(priorConditions),
              },
            },
          };

          result += serializeBlock(block, false);
          const innerStr = str.substring(node.sourceSpan.end.offset);
          if (innerStr.replace('\n', '').trim() !== '') {
            result += processHtml(innerStr);
          }
          result += serializedBlockCloseTag;
        } else {
          result += str.substring(
            node.sourceSpan.start.offset,
            node.sourceSpan.end.offset,
          );
        }
      }
    } catch (error) {
      if (
        error instanceof Error &&
        error.message.includes('Unexpected closing tag')
      ) {
        // template.str have an unclosed tag, extract all valid text and
        // replace the invlalid endtag with htmlattr
        const { col, line } = getErrorInfo(error.message)!;
        const errorTag = error.message.match(
          /Unexpected closing tag "(\s*\S*)"/,
        )?.[1]!;
        const preErrorTag = getSubstringTill(Number(col), Number(line), str);
        result += preErrorTag;
        result += createHtmlAttribute('endopencondtag', {
          hash:
            overrideHash ||
            (priorConditions.length > 0 && hash(priorConditions)),
        });
        // 3 is length of </>
        const leftovers = str.substring(
          preErrorTag.length + errorTag.length + 4,
        );
        if (leftovers.replace('\n', '').trim() !== '') {
          result += processHtml(leftovers);
        }
      }
    }

    return result;
  };

  return processHtml(html);
}

const el = (options?: Partial<BuilderElement>): BuilderElement =>
  createBuilderElement({
    meta: {
      importedFrom: 'liquid',
      ...options?.meta,
    },
    ...options,
  });

const tagRe = /\[([a-z]+)\](='([^']+)')?/;
const tagReAll = /\[([^\]]+)\](='([^']+)')?/g;
interface ParsedTag {
  name: string;
  value: string;
  raw: string;
}

const parseTags = (tag: string): ParsedTag[] => {
  const tags: ParsedTag[] = [];
  tag.replace(tagReAll, (match, p1, _p2, p3) => {
    tags.push({
      name: htmlDecode(p1),
      value: htmlDecode(p3 || ''),
      raw: match,
    });
    return '';
  });
  return tags;
};

const parseTag = (tag = ''): ParsedTag | null => {
  const matched = tag.match(tagRe);
  return (
    matched && {
      name: htmlDecode(matched[1]),
      value: htmlDecode(matched[3] || ''),
      raw: htmlDecode(matched[0]),
    }
  );
};

const hasTag = (html: string) => !!parseTag(html);

export const htmlNodeToBuilder = async (
  node: compiler.ASTNode,
  index: number,
  parentArray: compiler.ASTNode[],
  options: LiquidToBuilderOptions,
): Promise<BuilderElement | BuilderElement[] | null> => {
  // TODO: if and for and form and section and assign
  if (isElement(node)) {
    if (node.tag === 'builder-component') {
      return el({
        children: await htmlAstToBuilder(node.children, options),
      });
    }

    let element: BuilderElement;
    let psuedoNode = node;

    if (node.tag === serializedBlockTagName) {
      try {
        const parsedBlock: Partial<BuilderElement> = JSON.parse(
          htmlDecode(node.attrsMap.block.replace(/"/g, '\\"')),
        );
        const children = await htmlAstToBuilder(node.children, options);
        element = el({
          ...parsedBlock,
          ...(children.length > 0 && { children }),
        });
        if (parsedBlock.meta?.psuedoNode) {
          psuedoNode = parsedBlock.meta?.psuedoNode as any;
          (element.properties = {}),
            (element.bindings = {}),
            delete parsedBlock.meta.psuedoNode;
        } else {
          return element;
        }
      } catch (err) {
        console.error(
          'Builder serialized block error',
          err,
          '\n\nin:',
          htmlDecode(node.attrsMap.block.replace(/"/g, '\\"')),
        );
        return el({
          component: {
            name: 'Text',
            options: {
              text: `Builder serialized block error: ${String(err)}`,
            },
          },
        });
      }
    } else {
      element = el({
        tagName: node.tag,
        properties: {},
        bindings: {},
        children: await htmlAstToBuilder(node.children, options),
      });
    }

    const properties = element.properties!;
    const bindings = element.bindings!;
    if (psuedoNode.tag === 'img') {
      let imgStr = psuedoNode.attrsMap.src || psuedoNode.attrsMap['data-src'];
      if (imgStr && hasTag(imgStr)) {
        imgStr = '';
      }
      element.tagName = '';
      element.component = {
        name: 'Raw:Img',
        options: {
          image: imgStr,
        },
      };
    }

    await bindingsFromAttrs(psuedoNode, bindings, properties, options);

    return element;
  }

  // TODO: parse for [data] for bindings
  if (isTextNode(node)) {
    let text = node.text;
    if (!text.trim()) {
      return null;
    }
    let parsed: ParsedTag | null = null;
    if (hasTag(text)) {
      parsed = parseTag(text)!;
      text = '';
    }

    const parsedOutput =
      parsed &&
      parsed.value &&
      parsed.name === 'output' &&
      JSON.parse(parsed.value);
    const parsedFor =
      parsed &&
      parsed.value &&
      parsed.name === 'for' &&
      JSON.parse(parsed.value);
    const parsedIf =
      parsed &&
      parsed.value &&
      parsed.name === 'if' &&
      JSON.parse(parsed.value);
    const parsedValue = parsedOutput;

    const translation = await getTranslation(parsedValue, options);
    if (translation != null) {
      text = translation;
    }

    if (parsed) {
      if (
        [
          'if',
          'elsif',
          'else',
          'endif',
          'endunless',
          'unless',
          'for',
          'endfor',
          'paginate',
          'endpaginate',
          'form',
          'endform',
          'endopencondtag',
        ].includes(parsed.name)
      ) {
        return el({
          component: {
            name: 'TempNode',
            options: {
              name: parsed.name,
              value: parsed.value,
            },
          },
        });
      }
      if (parsed.name !== 'output') {
        console.warn('No handler for', parsed.name);
      }
    }

    // TODO: classname, etc
    const block = el({
      // tagName: 'span',

      bindings: {
        ...(parsedOutput &&
          translation == null && {
            ['component.options.text']: liquidBindingTemplate(parsedOutput.raw),
          }),
      } as { [key: string]: string },

      component: {
        name: 'Text',
        options: { text },
      },
    });

    return block;
  }

  // TODO: handle comment, etc
  console.warn('node not matched', node);

  return null as any;

  // TODO: add back
  // throw new Error('Unhandled node type');
};

const assets: Record<
  string,
  Promise<string | Error | undefined> | undefined
> = {};

const getShopifyAsset = async (
  assetKey: string,
  options: LiquidToBuilderOptions,
) => {
  const publicKey = options && options.auth && options.auth.publicKey;
  const token = options && options.auth && options.auth.token;
  const themeId = options?.themeId;
  // TODO: later keep translation support trough some means

  if (publicKey && token && themeId) {
    const key = assetKey + themeId + publicKey;
    if (assets[key]) {
      return await assets[key];
    }
    const shopifyRoot = 'https://cdn.builder.io/api/v1/shopify';
    let url = `${shopifyRoot}/themes/${themeId}/assets.json?asset[key]=${assetKey}&apiKey=${publicKey}`;

    if (options.cachebust) {
      url += '&cachebust=true';
    }
    assets[key] = axios
      .get(url, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      .then(
        (result) => result.data && result.data.asset && result.data.asset.value,
      );
    return await assets[key];
  }
};

const getTranslation = async (
  parsedValue: any,
  options: LiquidToBuilderOptions = {},
) => {
  if (!parsedValue) {
    return null;
  }
  const { filters, initial } = parsedValue;
  if (Array.isArray(filters)) {
    const translate = Boolean(filters.find((item) => item.name === 't'));
    if (translate) {
      const asset =
        options.translations ||
        (await getShopifyAsset('locales/en.default.json', options));
      const parsed =
        typeof asset === 'string' ? attempt(() => JSON.parse(asset)) : asset;
      if (parsed && !isError(parsed)) {
        const translationValue = get(parsed, initial.replace(/'/g, ''));
        return translationValue;
      } else {
        console.warn('Could not grab translation', options);
      }
    }
  }
  return null;
};

export const liquidToAst = (
  str: string,
  options: LiquidToBuilderOptions = {},
) => {
  // Look for  "<tag ...> {% end"
  // FIXME: this will also throw on self closing tags like <input> but ideally should be fixed to not
  const problemMatched = str.match(/<[^\/>]+?>\s*{%[\s\-]*end/gi);
  if (problemMatched) {
    console.warn(
      'Found invalid liquid condition around open HTML tag',
      problemMatched,
    );
  }

  // Look for "{% if|unless %}</div>""
  const closeTagMatch = str.match(/{%[\s\-]*(if|unless)[^}]*%}\s*<\//gi);
  if (closeTagMatch) {
    console.warn(
      'Found invalid liquid condition around close HTML tag',
      closeTagMatch,
    );
  }

  const engine = new Liquid();

  // TODO: handle other tags
  const selfCloseTags = [
    'section',
    'render',
    'include',
    'echo',
    'liquid',
    'layout',
    'cycle',
    'break',
    'continue',
  ];

  selfCloseTags.forEach((tag) => {
    engine.registerTag(tag, {
      parse(token, remainTokens) {
        this.remainTokens = remainTokens;
        this.templates = [];
        this.type = 'block';
        this.blockType = 'selfClose';
        this.name = tag;
        this.args = token.args;
      },
      render: () => null,
    });
  });

  const nonLiquidBlockTags = ['style', 'stylesheet', 'javascript', 'schema'];
  nonLiquidBlockTags.forEach((tag) => {
    engine.registerTag(tag, {
      parse(token, remainTokens) {
        this.remainTokens = remainTokens;
        this.tokens = [];
        this.type = 'block';
        this.blockType = 'nonLiquidBlock';
        this.name = tag;
        this.args = token.args;

        this.tokens = [];
        const stream = this.liquid.parser.parseStream(remainTokens);
        stream
          .on('token', (token) => {
            if ((token as any).name === 'end' + tag) stream.stop();
            else this.tokens.push(token);
          })
          .on('end', () => {
            throw new Error(`tag ${token.raw} not closed`);
          });
        stream.start();
      },
      render: () => null,
    });
  });

  const blockTags = ['form', 'paginate', 'schema'];
  blockTags.forEach((tag) => {
    engine.registerTag(tag, {
      parse(token, remainTokens) {
        this.remainTokens = remainTokens;
        this.templates = [];
        this.type = 'block';
        this.name = tag;
        this.args = token.args;

        const stream: ParseStream = this.liquid.parser
          .parseStream(remainTokens)
          .on('tag:end' + tag, () => stream.stop())
          .on('template', (tpl: ITemplate) => this.templates.push(tpl))
          .on('end', () => {
            throw new Error(`tag ${token.raw} not closed`);
          });

        stream.start();
      },
      render: () => null,
    });
  });

  const parsedTemplateItems = engine.parse(str);
  return parsedTemplateItems;
};

const bindingsPlaceholder = '__B__';

export const htmlToAst = (html: string) => {
  // https://github.com/vuejs/vue/blob/dev/src/platforms/web/compiler/modules/class.js#L19
  const ast = compiler.compile(
    `<template>${html.replace(
      /(class|style)=/g,
      `${bindingsPlaceholder}$1=`,
    )}</template>`,
  ).ast!.children;
  const processed = postProcessHtmlAstNodes(cloneDeep(ast));
  return { htmlNodes: processed, preprocessed: ast };
};

const isBuilderElement = (el: unknown): el is BuilderElement =>
  Boolean(
    el &&
      typeof el === 'object' &&
      (el as any)['@type'] === '@builder.io/sdk:Element',
  );

const isBuilderElementArray = (obj: unknown): obj is BuilderElement[] =>
  Boolean(obj && Array.isArray(obj) && obj[0] && isBuilderElement(obj[0]));

const getNextBuilderSiblings = (
  el: BuilderElement,
  parentArray: BuilderElement[],
) => {
  const index = parentArray.indexOf(el);
  if (index === -1) {
    console.log('node', el, parentArray);
    throw new Error('El is not in parentArray');
  }
  return parentArray.slice(index + 1);
};

const tempNodeInfo = (el: BuilderElement) => {
  const component = el.component;
  if (component) {
    const { name: componentName, options } = component;
    if (componentName === 'TempNode') {
      const { name, value } = options;
      return { value: value as string, name: name as string };
    }
  }
  return { name: null, value: null };
};

const tempTagInfo = (el: BuilderElement) => {
  const component = el.component;
  if (component) {
    const { name: componentName, options } = component;
    if (componentName === 'TempTag') {
      const { name, value } = options;
      return { value: value as string, name: name as string };
    }
  }
  return { name: null, value: null };
};

const getTextNode = (str: string): compiler.ASTText => ({
  static: true,
  type: 3,
  text: str,
});

export const separateTagsAndText = (text: string): compiler.ASTText[] => {
  const str = (text || '').trim();
  const textItems: string[] = [];
  const tags = parseTags(str);
  if (!tags.length) {
    return [getTextNode(str)];
  }
  const result: compiler.ASTText[] = [];
  let currentIndex = 0;
  for (const tag of tags) {
    const index = str.indexOf(tag.raw, currentIndex);
    textItems.push(str.slice(currentIndex, index));
    currentIndex = index + tag.raw.length;
  }
  const lastRaw = last(tags)!.raw;
  const lastIndex = text.lastIndexOf(lastRaw) + lastRaw.length;
  textItems.push(str.slice(lastIndex));
  for (let i = 0; i < tags.length; i++) {
    if (textItems[i] && textItems[i].trim()) {
      result.push(getTextNode(textItems[i]));
    }
    result.push(getTextNode(tags[i].raw));
  }
  if (textItems[tags.length] && textItems[tags.length].trim()) {
    result.push(getTextNode(textItems[tags.length] || ''));
  }
  return result;
};

const debugLoops = false;

const isArrayWithTextNode = (obj: unknown): obj is any[] =>
  Array.isArray(obj) && obj.find((item) => isTextNode(item));

export const postProcessHtmlAstNodes = (nodes: compiler.ASTNode[]) => {
  let updated = true;
  let i = 0;
  let latest = nodes;

  while (updated) {
    if (i++ > (debugLoops ? 3 : 1000)) {
      console.warn('Too many updates');
      break;
    }
    updated = false;
    // tslint:disable-next-line:ter-prefer-arrow-callback
    latest = traverse(latest).forEach(function(current) {
      if (current?.name && current.name.startsWith(bindingsPlaceholder)) {
        this.update({
          ...current,
          name: current.name.replace(bindingsPlaceholder, ''),
        });
      } else if (current) {
        const prop = Object.keys(current).find((key) =>
          key.startsWith(bindingsPlaceholder),
        );
        if (prop) {
          this.update({
            ...omit(current, prop),
            [prop?.replace(bindingsPlaceholder, '')]: current[prop],
          });
        }
      }

      if (!isArrayWithTextNode(current)) {
        return;
      }

      for (const item of current) {
        if (!isTextNode(item)) {
          continue;
        }
        const parent = current;
        const text = item.text;
        const separated = separateTagsAndText(text);
        if (separated.length > 1) {
          updated = true;
          this.update(
            [
              ...parent.slice(0, parent.indexOf(item)),
              ...separated,
              ...parent.slice(parent.indexOf(item) + 1),
            ],
            true,
          );
          break;
        }
      }
    });
  }

  return latest;
};

const isCondition = (el: BuilderElement) =>
  el.component?.name === 'Shopify:Condition';
const isOpenConditionalTag = (el: BuilderElement) =>
  el.component?.name === 'Shopify:ConditionalTag';
const isEndConditionalTag = (el: BuilderElement) =>
  el.component?.options?.name === 'endopencondtag';
const moveCondtionalTagsUp = (nodes: BuilderElement[]) => {
  let updated = true;
  let i = 0;
  while (updated) {
    if (i++ > (debugLoops ? 4 : 1000)) {
      console.warn('Too many updates');
      break;
    }
    updated = false;
    // tslint:disable-next-line:ter-prefer-arrow-callback
    nodes = traverse(nodes).forEach(function(current) {
      if (!isBuilderElementArray(current)) {
        return;
      }

      for (
        let currentIndex = 0;
        currentIndex < current.length;
        currentIndex++
      ) {
        let ejected: any = null;
        const condition = current[currentIndex];
        if (!isCondition(condition)) {
          return;
        }
        const branches: {
          expression?: string;
          blocks?: BuilderElement[];
        }[] = condition.component!.options.branches;
        let branchIndex = -1;
        for (const branch of branches) {
          branchIndex++;
          const ejectedIndex = branch.blocks!.findIndex(function(
            block,
            blockIndex,
          ) {
            const { name } = tempTagInfo(block) as any;
            return name === 'opencondtag';
          });

          if (ejectedIndex > -1) {
            const oldBlocks = branch.blocks;
            ejected = branch.blocks?.[ejectedIndex];
            const newBlocks = [
              ...(oldBlocks?.slice(0, ejectedIndex) || []),
              ...(ejected!.children || []),
              ...(oldBlocks?.slice(ejectedIndex + 1) || []),
            ];
            const updatedCondition = {
              ...condition,
              component: {
                ...condition.component,
                options: {
                  ...condition.component!.options,
                  branches: [
                    ...branches.slice(0, branchIndex),
                    // todo: remove condtion all together if we emptied it's branches
                    {
                      ...branch,
                      blocks: newBlocks,
                    },
                    ...branches.slice(branchIndex + 1),
                  ],
                },
              },
            };
            this.update(
              [
                ...current.slice(0, currentIndex),
                {
                  ...ejected,
                  meta: {
                    ...ejected.meta,
                    originalIndex: ejectedIndex,
                    branchIndex,
                  },
                  component: {
                    ...ejected!.component,
                    name: 'Shopify:ConditionalTag',
                  },
                  children: [updatedCondition],
                },
                ...current.slice(currentIndex + 1),
              ],
              true,
            );
            break;
          }
        }
        if (ejected) {
          updated = true;
          break;
        }
      }
    });
  }
  return nodes;
};

const matchConditionalTagsWithEndings = (nodes: BuilderElement[]) => {
  let updated = true;
  let i = 0;
  while (updated) {
    if (i++ > (debugLoops ? 4 : 1000)) {
      console.warn('Too many updates');
      break;
    }
    updated = false;
    // tslint:disable-next-line:ter-prefer-arrow-callback
    nodes = traverse(nodes).forEach(function(current) {
      if (!isBuilderElementArray(current)) {
        return;
      }
      for (
        let currentIndex = 0;
        currentIndex < current.length;
        currentIndex++
      ) {
        const node = current[currentIndex];
        if (!isOpenConditionalTag(node) || this.key === 'conditionalTags') {
          return;
        }
        let conditionalTags: Omit<BuilderElement, 'children'>[] = [
          omit(node, 'children'),
        ];
        let tag: BuilderElement = node;
        const originalIndex = node.meta!.originalIndex;
        const branchIndex = node.meta!.branchIndex as number;
        while (tag.children) {
          tag = tag.children[0];
          if (isOpenConditionalTag(tag)) {
            conditionalTags.push(omit(tag, 'children'));
          } else {
            break;
          }
        }

        let endTag = current
          .slice(currentIndex + 1)
          .findIndex(
            (el) =>
              isEndConditionalTag(el) &&
              el.component?.options.hash === node.component?.options.hash,
          );
        if (endTag === -1) {
          // TODO try to recover by finding the next shopify condition with the same hash
          endTag =
            current
              .slice(currentIndex + 1)
              .findIndex(
                (el) =>
                  isCondition(el) &&
                  el.component?.options.hash === node.component?.options.hash,
              ) + 1;
          if (endTag === 0) {
            throw Error(
              `no endTag for a conditional ${node.component?.options.hash}`,
            );
          }
        }

        // cursor at condition now
        let condition = tag;
        let hoistedCondition: any = null;
        /* originalIndex is where the open tag was, e.g 
          {% if test %} TEXT<span> in span</span> <div class = '''>
          it'll be 2,
        */
        if (originalIndex > 0) {
          const originalBranch = cloneDeep(
            condition.component?.options.branches[branchIndex],
          );
          hoistedCondition = mergeWith(
            {},
            condition,
            {
              component: {
                options: {
                  isHoisted: true,
                  branches: [
                    {
                      // TODO: do I need to check if hoisting from an else branch?
                      ...originalBranch,
                      blocks: originalBranch.blocks.slice(0, originalIndex),
                    },
                  ],
                },
              },
            },
            (_, dest) => {
              // always prefer arrays from destination, (third arg above)
              if (Array.isArray(dest)) {
                return dest;
              }
            },
          );

          condition = mergeWith(
            {},
            condition,
            {
              component: {
                options: {
                  branches: [
                    ...condition.component!.options.branches.slice(
                      0,
                      branchIndex,
                    ),
                    {
                      // TODO: do I need to check if hoisting from an else branch?
                      ...originalBranch,
                      blocks: originalBranch.blocks.slice(originalIndex),
                    },
                    ...condition.component!.options.branches.slice(
                      branchIndex + 1,
                    ),
                  ],
                },
              },
            },
            (_, dest) => {
              // always prefer arrays from destination, (third arg above)
              if (Array.isArray(dest)) {
                return dest;
              }
            },
          );
        }

        this.update(
          [
            ...current.slice(0, currentIndex),
            ...(hoistedCondition ? [hoistedCondition] : []),
            el({
              // TODO: lookout for tempnodes in condition blocks
              children: [condition, ...current.slice(currentIndex + 1, endTag)],
              component: {
                name: 'Shopify:WrapperTag',
                options: {
                  conditionalTags,
                },
              },
            }),
            ...current.slice(currentIndex + endTag + 2),
          ],
          true,
        );
        updated = true;
      }
    });
  }

  return nodes;
};

export const postProcessBuilderTree = async (
  nodes: BuilderElement[],
  options: LiquidToBuilderOptions,
) => {
  let updated = true;
  let i = 0;
  let latest = nodes;
  while (updated) {
    if (i++ > (debugLoops ? 3 : 1000)) {
      console.warn('Too many updates');
      break;
    }
    updated = false;
    // tslint:disable-next-line:ter-prefer-arrow-callback
    latest = traverse(latest).forEach(function(current) {
      if (!isBuilderElementArray(current)) {
        return;
      }

      for (const item of current) {
        // TODO: add support for {% javascript %} and {% stylesheet %} here as well:
        // https://shopify.dev/tutorials/develop-theme-use-sections#id
        if (item.meta?.identifier === 'ShopifySection') {
          // haven't updated the section layer yet if no schema, try to process
          const schema = item.component?.options.schema;
          if (!schema) {
            const schemaBlock = item.children?.find((child) => {
              return child.layerName === 'Schema';
            });

            if (schemaBlock) {
              item.component!.options.schema = schemaBlock.component?.options;
              if (!item.component!.options.section) {
                item.component!.options.section = {
                  name: '', // What goes here?
                  settings: {},
                };
              }
              const settings = item.component!.options.section.settings;
              for (const setting of schemaBlock.component?.options.settings) {
                const name = setting.id;
                // TODO: sometimes shopify templates are using settings but they don't have a default or a config in the settings_data.json but somehow have a value?
                if (
                  typeof settings[name] === 'undefined' &&
                  typeof setting.default !== 'undefined'
                ) {
                  settings[name] = setting.default;
                }
              }
            } else {
              console.warn('This section has no schema!');
              // Put an object here so we know we tried to process so the above condition doesn't match anymore
              item.component!.options.schema = {};
            }

            updated = true;
            return this.stop();
          }
        }

        const { name, value } = tempNodeInfo(item);
        const parsedValue = value && attempt(() => JSON.parse(value));

        if (name) {
          const isBlockStart = [
            'for',
            'if',
            'unless',
            'paginate',
            'form',
          ].includes(name);
          if (isBlockStart) {
            const parent = current;
            // Could be fucked.... could have no close tag... or be in wrong palce...
            // Handle this later.
            const nextSiblings = getNextBuilderSiblings(item, parent);

            let skip = 0;
            // TODO: maybe reverse traverse for end tag like compylr...
            const endTag = nextSiblings.find((el) => {
              const { name: siblingName } = tempNodeInfo(el);
              if (name === siblingName) {
                skip++;
                return false;
              }
              const matches = siblingName === 'end' + name;
              if (matches) {
                if (skip) {
                  skip--;
                } else {
                  return true;
                }
              }
              return false;
            });

            if (!endTag) {
              console.warn(
                `Did not find end tag for tag: "${name}"`,
                item.component!.options.value,
              );
            } else {
              updated = true;
              let skip = 0;
              const midTags = nextSiblings
                .slice(0, parent.indexOf(endTag))
                .filter((el) => {
                  const { name: siblingName } = tempNodeInfo(el);
                  if ('if' === siblingName || siblingName === 'unless') {
                    skip++;
                    return false;
                  }
                  const matches =
                    siblingName === 'endunless' || siblingName === 'endif';
                  if (matches) {
                    if (skip) {
                      skip--;
                    } else {
                      // TODO: short circuit
                      return false;
                    }
                  }
                  if (
                    !skip &&
                    ['else', 'elsif'].includes(siblingName as string)
                  ) {
                    return true;
                  }
                  return false;
                });
              if (name === 'if') {
                const allTags = [item].concat(midTags).concat([endTag]);
                const branches: {
                  expression?: string;
                  blocks?: BuilderElement[];
                }[] = [];
                for (let i = 0; i < allTags.length; i++) {
                  const tag = allTags[i];
                  const info = tempNodeInfo(tag);
                  if (info.name === 'endif') {
                    break;
                  }
                  const nextTag = allTags[i + 1];
                  const parsedValue = info.value && JSON.parse(info.value);
                  branches.push({
                    expression: parsedValue.cond
                      ? `${
                          parsedValue.negate ? '!' : ''
                        }${liquidConditionTemplate(parsedValue.cond)}`
                      : '',
                    blocks: parent.slice(
                      parent.indexOf(tag) + 1,
                      parent.indexOf(nextTag),
                    ),
                  });
                }
                this.update(
                  [
                    ...parent.slice(0, parent.indexOf(item)),
                    el({
                      component: {
                        name: 'Shopify:Condition',
                        options: {
                          hash: parsedValue.hash,
                          branches,
                        },
                      },
                    }),
                    ...parent.slice(parent.indexOf(endTag) + 1),
                  ],
                  true,
                );
              }
              // else if (name === 'unless') {
              //unless is rewritten as a Shopify:Condition component
              // }
              else if (name === 'paginate') {
                const allTags = [item].concat(midTags).concat([endTag]);
                const options: any = {};
                for (let i = 0; i < allTags.length; i++) {
                  const tag = allTags[i];
                  const info = tempNodeInfo(tag);
                  if (info.name === 'endpaginate') {
                    break;
                  }
                  const parsedValue = info.value && JSON.parse(info.value);
                  const [expression, limit] = parsedValue.args.split(
                    /\s+by\s*/,
                  );
                  options.expression = expression;
                  options.limit = limit;
                }
                this.update(
                  [
                    ...parent.slice(0, parent.indexOf(item)),
                    el({
                      component: {
                        options,
                        name: 'Shopify:Paginate',
                      },
                      children: parent.slice(
                        parent.indexOf(item) + 1,
                        parent.indexOf(endTag),
                      ),
                    }),
                    ...parent.slice(parent.indexOf(endTag) + 1),
                  ],
                  true,
                );
              } else if (name === 'form') {
                const allTags = [item].concat(midTags).concat([endTag]);
                const options: any = {};
                for (let i = 0; i < allTags.length; i++) {
                  const tag = allTags[i];
                  const info = tempNodeInfo(tag);
                  if (info.name === 'endform') {
                    break;
                  }
                  const parsedValue = info.value && JSON.parse(info.value);
                  const args = parseArgList(parsedValue.args);
                  options.type = args
                    .shift()
                    ?.replace(/"/g, '')
                    .replace(/'/g, '');
                  options.parameter = null;
                  options.customAttributes = null;

                  if (args.length && !args[0].includes(':')) {
                    options.parameter = args.shift();
                  }

                  if (args.length) {
                    options.customAttributes = args;
                  }
                }
                this.update(
                  [
                    ...parent.slice(0, parent.indexOf(item)),
                    el({
                      component: {
                        options,
                        name: 'Shopify:Form',
                      },
                      children: parent.slice(
                        parent.indexOf(item) + 1,
                        parent.indexOf(endTag),
                      ),
                    }),
                    ...parent.slice(parent.indexOf(endTag) + 1),
                  ],
                  true,
                );
              } else if (name === 'for') {
                const options = {
                  repeat: {
                    itemName: parsedValue.variable,
                    collection: parsedValue.collection,
                    expression: parsedValue.fullRaw,
                  },
                };

                this.update(
                  [
                    ...parent.slice(0, parent.indexOf(item)),
                    el({
                      component: {
                        options,
                        name: 'Shopify:For',
                      },
                      children: parent.slice(
                        parent.indexOf(item) + 1,
                        parent.indexOf(endTag),
                      ),
                    }),
                    ...parent.slice(parent.indexOf(endTag) + 1),
                  ],
                  true,
                );
              } else {
                this.update(
                  [
                    ...parent.slice(0, parent.indexOf(item)),
                    el({
                      component: {
                        name: 'Core:Fragment',
                      },
                      bindings: {} as { [key: string]: string },
                      ...(name === 'for' &&
                        !isError(parsedValue) && {
                          repeat: {
                            itemName: parsedValue.variable,
                            collection: liquidBindingTemplate(
                              parsedValue.collection,
                            ),
                          },
                        }),
                      children: parent.slice(
                        parent.indexOf(item) + 1,
                        parent.indexOf(endTag),
                      ),
                    }),
                    ...parent.slice(parent.indexOf(endTag) + 1),
                  ],
                  true,
                );
              }

              break;
            }
          }
        }
      }
    });
  }
  latest = moveCondtionalTagsUp(latest);
  latest = matchConditionalTagsWithEndings(latest);
  return latest;
};

export const htmlAstToBuilder = async (
  nodes: compiler.ASTNode[],
  options: LiquidToBuilderOptions,
) => {
  // TODO: need to pass through index and array so can see if before/after is for, etc
  const els = compact(
    flatten(
      await Promise.all(
        nodes
          .filter((node) => isTextNode(node) || isElement(node))
          .map((node, index, nodes) =>
            htmlNodeToBuilder(node, index, nodes, options),
          ),
      ),
    ),
  );
  return els;
};

export const processedAstToBuilder = async (
  nodes: compiler.ASTNode[],
  options: LiquidToBuilderOptions,
) => {
  // TODO: need to pass through index and array so can see if before/after is for, etc
  const els = await htmlAstToBuilder(nodes, options);
  const processed = await postProcessBuilderTree(fastClone(els), options);
  return { blocks: processed, preprocessed: els };
};

export interface LiquidToBuilderOptions {
  log?: boolean;
  themeId?: string;
  importSections?: boolean;
  importSnippets?: boolean;
  translations?: { [key: string]: string };
  cachebust?: boolean;
  auth?: {
    token?: string;
    publicKey?: string;
  };
}

export const htmlDebugString = (els: BuilderElement[]) => {
  const str = els.map((el) => htmlDebugNodeString(el)).join('\n');
  return tryFormat(str);
};

export const tryFormat = (str: string) => {
  try {
    return format(str, {
      parser: 'html',
      htmlWhitespaceSensitivity: 'ignore',
      plugins: [htmlParser],
    });
  } catch (err) {
    console.warn('Prettier failed', err);
    return str;
  }
};

const htmlDebugNodeString = (el: BuilderElement): string => {
  const tagName = (el.component && el.component.name) || el.tagName;
  const properties: [string, string][] = [];

  for (const property in el.properties) {
    const value = el.properties[property] as any;
    if (property !== 'attr') {
      properties.push([property, value]);
    } else {
      for (const attr in value) {
        properties.push([attr, value[attr]]);
      }
    }
  }
  for (const binding in el.bindings) {
    properties.push([':' + binding, el.bindings[binding]]);
  }
  if (el.component && el.component.options) {
    for (const property in el.component.options) {
      let value = el.component.options[property];
      if (value && typeof value === 'object') {
        value = JSON.stringify(value);
      }
      properties.push(['@' + property, String(value)]);
    }
  }
  return `<${tagName} ${properties.reduce(
    (memo, tuple) =>
      memo + ` ${tuple[0]}="${(tuple[1] || '').replace(/"/g, '`')}"`,
    '',
  )}
    ${
      el.children && el.children.length
        ? `>${el.children
            .map((child) => htmlDebugNodeString(child))
            .join('\n')}</${tagName}>`
        : '/>'
    }
  `;
};

/**
 * This function is the first step, before we turn the liquid into an AST.
 * It is used to make certain changes to the liquid string that are much
 * easier to do before we process it. Examples of this include rewriting
 * certain tags to a format we already know how to parse, or fixing common
 * liquid template errors that cause problems during import.
 *
 * Note: there are a lot of regexes in here, and they can be confusing!
 * If you are trying to debug something that includes a regex, try using
 * a tool like https://regex101.com/ to break down what is going on.
 */
export const preprocessLiquid = async (
  liquid: string,
  options: LiquidToBuilderOptions = {},
) => {
  let processedLiquid = liquid || '';

  /**
   * Replace <svg>*</svg> with custom code
   * TODO: maybe instead do this in the post proces HTML AST and have a way to serialize the HTML
   * AST back to HTML
   */
  // Adding but commenting out for now as this has pros and cons and may decide to use later but not quite yet
  // processedLiquid = processedLiquid.replace(/<svg[\s\S]+?<\/svg>/gi, match =>
  //   // TODO: maybe a way to noWrap this as an option? in meta?
  //   serializeBlock({
  //     layerName: 'Svg',
  //     responsiveStyles: {
  //       large: {
  //         display: 'inline'
  //       }
  //     },
  //     component: {
  //       name: 'Custom Code',
  //       options: {
  //         code: match,
  //       },
  //     },
  //   })
  // );

  /**
   * Remove capture tags that include liquid template logic and replace references
   * to the captured string with the full template string. The reason for this is so
   * that we are able to create Builder elements out of the contents of the capture tag
   * instead of it just getting render via a liquid string
   */
  // Grab the contents and variable name of capture tags, i.e. {% capture ... %} ... {% endcapture %}
  const captureGroupRegex = /{%-?\s*capture\s*(.+?)-?%}([\s\S]*?){%-?\s*endcapture\s*-?%}/gi;
  let matchedCaptureGroup;

  const allCaptureGroupMatches: any[] = [];
  while (
    (matchedCaptureGroup = captureGroupRegex.exec(processedLiquid)) !== null
  ) {
    const [match, capturedVariableName, capturedContents] = matchedCaptureGroup;
    const capturedContentsHasLiquid = capturedContents?.match(/\{%/gim);
    const capturedContentContainsCaptureTag = capturedContents?.match(
      /{%-?\s*capture/gim,
    );

    if (
      capturedVariableName &&
      capturedContentsHasLiquid &&
      !capturedContentContainsCaptureTag
    ) {
      // We want to find a replace any instances of the captured variable in the template, i.e. {{ my_variable }}
      allCaptureGroupMatches.push({
        match,
        capturedVariableName,
        capturedContents,
      });
      const capturedVariableReplaceRegex = new RegExp(
        `{{-?\\s*${capturedVariableName.trim()}\\s*-?}}`,
        'gi',
      );

      processedLiquid = processedLiquid.replace(
        capturedVariableReplaceRegex,
        capturedContents,
      );
    } else if (capturedContentContainsCaptureTag) {
      console.warn('Capture tag preprocess contained nested capture tag', {
        match,
        capturedVariableName,
        capturedContents,
      });
    }
  }

  // For any capture tag that we found, we still want to add it to the state
  // even though we replaced any {{ captured_variable }} tags with the actual contents
  // of the capture. The reason for this is so that expressions like:
  //
  // {% capture headlines%}....{% endcapture %}
  // {% assign headline_length = headlines | split: '^' | size %}
  //
  // will still work
  if (allCaptureGroupMatches.length) {
    for (const captureMatch of allCaptureGroupMatches) {
      const captureReplacement = `{% capture ${captureMatch.capturedVariableName} %}{% raw %}${captureMatch.capturedContents}{% endraw %}{% endcapture %}`;
      processedLiquid = processedLiquid.replace(
        captureMatch.match,
        captureReplacement,
      );
    }
  }

  /**
   * Transform any `with` statements inside of {% include %} tags to be key/values instead
   */
  const includesWithRegex = /{%-?\s*include\s*([\S]+?)\s*with\s*([\S]+?)\s*-?%}/gi;
  processedLiquid = processedLiquid.replace(
    includesWithRegex,
    (fullIncludesMatch, templateName, withMatch) => {
      const templateNameCleaned = templateName
        .trim()
        .replace(/'/g, '')
        .replace(/"/g, '');
      return `{% include '${templateNameCleaned}', ${templateNameCleaned}: ${withMatch} %}`;
    },
  );

  /**
   * Transform any `with` statements inside of {% include %} tags that have key values to be regular key/values instead.
   *
   * e.g {%include 'responsive-image' with image: image_object, max_width: 480 }
   */
  const includesWithAndValuesRegex = /{%-?\s*include\s*([\S]+?)\s*with\s*(([\S]+?:\s*[\S]+?,?\s*)+)-?%}/gi;
  processedLiquid = processedLiquid.replace(
    includesWithAndValuesRegex,
    (fullIncludesMatch, templateName, allKeysAndValues) => {
      const templateNameCleaned = templateName
        .trim()
        .replace(/'/g, '')
        .replace(/"/g, '');

      const allKeysAndValuesCleaned = allKeysAndValues
        .trim()
        .replace(/\s+/g, ' ');
      return `{% include '${templateNameCleaned}', ${allKeysAndValuesCleaned} %}`;
    },
  );

  /**
   * Transform `{% ... template contains ... %}` statements to use template.name
   */
  const templateContainsRegex = /{%-?(.+?)template\s+contains\s+(.+?)-?%}/gi;
  processedLiquid = processedLiquid.replace(
    templateContainsRegex,
    (fullTemplateMatch, templatePrefixText, templatePostfixText) => {
      return `{% ${templatePrefixText} template.name contains ${templatePostfixText} %}`;
    },
  );

  /**
   * Transform any HTML boolean attributes that are touching liquid brackets
   * into having space around them e.g.:
   *
   * <input {% if forloop.first %} checked{% endif %} />
   *
   * This list is definitely not exhaustive of all HTML boolean attributes, but we can add more in the future if needed.
   * This approach will break things if people use these words in attribute values e.g.
   *
   * <a href="/some-path/{% if foo %}checked{% endif %}">link</a>
   *
   * but we will need to fix that when the time comes. One approach will be a post liquid to AST step where we do something
   * like what is described here: https://builder-internal.slack.com/archives/CRD6L7GC8/p1588193831046700
   */
  const booleanHTMLAttributes = ['checked', 'disabled', 'selected'];

  for (const booleanAttribute of booleanHTMLAttributes) {
    const booleanAttributeRegex = new RegExp(
      `<[\\s\\S]*?(${booleanAttribute}{%)[\\s\\S]*?>`,
      'gi',
    );

    processedLiquid = processedLiquid.replace(
      booleanAttributeRegex,
      (fullMatch, attributeMatch) => {
        return fullMatch.replace(`${attributeMatch}`, `${booleanAttribute} {%`);
      },
    );
  }

  /**
   * Transform any calls to {{ content_for_index }} with section tags. The content_for_index
   * is something shopify injects to the page via the visual editor they have. It specifies the
   * sections that are used on customizable pages Here is some more info: https://shopify.dev/docs/themes/files/theme-liquid.
   */
  const themeAsset = await getShopifyAsset(
    'config/settings_data.json',
    options,
  );
  const themeSettings =
    typeof themeAsset === 'string' && attempt(() => JSON.parse(themeAsset));

  if (themeSettings && !isError(themeSettings)) {
    const contentForIndexTemplates =
      themeSettings.current?.content_for_index ||
      themeSettings.presets?.Default?.content_for_index;

    if (contentForIndexTemplates.length) {
      const contentForIndexLiquidStrings = contentForIndexTemplates.map(
        (template: string) => `{% section '${template}' %}`,
      );
      const contentForIndexRegex = /{{\s*content_for_index\s*}}/gi;
      processedLiquid = processedLiquid.replace(
        contentForIndexRegex,
        (fullMatch) => {
          return fullMatch.replace(
            fullMatch,
            contentForIndexLiquidStrings.join(''),
          );
        },
      );
    }
  }

  return processedLiquid;
};

export const liquidToBuilder = async (
  liquid: string,
  options: LiquidToBuilderOptions = {},
) => {
  if (options.log) {
    console.log('liquidToBuilder: liquid', { liquid });
  }

  const preprocessedLiquid = await preprocessLiquid(liquid, options);
  if (options.log) {
    console.log('preprocessedLiquid: ', { preprocessedLiquid });
  }

  const scriptRe = /<script[\s\S]*?>[\s\S]*?<\/script>/gi;
  const scriptsInLiquid = preprocessedLiquid.match(scriptRe);
  const parsedTemplateItems = liquidToAst(
    preprocessedLiquid.replace(scriptRe, ''),
    options,
  );
  if (options.log) {
    console.log('liquidToBuilder: parsed liquid', parsedTemplateItems);
  }
  let html = await parsedLiquidToHtml(parsedTemplateItems, options);
  const themeAsset = await getShopifyAsset(
    'config/settings_data.json',
    options,
  );
  const themeSettings =
    typeof themeAsset === 'string' && attempt(() => JSON.parse(themeAsset));
  if (
    themeSettings &&
    !isError(themeSettings) &&
    options.importSections !== false
  ) {
    const serialized = serializeBlock(
      {
        layerName: `Theme Settings`,
        component: {
          name: 'Shopify:ThemeProvider',
          options: {
            shopifyMetafields: [
              { path: 'state.settings', as: '_theme_settings' },
            ],
            state: {
              settings: mapArrays(omit(themeSettings.current, 'sections')),
            },
          },
        },
      },
      false,
    );
    html = `${serialized}${html}${serializedBlockCloseTag}`;
  }
  if (options.log) {
    console.log('liquidToBuilder: html', { html });
  }
  const { htmlNodes } = htmlToAst(html);
  if (options.log) {
    console.log('liquidToBuilder: parsed html', htmlNodes);
  }
  // TODO: remove builder-component blocks
  const { blocks } = await processedAstToBuilder(htmlNodes, options);
  if (Array.isArray(scriptsInLiquid) && scriptsInLiquid.length > 0) {
    blocks.push(
      el({
        layerName: 'Imported Script',
        component: {
          name: 'Custom Code',
          options: {
            code: scriptsInLiquid.join(''),
            replaceNodes: true,
          },
        },
      }),
    );
  }

  if (options.importSections !== false) {
    // TODO: special option for this
    // blocks.unshift(
    //   el({
    //     layerName: 'BuiltWithBuilder flag',
    //     component: {
    //       name: 'Custom Code',
    //       options: {
    //         code: '<script>window.builtWithBuilder = true</script>',
    //       },
    //     },
    //   }),
    // );
  }
  if (options.log) {
    console.log('liquidToBuilder: blocks', JSON.stringify(blocks));
  }
  return blocks;
};

export const htmlToBuilder = async (html: string) => {
  const { htmlNodes } = htmlToAst(html);
  console.log('procesed', htmlNodes);
  const { blocks } = await processedAstToBuilder(htmlNodes, {});
  console.log('blocks', blocks);
  return blocks;
};

export const bindingsFromAttrs = async (
  node: compiler.ASTElement,
  bindings: Record<string, any>,
  properties: Record<string, any>,
  options: LiquidToBuilderOptions,
) => {
  const getIndexOfClosingTag = (start: number, closingTags: string[]) => {
    let i = start;
    let cursor = 1;
    while (i < node.attrsList.length) {
      const { name } = node.attrsList[i];
      if (name === '[if]') {
        if (!closingTags.includes('[else]')) {
          throw new Error('if after else');
        }
        cursor++;
      }
      if (closingTags.includes(name)) {
        cursor--;
        if (cursor === 0) {
          return i;
        }
      }
      i++;
    }
    throw new Error(`${cursor}  no matching closing tag`);
  };

  const getConditionalValue = (
    conditions: Condition[],
    value: string,
    defaultValue: string,
  ) => {
    return conditions.length > 0
      ? `/*start*/${conditions
          .map(
            (c) =>
              `${c.negate ? '!' : ''}${liquidConditionTemplate(c.expression)}`,
          )
          .join('&&') + ` ? ${value} : (${defaultValue})`}/*end*/`
      : value;
  };

  const parseAttrsInRange = async (
    start: number,
    end: number,
    conditions: Condition[],
  ) => {
    let i = start;
    let keyForImage = '';

    while (i < end) {
      const { name, value } = node.attrsList[i];
      const key = name;
      let jump = 1;
      if (hasTag(key)) {
        const stuff = JSON.parse(htmlDecode(value));

        if (key === '[if]') {
          jump = getIndexOfClosingTag(i + 1, ['[endif]']);
          await parseAttrsInRange(
            i + 1,
            jump,
            conditions.concat([
              { expression: stuff.cond, negate: stuff.negate },
            ]),
          );
        } else if (key === '[unless]') {
          jump = getIndexOfClosingTag(i + 1, ['[endunless]']);
          await parseAttrsInRange(
            i + 1,
            jump,
            conditions.concat([{ expression: stuff.cond, negate: true }]),
          );
        } else if (key === '[else]') {
          jump = getIndexOfClosingTag(i + 1, ['[endif]']);
          await parseAttrsInRange(
            i + 1,
            jump,
            conditions.map((cond) => ({ ...cond, negate: !cond.negate })),
          );
        } else if (key === '[elsif]') {
          jump = getIndexOfClosingTag(i + 1, ['[elsif]', '[endif]']);
          const elseConditions: Condition[] = conditions.map((cond) => ({
            ...cond,
            negate: !cond.negate,
          }));
          await parseAttrsInRange(
            i + 1,
            jump,
            elseConditions.concat([{ expression: stuff.cond }]),
          );
        }
      } else if (hasTag(value)) {
        let liquidStr = stringWithBindingsToLiquid(value);
        // Remove trailing semi-colon because the liquid render function does not know how to handle it
        liquidStr = liquidStr?.replace(/;$/, '');
        let useKey = key;
        if (
          (keyForImage == key ||
            (!keyForImage && (key === 'src' || key === 'data-src'))) &&
          node.tag === 'img'
        ) {
          useKey = 'component.options.image';
          keyForImage = key;
        }
        if (key === 'data-srcset' && node.tag === 'img') {
          useKey = 'srcset';
        }
        if (useKey === 'style') {
          useKey = 'attr.style';
        }
        bindings[useKey] = getConditionalValue(
          conditions,
          liquidRenderTemplate(liquidStr),
          bindings[useKey],
        );

        const parsed = parseTag(value);
        if (parsed && parsed.value && parsed.name === 'output') {
          const parsedValue = JSON.parse(parsed.value);

          // TODO: this makes a call for each node, maybe put the local json on the state instead?
          const translation = await getTranslation(parsedValue, options);
          if (translation !== null) {
            if (conditions.length === 0) {
              delete bindings[key];
              properties[key] = translation;
            } else {
              bindings[key] = getConditionalValue(
                conditions!,
                `'${translation}'`,
                bindings[key],
              );
            }
          }
        }
      } else {
        if (key === 'style' && conditions.length === 0) {
          if (!properties.attr) {
            // TODO: use another property? hm
            (properties as any).attr = {};
          }
          (properties.attr as any).style = value;
          console.warn('skipping style', value);
        } else if (key.includes('[')) {
          console.warn('Found property key with [', key);
        } else {
          if (conditions.length > 0) {
            const useKey = key === 'style' ? 'attr.style' : key;
            bindings[useKey] = getConditionalValue(
              conditions,
              `'${value}'`,
              bindings[useKey],
            );
          } else {
            properties[key] = value;
          }
          // TEMP HACK FOR LAZY IMAGES
          if (key === 'data-src') {
            properties.src = value;
          }
        }
      }
      i += jump;
    }
  };
  await parseAttrsInRange(0, node.attrsList.length, []);
};
