import { stringifySingleScopeOnMount } from '@/generators/helpers/on-mount';
import { blockToStencil } from '@/generators/stencil/blocks';
import {
  getDepsAsArray,
  getExportsAndLocal,
  getImports,
  getPropsAsCode,
  getStencilCoreImportsAsString,
  getTagName,
  needsWrap,
} from '@/generators/stencil/helpers';
import { getCodeProcessorPlugins } from '@/generators/stencil/plugins/get-code-processor-plugins';
import { StencilPropOption, ToStencilOptions } from '@/generators/stencil/types';
import { ProcessBindingOptions } from '@/helpers/class-components';
import { dashCase } from '@/helpers/dash-case';
import { dedent } from '@/helpers/dedent';
import { checkIsEvent } from '@/helpers/event-handlers';
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
  ROOT_REF,
  getAddAttributePassingRef,
  getAttributePassingString,
  shouldAddAttributePassing,
} from '@/helpers/web-components/attribute-passing';
import {
  runPostCodePlugins,
  runPostJsonPlugins,
  runPreCodePlugins,
  runPreJsonPlugins,
} from '@/modules/plugins';
import { BaseHook, MitosisState } from '@/types/mitosis-component';
import { TranspilerGenerator } from '@/types/transpiler';
import { format } from 'prettier/standalone';

export const componentToStencil: TranspilerGenerator<ToStencilOptions> = (
  _options = {
    typescript: true, // Stencil is uses .tsx always
  },
) => {
  return ({ component }) => {
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
    let props: string[] = Array.from(getProps(json));
    const events: string[] = props.filter((prop) => checkIsEvent(prop));
    const defaultProps: MitosisState | undefined = json.defaultProps;
    const childComponents: string[] = getChildComponents(json);

    props = props.filter((prop) => {
      // Stencil doesn't need children as a prop
      return prop !== 'children';
    });
    const processBindingOptions: ProcessBindingOptions = { events, props, target: 'stencil' };

    options.plugins = getCodeProcessorPlugins(json, options, processBindingOptions);

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

    let refs = json.refs
      ? Object.entries(json.refs)
          .map(([key, value]) => `private ${key}!: ${value.typeParameter ?? 'HTMLElement'};`)
          .join('\n')
      : '';

    const wrap = needsWrap(json.children);
    const withAttributePassing = !wrap && shouldAddAttributePassing(json, options);
    const rootRef = getAddAttributePassingRef(json, options);
    if (withAttributePassing && !refs.includes(rootRef)) {
      refs += `\nprivate ${rootRef}!: HTMLElement;`;
    }

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

    const noDependencyOnUpdateHooks = json.hooks.onUpdate?.filter((hook) => !hook.deps) ?? [];
    /*
     * We want to create a function for every onUpdate hook that has dependencies.
     * We call the function once in "componentDidLoad"
     * And we create "Watch" decorators for every dependency
     */
    const dependencyOnUpdateHooks = json.hooks.onUpdate?.filter((hook) => hook.deps) ?? [];

    const coreImports = getStencilCoreImportsAsString({
      wrap,
      events,
      props,
      dataString,
      watch: Boolean(dependencyOnUpdateHooks?.length),
    });

    const propOptions: Record<string, StencilPropOption> = {
      ...options.propOptions,
      ...json.meta.useMetadata?.stencil?.propOptions,
    };

    let str = dedent`
      ${getImports(json, options, childComponents)}
      
      import { ${coreImports} } from '@stencil/core';
      
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
          ${getPropsAsCode({ props, json, defaultProps, propOptions })}
          ${dataString}
          ${methodsString}
          ${getExportsAndLocal(json)}
          ${withAttributePassing ? getAttributePassingString(true) : ''}
          
          ${dependencyOnUpdateHooks
            .map((hook: BaseHook, index: number) => {
              return `
            watch${index}Fn() { 
              ${hook.code} 
            }
            
            ${getDepsAsArray(hook.deps!)
              .map((dep) => `@Watch("${dep}")`)
              .join('\n')}
              watch${index}(){
                this.watch${index}Fn();
              }            
            `;
            })
            .join('\n')}
  
          ${`componentDidLoad() { 
              ${
                withAttributePassing
                  ? `this.enableAttributePassing(this.${rootRef}, "${dashCase(json.name)}");`
                  : ''
              }
              ${json.hooks.onMount.length ? stringifySingleScopeOnMount(json) : ''} 
              ${dependencyOnUpdateHooks
                .map((_, index: number) => `this.watch${index}Fn();`)
                .join('\n')}
              }`}
          ${
            !json.hooks.onUnMount?.code
              ? ''
              : `disconnectedCallback() { ${json.hooks.onUnMount.code} }`
          }
          ${
            noDependencyOnUpdateHooks.length
              ? `componentDidUpdate() { ${noDependencyOnUpdateHooks
                  .map((hook) => hook.code)
                  .join('\n')} }`
              : ''
          }
  
        render() {
          return (${wrap ? '<Host>' : ''}
  
            ${json.children
              .map((item) =>
                blockToStencil({
                  json: item,
                  options,
                  insideJsx: true,
                  childComponents,
                  rootRef: withAttributePassing && rootRef === ROOT_REF ? rootRef : undefined, // only pass rootRef if it's not the default
                }),
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
};
