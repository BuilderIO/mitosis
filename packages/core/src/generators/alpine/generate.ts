import { ToAlpineOptions } from '@/generators/alpine/types';
import { babelTransformCode } from '@/helpers/babel-transform';
import { dashCase } from '@/helpers/dash-case';
import { fastClone } from '@/helpers/fast-clone';
import { getRefs } from '@/helpers/get-refs';
import { getStateObjectStringFromComponent } from '@/helpers/get-state-object-string';
import { initializeOptions } from '@/helpers/merge-options';
import { removeSurroundingBlock } from '@/helpers/remove-surrounding-block';
import { replaceIdentifiers } from '@/helpers/replace-identifiers';
import { stripMetaProperties } from '@/helpers/strip-meta-properties';
import { stripStateAndPropsRefs } from '@/helpers/strip-state-and-props-refs';
import { collectCss } from '@/helpers/styles/collect-css';
import { MitosisComponent } from '@/types/mitosis-component';
import { checkIsForNode, ForNode, MitosisNode } from '@/types/mitosis-node';
import { TranspilerGenerator } from '@/types/transpiler';
import { camelCase, flowRight as compose, curry, flow } from 'lodash';
import { format } from 'prettier/standalone';
import { SELF_CLOSING_HTML_TAGS } from '../../constants/html_tags';
import {
  runPostCodePlugins,
  runPostJsonPlugins,
  runPreCodePlugins,
  runPreJsonPlugins,
} from '../../modules/plugins';
import { renderMountHook } from './render-mount-hook';
import { hasRootUpdateHook, renderUpdateHooks } from './render-update-hooks';

export const checkIsComponentNode = (node: MitosisNode): boolean =>
  node.name === '@builder.io/mitosis/component';

/**
 * Test if the binding expression would be likely to generate
 * valid or invalid liquid. If we generate invalid liquid tags
 * Shopify will reject our PUT to update the template
 */
export const isValidAlpineBinding = (str = '') => {
  return true;
  /*
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
  */
};

const removeOnFromEventName = (str: string) => str.replace(/^on/, '');
const removeTrailingSemicolon = (str: string) => str.replace(/;$/, '');
const trim = (str: string) => str.trim();

const replaceInputRefs = curry((json: MitosisComponent, str: string) => {
  getRefs(json).forEach((value) => {
    str = str.replaceAll(value, `this.$refs.${value}`);
  });

  return str;
});
const replaceStateWithThis = (str: string) => str.replaceAll('state.', 'this.');
const getStateObjectString = (json: MitosisComponent) =>
  flow(
    getStateObjectStringFromComponent,
    trim,
    replaceInputRefs(json),
    renderMountHook(json),
    renderUpdateHooks(json),
    replaceStateWithThis,
    // cleanup bad regexes that result in malformed JSON strings that start with `{,`
    (x) => (x.startsWith('{,') ? x.replace('{,', '{') : x),
  )(json);

const bindEventHandlerKey = compose(dashCase, removeOnFromEventName);
const bindEventHandlerValue = compose(
  (x: string) =>
    replaceIdentifiers({
      code: x,
      from: 'event',
      to: '$event',
    }),
  removeTrailingSemicolon,
  trim,
  removeSurroundingBlock,
  stripStateAndPropsRefs,
);

const bindEventHandler =
  ({ useShorthandSyntax }: ToAlpineOptions) =>
  (eventName: string, code: string) => {
    const bind = useShorthandSyntax ? '@' : 'x-on:';
    return ` ${bind}${bindEventHandlerKey(eventName)}="${bindEventHandlerValue(code).trim()}"`;
  };

const mappers: {
  [key: string]: (json: MitosisNode, options: ToAlpineOptions) => string;
} = {
  For: (json, options) =>
    !(
      checkIsForNode(json) &&
      isValidAlpineBinding(json.bindings.each?.code) &&
      isValidAlpineBinding(json.scope.forName)
    )
      ? ''
      : `<template x-for="${json.scope.forName} in ${stripStateAndPropsRefs(
          json.bindings.each?.code,
        )}">
    ${(json.children ?? []).map((item) => blockToAlpine(item, options)).join('\n')}
    </template>`,
  Fragment: (json, options) => blockToAlpine({ ...json, name: 'div' }, options),
  Show: (json, options) =>
    !isValidAlpineBinding(json.bindings.when?.code)
      ? ''
      : `<template x-if="${stripStateAndPropsRefs(json.bindings.when?.code)}">
    ${(json.children ?? []).map((item) => blockToAlpine(item, options)).join('\n')}
    </template>`,
};

// TODO: spread support
const blockToAlpine = (json: MitosisNode | ForNode, options: ToAlpineOptions = {}): string => {
  if (mappers[json.name]) {
    return mappers[json.name](json, options);
  }

  // TODO: Add support for `{props.children}` bindings

  if (json.properties._text) {
    return json.properties._text;
  }

  if (json.bindings._text?.code) {
    return isValidAlpineBinding(json.bindings._text.code)
      ? `<span x-html="${stripStateAndPropsRefs(json.bindings._text.code as string)}"></span>`
      : '';
  }

  let str = `<${json.name} `;

  /*
  // Copied from the liquid generator. Not sure what it does. 
  if (
    json.bindings._spread?.code === '_spread' &&
    isValidAlpineBinding(json.bindings._spread.code)
  ) {
    str += `
          <template x-for="_attr in ${json.bindings._spread.code}">
            {{ _attr[0] }}="{{ _attr[1] }}"
          </template>
        `;
  }
  */

  for (const key in json.properties) {
    const value = json.properties[key];
    str += ` ${key}="${value}" `;
  }

  for (const key in json.bindings) {
    if (key === '_spread' || key === 'css') {
      continue;
    }
    const { code: value, type: bindingType } = json.bindings[key]!;
    // TODO: proper babel transform to replace. Util for this
    const useValue = stripStateAndPropsRefs(value);

    if (key.startsWith('on')) {
      str += bindEventHandler(options)(key, value);
    } else if (key === 'ref') {
      str += ` x-ref="${useValue}"`;
    } else if (isValidAlpineBinding(useValue)) {
      const bind = options.useShorthandSyntax && bindingType !== 'spread' ? ':' : 'x-bind:';
      str += ` ${bind}${bindingType === 'spread' ? '' : key}="${useValue}" `.replace(':=', '=');
    }
  }
  return SELF_CLOSING_HTML_TAGS.has(json.name)
    ? `${str} />`
    : `${str}>${(json.children ?? []).map((item) => blockToAlpine(item, options)).join('\n')}</${
        json.name
      }>`;
};

export const componentToAlpine: TranspilerGenerator<ToAlpineOptions> =
  (_options = {}) =>
  ({ component }) => {
    const options = initializeOptions({ target: 'alpine', component, defaults: _options });

    let json = fastClone(component);
    if (options.plugins) {
      json = runPreJsonPlugins({ json, plugins: options.plugins });
    }
    const css = collectCss(json);
    stripMetaProperties(json);
    if (options.plugins) {
      json = runPostJsonPlugins({ json, plugins: options.plugins });
    }

    const componentName = camelCase(json.name) || 'MyComponent';

    const stateObjectString = getStateObjectString(json);
    // Set x-data on root element
    json.children[0].properties['x-data'] = options.inlineState
      ? stateObjectString
      : `${componentName}()`;

    if (hasRootUpdateHook(json)) {
      json.children[0].properties['x-effect'] = 'onUpdate';
    }

    let str = css.trim().length ? `<style>${css}</style>` : '';
    str += json.children.map((item) => blockToAlpine(item, options)).join('\n');

    if (!options.inlineState) {
      str += `<script>
          ${babelTransformCode(`document.addEventListener('alpine:init', () => {
              Alpine.data('${componentName}', () => (${stateObjectString}))
          })`)}
        </script>`;
    }

    if (options.plugins) {
      str = runPreCodePlugins({ json, code: str, plugins: options.plugins });
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
      str = runPostCodePlugins({ json, code: str, plugins: options.plugins });
    }
    return str;
  };
