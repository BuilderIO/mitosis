import { stringifySingleScopeOnMount } from '@/generators/helpers/on-mount';
import { blockToStencil } from '@/generators/stencil/blocks';
import {
  getImports,
  getPropsAsCode,
  getStencilCoreImportsAsString,
  getTagName,
  isEvent,
  needsWrap,
  ProcessBindingOptions,
} from '@/generators/stencil/helpers';
import { getCodeProcessorPlugins } from '@/generators/stencil/plugins/get-code-processor-plugins';
import { ToStencilOptions } from '@/generators/stencil/types';
import { dedent } from '@/helpers/dedent';
import { fastClone } from '@/helpers/fast-clone';
import { getChildComponents } from '@/helpers/get-child-components';
import { getProps } from '@/helpers/get-props';
import { getStateObjectStringFromComponent } from '@/helpers/get-state-object-string';
import { indent } from '@/helpers/indent';
import { mapRefs } from '@/helpers/map-refs';
import { initializeOptions } from '@/helpers/merge-options';
import { stripMetaProperties } from '@/helpers/strip-meta-properties';
import { collectCss } from '@/helpers/styles/collect-css';
import {
  runPostCodePlugins,
  runPostJsonPlugins,
  runPreCodePlugins,
  runPreJsonPlugins,
} from '@/modules/plugins';
import { MitosisState } from '@/types/mitosis-component';
import { TranspilerGenerator } from '@/types/transpiler';
import { format } from 'prettier/standalone';

export const componentToStencil: TranspilerGenerator<ToStencilOptions> =
  (
    _options = {
      typescript: true, // Stencil is uses .tsx always
    },
  ) =>
  ({ component }) => {
    let json = fastClone(component);
    const options: ToStencilOptions = initializeOptions({
      target: 'stencil',
      component,
      defaults: _options,
    });

    if (options.plugins) {
      json = runPreJsonPlugins({ json, plugins: options.plugins });
    }

    mapRefs(json, (refName) => `this.${refName}`);
    let css = collectCss(json);
    const props: string[] = Array.from(getProps(json));
    const events: string[] = props.filter((prop) => isEvent(prop));
    const defaultProps: MitosisState | undefined = json.defaultProps;
    const childComponents: string[] = getChildComponents(json);
    const processBindingOptions: ProcessBindingOptions = { events };

    options.plugins = getCodeProcessorPlugins(options, processBindingOptions);

    if (options.plugins) {
      json = runPostJsonPlugins({ json, plugins: options.plugins });
    }
    stripMetaProperties(json);

    const dataString = getStateObjectStringFromComponent(json, {
      format: 'class',
      data: true,
      functions: false,
      getters: false,
      keyPrefix: '@State() ',
    });

    const methodsString = getStateObjectStringFromComponent(json, {
      format: 'class',
      data: false,
      functions: true,
      getters: true,
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
    ${getImports(json, options, childComponents)}
    
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
            : `componentDidLoad() { ${stringifySingleScopeOnMount(json)} }`
        }
        ${
          !json.hooks.onUnMount?.code
            ? ''
            : `disconnectedCallback() { ${json.hooks.onUnMount.code} }`
        }
        ${
          !json.hooks.onUpdate?.length
            ? ''
            : `componentDidUpdate() { ${json.hooks.onUpdate.map((hook) => hook.code).join('\n')} }`
        }

      render() {
        return (${wrap ? '<Host>' : ''}

          ${json.children
            .map((item) => blockToStencil(item, options, true, childComponents))
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
