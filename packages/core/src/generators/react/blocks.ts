import { filterEmptyTextNodes } from '@/helpers/filter-empty-text-nodes';
import isChildren from '@/helpers/is-children';
import { isRootTextNode } from '@/helpers/is-root-text-node';
import { isValidAttributeName } from '@/helpers/is-valid-attribute-name';
import { getForArguments } from '@/helpers/nodes/for';
import { isSlotProperty } from '@/helpers/slots';
import { MitosisComponent } from '@/types/mitosis-component';
import { checkIsForNode, ForNode, MitosisNode } from '@/types/mitosis-node';
import { SELF_CLOSING_HTML_TAGS } from '../../constants/html_tags';
import { closeFrag, getFragment, openFrag, processBinding, wrapInFragment } from './helpers';
import { updateStateSettersInCode } from './state';
import { ToReactOptions } from './types';

const NODE_MAPPERS: {
  [key: string]: (
    json: MitosisNode,
    options: ToReactOptions,
    component: MitosisComponent,
    parentSlots: any[],
  ) => string;
} = {
  Slot(json, options, component, parentSlots) {
    const slotName = json.bindings.name?.code || json.properties.name;

    const hasChildren = json.children.length;

    const renderChildren = () => {
      const childrenStr = json.children
        ?.map((item) => blockToReact(item, options, component))
        .join('\n')
        .trim();
      /**
       * Ad-hoc way of figuring out if the children defaultProp is:
       * - a JSX element, e.g. `<div>foo</div>`
       * - a JS expression, e.g. `true`, `false`
       * - a string, e.g. `'Default text'`
       *
       * and correctly wrapping it in quotes when appropriate.
       */
      if (childrenStr.startsWith(`<`) && childrenStr.endsWith(`>`)) {
        return childrenStr;
      } else if (['false', 'true', 'null', 'undefined'].includes(childrenStr)) {
        return childrenStr;
      } else {
        return `"${childrenStr}"`;
      }
    };

    if (!slotName) {
      // TODO: update MitosisNode for simple code
      const key = Object.keys(json.bindings).find(Boolean);
      if (key && parentSlots) {
        parentSlots.push({ key, value: json.bindings[key]?.code });
        return '';
      }

      const children = processBinding('props.children', options);
      return `<>{${children} ${hasChildren ? `|| (${renderChildren()})` : ''}}</>`;
    }

    let slotProp = processBinding(slotName as string, options).replace('name=', '');

    if (!slotProp.startsWith('props.')) {
      slotProp = `props.${slotProp}`;
    }

    return `<>{${slotProp} ${hasChildren ? `|| (${renderChildren()})` : ''}}</>`;
  },
  Fragment(json, options, component) {
    const wrap = wrapInFragment(json) || isRootTextNode(json);
    return `${wrap ? getFragment('open', options) : ''}${json.children
      .map((item) => blockToReact(item, options, component))
      .join('\n')}${wrap ? getFragment('close', options) : ''}`;
  },
  For(_json, options, component) {
    const json = _json as ForNode;
    const wrap = wrapInFragment(json);
    const forArguments = getForArguments(json).join(', ');
    return `{${processBinding(
      json.bindings.each?.code as string,
      options,
    )}?.map((${forArguments}) => (
      ${wrap ? openFrag(options) : ''}${json.children
      .filter(filterEmptyTextNodes)
      .map((item) => blockToReact(item, options, component))
      .join('\n')}${wrap ? closeFrag(options) : ''}
    ))}`;
  },
  Show(json, options, component) {
    const wrap =
      wrapInFragment(json) ||
      isRootTextNode(json) ||
      component.children[0] === json ||
      // when `<Show><For>...</For></Show>`, we need to wrap the For generated code in a fragment
      // since it's a `.map()` call
      (json.children.length === 1 && ['For', 'Show'].includes(json.children[0].name));

    const wrapElse =
      json.meta.else &&
      (wrapInFragment(json.meta.else as any) || checkIsForNode(json.meta.else as any));

    return `{${processBinding(json.bindings.when?.code as string, options)} ? (
      ${wrap ? openFrag(options) : ''}${json.children
      .filter(filterEmptyTextNodes)
      .map((item) => blockToReact(item, options, component))
      .join('\n')}${wrap ? closeFrag(options) : ''}
    ) : ${
      !json.meta.else
        ? 'null'
        : (wrapElse ? openFrag(options) : '') +
          blockToReact(json.meta.else as any, options, component) +
          (wrapElse ? closeFrag(options) : '')
    }}`;
  },
};

const ATTTRIBUTE_MAPPERS: { [key: string]: string } = {
  spellcheck: 'spellCheck',
  autocapitalize: 'autoCapitalize',
  autocomplete: 'autoComplete',
  for: 'htmlFor',
};

// TODO: Maybe in the future allow defining `string | function` as values
const BINDING_MAPPERS: {
  [key: string]:
    | string
    | ((key: string, value: string, options?: ToReactOptions) => [string, string]);
} = {
  ref(ref, value, options) {
    if (options?.preact) {
      return [ref, value];
    }
    const regexp = /(.+)?props\.(.+)( |\)|;|\()?$/m;
    if (regexp.test(value)) {
      const match = regexp.exec(value);
      const prop = match?.[2];
      if (prop) {
        return [ref, prop];
      }
    }
    return [ref, value];
  },
  innerHTML(_key, value) {
    return ['dangerouslySetInnerHTML', `{__html: ${value.replace(/\s+/g, ' ')}}`];
  },
  ...ATTTRIBUTE_MAPPERS,
};

const NATIVE_EVENT_MAPPER: {
  [key: string]: string;
} = {
  onClick: 'onPress',
};

export const blockToReact = (
  json: MitosisNode,
  options: ToReactOptions,
  component: MitosisComponent,
  parentSlots: any[] = [],
) => {
  if (NODE_MAPPERS[json.name]) {
    return NODE_MAPPERS[json.name](json, options, component, parentSlots);
  }

  if (json.properties._text) {
    const text = json.properties._text;
    if (options.type === 'native' && text.trim().length) {
      return `<Text>${text}</Text>`;
    }
    return text;
  }
  if (json.bindings._text?.code) {
    const processed = processBinding(json.bindings._text.code, options);
    if (
      options.type === 'native' &&
      !isChildren({ node: json }) &&
      !isSlotProperty(json.bindings._text.code.split('.')[1] || '')
    ) {
      return `<Text>{${processed}}</Text>`;
    }
    return `{${processed}}`;
  }

  let str = '';

  str += `<${json.name} `;

  for (const key in json.properties) {
    const value = (json.properties[key] || '').replace(/"/g, '&quot;').replace(/\n/g, '\\n');

    if (key === 'class') {
      str = `${str.trim()} className="${value}" `;
    } else if (BINDING_MAPPERS[key]) {
      const mapper = BINDING_MAPPERS[key];
      if (typeof mapper === 'function') {
        const [newKey, newValue] = mapper(key, value, options);
        str += ` ${newKey}={${newValue}} `;
      } else {
        str += ` ${BINDING_MAPPERS[key]}="${value}" `;
      }
    } else {
      if (isValidAttributeName(key)) {
        str += ` ${key}="${(value as string).replace(/"/g, '&quot;')}" `;
      }
    }
  }

  for (const key in json.bindings) {
    // ignore duplicate slot attribute
    if (json.slots[key]) {
      continue;
    }

    const value = String(json.bindings[key]?.code);

    if (key === 'css' && value.trim() === '{}') {
      continue;
    }

    const useBindingValue = processBinding(value, options);

    if (json.bindings[key]?.type === 'spread') {
      str += ` {...(${value})} `;
    } else if (key.startsWith('on')) {
      const { arguments: cusArgs = ['event'] } = json.bindings[key]!;
      const eventName = options.type === 'native' ? NATIVE_EVENT_MAPPER[key] || key : key;
      str += ` ${eventName}={(${cusArgs.join(',')}) => ${updateStateSettersInCode(
        useBindingValue,
        options,
      )} } `;
    } else if (key.startsWith('slot')) {
      // <Component slotProjected={<AnotherComponent />} />
      str += ` ${key}={${value}} `;
    } else if (key === 'class') {
      str += ` className={${useBindingValue}} `;
    } else if (BINDING_MAPPERS[key]) {
      const mapper = BINDING_MAPPERS[key];
      if (typeof mapper === 'function') {
        const [newKey, newValue] = mapper(key, useBindingValue, options);
        str += ` ${newKey}={${newValue}} `;
      } else {
        if (useBindingValue === 'true') {
          str += ` ${BINDING_MAPPERS[key]} `;
        } else {
          str += ` ${BINDING_MAPPERS[key]}={${useBindingValue}} `;
        }
      }
    } else if (key === 'style' && options.type === 'native' && json.name === 'ScrollView') {
      // React Native's ScrollView has a different prop for styles: `contentContainerStyle`
      str += ` contentContainerStyle={${useBindingValue}} `;
    } else {
      if (isValidAttributeName(key)) {
        if (useBindingValue === 'true') {
          str += ` ${key} `;
        } else {
          str += ` ${key}={${useBindingValue}} `;
        }
      }
    }
  }

  if (json.slots) {
    for (const key in json.slots) {
      const value = json.slots[key];
      if (!value?.length) {
        continue;
      }
      const reactComponents = value.map((node) => blockToReact(node, options, component));
      const slotStringValue =
        reactComponents.length === 1 ? reactComponents[0] : `<>${reactComponents.join('\n')}</>`;
      str += ` ${key}={${slotStringValue}} `;
    }
  }

  if (SELF_CLOSING_HTML_TAGS.has(json.name)) {
    return str + ' />';
  }

  // Self close by default if no children
  if (!json.children.length) {
    str += ' />';
    return str;
  }

  // TODO: update MitosisNode for simple code
  const needsToRenderSlots: any[] = [];
  let childrenNodes = '';
  if (json.children) {
    childrenNodes = json.children
      .map((item) => blockToReact(item, options, component, needsToRenderSlots))
      .join('');
  }
  if (needsToRenderSlots.length) {
    needsToRenderSlots.forEach(({ key, value }) => {
      str += ` ${key}={${value}} `;
    });
  }
  str = str.trim() + '>';

  if (json.children) {
    str += childrenNodes;
  }

  return str + `</${json.name}>`;
};
