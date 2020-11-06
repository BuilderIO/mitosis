import { BuilderContent, BuilderElement, Builder } from '@builder.io/sdk';
import * as prettier from 'prettier/standalone';
import * as tsParser from 'prettier/parser-typescript';
import { last, escapeRegExp, capitalize, reduce } from 'lodash';
import { component, getComponentInfo, ComponentInfo } from './modules/components';

interface BuilderToJsxOptions {
  reactMode?: boolean;
  includeUid?: boolean;
}

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

const tryFormat = (code: string) => {
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

const stringify = (json: Json) => {
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
        str += json.map(item => stringify(item)).join(',');
        str += ']';
      } else if ((json as any)['@type'] === '@builder.io/sdk:Element') {
        str += blockToJsx(json as any);
      } else {
        str += '{';
        for (const key in json) {
          str += JSON.stringify(key);
          str += ':';
          str += stringify(json[key] as any);
          str += ',';
        }
        str += '}';
      }
  }
  return str;
};

export const contentToJsx = (content: BuilderContent, options: BuilderToJsxOptions = {}) => {
  const prefixBlock = content.data?.blocks?.find(
    item => item?.component?.name === 'Builder:Snippet'
  );
  const suffixBlock = content.data?.blocks
    ?.slice()
    .reverse()
    .find(item => item?.component?.name === 'Builder:Snippet');

  let str = '';

  if (prefixBlock) {
    str += blockToJsx(prefixBlock, options);
  }
  str += '<>';
  str +=
    content.data?.blocks
      ?.filter(block => block !== prefixBlock && block !== suffixBlock)
      .map(item => blockToJsx(item, options))
      .join('\n') || '';

  str += '</>';

  if (suffixBlock) {
    str += blockToJsx(suffixBlock, options);
  }

  return tryFormat(str);
};

export const blockToJsx = (
  block: BuilderElement & { code?: any },
  options: BuilderToJsxOptions = {}
) => {
  const tagName = block.tagName || 'div';
  let str = '';

  let needsCloseSquiggly = false;
  let hasCondition = false;

  if (options?.reactMode) {
    const show = block.code?.bindings?.show || block.bindings?.show;
    if (show) {
      hasCondition = true;
      needsCloseSquiggly = true;
      str += ' { ';
      str += ` (${show}) && (`;
    }

    const hide = block.code?.bindings?.hide || block.bindings?.hide;
    if (hide) {
      needsCloseSquiggly = true;

      if (!hasCondition) {
        str += ' { ';
      } else {
        str += ' && ';
      }
      hasCondition = true;

      str += ` !(${hide}) && (`;
    }

    if (block.repeat?.collection) {
      if (!hasCondition) {
        str += ' { ';
      }
      needsCloseSquiggly = true;
      const itemName = block.repeat.itemName || last(block.repeat.collection.split('.')) + 'Item';
      str += `(${block.repeat.collection}).map((${itemName}) => (`;
    }
  }

  const componentName = block.component?.name;

  // TODO: stateless way to pass available components too
  const componentInfo =
    (componentName && getComponentInfo(componentName)) ||
    Builder.components.find(item => item.name === componentName) ||
    null;
  const noWrap = componentInfo?.noWrap;

  // TDOO: will need to transform at some point and reference
  const ComponentName = block.component?.name.replace(/[^a-z0-9]/gi, '');

  const zeroWrapping = Boolean(noWrap && (componentInfo as ComponentInfo)?.component);

  if (zeroWrapping) {
    str += (componentInfo as ComponentInfo).component(block);
  } else {
    if (noWrap) {
      str += `<${ComponentName}`;
    } else {
      str += `<${tagName}`;
    }

    if (block.id && options.includeUid !== false) {
      str += ` uid="${block.id?.replace('builder-', '')}"`;
    }

    for (const property in block.properties) {
      if (block.bindings?.[`properties.${property}`]) {
        continue;
      }
      const propertyName = property === 'class' ? 'className' : property;
      str += ` ${propertyName}="${block.properties[property]}"`;
    }

    if (block.responsiveStyles) {
      const cssObj: any = block.responsiveStyles?.large || {};
      for (const sizeName of ['medium', 'small', 'xsmall']) {
        const val = size((block.responsiveStyles as any)?.[sizeName]);
        if (val) {
          cssObj[sizeName] = val;
        }
      }
      if (size(cssObj)) {
        str += ` css={${JSON.stringify(cssObj)}}`;
      }
    }

    for (const property in block.bindings) {
      let value = block.code?.bindings[property] || block.bindings[property];
      value = value.replace(/context\.shopify\.liquid\.render/g, 'liquid');
      // TODO: handle style bindings, component options
      // TEMP HACK
      if (
        (!property.includes('.') &&
          (!options?.reactMode || !['show', 'hide'].includes(property))) ||
        property.startsWith('properties.')
      ) {
        const useProperty = property === 'class' ? 'className' : last(property.split('.'));
        str += ` ${useProperty}={${value}}`;
      }
    }

    if (block.repeat && !options?.reactMode) {
      // TODO: same logic as react lib for figuring out item names
      const itemName = block.repeat.itemName || last(block.repeat.collection.split('.')) + 'Item';
      str += ` for="${itemName} of ${block.repeat.collection}"`;
    }

    for (const property in { ...block.actions, ...block.code?.actions }) {
      const value = block.code?.actions?.[property] || block.actions?.[property];
      str += ` on${capitalize(property)}={() => ${value}}`;
    }

    if (!noWrap) {
      str += '>';
    }

    if (block.component) {
      if (!noWrap) {
        str += `<${ComponentName}`;
      }

      for (const property in block.component.options) {
        if (block.bindings?.[`component.options.${property}`]) {
          continue;
        }
        const propertyName = property === 'class' ? 'className' : property;
        const value = block.component.options[property];

        const stringifiedValue = stringify(value);

        const finalValue = stringifiedValue.replace(/context\.shopify\.liquid\.render/g, 'liquid');
        str += ` ${propertyName}={${finalValue}}`;
      }

      for (const property in { ...block.bindings, ...block.code?.bindings }) {
        const value = (block.code?.bindings?.[property] || block.bindings?.[property]).replace(
          /context\.shopify\.liquid/g,
          'liquid'
        );
        // TODO: handle style bindings, component options
        if (property.startsWith('options.') || property.startsWith('component.options.')) {
          const useProperty = property === 'class' ? 'className' : last(property.split('.'));

          str += ` ${useProperty}={${value}}`;
        }
      }
      str += '>';
    }

    str += block.children?.map(item => blockToJsx(item, options)).join('\n') || '';

    if (block.component && !noWrap) {
      str += `</${ComponentName}>`;
    }

    if (noWrap) {
      str += `</${ComponentName}>`;
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
