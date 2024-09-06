import { SELF_CLOSING_HTML_TAGS } from '@/constants/html_tags';
import {
  getPropsAsCode,
  getTagName,
  isEvent,
  postCodeChildComponentImports,
  postCodeEvents,
  processBinding,
} from '@/generators/stencil/helpers';
import { ToStencilOptions } from '@/generators/stencil/types';
import { dedent } from '@/helpers/dedent';
import { fastClone } from '@/helpers/fast-clone';
import { filterEmptyTextNodes } from '@/helpers/filter-empty-text-nodes';
import { getChildComponents } from '@/helpers/get-child-components';
import { getProps } from '@/helpers/get-props';
import { getStateObjectStringFromComponent } from '@/helpers/get-state-object-string';
import { indent } from '@/helpers/indent';
import { mapRefs } from '@/helpers/map-refs';
import { initializeOptions } from '@/helpers/merge-options';
import { getForArguments } from '@/helpers/nodes/for';
import { renderPreComponent } from '@/helpers/render-imports';
import { stripMetaProperties } from '@/helpers/strip-meta-properties';
import { collectCss } from '@/helpers/styles/collect-css';
import {
  runPostCodePlugins,
  runPostJsonPlugins,
  runPreCodePlugins,
  runPreJsonPlugins,
} from '@/modules/plugins';
import { MitosisState } from '@/types/mitosis-component';
import { MitosisNode, checkIsForNode } from '@/types/mitosis-node';
import { TranspilerGenerator } from '@/types/transpiler';
import { format } from 'prettier/standalone';
import { stringifySingleScopeOnMount } from '../helpers/on-mount';
import { collectClassString } from './collect-class-string';

const blockToStencil = (
  json: MitosisNode,
  options: ToStencilOptions = {},
  insideJsx: boolean,
  childComponents: string[],
): string => {
  let blockName = childComponents.find((impName) => impName === json.name)
    ? getTagName(json.name, options)
    : json.name;

  if (json.properties._text) {
    return json.properties._text;
  }
  if (json.bindings._text?.code) {
    let code = processBinding(json.bindings._text.code as string);
    if (json.bindings._text?.code === 'props.children') {
      // Replace props.children with default <slot>
      return '<slot></slot>';
    }

    if (insideJsx) {
      return `{${code}}`;
    }
    return code;
  }

  if (checkIsForNode(json)) {
    const wrap = json.children.length !== 1;
    const forArgs = getForArguments(json).join(', ');

    const expression = `${processBinding(json.bindings.each?.code as string)}?.map((${forArgs}) => (
      ${wrap ? '<Fragment>' : ''}${json.children
      .filter(filterEmptyTextNodes)
      .map((item) => blockToStencil(item, options, wrap, childComponents))
      .join('\n')}${wrap ? '</Fragment>' : ''}
    ))`;
    if (insideJsx) {
      return `{${expression}}`;
    } else {
      return expression;
    }
  } else if (blockName === 'Show') {
    const wrap = json.children.length !== 1;
    const expression = `${processBinding(json.bindings.when?.code as string)} ? (
      ${wrap ? '<Fragment>' : ''}${json.children
      .filter(filterEmptyTextNodes)
      .map((item) => blockToStencil(item, options, wrap, childComponents))
      .join('\n')}${wrap ? '</Fragment>' : ''}
    ) : ${
      !json.meta.else
        ? 'null'
        : `(${blockToStencil(json.meta.else as any, options, false, childComponents)})`
    }`;

    if (insideJsx) {
      return `{${expression}}`;
    } else {
      return expression;
    }
  } else if (blockName === 'Slot') {
    blockName = 'slot';
  }

  let str = '';

  str += `<${blockName} `;

  const classString = collectClassString(json);
  if (classString) {
    str += ` class=${classString} `;
  }

  for (const key in json.properties) {
    const value = json.properties[key];
    str += ` ${key}="${value}" `;
  }
  for (const key in json.bindings) {
    const { code, arguments: cusArgs = [], type } = json.bindings[key]!;

    if (type === 'spread') {
      str += ` {...(${code})} `;
    } else if (key === 'ref') {
      // TODO: Add correct type here
      str += ` ref={(el) => this.${code} = el} `;
    } else if (isEvent(key)) {
      const useKey = key === 'onChange' && blockName === 'input' ? 'onInput' : key;
      str += ` ${useKey}={(${cusArgs.join(',')}) => ${processBinding(code as string)}} `;
    } else {
      str += ` ${key}={${processBinding(code as string)}} `;
    }
  }
  if (SELF_CLOSING_HTML_TAGS.has(blockName)) {
    return str + ' />';
  }
  str += '>';
  if (json.children) {
    str += json.children
      .map((item) => blockToStencil(item, options, true, childComponents))
      .join('\n');
  }

  str += `</${blockName}>`;

  return str;
};

export const componentToStencil: TranspilerGenerator<ToStencilOptions> =
  (
    _options = {
      typescript: true, // Stencil is uses .tsx always
    },
  ) =>
  ({ component }) => {
    const options = initializeOptions({ target: 'stencil', component, defaults: _options });
    let json = fastClone(component);
    if (options.plugins) {
      json = runPreJsonPlugins({ json, plugins: options.plugins });
    }
    let css = collectCss(json);

    mapRefs(json, (refName) => `this.${refName}`);

    if (options.plugins) {
      json = runPostJsonPlugins({ json, plugins: options.plugins });
    }
    stripMetaProperties(json);

    const props: string[] = Array.from(getProps(json));
    const events: string[] = props.filter((prop) => isEvent(prop));
    const defaultProps: MitosisState | undefined = json.defaultProps;
    const childComponents: string[] = getChildComponents(json);

    const dataString = getStateObjectStringFromComponent(json, {
      format: 'class',
      data: true,
      functions: false,
      getters: false,
      keyPrefix: '@State() ',
      valueMapper: (code) => processBinding(code),
    });

    const methodsString = getStateObjectStringFromComponent(json, {
      format: 'class',
      data: false,
      functions: true,
      getters: true,
      valueMapper: (code) => processBinding(code),
    });

    const refs = json.refs
      ? Object.entries(json.refs)
          .map(([key, value]) => {
            return `private ${key}!: ${value.typeParameter ?? 'HTMLElement'}`;
          })
          .join('\n')
      : '';

    const wrap = json.children.length !== 1;

    if (options.prettier !== false) {
      try {
        css = format(css, {
          parser: 'css',
          plugins: [require('prettier/parser-postcss')],
        });
      } catch (err) {
        console.warn('Could not format css', err);
      }
    }

    let tagName = getTagName(json.name, options);
    if (json.meta.useMetadata?.tagName) {
      // Deprecated option, we shouldn't use this, instead change the name of your Mitosis component
      tagName = json.meta.useMetadata?.tagName;
    }

    let str = dedent`
    ${renderPreComponent({
      explicitImportFileExtension: options.explicitImportFileExtension,
      component: json,
      target: 'stencil',
    })}

    import { Component, Prop, h, State, Fragment, Event } from '@stencil/core';
    
    ${json.types ? json.types.join('\n') : ''}
    @Component({
      tag: '${tagName}',
      ${json.meta.useMetadata?.isAttachedToShadowDom ? 'shadow: true,' : ''}
      ${
        css.length
          ? `styles: \`
        ${indent(css, 8)}\`,`
          : ''
      }
    })
    export class ${json.name} {
        ${refs}
        ${getPropsAsCode(props, defaultProps, json.propsTypeRef)}
        ${dataString}
        ${methodsString}

        ${
          !json.hooks.onMount.length
            ? ''
            : `componentDidLoad() { ${processBinding(stringifySingleScopeOnMount(json))} }`
        }
        ${
          !json.hooks.onUnMount?.code
            ? ''
            : `disconnectedCallback() { ${processBinding(json.hooks.onUnMount.code)} }`
        }
        ${
          !json.hooks.onUpdate?.length
            ? ''
            : `componentDidUpdate() { ${json.hooks.onUpdate
                .map((hook) => processBinding(hook.code))
                .join('\n')} }`
        }

      render() {
        return (${wrap ? '<Fragment>' : ''}

          ${json.children
            .map((item) => blockToStencil(item, options, true, childComponents))
            .join('\n')}

        ${wrap ? '</Fragment>' : ''})
      }
    }
  `;

    str = postCodeEvents(str, events);
    str = postCodeChildComponentImports(str, childComponents);

    // Some props aren't replaced by processBinding
    str = str.replaceAll(`props.`, `this.`);

    if (options.plugins) {
      str = runPreCodePlugins({ json, code: str, plugins: options.plugins });
    }
    if (options.prettier !== false) {
      str = format(str, {
        parser: 'typescript',
        plugins: [require('prettier/parser-typescript')],
      });
    }
    if (options.plugins) {
      str = runPostCodePlugins({ json, code: str, plugins: options.plugins });
    }
    return str;
  };
