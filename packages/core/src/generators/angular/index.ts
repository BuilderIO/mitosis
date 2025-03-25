import { VALID_HTML_TAGS } from '@/constants/html_tags';
import { createSingleBinding } from '@/helpers/bindings';
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
import { isMitosisNode } from '@/helpers/is-mitosis-node';
import { isUpperCase } from '@/helpers/is-upper-case';
import { mapRefs } from '@/helpers/map-refs';
import { initializeOptions } from '@/helpers/merge-options';
import { CODE_PROCESSOR_PLUGIN } from '@/helpers/plugins/process-code';
import { renderPreComponent } from '@/helpers/render-imports';
import { replaceIdentifiers, replaceNodes } from '@/helpers/replace-identifiers';
import { isSlotProperty } from '@/helpers/slots';
import { stripMetaProperties } from '@/helpers/strip-meta-properties';
import {
  DO_NOT_USE_VARS_TRANSFORMS,
  stripStateAndPropsRefs,
} from '@/helpers/strip-state-and-props-refs';
import { collectCss } from '@/helpers/styles/collect-css';
import { nodeHasCss } from '@/helpers/styles/helpers';
import { traverseNodes } from '@/helpers/traverse-nodes';
import {
  runPostCodePlugins,
  runPostJsonPlugins,
  runPreCodePlugins,
  runPreJsonPlugins,
} from '@/modules/plugins';
import { MitosisComponent } from '@/types/mitosis-component';
import { MitosisNode } from '@/types/mitosis-node';
import { TranspilerGenerator } from '@/types/transpiler';
import * as babel from '@babel/core';
import { flow, pipe } from 'fp-ts/lib/function';
import { kebabCase, uniq } from 'lodash';
import traverse from 'neotraverse/legacy';
import { format } from 'prettier/standalone';
import isChildren from '../../helpers/is-children';
import { stringifySingleScopeOnMount } from '../helpers/on-mount';
import {
  HELPER_FUNCTIONS,
  getAppropriateTemplateFunctionKeys,
  getDefaultProps,
  transformState,
} from './helpers';
import {
  AngularBlockOptions,
  BUILT_IN_COMPONENTS,
  DEFAULT_ANGULAR_OPTIONS,
  ToAngularOptions,
} from './types';

import { dashCase } from '@/helpers/dash-case';
import { checkIsEvent } from '@/helpers/event-handlers';

import { addCodeNgAfterViewInit, makeReactiveState } from '@/generators/angular/helpers/hooks';
import {
  ROOT_REF,
  getAddAttributePassingRef,
  getAttributePassingString,
  shouldAddAttributePassing,
} from '@/helpers/web-components/attribute-passing';
import { blockToAngular } from './blocks';

const { types } = babel;

const preprocessCssAsJson = (json: MitosisComponent) => {
  traverse(json).forEach((item) => {
    if (isMitosisNode(item)) {
      if (nodeHasCss(item)) {
        if (item.bindings.css?.code?.includes('&quot;')) {
          item.bindings.css.code = item.bindings.css.code.replace(/&quot;/g, '"');
        }
      }
    }
  });
};

const generateNgModule = (
  content: string,
  name: string,
  componentsUsed: string[],
  component: MitosisComponent,
  bootstrapMapper: Function | null | undefined,
): string => {
  return `import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";

${content}

@NgModule({
  declarations: [${name}],
  imports: [CommonModule${
    componentsUsed.length ? ', ' + componentsUsed.map((comp) => `${comp}Module`).join(', ') : ''
  }],
  exports: [${name}],
  ${bootstrapMapper ? bootstrapMapper(name, componentsUsed, component) : ''}
})
export class ${name}Module {}`;
};

const traverseToGetAllDynamicComponents = (
  json: MitosisComponent,
  options: ToAngularOptions,
  blockOptions: AngularBlockOptions,
) => {
  const components: Set<string> = new Set();
  let dynamicTemplate = '';
  traverse(json).forEach((item) => {
    if (isMitosisNode(item) && item.name.includes('.') && item.name.split('.').length === 2) {
      const children = item.children
        .map((child) => blockToAngular({ root: json, json: child, options, blockOptions }))
        .join('\n');
      dynamicTemplate = `<ng-template #${
        item.name.split('.')[1].toLowerCase() + 'Template'
      }>${children}</ng-template>`;
      components.add(item.name);
    }
  });
  return {
    components,
    dynamicTemplate,
  };
};

const traverseAndCheckIfInnerHTMLIsUsed = (json: MitosisComponent) => {
  let innerHTMLIsUsed = false;
  traverse(json).forEach((item) => {
    if (isMitosisNode(item)) {
      Object.keys(item.bindings).forEach((key) => {
        if (key === 'innerHTML') {
          innerHTMLIsUsed = true;
          return;
        }
      });
    }
  });
  return innerHTMLIsUsed;
};

/**
 * Prefixes state identifiers with this.
 * e.g. state.foo --> this.foo
 */
const prefixState = (code: string): string => {
  return replaceNodes({
    code,
    nodeMaps: [
      {
        from: types.identifier('state'),
        to: types.thisExpression(),
      },
    ],
  }).trim();
};

const processAngularCode =
  ({
    contextVars,
    outputVars,
    domRefs,
    replaceWith,
  }: {
    contextVars: string[];
    outputVars: string[];
    domRefs: string[];
    replaceWith?: string;
  }) =>
  (code: string) =>
    pipe(
      DO_NOT_USE_VARS_TRANSFORMS(code, {
        contextVars,
        domRefs,
        outputVars,
      }),
      /**
       * Only prefix state that is in the Angular class component.
       * Do not prefix state referenced in the template
       */
      replaceWith === 'this' ? prefixState : (x) => x,
      (newCode) => stripStateAndPropsRefs(newCode, { replaceWith }),
    );

const isASimpleProperty = (code: string) => {
  const expressions = ['==', '===', '!=', '!==', '<', '>', '<=', '>='];
  const invalidChars = ['{', '}', '(', ')', 'typeof'];

  return !invalidChars.some((char) => code.includes(char)) && !expressions.includes(code);
};

const generateNewBindingName = (index: number, name: string) =>
  `node_${index}_${name.replaceAll('.', '_').replaceAll('-', '_')}`;

const handleBindings = (
  json: MitosisComponent,
  item: MitosisNode,
  index: number,
  forName?: string,
  indexName?: string,
) => {
  for (const key in item.bindings) {
    if (
      key.startsWith('"') ||
      key.startsWith('$') ||
      key === 'css' ||
      key === 'ref' ||
      isASimpleProperty(item.bindings[key]!.code)
    ) {
      continue;
    }

    const newBindingName = generateNewBindingName(index, item.name);

    if (forName) {
      if (item.name === 'For') continue;
      if (key === 'key') continue;

      if (checkIsEvent(key)) {
        const { arguments: cusArgs = ['event'] } = item.bindings[key]!;
        const eventBindingName = `${generateNewBindingName(index, item.name)}_event`;
        if (
          item.bindings[key]?.code.trim().startsWith('{') &&
          item.bindings[key]?.code.trim().endsWith('}')
        ) {
          const forAndIndex = `${forName ? `, ${forName}` : ''}${
            indexName ? `, ${indexName}` : ''
          }`;
          const eventArgs = `${cusArgs.join(', ')}${forAndIndex}`;
          json.state[eventBindingName] = {
            code: `(${eventArgs}) => ${item.bindings[key]!.code}`,
            type: 'function',
          };
          item.bindings[key]!.code = `state.${eventBindingName}(${eventArgs})`;
          json.state[newBindingName] = {
            code: `(${eventArgs}) => (${item.bindings[key]!.code})`,
            type: 'function',
          };
          item.bindings[key]!.code = `state.${newBindingName}($${eventArgs})`;
        }
      } else {
        json.state[newBindingName] = {
          code: `(${forName}${indexName ? `, ${indexName}` : ''}) => (${item.bindings[key]!.code})`,
          type: 'function',
        };
        item.bindings[key]!.code = `state.${newBindingName}(${forName}${
          indexName ? `, ${indexName}` : ''
        })`;
      }
    } else if (item.bindings[key]?.code) {
      if (item.bindings[key]?.type !== 'spread' && !checkIsEvent(key)) {
        json.state[newBindingName] = { code: 'null', type: 'property' };
        makeReactiveState(
          json,
          newBindingName,
          `this.${newBindingName} = ${item.bindings[key]!.code}`,
        );
        item.bindings[key]!.code = `state.${newBindingName}`;
      } else if (checkIsEvent(key)) {
        const { arguments: cusArgs = ['event'] } = item.bindings[key]!;
        if (
          item.bindings[key]?.code.trim().startsWith('{') &&
          item.bindings[key]?.code.trim().endsWith('}')
        ) {
          json.state[newBindingName] = {
            code: `(${cusArgs.join(', ')}) => ${item.bindings[key]!.code}`,
            type: 'function',
          };
          item.bindings[key]!.code = `state.${newBindingName}(${cusArgs.join(', ')})`;
        }
      } else {
        makeReactiveState(
          json,
          newBindingName,
          `state.${newBindingName} = {...(${item.bindings[key]!.code})}`,
        );
        item.bindings[newBindingName] = item.bindings[key];
        item.bindings[key]!.code = `state.${newBindingName}`;
        delete item.bindings[key];
      }
    }
    index++;
  }
  return index;
};

const handleProperties = (json: MitosisComponent, item: MitosisNode, index: number) => {
  for (const key in item.properties) {
    if (key.startsWith('$') || isASimpleProperty(item.properties[key]!)) {
      continue;
    }
    const newBindingName = generateNewBindingName(index, item.name);
    json.state[newBindingName] = { code: '`' + `${item.properties[key]}` + '`', type: 'property' };
    item.bindings[key] = createSingleBinding({ code: `state.${newBindingName}` });
    delete item.properties[key];
    index++;
  }
  return index;
};

const handleAngularBindings = (
  json: MitosisComponent,
  item: MitosisNode,
  index: number,
  { forName, indexName }: { forName?: string; indexName?: string } = {},
): number => {
  if (isChildren({ node: item })) return index;

  index = handleBindings(json, item, index, forName, indexName);
  index = handleProperties(json, item, index);

  return index;
};

const classPropertiesPlugin = () => ({
  json: {
    pre: (json: MitosisComponent) => {
      let lastId = 0;
      traverseNodes(json, (item) => {
        if (isMitosisNode(item)) {
          if (item.name === 'For') {
            const forName = (item.scope as any).forName;
            const indexName = (item.scope as any).indexName;
            traverseNodes(item, (child) => {
              if (isMitosisNode(child)) {
                (child as any)._traversed = true;
                lastId = handleAngularBindings(json, child, lastId, {
                  forName,
                  indexName,
                });
              }
            });
          } else if (!(item as any)._traversed) {
            lastId = handleAngularBindings(json, item, lastId);
          }
        }
      });
      return json;
    },
  },
});

export const componentToAngular: TranspilerGenerator<ToAngularOptions> =
  (userOptions = {}) =>
  ({ component: _component }) => {
    // Make a copy we can safely mutate, similar to babel's toolchain
    let json = fastClone(_component);

    const useMetadata = json.meta?.useMetadata;

    const contextVars = Object.keys(json?.context?.get || {});
    // TODO: Why is 'outputs' used here and shouldn't it be typed in packages/core/src/types/metadata.ts
    const metaOutputVars: string[] = (useMetadata?.outputs as string[]) || [];

    const outputVars = uniq([...metaOutputVars, ...getPropFunctions(json)]);

    const options = initializeOptions({
      target: 'angular',
      component: _component,
      defaults: DEFAULT_ANGULAR_OPTIONS,
      userOptions: userOptions,
    });
    options.plugins = [
      ...(options.plugins || []),
      CODE_PROCESSOR_PLUGIN((codeType, _, node) => {
        switch (codeType) {
          case 'hooks':
            return flow(
              processAngularCode({
                replaceWith: 'this',
                contextVars,
                outputVars,
                domRefs: Array.from(getRefs(json)),
              }),
              (code) => {
                const allMethodNames = Object.entries(json.state)
                  .filter(([_, value]) => value?.type === 'function' || value?.type === 'method')
                  .map(([key]) => key);

                return replaceIdentifiers({
                  code,
                  from: allMethodNames,
                  to: (name) => `this.${name}`,
                });
              },
            );

          case 'bindings':
            return (code, key) => {
              // we create a separate state property for spread binding and use ref to attach the attributes
              // so we need to use `this.` inside the class to access state and props
              const isSpreadAttributeBinding =
                node?.bindings[key]?.type === 'spread' &&
                VALID_HTML_TAGS.includes(node.name.trim());

              // If we have a For loop with "key" it will be transformed to
              // trackOfXXX, we need to use "this" for state properties
              const isKey = key === 'key';

              const newLocal = processAngularCode({
                contextVars: [],
                outputVars,
                domRefs: [], // the template doesn't need the this keyword.
                replaceWith: isKey || isSpreadAttributeBinding ? 'this' : undefined,
              })(code);
              return newLocal.replace(/"/g, '&quot;');
            };
          case 'hooks-deps':
          case 'state':
          case 'context-set':
          case 'properties':
          case 'dynamic-jsx-elements':
          case 'types':
            return (x) => x;
        }
      }),
    ];

    if (options.state === 'class-properties') {
      options.plugins.push(classPropertiesPlugin);
    }

    if (options.plugins) {
      json = runPreJsonPlugins({ json, plugins: options.plugins });
    }

    const [forwardProp, hasPropRef] = getPropsRef(json, true);
    const propsTypeRef = json.propsTypeRef !== 'any' ? json.propsTypeRef : undefined;

    const childComponents: string[] = getChildComponents(json);

    const customImports = getCustomImports(json);

    const { exports: localExports = {} } = json;
    const localExportVars = Object.keys(localExports)
      .filter((key) => localExports[key].usedInLocal)
      .map((key) => `${key} = ${key};`);

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

    const props = getProps(json);
    // prevent jsx props from showing up as @Input
    if (hasPropRef) {
      props.delete(forwardProp);
    }
    props.delete('children');

    // remove props for outputs
    outputVars.forEach((variableName) => {
      props.delete(variableName);
    });

    const outputs = outputVars.map((variableName) => {
      if (options?.experimental?.outputs) {
        return options?.experimental?.outputs(json, variableName);
      }
      return `@Output() ${variableName} = new EventEmitter()`;
    });

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

    const componentsUsed = Array.from(getComponentsUsed(json)).filter((item) => {
      return item.length && isUpperCase(item[0]) && !BUILT_IN_COMPONENTS.has(item);
    });

    mapRefs(json, (refName) => {
      const isDomRef = domRefs.has(refName);
      return `this.${isDomRef ? '' : '_'}${refName}${isDomRef ? '.nativeElement' : ''}`;
    });

    if (options.plugins) {
      json = runPostJsonPlugins({ json, plugins: options.plugins });
    }

    preprocessCssAsJson(json);
    let css = collectCss(json);
    if (options.prettier !== false) {
      css = tryFormat(css, 'css');
    }

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

        return processAngularCode({
          replaceWith: 'this',
          contextVars,
          outputVars,
          domRefs: Array.from(domRefs),
        })(value);
      },
    });

    const refsForObjSpread = getRefs(json, 'spreadRef');

    const hostDisplayCss = options.visuallyIgnoreHostElement ? ':host { display: contents; }' : '';
    const styles = css.length ? [hostDisplayCss, css].join('\n') : hostDisplayCss;

    // Preparing built in component metadata parameters
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
      ...(outputs.length ? ['Output', 'EventEmitter'] : []),
      ...(options?.experimental?.inject ? ['Inject', 'forwardRef'] : []),
      'Component',
      ...(domRefs.size || dynamicComponents.size || refsForObjSpread.size
        ? ['ViewChild', 'ElementRef']
        : []),
      ...(refsForObjSpread.size ? ['Renderer2'] : []),
      ...(props.size ? ['Input'] : []),
      ...(dynamicComponents.size ? ['ViewContainerRef', 'TemplateRef'] : []),
      ...(json.hooks.onUpdate?.length && options.typescript ? ['SimpleChanges'] : []),
      ...(changeDetectionStrategy === 'OnPush' ? ['ChangeDetectionStrategy'] : []),
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

      ${Array.from(props)
        .filter((item) => !isSlotProperty(item) && item !== 'children')
        .map((item) => {
          const hasDefaultProp = json.defaultProps && json.defaultProps.hasOwnProperty(item);
          const propType = propsTypeRef ? `${propsTypeRef}["${item}"]` : 'any';
          let propDeclaration = `@Input() ${item}${
            options.typescript ? `${hasDefaultProp ? '' : '!'}: ${propType}` : ''
          }`;
          if (hasDefaultProp) {
            propDeclaration += ` = defaultProps["${item}"]`;
          }
          return propDeclaration;
        })
        .join('\n')}

      ${outputs.join('\n')}

      ${Array.from(domRefs)
        .map(
          (refName) =>
            `@ViewChild('${refName}') ${refName}${options.typescript ? '!: ElementRef' : ''}`,
        )
        .join('\n')}

      ${Array.from(refsForObjSpread)
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

const tryFormat = (str: string, parser: string) => {
  try {
    return format(str, {
      parser,
      plugins: [
        // To support running in browsers
        require('prettier/parser-typescript'),
        require('prettier/parser-postcss'),
        require('prettier/parser-html'),
        require('prettier/parser-babel'),
      ],
      htmlWhitespaceSensitivity: 'ignore',
    });
  } catch (err) {
    console.warn('Could not prettify', { string: str }, err);
  }
  return str;
};

export * from './types';
