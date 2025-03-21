import {
  getDefaultProps,
  getTemplateFormat,
  traverseAndCheckIfInnerHTMLIsUsed,
} from '@/generators/angular/helpers';
import { tryFormat } from '@/generators/angular/helpers/format';
import { getInputs } from '@/generators/angular/helpers/get-inputs';
import { getOutputs } from '@/generators/angular/helpers/get-outputs';
import { getDomRefs } from '@/generators/angular/helpers/get-refs';
import { getAngularStyles } from '@/generators/angular/helpers/get-styles';
import { blockToAngularSignals } from '@/generators/angular/signals/blocks';
import { getAngularCoreImportsAsString } from '@/generators/angular/signals/helpers';
import { getCodeProcessorPlugins } from '@/generators/angular/signals/plugins/get-code-processor-plugins';
import {
  BUILT_IN_COMPONENTS,
  DEFAULT_ANGULAR_OPTIONS,
  ToAngularOptions,
} from '@/generators/angular/types';
import { stringifySingleScopeOnMount } from '@/generators/helpers/on-mount';
import { ProcessBindingOptions } from '@/helpers/class-components';
import { dedent } from '@/helpers/dedent';
import { checkIsEvent } from '@/helpers/event-handlers';
import { fastClone } from '@/helpers/fast-clone';
import { getChildComponents } from '@/helpers/get-child-components';
import { getComponentsUsed } from '@/helpers/get-components-used';
import { getProps } from '@/helpers/get-props';
import { getStateObjectStringFromComponent } from '@/helpers/get-state-object-string';
import { isUpperCase } from '@/helpers/is-upper-case';
import { initializeOptions } from '@/helpers/merge-options';
import { renderPreComponent } from '@/helpers/render-imports';
import { stripMetaProperties } from '@/helpers/strip-meta-properties';
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
import { kebabCase } from 'lodash';

export const componentToAngularSignals: TranspilerGenerator<ToAngularOptions> = (
  userOptions = {},
) => {
  return ({ component }) => {
    // Make a copy we can safely mutate, similar to babel's toolchain
    let json = fastClone(component);

    const options = initializeOptions({
      target: 'angular',
      component,
      defaults: DEFAULT_ANGULAR_OPTIONS,
      userOptions,
    });
    options.typescript = true; // Angular uses ts all the time
    options.api = 'signals';

    if (options.plugins) {
      json = runPreJsonPlugins({ json, plugins: options.plugins });
    }

    const domRefs = getDomRefs({ json, options });
    const withAttributePassing = shouldAddAttributePassing(json, options);
    const rootRef = getAddAttributePassingRef(json, options);

    let props: string[] = Array.from(getProps(json));
    const events: string[] = props.filter((prop) => checkIsEvent(prop));
    const childComponents: string[] = getChildComponents(json);
    const processBindingOptions: ProcessBindingOptions = { events };

    props = props.filter((prop) => {
      // Best practise for Angular is to use Events without "on"
      // Stencil doesn't need children as a prop
      return prop !== 'children' && !checkIsEvent(prop);
    });

    options.plugins = getCodeProcessorPlugins(json, options, processBindingOptions);

    if (options.plugins) {
      json = runPostJsonPlugins({ json, plugins: options.plugins });
    }

    // CSS
    const styles = getAngularStyles({ json, options });

    // Mitosis Metadata
    const useMetadata = json.meta?.useMetadata;
    const shouldUseSanitizer =
      !useMetadata?.angular?.sanitizeInnerHTML && traverseAndCheckIfInnerHTMLIsUsed(json);
    const onPush = useMetadata?.angular?.changeDetection == 'OnPush';

    // HTML
    let template = json.children
      .map((item) => {
        return blockToAngularSignals({
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
      })
      .join('\n');

    if (options.prettier !== false) {
      template = tryFormat(template, 'html');
    }

    // Angular component settings
    const componentsUsed = Array.from(getComponentsUsed(json)).filter(
      (item) => item.length && isUpperCase(item[0]) && !BUILT_IN_COMPONENTS.has(item),
    );
    const componentSettings: Record<string, any> = {
      selector: `'${kebabCase(json.name)}'`,
      standalone: 'true',
      imports: `[${['CommonModule', ...componentsUsed].join(', ')}]`,
      template: `\`${getTemplateFormat(template)}\``,
    };
    if (onPush) {
      componentSettings.changeDetection = `'ChangeDetectionStrategy.OnPush'`;
    }
    if (styles) {
      componentSettings.styles = `\`${styles}\``;
    }

    stripMetaProperties(json);

    const dataString = getStateObjectStringFromComponent(json, {
      format: 'class',
      data: true,
      functions: false,
      getters: false,
      valueMapper: (
        code: string,
        _: 'data' | 'function' | 'getter',
        typeParameter: string | undefined,
      ) => {
        return `signal${typeParameter ? `<${typeParameter}>` : ''}(${code})`;
      },
    });

    const methodsString = getStateObjectStringFromComponent(json, {
      format: 'class',
      data: false,
      functions: true,
      getters: true,
    });

    // Imports
    const coreImports = getAngularCoreImportsAsString({
      refs: domRefs.size !== 0,
      input: props.length !== 0,
      output: events.length !== 0,
      effect: json.hooks.onUpdate?.length !== 0,
      signal: dataString.length !== 0,
      onPush,
    });

    let str = dedent`
        import { ${coreImports} } from '@angular/core';
        import { CommonModule } from '@angular/common';
        ${shouldUseSanitizer ? `import { DomSanitizer } from '@angular/platform-browser';` : ''}

    
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
          ${Object.entries(componentSettings)
            .map(([k, v]) => `${k}: ${v}`)
            .join(',')}
        })
        export class ${json.name} {    
          ${getInputs({
            json,
            options,
            props: Array.from(props),
          })}    
          ${getOutputs({ json, outputVars: events, api: options.api })}
    
          ${Array.from(domRefs)
            .map((refName) => `${refName} = viewChild<ElementRef>("${refName}")`)
            .join('\n')}
    
          ${dataString}
          ${methodsString}
    
          constructor() {          
          ${
            json.hooks.onUpdate?.length
              ? json.hooks.onUpdate
                  ?.map(
                    ({ code }) =>
                      `effect(() => {
                      ${code}
                      });`,
                  )
                  .join('\n')
              : ''
          }
          }
          
          ${withAttributePassing ? getAttributePassingString(options.typescript) : ''}
          
          ${
            !json.hooks.onMount.length && !json.hooks.onInit?.code
              ? ''
              : `ngOnInit() {
                  ${!json.hooks?.onInit ? '' : json.hooks.onInit?.code}
                  ${json.hooks.onMount.length > 0 ? stringifySingleScopeOnMount(json) : ''}
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
            json.hooks.onUnMount
              ? `ngOnDestroy() {
                  ${json.hooks.onUnMount?.code || ''}
                }`
              : ''
          }
    
        }
      `;

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
