import { BuilderContent, BuilderElement, Builder } from '@builder.io/sdk';
import * as prettier from 'prettier/standalone';
import * as tsParser from 'prettier/parser-typescript';
import { last, reduce, kebabCase } from 'lodash';
import { component, getComponentInfo, ComponentInfo } from './modules/components';

import './code-generators/components/text';
import './code-generators/components/columns';
// import './code-generators/components/image';
import './code-generators/components/video';
import './code-generators/components/fragment';
import './code-generators/components/section';
import './code-generators/components/button';
import './code-generators/components/symbol';
import './code-generators/components/custom-code';
import './code-generators/components/raw-img';
import { sizes } from './code-generators/constants/sizes';
import { mapToCss } from './code-generators/functions/map-to-css';
import { solidImageComponent } from './constants/solid-image-component';
import { style } from './code-generators/functions/style';

export const capitalize = (str: string): string => (str[0] || '').toUpperCase() + str.substring(1);

const wrapExpression = (expression: string) =>
  `(() => { try { ${expression} } catch (e) { console.warn(e) } })()`;

export interface BuilderToJsxOptions {
  includeBuilder?: boolean;
  format: 'solid' | 'react' | 'lite';
  pretty?: boolean;
  symbol?: boolean;
  name?: string;
}

export interface BuilderToJsxContext {
  prependCode: string;
  symbolCount: number;
  customComponents: Set<string>;
}

export const createBuilderToJsxContext = (): BuilderToJsxContext => ({
  prependCode: '',
  symbolCount: 0,
  customComponents: new Set(),
});

export interface StringMap {
  [key: string]: string | undefined | null;
}

// This list is not exhaustive of all HTML boolean attributes, but we can add more in the future if needed.
const booleanHTMLAttributes = new Set(['checked', 'disabled', 'selected']);

export function mapToAttributes(map: StringMap) {
  if (!size(map)) {
    return '';
  }
  return reduce(
    map,
    (memo, value, key) => {
      let attributeValue = ` ${key}="${value}"`;

      if (booleanHTMLAttributes.has(key) && value) {
        attributeValue = ` ${value}`;
      }

      return memo + attributeValue;
    },
    ''
  );
}

component({
  name: 'Builder:Snippet',
  component: block => block.component?.options.code || '',
  noWrap: true,
});
component({
  name: 'Builder:RawText',
  component: block => block.component?.options.text || '',
  noWrap: true,
});
component({
  name: 'Raw:Img',
  component: block => {
    const { image, ...rest } = block.component!.options;
    // TODO: pass bindings down
    return `<img src="${block.component?.options.image}" ${mapToAttributes({
      ...block.properties,
      ...rest,
    })}  />`;
  },
  noWrap: true,
});

export const tryFormat = (code: string) => {
  try {
    return (
      prettier
        .format(code, {
          parser: 'typescript',
          plugins: [tsParser],
        })
        // Remove ugly and unneeded JSX literal spaces ({" "}) that
        // prettier adds
        .replace(/\{['"]\s*['"]\}/g, '')
        // Prettier doesn't convert self closing tags to remove end tags,
        // so do with regex for common ones
        .replace(/\s*><\/img>/g, ' />')
        .replace(/\s*><\/input>/g, ' />')
        .trim()
        // Remove final ';'
        .replace(/;$/, '')
    );
  } catch (err) {
    console.warn('Could not format code:', err, code);
    return code;
  }
};

const size = (obj?: object) => Boolean(obj && Object.keys(obj).length);

type Json = string | boolean | null | JsonObject | JsonArray;
type JsonArray = Json[];
type JsonObject = { [key: string]: Json | undefined };

const stringify = (json: Json, options: BuilderToJsxOptions, context: BuilderToJsxContext) => {
  let str = '';
  switch (typeof json) {
    case 'string':
    case 'boolean':
    case 'number':
      str += JSON.stringify(json);
      break;
    case 'object':
      if (!json) {
        str += JSON.stringify(json);
      } else if (Array.isArray(json)) {
        str += '[';
        str += json.map(item => stringify(item, options, context)).join(',');
        str += ']';
      } else if ((json as any)['@type'] === '@builder.io/sdk:Element') {
        str += blockToJsx(json as any, options, context);
      } else {
        str += '{';
        for (const key in json) {
          str += JSON.stringify(key);
          str += ':';
          str += stringify(json[key] as any, options, context);
          str += ',';
        }
        str += '}';
      }
  }
  return tryFormat(str);
};

export const contentToJsx = (
  content: BuilderContent,
  options: BuilderToJsxOptions,
  // TODO: separate options object as second argument
  _context = createBuilderToJsxContext()
) => {
  const prefixBlock = content.data?.blocks?.find(
    item => item?.component?.name === 'Builder:Snippet'
  );
  const suffixBlock = content.data?.blocks
    ?.slice()
    .reverse()
    .find(item => item?.component?.name === 'Builder:Snippet');

  let str = '';

  if (prefixBlock) {
    str += blockToJsx(prefixBlock, options, _context);
  }
  if (options.format === 'solid') {
    str += 'import { createState, produce, setState, Show } from "solid-js";';
    if (options.includeBuilder !== false) {
      str += 'import { Builder } from "@builder.io/sdk";';
    }
    str += 'import { css } from "solid-styled-components";';

    str += solidImageComponent;
  }

  if (options.name) {
    str += `\nfunction ${options.name}() {`;
  } else {
    str += `\nexport default function MyComponent() {`;
  }
  if (options.format === 'solid') {
    str += `\n  const [state, setState] = createState(${JSON.stringify(
      content.data?.state || {}
    )});`;
    str += `
      const context = {};
    `;
  } else if (options.format === 'react') {
    const USE_HOOKS = true;
    if (!USE_HOOKS) {
      str += `\n const state = {}`;
      str += `\n const context = {}`;
    } else {
      str += `\n  const [_tick, _setTick] = React.useState(() => 0);`;
      // Trigger component change on state change
      str += `\n  const [state, _setState] = React.useState(() => onChange(${JSON.stringify(
        content.data?.state || {}
      )}, () => {
        _setTick(tick => tick + 1);
      }));
      `;

      // TODO: react context API instead - useContext?
      str += `
        const [context, _setContext] = React.useState({});
      `;
    }
  }

  // TODO: validate JS code is valid by running through lightweight validator first
  str += `
    try {
      // TODO: hook that runs on setup once only. useInit() or something - make custom with internal useState
      if (_tick === 0) {
        ${content.data?.jsCode || ''};
      }
    } catch (err) {
      console.warn('Builder custom code error:', err)
    }
  `;

  str += `\n  return (<div data-builder-content-id="${content.id}">`;
  str +=
    content.data?.blocks
      ?.filter(block => block !== prefixBlock && block !== suffixBlock)
      .map(item => blockToJsx(item, options, _context))
      .join('\n') || '';

  str += '\n  </div>);';
  str += '\n  }';

  if (suffixBlock) {
    str += blockToJsx(suffixBlock, options, _context);
  }

  if (!options.symbol) {
    let prependCode = _context.prependCode || '';

    for (const name of Array.from(_context.customComponents)) {
      prependCode += `
        if (typeof ${name} === 'undefined') {
          var name = () => null;
        }
      `;
    }

    str = prependCode + '\n' + str;
  }

  if (options.pretty) {
    str = tryFormat(str);
  }

  // TODO: prettier option
  return str;
};

export const blockToJsx = (
  block: BuilderElement & { code?: any },
  options: BuilderToJsxOptions,
  _context: BuilderToJsxContext
) => {
  const cssObj = block.responsiveStyles || {};

  let str = '';
  // if (size(cssObj)) {
  //   // Dynamnic styles with `<style jsx dynamic>` when needed from reading bindings
  //   str += '<style jsx>{`';
  //   if (size(cssObj.large)) {
  //     str += `.builder-block.${block.id} {${mapToCss(cssObj.large!)}}`;
  //   }
  //   if (size(cssObj.medium)) {
  //     str += `@media (max-width: 641px){ .builder-block.${block.id} {${mapToCss(
  //       cssObj.medium!
  //     )}} }`;
  //   }
  //   if (size(cssObj.medium)) {
  //     str += `@media (max-width: 320px){ .builder-block.${block.id} {${mapToCss(cssObj.small!)}} }`;
  //   }
  //   str += '`}</style>';
  // }
  const tagName = block.tagName || 'div';

  let needsCloseSquiggly = false;
  let hasCondition = false;

  const componentName = block.component?.name;

  // TODO: stateless way to pass available components too
  const componentInfo = (componentName && getComponentInfo(componentName)) || null;
  const noWrap = componentInfo?.noWrap;

  // TDOO: will need to transform at some point and reference
  const ComponentName = block.component?.name.replace(/[^\w]/gi, '_');

  const zeroWrapping = Boolean(noWrap && (componentInfo as ComponentInfo)?.component);

  if (zeroWrapping) {
    str += (componentInfo as ComponentInfo).component(block, options, _context);
  } else {
    if (noWrap) {
      str += `<${ComponentName}`;
    } else {
      str += `<${tagName}`;
    }

    str += ` builder-id="${block.id?.replace('builder-', '')}"`;

    for (const property in block.properties) {
      if (block.bindings?.[`properties.${property}`]) {
        continue;
      }
      const propertyName = property === 'class' ? 'className' : property;
      str += ` ${propertyName}="${block.properties[property]}"`;
    }

    if (block.responsiveStyles) {
      const cssObj: any = { ...block.responsiveStyles?.large };
      for (const sizeName of ['medium', 'small', 'xsmall']) {
        const val = (block.responsiveStyles as any)?.[sizeName];
        if (size(val)) {
          const width = sizes.getWidthForSize(sizeName as any);
          cssObj[`@media (max-width: ${width}px)`] = val;
        }
      }
      const styleBindings = {} as StringMap;
      for (const property in block.bindings) {
        if (property.startsWith('style.')) {
          const cssProperty = property.replace('style.', '');
          const value = block.bindings[property];
          styleBindings[cssProperty] = value;
        }
      }
      // str += ` className="builder-block ${block.id}" `;
      if (size(cssObj)) {
        // TODO: class property and bindings
        if (options.format === 'solid') {
          str += ` className={css\`${mapToCss(cssObj)}\` + ' builder-block ${block.id}'} `;
        } else {
          // TODO: use emotion css
          str += ` className="builder-block ${block.id}" `;
          str += ` css={${JSON.stringify(cssObj)}}`;
        }
      }

      if (size(styleBindings)) {
        if (options.format === 'solid') {
          // TODO: use css= for data bindings
          str += ` ${style(styleBindings as any, options)} `;
        } else {
          str += ` style={{`;
          for (const key of Object.keys(styleBindings)) {
            str += `'${key}': ${wrapExpression(styleBindings[key]!)}, `;
          }

          str += '}} ';
        }
      }
    }

    for (const property in block.bindings) {
      let value = block.code?.bindings[property] || block.bindings[property];
      // TODO: handle style bindings, component options
      // TEMP HACK
      if (
        // TODO: use solid <If> component
        (!property.includes('.') && !['show', 'hide'].includes(property)) ||
        property.startsWith('properties.')
      ) {
        const useProperty = property === 'class' ? 'className' : last(property.split('.'));
        str += ` ${useProperty}={${wrapExpression(value)}}`;
      }
    }

    // TODO: use Solid <For> component
    // if (block.repeat && !options?.reactMode) {
    //   // TODO: same logic as react lib for figuring out item names
    //   const itemName = block.repeat.itemName || last(block.repeat.collection.split('.')) + 'Item';
    //   str += ` for="${itemName} of ${block.repeat.collection}"`;
    // }

    for (const property in { ...block.actions, ...block.code?.actions }) {
      const value = block.code?.actions?.[property] || block.actions?.[property];
      if (options.format === 'solid') {
        str += ` on${capitalize(property)}={() => setState(produce(state => { ${value}})) }`;
      } else {
        str += ` on${capitalize(property)}={() => { ${value} }}`;
      }
    }

    if (!noWrap) {
      str += '>';
    }

    if (block.component) {
      if (componentInfo) {
        str += (componentInfo as ComponentInfo).component(block, options, _context);
      } else {
        if (!noWrap) {
          str += `<${ComponentName}`;
        }
        _context.customComponents.add(ComponentName!);

        for (const property in block.component.options) {
          if (block.bindings?.[`component.options.${property}`]) {
            continue;
          }
          const propertyName = property === 'class' ? 'className' : property;
          const value = block.component.options[property];

          const stringifiedValue = stringify(value, options, _context);

          const finalValue = stringifiedValue;

          if (finalValue.trim() && finalValue.trim() !== '""') {
            str += ` ${propertyName}={${finalValue}}`;
          }
        }

        for (const property in { ...block.bindings, ...block.code?.bindings }) {
          const value = block.code?.bindings?.[property] || block.bindings?.[property];
          // TODO: handle style bindings, component options
          if (property.startsWith('options.') || property.startsWith('component.options.')) {
            const useProperty = property === 'class' ? 'className' : last(property.split('.'));

            if (value.trim() && value.trim() !== '""') {
              str += ` ${useProperty}={${wrapExpression(value)}}`;
            }
          }
        }
        str += '>';
      }
    }

    if (!componentInfo) {
      str += block.children?.map(item => blockToJsx(item, options, _context)).join('\n') || '';
    }

    if (block.component && !noWrap && !componentInfo) {
      str += `</${ComponentName}>`;
    }

    if (noWrap) {
      // str += `</${ComponentName}>`;
    } else {
      str += `</${tagName}>`;
    }

    if (block.repeat) {
      str += ' ) ';
      if (hasCondition) {
        str += ' ) ';
      }
    }
  }
  if (needsCloseSquiggly) {
    str += ' )} ';
  }

  return str;
};
