import { pipe } from 'fp-ts/lib/function';
import { filterEmptyTextNodes } from '../../helpers/filter-empty-text-nodes';
import isChildren from '../../helpers/is-children';
import { isMitosisNode } from '../../helpers/is-mitosis-node';
import { removeSurroundingBlock } from '../../helpers/remove-surrounding-block';
import { replaceIdentifiers } from '../../helpers/replace-identifiers';
import { replaceSlotsInString, stripSlotPrefix, isSlotProperty } from '../../helpers/slots';
import { stripStateAndPropsRefs } from '../../helpers/strip-state-and-props-refs';
import { selfClosingTags } from '../../parsers/jsx';
import { MitosisNode, ForNode } from '../../types/mitosis-node';
import {
  encodeQuotes,
  addBindingsToJson,
  addPropertiesToJson,
  invertBooleanExpression,
} from './helpers';
import { ToVueOptions } from './types';

const SPECIAL_PROPERTIES = {
  V_IF: 'v-if',
  V_FOR: 'v-for',
  V_ELSE: 'v-else',
  V_ELSE_IF: 'v-else-if',
} as const;

type BlockRenderer = (json: MitosisNode, options: ToVueOptions, scope?: Scope) => string;

interface Scope {
  isRootNode?: boolean;
}

// TODO: Maybe in the future allow defining `string | function` as values
const BINDING_MAPPERS: { [key: string]: string | undefined } = {
  innerHTML: 'v-html',
};

const NODE_MAPPERS: {
  [key: string]: BlockRenderer | undefined;
} = {
  Fragment(json, options, scope) {
    if (options.vueVersion === 2 && scope?.isRootNode) {
      throw new Error('Vue 2 template should have a single root element');
    }
    return json.children.map((item) => blockToVue(item, options)).join('\n');
  },
  For(_json, options) {
    const json = _json as ForNode;
    const keyValue = json.bindings.key || { code: 'index' };
    const forValue = `(${json.scope.forName}, index) in ${stripStateAndPropsRefs(
      json.bindings.each?.code,
    )}`;

    if (options.vueVersion >= 3) {
      // TODO: tmk key goes on different element (parent vs child) based on Vue 2 vs Vue 3
      return `<template :key="${encodeQuotes(keyValue?.code || 'index')}" v-for="${encodeQuotes(
        forValue,
      )}">
        ${json.children.map((item) => blockToVue(item, options)).join('\n')}
      </template>`;
    }
    // Vue 2 can only handle one root element
    const firstChild = json.children.filter(filterEmptyTextNodes)[0] as MitosisNode | undefined;

    // Edge-case for when the parent is a `Show`, we need to pass down the `v-if` prop.
    const jsonIf = json.properties[SPECIAL_PROPERTIES.V_IF];

    return firstChild
      ? pipe(
          firstChild,
          addBindingsToJson({ key: keyValue }),
          addPropertiesToJson({
            [SPECIAL_PROPERTIES.V_FOR]: forValue,
            ...(jsonIf ? { [SPECIAL_PROPERTIES.V_IF]: jsonIf } : {}),
          }),
          (block) => blockToVue(block, options),
        )
      : '';
  },
  Show(json, options, scope) {
    const ifValue = replaceSlotsInString(
      stripStateAndPropsRefs(json.bindings.when?.code),
      (slotName) => `$slots.${slotName}`,
    );

    const defaultShowTemplate = `
    <template ${SPECIAL_PROPERTIES.V_IF}="${encodeQuotes(ifValue)}">
      ${json.children.map((item) => blockToVue(item, options)).join('\n')}
    </template>
    ${
      isMitosisNode(json.meta.else)
        ? `
        <template ${SPECIAL_PROPERTIES.V_ELSE}>
          ${blockToVue(json.meta.else, options)}
        </template>`
        : ''
    }
    `;

    switch (options.vueVersion) {
      case 3:
        return defaultShowTemplate;
      case 2:
        // if it is not the root node, the default show template can be used
        // as Vue 2 only has this limitation at root level
        if (!scope?.isRootNode) {
          return defaultShowTemplate;
        }

        const children = json.children.filter(filterEmptyTextNodes);
        // Vue 2 can only handle one root element, so we just take the first one.
        // TO-DO: warn user of multi-children Show.
        const firstChild = children[0] as MitosisNode | undefined;
        const elseBlock = json.meta.else;

        const hasShowChild = firstChild?.name === 'Show';
        const childElseBlock = firstChild?.meta.else;

        const allShowChildrenWithoutElse = children.every((x) => x.name === 'Show' && !x.meta.else);

        if (allShowChildrenWithoutElse && isMitosisNode(elseBlock)) {
          /**
           * This is when we mimic an if-else chain by only providing `Show` elements as children, none of which have an `else` block
           *
           * <show when={foo} else={else-1}>
           *  <show when={bar}> <bar-code> </show>
           *  <show when={x}> <x-code> </show>
           *  <show when={y}> <y-code> </show>
           * </show>
           *
           * What we want in this case is:
           *
           * <else-1 if={!foo} />
           * <bar-code v-else-if={bar} />
           * <x-code v-else-if={x} />
           * <y-code v-else />
           */
          const ifString = pipe(
            elseBlock,
            addPropertiesToJson({ [SPECIAL_PROPERTIES.V_IF]: invertBooleanExpression(ifValue) }),
            (block) => blockToVue(block, options),
          );

          const childrenStrings = children.map((child, idx) => {
            const isLast = idx === children.length - 1;

            const innerBlock = child.children.filter(filterEmptyTextNodes)[0];

            if (!isLast) {
              const childIfValue = pipe(child.bindings.when?.code, stripStateAndPropsRefs);
              const elseIfString = pipe(
                innerBlock,
                addPropertiesToJson({ [SPECIAL_PROPERTIES.V_ELSE_IF]: childIfValue }),
                (block) => blockToVue(block, options),
              );

              return elseIfString;
            } else {
              const elseString = pipe(
                innerBlock,
                addPropertiesToJson({ [SPECIAL_PROPERTIES.V_ELSE]: '' }),
                (block) => blockToVue(block, options),
              );

              return elseString;
            }
          });

          return `
            ${ifString}
            ${childrenStrings.join('\n')}
          `;
        } else if (
          firstChild &&
          isMitosisNode(elseBlock) &&
          hasShowChild &&
          isMitosisNode(childElseBlock)
        ) {
          /**
           * This is special edge logic to handle 2 nested Show elements in Vue 2.
           * We need to invert the logic to make it work, due to no-template-root-element limitations in Vue 2.
           *
           * <show when={foo} else={else-1}>
           *  <show when={bar}> <bar-code> </show>
           *
           *  <show when={x}> <x-code> </show>
           *
           *  <show when={y}> <y-code> </show>
           * </show>
           *
           *
           *
           *
           * foo: true && bar: true => if-code
           * foo: true && bar: false => else-2
           * foo: false && bar: true?? => else-1
           *
           *
           * map to:
           *
           * <else-1 if={!foo} />
           * <else-2 v-else-if={!bar} />
           * <if-code v-else />
           *
           */
          const ifString = pipe(
            elseBlock,
            addPropertiesToJson({ [SPECIAL_PROPERTIES.V_IF]: invertBooleanExpression(ifValue) }),
            (block) => blockToVue(block, options),
          );

          const childIfValue = pipe(
            firstChild.bindings.when?.code,
            stripStateAndPropsRefs,
            invertBooleanExpression,
          );
          const elseIfString = pipe(
            childElseBlock,
            addPropertiesToJson({ [SPECIAL_PROPERTIES.V_ELSE_IF]: childIfValue }),
            (block) => blockToVue(block, options),
          );

          const firstChildOfFirstChild = firstChild.children.filter(filterEmptyTextNodes)[0] as
            | MitosisNode
            | undefined;
          const elseString = firstChildOfFirstChild
            ? pipe(
                firstChildOfFirstChild,
                addPropertiesToJson({ [SPECIAL_PROPERTIES.V_ELSE]: '' }),
                (block) => blockToVue(block, options),
              )
            : '';

          return `

            ${ifString}

            ${elseIfString}

            ${elseString}

          `;
        } else {
          const ifString = firstChild
            ? pipe(
                firstChild,
                addPropertiesToJson({ [SPECIAL_PROPERTIES.V_IF]: ifValue }),
                (block) => blockToVue(block, options),
              )
            : '';

          const elseString = isMitosisNode(elseBlock)
            ? pipe(elseBlock, addPropertiesToJson({ [SPECIAL_PROPERTIES.V_ELSE]: '' }), (block) =>
                blockToVue(block, options),
              )
            : '';

          return `
                    ${ifString}
                    ${elseString}
                  `;
        }
    }
  },
  Slot(json, options) {
    if (!json.bindings.name) {
      const key = Object.keys(json.bindings).find(Boolean);
      if (!key) return '<slot />';

      return `
        <template #${key}>
        ${json.bindings[key]?.code}
        </template>
      `;
    }
    const strippedTextCode = stripStateAndPropsRefs(json.bindings.name.code);

    return `<slot name="${stripSlotPrefix(strippedTextCode).toLowerCase()}">${json.children
      ?.map((item) => blockToVue(item, options))
      .join('\n')}</slot>`;
  },
};

const stringifyBinding =
  (node: MitosisNode) =>
  ([key, value]: [string, { code: string; arguments?: string[] } | undefined]) => {
    if (key === '_spread') {
      return '';
    } else if (key === 'class') {
      return ` :class="_classStringToObject(${stripStateAndPropsRefs(value?.code, {
        replaceWith: '',
      })})" `;
      // TODO: support dynamic classes as objects somehow like Vue requires
      // https://vuejs.org/v2/guide/class-and-style.html
    } else {
      // TODO: proper babel transform to replace. Util for this
      const useValue = stripStateAndPropsRefs(value?.code);

      if (key.startsWith('on')) {
        const { arguments: cusArgs = ['event'] } = value!;
        let event = key.replace('on', '').toLowerCase();
        if (event === 'change' && node.name === 'input') {
          event = 'input';
        }
        const isAssignmentExpression = useValue.includes('=');
        const valueWRenamedEvent = replaceIdentifiers({
          code: useValue,
          from: cusArgs[0],
          to: '$event',
        });

        // TODO: proper babel transform to replace. Util for this
        if (isAssignmentExpression) {
          return ` @${event}="${encodeQuotes(removeSurroundingBlock(valueWRenamedEvent))}" `;
        } else {
          return ` @${event}="${encodeQuotes(
            removeSurroundingBlock(removeSurroundingBlock(valueWRenamedEvent)),
          )}" `;
        }
      } else if (key === 'ref') {
        return ` ref="${encodeQuotes(useValue)}" `;
      } else if (BINDING_MAPPERS[key]) {
        return ` ${BINDING_MAPPERS[key]}="${encodeQuotes(useValue.replace(/"/g, "\\'"))}" `;
      } else {
        return ` :${key}="${encodeQuotes(useValue)}" `;
      }
    }
  };
export const blockToVue: BlockRenderer = (node, options, scope) => {
  const nodeMapper = NODE_MAPPERS[node.name];
  if (nodeMapper) {
    return nodeMapper(node, options, scope);
  }

  if (isChildren(node)) {
    return `<slot/>`;
  }

  if (node.name === 'style') {
    // Vue doesn't allow <style>...</style> in templates, but does support the synonymous
    // <component is="'style'">...</component>
    node.name = 'component';
    node.bindings.is = { code: "'style'" };
  }

  if (node.properties._text) {
    return `${node.properties._text}`;
  }

  const textCode = node.bindings._text?.code;
  if (textCode) {
    const strippedTextCode = stripStateAndPropsRefs(textCode);
    if (isSlotProperty(strippedTextCode)) {
      return `<slot name="${stripSlotPrefix(strippedTextCode).toLowerCase()}"/>`;
    }
    return `{{${strippedTextCode}}}`;
  }

  let str = '';

  str += `<${node.name} `;

  if (node.bindings._spread?.code) {
    str += `v-bind="${encodeQuotes(stripStateAndPropsRefs(node.bindings._spread.code as string))}"`;
  }

  for (const key in node.properties) {
    const value = node.properties[key];

    if (key === 'className') {
      continue;
    } else if (key === SPECIAL_PROPERTIES.V_ELSE) {
      str += ` ${key} `;
    } else if (typeof value === 'string') {
      str += ` ${key}="${encodeQuotes(value)}" `;
    }
  }

  const stringifiedBindings = Object.entries(node.bindings)
    .map(([k, v]) =>
      stringifyBinding(node)([k, v] as [
        string,
        { code: string; arguments?: string[] } | undefined,
      ]),
    )
    .join('');

  str += stringifiedBindings;

  if (selfClosingTags.has(node.name)) {
    return str + ' />';
  }

  str += '>';
  if (node.children) {
    str += node.children.map((item) => blockToVue(item, options)).join('');
  }

  return str + `</${node.name}>`;
};
