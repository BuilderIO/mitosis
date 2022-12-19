import dedent from 'dedent';
import { format } from 'prettier/standalone';
import { collectCss } from '../helpers/styles/collect-css';
import { fastClone } from '../helpers/fast-clone';
import { getRefs } from '../helpers/get-refs';
import { getStateObjectStringFromComponent } from '../helpers/get-state-object-string';
import { mapRefs } from '../helpers/map-refs';
import { renderPreComponent } from '../helpers/render-imports';
import {
  DO_NOT_USE_VARS_TRANSFORMS,
  stripStateAndPropsRefs,
} from '../helpers/strip-state-and-props-refs';
import { selfClosingTags } from '../parsers/jsx';
import { checkIsForNode, MitosisNode } from '../types/mitosis-node';
import {
  runPostCodePlugins,
  runPostJsonPlugins,
  runPreCodePlugins,
  runPreJsonPlugins,
} from '../modules/plugins';
import isChildren from '../helpers/is-children';
import { getProps } from '../helpers/get-props';
import { getPropsRef } from '../helpers/get-props-ref';
import { getPropFunctions } from '../helpers/get-prop-functions';
import { isString, kebabCase, uniq } from 'lodash';
import { stripMetaProperties } from '../helpers/strip-meta-properties';
import { removeSurroundingBlock } from '../helpers/remove-surrounding-block';
import { BaseTranspilerOptions, TranspilerGenerator } from '../types/transpiler';
import { indent } from '../helpers/indent';
import { isSlotProperty, stripSlotPrefix } from '../helpers/slots';
import { getCustomImports } from '../helpers/get-custom-imports';
import { getComponentsUsed } from '../helpers/get-components-used';
import { isUpperCase } from '../helpers/is-upper-case';
import { replaceIdentifiers } from '../helpers/replace-identifiers';
import { VALID_HTML_TAGS } from '../constants/html_tags';
import { flow, pipe } from 'fp-ts/lib/function';

import { MitosisComponent } from '..';
import { mergeOptions } from '../helpers/merge-options';
import { CODE_PROCESSOR_PLUGIN } from '../helpers/plugins/process-code';

const BUILT_IN_COMPONENTS = new Set(['Show', 'For', 'Fragment', 'Slot']);

export interface ToAngularOptions extends BaseTranspilerOptions {
  standalone?: boolean;
  preserveImports?: boolean;
  preserveFileExtensions?: boolean;
  importMapper?: Function;
  bootstrapMapper?: Function;
}

interface AngularBlockOptions {
  childComponents?: string[];
}

const mappers: {
  [key: string]: (json: MitosisNode, options: ToAngularOptions) => string;
} = {
  Fragment: (json, options) => {
    return `<ng-container>${json.children
      .map((item) => blockToAngular(item, options))
      .join('\n')}</ng-container>`;
  },
  Slot: (json, options) => {
    const renderChildren = () =>
      json.children?.map((item) => blockToAngular(item, options)).join('\n');

    return `<ng-content ${Object.entries({ ...json.bindings, ...json.properties })
      .map(([binding, value]) => {
        if (value && binding === 'name') {
          const selector = pipe(isString(value) ? value : value.code, stripSlotPrefix, kebabCase);
          return `select="[${selector}]"`;
        }
      })
      .join('\n')}>${Object.entries(json.bindings)
      .map(([binding, value]) => {
        if (value && binding !== 'name') {
          return value.code;
        }
      })
      .join('\n')}${renderChildren()}</ng-content>`;
  },
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

// TODO: Maybe in the future allow defining `string | function` as values
const BINDINGS_MAPPER: { [key: string]: string | undefined } = {
  innerHTML: 'innerHTML',
  style: 'ngStyle',
};

export const blockToAngular = (
  json: MitosisNode,
  options: ToAngularOptions = {},
  blockOptions: AngularBlockOptions = {},
): string => {
  const childComponents = blockOptions?.childComponents || [];
  const isValidHtmlTag = VALID_HTML_TAGS.includes(json.name.trim());

  if (mappers[json.name]) {
    return mappers[json.name](json, options);
  }

  if (isChildren({ node: json })) {
    return `<ng-content></ng-content>`;
  }

  if (json.properties._text) {
    return json.properties._text;
  }
  const textCode = json.bindings._text?.code;
  if (textCode) {
    if (isSlotProperty(textCode)) {
      const selector = pipe(textCode, stripSlotPrefix, kebabCase);
      return `<ng-content select="[${selector}]"></ng-content>`;
    }

    return `{{${textCode}}}`;
  }

  let str = '';

  const needsToRenderSlots = [];

  if (checkIsForNode(json)) {
    const indexName = json.scope.indexName;
    str += `<ng-container *ngFor="let ${json.scope.forName} of ${json.bindings.each?.code}${
      indexName ? `; let ${indexName} = index` : ''
    }">`;
    str += json.children.map((item) => blockToAngular(item, options, blockOptions)).join('\n');
    str += `</ng-container>`;
  } else if (json.name === 'Show') {
    str += `<ng-container *ngIf="${json.bindings.when?.code}">`;
    str += json.children.map((item) => blockToAngular(item, options, blockOptions)).join('\n');
    str += `</ng-container>`;
  } else {
    const elSelector = childComponents.find((impName) => impName === json.name)
      ? kebabCase(json.name)
      : json.name;
    str += `<${elSelector} `;

    // TODO: spread support for angular
    // if (json.bindings._spread) {
    //   str += `v-bind="${stripStateAndPropsRefs(
    //     json.bindings._spread as string,
    //   )}"`;
    // }

    for (const key in json.properties) {
      if (key.startsWith('$')) {
        continue;
      }
      const value = json.properties[key];
      str += ` ${key}="${value}" `;
    }
    for (const key in json.bindings) {
      if (json.bindings[key]?.type === 'spread') {
        continue;
      }
      if (key.startsWith('$')) {
        continue;
      }

      const { code, arguments: cusArgs = ['event'] } = json.bindings[key]!;
      // TODO: proper babel transform to replace. Util for this

      if (key.startsWith('on')) {
        let event = key.replace('on', '');
        event = event.charAt(0).toLowerCase() + event.slice(1);

        if (event === 'change' && json.name === 'input' /* todo: other tags */) {
          event = 'input';
        }
        // TODO: proper babel transform to replace. Util for this
        const eventName = cusArgs[0];
        const regexp = new RegExp(
          '(^|\\n|\\r| |;|\\(|\\[|!)' + eventName + '(\\?\\.|\\.|\\(| |;|\\)|$)',
          'g',
        );
        const replacer = '$1$event$2';
        const finalValue = removeSurroundingBlock(code.replace(regexp, replacer));
        str += ` (${event})="${finalValue}" `;
      } else if (key === 'class') {
        str += ` [class]="${code}" `;
      } else if (key === 'ref') {
        str += ` #${code} `;
      } else if (isSlotProperty(key)) {
        const lowercaseKey = pipe(key, stripSlotPrefix, (x) => x.toLowerCase());
        needsToRenderSlots.push(`${code.replace(/(\/\>)|\>/, ` ${lowercaseKey}>`)}`);
      } else if (BINDINGS_MAPPER[key]) {
        str += ` [${BINDINGS_MAPPER[key]}]="${code}"  `;
      } else if (isValidHtmlTag || key.includes('-')) {
        // standard html elements need the attr to satisfy the compiler in many cases: eg: svg elements and [fill]
        str += ` [attr.${key}]="${code}" `;
      } else {
        str += `[${key}]="${code}" `;
      }
    }
    if (selfClosingTags.has(json.name)) {
      return str + ' />';
    }
    str += '>';

    if (needsToRenderSlots.length > 0) {
      str += needsToRenderSlots.map((el) => el).join('');
    }

    if (json.children) {
      str += json.children.map((item) => blockToAngular(item, options, blockOptions)).join('\n');
    }

    str += `</${elSelector}>`;
  }
  return str;
};

const processAngularCode =
  ({
    contextVars,
    outputVars,
    domRefs,
    stateVars,
    replaceWith,
  }: {
    contextVars: string[];
    outputVars: string[];
    domRefs: string[];
    stateVars?: string[];
    replaceWith?: string;
  }) =>
  (code: string) =>
    pipe(
      DO_NOT_USE_VARS_TRANSFORMS(code, {
        contextVars,
        domRefs,
        outputVars,
        stateVars,
      }),
      (newCode) => stripStateAndPropsRefs(newCode, { replaceWith }),
    );

export const componentToAngular: TranspilerGenerator<ToAngularOptions> =
  (userOptions = {}) =>
  ({ component: _component }) => {
    const DEFAULT_OPTIONS = {
      preserveImports: false,
      preserveFileExtensions: false,
    };

    // Make a copy we can safely mutate, similar to babel's toolchain
    let json = fastClone(_component);

    const contextVars = Object.keys(json?.context?.get || {});
    const metaOutputVars: string[] = (json.meta?.useMetadata?.outputs as string[]) || [];
    const outputVars = uniq([...metaOutputVars, ...getPropFunctions(json)]);
    const stateVars = Object.keys(json?.state || {});

    const options = mergeOptions({ ...DEFAULT_OPTIONS, ...userOptions });
    options.plugins = [
      ...(options.plugins || []),
      CODE_PROCESSOR_PLUGIN((codeType) => {
        switch (codeType) {
          case 'hooks':
            return flow(
              processAngularCode({
                replaceWith: 'this',
                contextVars,
                outputVars,
                domRefs: Array.from(getRefs(json)),
                stateVars,
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
            return (code) => {
              const newLocal = processAngularCode({
                contextVars: [],
                outputVars,
                domRefs: [], // the template doesn't need the this keyword.
              })(code);
              return newLocal.replace(/"/g, '&quot;');
            };
          case 'hooks-deps':
          case 'state':
          case 'properties':
            return (x) => x;
        }
      }),
    ];

    if (options.plugins) {
      json = runPreJsonPlugins(json, options.plugins);
    }

    const [forwardProp, hasPropRef] = getPropsRef(json, true);
    const childComponents: string[] = [];
    const propsTypeRef = json.propsTypeRef !== 'any' ? json.propsTypeRef : undefined;

    json.imports.forEach(({ imports }) => {
      Object.keys(imports).forEach((key) => {
        if (imports[key] === 'default') {
          childComponents.push(key);
        }
      });
    });

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
    const hasConstructor = Boolean(injectables.length || json.hooks?.onInit);

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

    const hasOnMount = Boolean(json.hooks?.onMount);
    const domRefs = getRefs(json);
    const jsRefs = Object.keys(json.refs).filter((ref) => !domRefs.has(ref));
    const componentsUsed = Array.from(getComponentsUsed(json)).filter((item) => {
      return item.length && isUpperCase(item[0]) && !BUILT_IN_COMPONENTS.has(item);
    });

    mapRefs(json, (refName) => {
      const isDomRef = domRefs.has(refName);
      return `this.${isDomRef ? '' : '_'}${refName}${isDomRef ? '.nativeElement' : ''}`;
    });

    if (options.plugins) {
      json = runPostJsonPlugins(json, options.plugins);
    }
    let css = collectCss(json);
    if (options.prettier !== false) {
      css = tryFormat(css, 'css');
    }

    let template = json.children
      .map((item) => blockToAngular(item, options, { childComponents }))
      .join('\n');
    if (options.prettier !== false) {
      template = tryFormat(template, 'html');
    }

    stripMetaProperties(json);

    const dataString = getStateObjectStringFromComponent(json, {
      format: 'class',
      valueMapper: processAngularCode({
        replaceWith: 'this',
        contextVars,
        outputVars,
        domRefs: Array.from(domRefs),
        stateVars,
      }),
    });
    // Preparing built in component metadata parameters
    const componentMetadata: Record<string, any> = {
      selector: `'${kebabCase(json.name || 'my-component')}, ${json.name}'`,
      template: `\`
        ${indent(template, 8).replace(/`/g, '\\`').replace(/\$\{/g, '\\${')}
        \``,
      ...(css.length
        ? {
            styles: `[\`${indent(css, 8)}\`]`,
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

    const getPropsDefinition = ({ json }: { json: MitosisComponent }) => {
      if (!json.defaultProps) return '';
      const defalutPropsString = Object.keys(json.defaultProps)
        .map((prop) => {
          const value = json.defaultProps!.hasOwnProperty(prop)
            ? json.defaultProps![prop]?.code
            : '{}';
          return `${prop}: ${value}`;
        })
        .join(',');
      return `const defaultProps = {${defalutPropsString}};\n`;
    };

    let str = dedent`
    import { ${outputs.length ? 'Output, EventEmitter, \n' : ''} ${
      options?.experimental?.inject ? 'Inject, forwardRef,' : ''
    } Component ${domRefs.size ? ', ViewChild, ElementRef' : ''}${
      props.size ? ', Input' : ''
    } } from '@angular/core';
    ${options.standalone ? `import { CommonModule } from '@angular/common';` : ''}

    ${json.types ? json.types.join('\n') : ''}
    ${getPropsDefinition({ json })}
    ${renderPreComponent({
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
    export class ${json.name} {
      ${localExportVars.join('\n')}
      ${customImports.map((name) => `${name} = ${name}`).join('\n')}

      ${Array.from(props)
        .filter((item) => !isSlotProperty(item) && item !== 'children')
        .map((item) => {
          const propType = propsTypeRef ? `${propsTypeRef}["${item}"]` : 'any';
          let propDeclaration = `@Input() ${item}: ${propType}`;
          if (json.defaultProps && json.defaultProps.hasOwnProperty(item)) {
            propDeclaration += ` = defaultProps["${item}"]`;
          }
          return propDeclaration;
        })
        .join('\n')}

      ${outputs.join('\n')}

      ${Array.from(domRefs)
        .map((refName) => `@ViewChild('${refName}') ${refName}: ElementRef`)
        .join('\n')}

      ${dataString}

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
                  stateVars,
                })(argument)}`
              : ''
          };`;
        })
        .join('\n')}

      ${
        !hasConstructor
          ? ''
          : `constructor(\n${injectables.join(',\n')}) {
            ${
              !json.hooks?.onInit
                ? ''
                : `
              ${json.hooks.onInit?.code}
              `
            }
          }
          `
      }
      ${
        !hasOnMount
          ? ''
          : `ngOnInit() {

              ${
                !json.hooks?.onMount
                  ? ''
                  : `
                ${json.hooks.onMount?.code}
                `
              }
            }`
      }

      ${
        !json.hooks.onUpdate?.length
          ? ''
          : `ngAfterContentChecked() {
              ${json.hooks.onUpdate.reduce((code, hook) => {
                code += hook.code;
                return code + '\n';
              }, '')}
            }`
      }

      ${
        !json.hooks.onUnMount
          ? ''
          : `ngOnDestroy() {
              ${json.hooks.onUnMount.code}
            }`
      }

    }
  `;

    str = generateNgModule(str, json.name, componentsUsed, json, options.bootstrapMapper);

    if (options.plugins) {
      str = runPreCodePlugins(str, options.plugins);
    }
    if (options.prettier !== false) {
      str = tryFormat(str, 'typescript');
    }
    if (options.plugins) {
      str = runPostCodePlugins(str, options.plugins);
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
