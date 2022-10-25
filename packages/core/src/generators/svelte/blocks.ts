import { selfClosingTags } from '../../parsers/jsx';
import { MitosisComponent } from '../../types/mitosis-component';
import { BaseNode, Binding, ForNode, MitosisNode } from '../../types/mitosis-node';

import isChildren from '../../helpers/is-children';
import { removeSurroundingBlock } from '../../helpers/remove-surrounding-block';
import { isSlotProperty, stripSlotPrefix } from '../../helpers/slots';
import { VALID_HTML_TAGS } from '../../constants/html_tags';
import { isUpperCase } from '../../helpers/is-upper-case';
import { getForArguments } from '../../helpers/nodes/for';
import { ToSvelteOptions } from './types';
import { stripStateAndProps } from './helpers';

const mappers: {
  For: BlockToSvelte<ForNode>;
  Fragment: BlockToSvelte;
  Show: BlockToSvelte;
  Slot: BlockToSvelte;
} = {
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
    if (!json.bindings.name) {
      const key = Object.keys(json.bindings).find(Boolean);
      if (!key) return '<slot />';

      return `
        <span #${key}>
        ${json.bindings[key]?.code}
        </span>
      `;
    }

    return `<slot name="${stripSlotPrefix(json.bindings.name.code).toLowerCase()}">${json.children
      ?.map((item) => blockToSvelte({ json: item, options, parentComponent }))
      .join('\n')}</slot>`;
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

  const isValidHtmlTag = VALID_HTML_TAGS.includes(json.name);
  const isSpecialSvelteTag = json.name.startsWith('svelte:');
  // Check if any import matches `json.name`
  const hasMatchingImport = parentComponent.imports.some(({ imports }) =>
    Object.keys(imports).some((name) => name === json.name),
  );

  // TO-DO: no way to decide between <svelte:component> and <svelte:element>...need to do that through metadata
  // overrides for now
  if (!isValidHtmlTag && !isSpecialSvelteTag && !hasMatchingImport) {
    json.bindings.this = {
      code: stripStateAndProps({ json: parentComponent, options })(json.name),
    };
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
  (options: ToSvelteOptions) =>
  ([key, binding]: [string, Binding | undefined]) => {
    if (key === 'innerHTML' || !binding) {
      return '';
    }

    const { code, arguments: cusArgs = ['event'], type } = binding;

    if (type === 'spread') {
      const spreadValue = key === 'props' ? '$$props' : code;
      return ` {...${spreadValue}} `;
    } else if (key.startsWith('on')) {
      const event = key.replace('on', '').toLowerCase();
      // TODO: handle quotes in event handler values

      const valueWithoutBlock = removeSurroundingBlock(code);

      if (valueWithoutBlock === key) {
        return ` on:${event}={${valueWithoutBlock}} `;
      } else {
        return ` on:${event}="{${cusArgs.join(',')} => {${valueWithoutBlock}}}" `;
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
    if (isSlotProperty(textCode)) {
      return `<slot name="${stripSlotPrefix(textCode).toLowerCase()}"/>`;
    }
    return `{${textCode}}`;
  }

  let str = '';

  str += `<${tagName} `;

  const isComponent = Boolean(tagName[0] && isUpperCase(tagName[0]));
  if ((json.bindings.style?.code || json.properties.style) && !isComponent) {
    const useValue = json.bindings.style?.code || json.properties.style;

    str += `use:mitosis_styling={${useValue}}`;
    delete json.bindings.style;
    delete json.properties.style;
  }

  for (const key in json.properties) {
    const value = json.properties[key];
    str += ` ${key}="${value}" `;
  }

  const stringifiedBindings = Object.entries(json.bindings).map(stringifyBinding(options)).join('');

  str += stringifiedBindings;

  // if we have innerHTML, it doesn't matter whether we have closing tags or not, or children or not.
  // we use the innerHTML content as children and don't render the self-closing tag.
  if (json.bindings.innerHTML?.code) {
    str += '>';
    str += BINDINGS_MAPPER.innerHTML(json, options);
    str += `</${tagName}>`;
    return str;
  }

  if (selfClosingTags.has(tagName)) {
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
