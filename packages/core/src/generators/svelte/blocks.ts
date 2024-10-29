import { createSingleBinding } from '@/helpers/bindings';
import isChildren from '@/helpers/is-children';
import { isUpperCase } from '@/helpers/is-upper-case';
import { getForArguments } from '@/helpers/nodes/for';
import { removeSurroundingBlock } from '@/helpers/remove-surrounding-block';
import { isSlotProperty, stripSlotPrefix, toKebabSlot } from '@/helpers/slots';
import { MitosisComponent } from '@/types/mitosis-component';
import { BaseNode, Binding, ForNode, MitosisNode } from '@/types/mitosis-node';
import { SELF_CLOSING_HTML_TAGS, VALID_HTML_TAGS } from '../../constants/html_tags';
import { stripStateAndProps } from './helpers';
import { ToSvelteOptions } from './types';

/**
 * blockToSvelte executed after stripStateAndProps,
 * when stripStateAndProps is executed,
 * SLOT_PREFIX from `slot` change to `$$slots.`
 */
const SLOT_PREFIX = '$$slots.';

const mappers: {
  For: BlockToSvelte<ForNode>;
  Fragment: BlockToSvelte;
  Show: BlockToSvelte;
  Slot: BlockToSvelte;
  style: BlockToSvelte;
  script: BlockToSvelte;
} = {
  style: ({ json, options, parentComponent }) => {
    let props = '';
    for (const key in json.properties) {
      const value = json.properties[key];
      props += ` ${key}="${value}" `;
    }

    let bindings = '';

    for (const key in json.bindings) {
      const value = json.bindings[key];
      if (value && key !== 'innerHTML') {
        bindings += ` ${key}=\${${value.code}} `;
      }
    }

    const innerText = json.bindings.innerHTML?.code || '';

    // We have to obfuscate `"style"` due to a limitation in the svelte-preprocessor plugin.
    // https://github.com/sveltejs/vite-plugin-svelte/issues/315#issuecomment-1109000027
    return `{@html \`<\${'style'} ${bindings} ${props}>\${${innerText}}<\${'/style'}>\`}`;
  },
  script: ({ json, options, parentComponent }) => {
    let props = '';
    for (const key in json.properties) {
      const value = json.properties[key];
      props += ` ${key}="${value}" `;
    }

    let bindings = '';

    for (const key in json.bindings) {
      const value = json.bindings[key];
      if (value && key !== 'innerHTML') {
        bindings += ` ${key}=\${${value.code}} `;
      }
    }

    const innerText = json.bindings.innerHTML?.code || '';

    return `{@html \`<script ${bindings} ${props}>\${${innerText}}</script>\`}`;
  },
  Fragment: ({ json, options, parentComponent }) => {
    if (json.bindings.innerHTML?.code) {
      return BINDINGS_MAPPER.innerHTML(json, options);
    } else if (json.children.length > 0) {
      return `${json.children
        .map((item) => blockToSvelte({ json: item, options, parentComponent }))
        .join('\n')}`;
    } else {
      return '';
    }
  },
  For: ({ json, options, parentComponent }) => {
    const firstChild = json.children[0];
    const keyValue = firstChild.properties.key || firstChild.bindings.key?.code;

    if (keyValue) {
      // we remove extraneous prop which Svelte does not use
      delete firstChild.properties.key;
      delete firstChild.bindings.key;
    }

    const args = getForArguments(json, { excludeCollectionName: true }).join(', ');

    return `
{#each ${json.bindings.each?.code} as ${args} ${keyValue ? `(${keyValue})` : ''}}
${json.children.map((item) => blockToSvelte({ json: item, options, parentComponent })).join('\n')}
{/each}
`;
  },
  Show: ({ json, options, parentComponent }) => {
    return `
{#if ${json.bindings.when?.code} }
${json.children.map((item) => blockToSvelte({ json: item, options, parentComponent })).join('\n')}

  ${
    json.meta.else
      ? `
  {:else}
  ${blockToSvelte({
    json: json.meta.else as MitosisNode,
    options,
    parentComponent,
  })}
  `
      : ''
  }
{/if}`;
  },
  Slot({ json, options, parentComponent }) {
    const slotName = json.bindings.name?.code || json.properties.name;

    const renderChildren = () =>
      json.children
        ?.map((item) => blockToSvelte({ json: item, options, parentComponent }))
        .join('\n');

    if (!slotName) {
      const key = Object.keys(json.bindings).find(Boolean);
      if (!key) {
        if (!json.children?.length) {
          return '<slot/>';
        }
        return `<slot>${renderChildren()}</slot>`;
      }

      return `
        <span #${key}>
        ${json.bindings[key]?.code}
        </span>
      `;
    }

    return `<slot name="${toKebabSlot(slotName, SLOT_PREFIX)}">${renderChildren()}</slot>`;
  },
};

const BINDINGS_MAPPER = {
  innerHTML: (json: MitosisNode, options: ToSvelteOptions) =>
    `{@html ${json.bindings.innerHTML?.code}}`,
};

const SVELTE_SPECIAL_TAGS = {
  COMPONENT: 'svelte:component',
  ELEMENT: 'svelte:element',
  SELF: 'svelte:self',
} as const;

const getTagName = ({
  json,
  parentComponent,
  options,
}: {
  json: MitosisNode;
  parentComponent: MitosisComponent;
  options: ToSvelteOptions;
}) => {
  if (parentComponent && json.name === parentComponent.name) {
    return SVELTE_SPECIAL_TAGS.SELF;
  }

  /**
   * These are special HTML tags that svelte requires `<svelte:element this={TAG}>`
   */
  const SPECIAL_HTML_TAGS = ['script', 'template'];

  if (SPECIAL_HTML_TAGS.includes(json.name)) {
    json.bindings.this = createSingleBinding({
      code: `"${json.name}"`,
    });

    return SVELTE_SPECIAL_TAGS.ELEMENT;
  }

  const isValidHtmlTag = VALID_HTML_TAGS.includes(json.name);

  const isSpecialSvelteTag = json.name.startsWith('svelte:');

  // Check if any import matches `json.name`
  const hasMatchingImport = parentComponent.imports.some(({ imports }) =>
    Object.keys(imports).some((name) => name === json.name),
  );

  // If none of these are true, then we have some type of dynamic tag name
  if (!isValidHtmlTag && !isSpecialSvelteTag && !hasMatchingImport) {
    json.bindings.this = createSingleBinding({
      code: stripStateAndProps({ json: parentComponent, options })(json.name),
    });

    // TO-DO: no way to perfectly decide between <svelte:component> and <svelte:element> for dynamic
    // values...need to do that through metadata overrides for now.
    return SVELTE_SPECIAL_TAGS.COMPONENT;
  }

  return json.name;
};

type BlockToSvelte<T extends BaseNode = MitosisNode> = (props: {
  json: T;
  options: ToSvelteOptions;
  parentComponent: MitosisComponent;
}) => string;

const stringifyBinding =
  (node: MitosisNode, options: ToSvelteOptions) =>
  ([key, binding]: [string, Binding | undefined]) => {
    if (key === 'innerHTML' || !binding) {
      return '';
    }

    const { code, arguments: cusArgs = ['event'], type } = binding;
    const isValidHtmlTag = VALID_HTML_TAGS.includes(node.name) || node.name === 'svelte:element';

    if (type === 'spread') {
      const spreadValue = key === 'props' ? '$$props' : code;
      return ` {...${spreadValue}} `;
    } else if (key.startsWith('on') && isValidHtmlTag) {
      const { async } = binding;
      // handle html native on[event] props
      const event = key.replace('on', '').toLowerCase();
      // TODO: handle quotes in event handler values

      const valueWithoutBlock = removeSurroundingBlock(code);

      if (valueWithoutBlock === key && !async) {
        return ` on:${event}={${valueWithoutBlock}} `;
      } else {
        const asyncKeyword = async ? 'async ' : '';
        return ` on:${event}="{${asyncKeyword}(${cusArgs.join(',')}) => {${valueWithoutBlock}}}" `;
      }
    } else if (key.startsWith('on')) {
      // handle on[custom event] props
      const valueWithoutBlock = removeSurroundingBlock(code);

      if (valueWithoutBlock === key) {
        return ` ${key}={${valueWithoutBlock}} `;
      } else {
        return ` ${key}={(${cusArgs.join(',')}) => ${valueWithoutBlock}}`;
      }
    } else if (key === 'ref') {
      return ` bind:this={${code}} `;
    } else {
      return ` ${key}={${code}} `;
    }
  };

export const blockToSvelte: BlockToSvelte = ({ json, options, parentComponent }) => {
  if (mappers[json.name as keyof typeof mappers]) {
    return mappers[json.name as keyof typeof mappers]({
      json: json as any,
      options,
      parentComponent,
    });
  }

  const tagName = getTagName({ json, parentComponent, options });

  if (isChildren({ node: json, extraMatches: ['$$slots.default'] })) {
    return `<slot></slot>`;
  }

  if (json.properties._text) {
    return json.properties._text;
  }

  const textCode = json.bindings._text?.code;

  if (textCode) {
    if (isSlotProperty(textCode, SLOT_PREFIX)) {
      return `<slot name="${stripSlotPrefix(textCode, SLOT_PREFIX).toLowerCase()}"/>`;
    }
    return `{${textCode}}`;
  }

  let str = '';

  str += `<${tagName} `;

  const isComponent = Boolean(tagName[0] && isUpperCase(tagName[0]));
  if ((json.bindings.style?.code || json.properties.style) && !isComponent) {
    const useValue = json.bindings.style?.code || json.properties.style;

    str += `style={stringifyStyles(${useValue})}`;
    delete json.bindings.style;
    delete json.properties.style;
  }

  for (const key in json.properties) {
    const value = json.properties[key];
    str += ` ${key}="${value}" `;
  }

  const stringifiedBindings = Object.entries(json.bindings)
    .map(stringifyBinding(json, options))
    .join('');

  str += stringifiedBindings;

  // if we have innerHTML, it doesn't matter whether we have closing tags or not, or children or not.
  // we use the innerHTML content as children and don't render the self-closing tag.
  if (json.bindings.innerHTML?.code) {
    str += '>';
    str += BINDINGS_MAPPER.innerHTML(json, options);
    str += `</${tagName}>`;
    return str;
  }

  if (SELF_CLOSING_HTML_TAGS.has(tagName)) {
    return str + ' />';
  }
  str += '>';
  if (json.children) {
    str += json.children
      .map((item) => blockToSvelte({ json: item, options, parentComponent }))
      .join('');
  }

  str += `</${tagName}>`;

  return str;
};
