import { SELF_CLOSING_HTML_TAGS } from '@/constants/html_tags';
import {
  getPropsAsCode,
  getStencilCoreImportsAsString,
  getTagName,
  isEvent,
  needsWrap,
  processBinding,
  ProcessBindingOptions,
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
import { checkIsForNode, MitosisNode } from '@/types/mitosis-node';
import { TranspilerGenerator } from '@/types/transpiler';
import { format } from 'prettier/standalone';
import { stringifySingleScopeOnMount } from '../helpers/on-mount';
import { collectClassString } from './collect-class-string';

const blockToStencil = (
  json: MitosisNode,
  options: ToStencilOptions = {},
  insideJsx: boolean,
  childComponents: string[],
  processBindingOptions: ProcessBindingOptions,
): string => {
  let blockName = childComponents.find((impName) => impName === json.name)
    ? getTagName(json.name, options)
    : json.name;

  if (blockName.includes('state.') || blockName.includes('props.')) {
    // For dynamic blocks fetched from fn
    blockName = processBinding(blockName, processBindingOptions);
  }

  if (json.properties._text) {
    return json.properties._text;
  }
  if (json.bindings._text?.code) {
    if (json.bindings._text?.code === 'props.children') {
      // Replace props.children with default <slot>
      return '<slot></slot>';
    }

    let code = processBinding(json.bindings._text.code, processBindingOptions);

    if (insideJsx) {
      return `{${code}}`;
    }
    return code;
  }

  if (checkIsForNode(json) && json.bindings.each?.code) {
    const wrap = json.children.length !== 1;
    const forArgs = getForArguments(json).join(', ');

    const expression = `${processBinding(
      json.bindings.each?.code,
      processBindingOptions,
    )}?.map((${forArgs}) => (
      ${wrap ? '<Fragment>' : ''}
      ${json.children
        .filter(filterEmptyTextNodes)
        .map((item) => blockToStencil(item, options, wrap, childComponents, processBindingOptions))
        .join('\n')}
      ${wrap ? '</Fragment>' : ''}
    ))`;
    if (insideJsx) {
      return `{${expression}}`;
    } else {
      return expression;
    }
  } else if (blockName === 'Show' && json.bindings.when?.code) {
    const wrap = json.children.length !== 1;
    const expression = `${processBinding(json.bindings.when?.code, processBindingOptions)} ? (
      ${wrap ? '<Fragment>' : ''}
      ${json.children
        .filter(filterEmptyTextNodes)
        .map((item) => blockToStencil(item, options, wrap, childComponents, processBindingOptions))
        .join('\n')}
      ${wrap ? '</Fragment>' : ''}
    ) : ${
      !json.meta.else
        ? 'null'
        : `(${blockToStencil(
            json.meta.else as any,
            options,
            false,
            childComponents,
            processBindingOptions,
          )})`
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

  const classString = collectClassString(json, processBinding, processBindingOptions);
  if (classString) {
    str += ` class=${classString} `;
  }

  for (const key in json.properties) {
    const value = json.properties[key];
    str += ` ${key}="${value}" `;
  }
  for (const key in json.bindings) {
    const { code, arguments: cusArgs = [], type } = json.bindings[key]!;
    const processedCode = processBinding(code, processBindingOptions);
    if (type === 'spread') {
      str += ` {...(${processedCode})} `;
    } else if (key === 'ref') {
      // TODO: Add correct type here
      str += ` ref={(el) => ${
        processedCode.startsWith('this.') ? processedCode : `this.${processedCode}`
      } = el} `;
    } else if (isEvent(key)) {
      const useKey = key === 'onChange' && blockName === 'input' ? 'onInput' : key;
      str += ` ${useKey}={(${cusArgs.join(',')}) => ${processedCode}} `;
    } else {
      str += ` ${key}={${processedCode}} `;
    }
  }
  if (SELF_CLOSING_HTML_TAGS.has(blockName)) {
    return str + ' />';
  }
  str += '>';
  if (json.children) {
    str += json.children
      .map((item) => blockToStencil(item, options, true, childComponents, processBindingOptions))
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
    const processBindingOptions: ProcessBindingOptions = { events };

    const dataString = getStateObjectStringFromComponent(json, {
      format: 'class',
      data: true,
      functions: false,
      getters: false,
      keyPrefix: '@State() ',
      valueMapper: (code) => processBinding(code, processBindingOptions),
    });

    const methodsString = getStateObjectStringFromComponent(json, {
      format: 'class',
      data: false,
      functions: true,
      getters: true,
      valueMapper: (code) => processBinding(code, processBindingOptions),
    });

    const refs = json.refs
      ? Object.entries(json.refs)
          .map(([key, value]) => {
            return `private ${key}!: ${value.typeParameter ?? 'HTMLElement'}`;
          })
          .join('\n')
      : '';

    const wrap = needsWrap(json.children);

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

    const coreImports = getStencilCoreImportsAsString(wrap, events, props, dataString);

    let str = dedent`
    ${renderPreComponent({
      explicitImportFileExtension: options.explicitImportFileExtension,
      component: json,
      target: 'stencil',
      importMapper: (_: any, theImport: any, importedValues: any) => {
        const childImport = importedValues.defaultImport;
        if (childImport && childComponents.includes(childImport)) {
          return `import {${childImport}} from '${theImport.path}';`;
        }

        return undefined;
      },
    })}

    import { ${coreImports} } from '@stencil/core';
    
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
            : `componentDidLoad() { ${processBinding(
                stringifySingleScopeOnMount(json),
                processBindingOptions,
              )} }`
        }
        ${
          !json.hooks.onUnMount?.code
            ? ''
            : `disconnectedCallback() { ${processBinding(
                json.hooks.onUnMount.code,
                processBindingOptions,
              )} }`
        }
        ${
          !json.hooks.onUpdate?.length
            ? ''
            : `componentDidUpdate() { ${json.hooks.onUpdate
                .map((hook) => processBinding(hook.code, processBindingOptions))
                .join('\n')} }`
        }

      render() {
        return (${wrap ? '<Host>' : ''}

          ${json.children
            .map((item) =>
              blockToStencil(item, options, true, childComponents, processBindingOptions),
            )
            .join('\n')}

        ${wrap ? '</Host>' : ''})
      }
    }
  `;

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
