import { blockToAngular } from '@/generators/angular/blocks';
import {
  HELPER_FUNCTIONS,
  generateNgModule,
  getAppropriateTemplateFunctionKeys,
  getDefaultProps,
  preprocessCssAsJson,
  processAngularCode,
  transformState,
  traverseAndCheckIfInnerHTMLIsUsed,
  traverseToGetAllDynamicComponents,
} from '@/generators/angular/helpers';
import { getInputImports, getInputs } from '@/generators/angular/helpers/get-inputs';
import { getOutputImports, getOutputs } from '@/generators/angular/helpers/get-outputs';
import { addCodeNgAfterViewInit } from '@/generators/angular/helpers/hooks';
import { getClassPropertiesPlugin } from '@/generators/angular/plugins/get-class-properties-plugin';
import { getCodeProcessorPlugins } from '@/generators/angular/plugins/get-code-processor-plugins';
import {
  BUILT_IN_COMPONENTS,
  DEFAULT_ANGULAR_OPTIONS,
  ToAngularOptions,
} from '@/generators/angular/types';
import { stringifySingleScopeOnMount } from '@/generators/helpers/on-mount';
import { dashCase } from '@/helpers/dash-case';
import { dedent } from '@/helpers/dedent';
import { fastClone } from '@/helpers/fast-clone';
import { getChildComponents } from '@/helpers/get-child-components';
import { getComponentsUsed } from '@/helpers/get-components-used';
import { getCustomImports } from '@/helpers/get-custom-imports';
import { getPropFunctions } from '@/helpers/get-prop-functions';
import { getProps } from '@/helpers/get-props';
import { getPropsRef } from '@/helpers/get-props-ref';
import { getRefs } from '@/helpers/get-refs';
import { getStateObjectStringFromComponent } from '@/helpers/get-state-object-string';
import { getTypedFunction } from '@/helpers/get-typed-function';
import { indent } from '@/helpers/indent';
import { isUpperCase } from '@/helpers/is-upper-case';
import { mapRefs } from '@/helpers/map-refs';
import { initializeOptions } from '@/helpers/merge-options';
import { renderPreComponent } from '@/helpers/render-imports';
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
import { TranspilerGenerator } from '@/types/transpiler';
import { kebabCase, uniq } from 'lodash';
import { tryFormat } from './helpers/format';

export const componentToAngular: TranspilerGenerator<ToAngularOptions> = (userOptions = {}) => {
  return ({ component: _component }) => {
    // Make a copy we can safely mutate, similar to babel's toolchain
    let json = fastClone(_component);

    const useMetadata = json.meta?.useMetadata;

    const contextVars: string[] = Object.keys(json?.context?.get || {});
    const metaOutputVars: string[] = (useMetadata?.outputs as string[]) || [];

    const outputVars: string[] = uniq([...metaOutputVars, ...getPropFunctions(json)]);

    const options = initializeOptions({
      target: 'angular',
      component: _component,
      defaults: DEFAULT_ANGULAR_OPTIONS,
      userOptions,
    });
    options.plugins = getCodeProcessorPlugins({ json, options, outputVars, contextVars });

    if (options.state === 'class-properties') {
      options.plugins.push(getClassPropertiesPlugin());
    }

    if (options.plugins) {
      json = runPreJsonPlugins({ json, plugins: options.plugins });
    }

    // Prepare Props
    const [forwardProp, hasPropRef] = getPropsRef(json, true);
    const props = getProps(json);
    // prevent jsx props from showing up as @Input
    if (hasPropRef) {
      props.delete(forwardProp);
    }
    props.delete('children');

    // remove props for outputs
    for (const variableName of outputVars) {
      props.delete(variableName);
    }

    const childComponents: string[] = getChildComponents(json);

    const customImports: string[] = getCustomImports(json);

    const { exports: localExports = {} } = json;
    const localExportVars: string[] = Object.keys(localExports)
      .filter((key) => localExports[key].usedInLocal)
      .map((key) => `${key} = ${key};`);

    // Context handling
    const injectables: string[] = contextVars.map((variableName) => {
      const variableType = json?.context?.get[variableName].name;
      if (options?.experimental?.injectables) {
        return options?.experimental?.injectables(variableName, variableType);
      }
      if (options?.experimental?.inject) {
        return `@Inject(forwardRef(() => ${variableType})) public ${variableName}: ${variableType}`;
      }
      return `public ${variableName} : ${variableType}`;
    });

    // Handle refs
    const domRefs = getRefs(json);
    const jsRefs = Object.keys(json.refs).filter((ref) => !domRefs.has(ref));

    const withAttributePassing = shouldAddAttributePassing(json, options);
    const rootRef = getAddAttributePassingRef(json, options);
    if (withAttributePassing) {
      if (!domRefs.has(rootRef)) {
        domRefs.add(rootRef);
      }

      addCodeNgAfterViewInit(
        json,
        `
            const element: HTMLElement | null = this.${rootRef}?.nativeElement;
            this.enableAttributePassing(element, "${dashCase(json.name)}");
            `,
      );
    }

    mapRefs(json, (refName) => {
      const isDomRef = domRefs.has(refName);
      return `this.${isDomRef ? '' : '_'}${refName}${isDomRef ? '.nativeElement' : ''}`;
    });

    if (options.plugins) {
      json = runPostJsonPlugins({ json, plugins: options.plugins });
    }

    // CSS
    preprocessCssAsJson(json);
    let css = collectCss(json);
    if (options.prettier !== false) {
      css = tryFormat(css, 'css');
    }

    const hostDisplayCss = options.visuallyIgnoreHostElement ? ':host { display: contents; }' : '';
    const styles = css.length ? [hostDisplayCss, css].join('\n') : hostDisplayCss;

    const helperFunctions = new Set<string>();
    const shouldUseSanitizer =
      !useMetadata?.angular?.sanitizeInnerHTML && traverseAndCheckIfInnerHTMLIsUsed(json);
    const changeDetectionStrategy = useMetadata?.angular?.changeDetection;

    let template = json.children
      .map((item) => {
        const tmpl = blockToAngular({
          root: json,
          json: item,
          options,
          rootRef: withAttributePassing && rootRef === ROOT_REF ? rootRef : undefined, // only pass rootRef if it's not the default
          blockOptions: {
            childComponents,
            nativeAttributes: useMetadata?.angular?.nativeAttributes ?? [],
            nativeEvents: useMetadata?.angular?.nativeEvents ?? [],
            sanitizeInnerHTML: !shouldUseSanitizer,
          },
        });
        if (options.state === 'inline-with-wrappers') {
          getAppropriateTemplateFunctionKeys(tmpl).forEach((key) =>
            helperFunctions.add(HELPER_FUNCTIONS(options.typescript)[key]),
          );
        }
        return tmpl;
      })
      .join('\n');

    if (options.prettier !== false) {
      template = tryFormat(template, 'html');
    }

    stripMetaProperties(json);

    const { components: dynamicComponents, dynamicTemplate } = traverseToGetAllDynamicComponents(
      json,
      options,
      {
        childComponents,
        nativeAttributes: useMetadata?.angular?.nativeAttributes ?? [],
        nativeEvents: useMetadata?.angular?.nativeEvents ?? [],
      },
    );

    transformState(json);

    const dataString = getStateObjectStringFromComponent(json, {
      format: 'class',
      withType: options.typescript,
      valueMapper: (code, type, typeParameter) => {
        let value = code;
        if (type !== 'data') {
          value = getTypedFunction(code, options.typescript, typeParameter);
        }

        if (options.api === 'signals') {
          if (type === 'data') {
            value = `signal(${value})`;
          }
        }

        return processAngularCode({
          replaceWith: 'this',
          contextVars,
          outputVars,
          domRefs: Array.from(domRefs),
        })(value);
      },
    });

    const refsForObjSpread = getRefs(json, 'spreadRef');

    // Preparing built in component metadata parameters
    const componentsUsed = Array.from(getComponentsUsed(json)).filter(
      (item) => item.length && isUpperCase(item[0]) && !BUILT_IN_COMPONENTS.has(item),
    );
    const componentMetadata: Record<string, any> = {
      selector: useMetadata?.angular?.selector
        ? `'${useMetadata?.angular?.selector}'`
        : `'${kebabCase(json.name || 'my-component')}'`,
      template: `\`
          ${indent(dynamicTemplate, 8).replace(/`/g, '\\`').replace(/\$\{/g, '\\${')}
          ${indent(template, 8).replace(/`/g, '\\`').replace(/\$\{/g, '\\${')}
          \``,
      ...(changeDetectionStrategy === 'OnPush'
        ? {
            changeDetection: 'ChangeDetectionStrategy.OnPush',
          }
        : {}),
      ...(styles
        ? {
            styles: `[\`${indent(styles, 8)}\`]`,
          }
        : {}),
      ...(options.standalone
        ? // TODO: also add child component imports here as well
          {
            standalone: 'true',
            imports: `[${['CommonModule', ...componentsUsed].join(', ')}]`,
          }
        : {}),
    };
    // Taking into consideration what user has passed in options and allowing them to override the default generated metadata
    Object.entries(json.meta.angularConfig || {}).forEach(([key, value]) => {
      componentMetadata[key] = value;
    });

    const hasConstructor =
      Boolean(injectables.length) ||
      dynamicComponents.size ||
      refsForObjSpread.size ||
      shouldUseSanitizer;

    const angularCoreImports = [
      ...(outputVars.length ? getOutputImports(options.api) : []),
      ...(options?.experimental?.inject ? ['Inject', 'forwardRef'] : []),
      'Component',
      ...(domRefs.size || dynamicComponents.size || refsForObjSpread.size
        ? ['ViewChild', 'ElementRef']
        : []),
      ...(refsForObjSpread.size ? ['Renderer2'] : []),
      ...(props.size ? getInputImports(options.api) : []),
      ...(dynamicComponents.size ? ['ViewContainerRef', 'TemplateRef'] : []),
      ...(json.hooks.onUpdate?.length && options.typescript ? ['SimpleChanges'] : []),
      ...(changeDetectionStrategy === 'OnPush' ? ['ChangeDetectionStrategy'] : []),
      ...(options.api === 'signals' ? ['signal'] : []),
    ].join(', ');

    const constructorInjectables = [
      ...injectables,
      ...(dynamicComponents.size
        ? [`private vcRef${options.typescript ? ': ViewContainerRef' : ''}`]
        : []),
      ...(refsForObjSpread.size
        ? [`private renderer${options.typescript ? ': Renderer2' : ''}`]
        : []),
      ...(shouldUseSanitizer
        ? [`protected sanitizer${options.typescript ? ': DomSanitizer' : ''}`]
        : []),
    ].join(',\n');

    let str = dedent`
        import { ${angularCoreImports} } from '@angular/core';
        ${shouldUseSanitizer ? `import { DomSanitizer } from '@angular/platform-browser';` : ''}
        ${options.standalone ? `import { CommonModule } from '@angular/common';` : ''}
    
        ${json.types ? json.types.join('\n') : ''}
        ${getDefaultProps(json)}
        ${renderPreComponent({
          explicitImportFileExtension: options.explicitImportFileExtension,
          component: json,
          target: 'angular',
          excludeMitosisComponents: !options.standalone && !options.preserveImports,
          preserveFileExtensions: options.preserveFileExtensions,
          componentsUsed,
          importMapper: options?.importMapper,
        })}
    
        @Component({
          ${Object.entries(componentMetadata)
            .map(([k, v]) => `${k}: ${v}`)
            .join(',')}
        })
        export default class ${json.name} {
          ${localExportVars.join('\n')}
          ${customImports.map((name) => `${name} = ${name}`).join('\n')}
    
          ${getInputs({
            json,
            options,
            props: Array.from(props),
          })}    
          ${getOutputs({ json, outputVars, api: options.api })}
    
          ${[...Array.from(domRefs), ...Array.from(refsForObjSpread)]
            .map(
              (refName) =>
                `@ViewChild('${refName}') ${refName}${options.typescript ? '!: ElementRef' : ''}`,
            )
            .join('\n')}
    
          ${Array.from(dynamicComponents)
            .map(
              (component) =>
                `@ViewChild('${component
                  .split('.')[1]
                  .toLowerCase()}Template', { static: true }) ${component
                  .split('.')[1]
                  .toLowerCase()}TemplateRef${options.typescript ? '!: TemplateRef<any>' : ''}`,
            )
            .join('\n')}
    
          ${dynamicComponents.size ? `myContent${options.typescript ? '?: any[][];' : ''}` : ''}
          ${
            refsForObjSpread.size
              ? `_listenerFns = new Map${options.typescript ? '<string, () => void>' : ''}()`
              : ''
          }
    
          ${dataString}
    
          ${helperFunctions.size ? Array.from(helperFunctions).join('\n') : ''}
    
          ${jsRefs
            .map((ref) => {
              const argument = json.refs[ref].argument;
              const typeParameter = json.refs[ref].typeParameter;
              return `private _${ref}${typeParameter ? `: ${typeParameter}` : ''}${
                argument
                  ? ` = ${processAngularCode({
                      replaceWith: 'this.',
                      contextVars,
                      outputVars,
                      domRefs: Array.from(domRefs),
                    })(argument)}`
                  : ''
              };`;
            })
            .join('\n')}
    
          ${!hasConstructor ? '' : `constructor(\n${constructorInjectables}) {}`}
          
          ${withAttributePassing ? getAttributePassingString(options.typescript) : ''}
          
          ${
            !json.hooks.onMount.length && !dynamicComponents.size && !json.hooks.onInit?.code
              ? ''
              : `ngOnInit() {
                  ${
                    !json.hooks?.onInit
                      ? ''
                      : `
                        ${json.hooks.onInit?.code}
                        `
                  }
                  ${
                    json.hooks.onMount.length > 0
                      ? `
                        if (typeof window !== 'undefined') {
                          ${stringifySingleScopeOnMount(json)}
                        }
                        `
                      : ''
                  }
                  ${
                    dynamicComponents.size
                      ? `
                  this.myContent = [${Array.from(dynamicComponents)
                    .map(
                      (component) =>
                        `this.vcRef.createEmbeddedView(this.${component
                          .split('.')[1]
                          .toLowerCase()}TemplateRef).rootNodes`,
                    )
                    .join(', ')}];
                  `
                      : ''
                  }
                }`
          }
    
          ${
            // hooks specific to Angular
            json.compileContext?.angular?.hooks
              ? Object.entries(json.compileContext?.angular?.hooks)
                  .map(([key, value]) => {
                    return `${key}() {
                ${value.code}
              }`;
                  })
                  .join('\n')
              : ''
          }
    
          ${
            !json.hooks.onUpdate?.length
              ? ''
              : `ngOnChanges(changes${options.typescript ? ': SimpleChanges' : ''}) {
                  if (typeof window !== 'undefined') {
                    ${json.hooks.onUpdate?.reduce((code, hook) => {
                      code += hook.code;
                      return code + '\n';
                    }, '')}
                  }
                }
                    `
          }
    
          ${
            !json.hooks.onUnMount && !refsForObjSpread.size
              ? ''
              : `ngOnDestroy() {
                  ${json.hooks.onUnMount?.code || ''}
                  ${
                    refsForObjSpread.size
                      ? `for (const fn of this._listenerFns.values()) { fn(); }`
                      : ''
                  }
                }`
          }
    
        }
      `;

    if (options.standalone !== true) {
      str = generateNgModule(str, json.name, componentsUsed, json, options.bootstrapMapper);
    }
    if (options.plugins) {
      str = runPreCodePlugins({ json, code: str, plugins: options.plugins });
    }
    if (options.prettier !== false) {
      str = tryFormat(str, 'typescript');
    }
    if (options.plugins) {
      str = runPostCodePlugins({ json, code: str, plugins: options.plugins });
    }

    return str;
  };
};
