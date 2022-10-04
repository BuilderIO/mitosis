import dedent from 'dedent';
import json5 from 'json5';
import { format } from 'prettier/standalone';
import { collectCss } from '../helpers/styles/collect-css';
import { fastClone } from '../helpers/fast-clone';
import { getRefs } from '../helpers/get-refs';
import { getStateObjectStringFromComponent } from '../helpers/get-state-object-string';
import { mapRefs } from '../helpers/map-refs';
import { renderPreComponent } from '../helpers/render-imports';
import { stripStateAndPropsRefs } from '../helpers/strip-state-and-props-refs';
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
import { kebabCase, uniq } from 'lodash';
import { stripMetaProperties } from '../helpers/strip-meta-properties';
import { removeSurroundingBlock } from '../helpers/remove-surrounding-block';
import { BaseTranspilerOptions, TranspilerGenerator } from '../types/transpiler';
import { indent } from '../helpers/indent';
import { isSlotProperty } from '../helpers/slots';
import { getCustomImports } from '../helpers/get-custom-imports';
import { getComponentsUsed } from '../helpers/get-components-used';
import { isUpperCase } from '../helpers/is-upper-case';

const BUILT_IN_COMPONENTS = new Set(['Show', 'For', 'Fragment']);

export interface ToAngularOptions extends BaseTranspilerOptions {
  standalone?: boolean;
  preserveImports?: boolean;
}

interface AngularBlockOptions {
  contextVars?: string[];
  outputVars?: string[];
  childComponents?: string[];
  domRefs?: string[];
}

const mappers: {
  [key: string]: (
    json: MitosisNode,
    options: ToAngularOptions,
    blockOptions?: AngularBlockOptions,
  ) => string;
} = {
  Fragment: (json, options, blockOptions) => {
    return `<div>${json.children
      .map((item) => blockToAngular(item, options, blockOptions))
      .join('\n')}</div>`;
  },
  Slot: (json, options, blockOptions) => {
    return `<ng-content ${Object.keys(json.bindings)
      .map((binding) => {
        if (binding === 'name') {
          const selector = kebabCase(json.bindings.name?.code?.replace('props.slot', ''));
          return `select="[${selector}]"`;
        }
      })
      .join('\n')}>${Object.keys(json.bindings)
      .map((binding) => {
        if (binding !== 'name') {
          return `${json.bindings[binding]?.code}`;
        }
      })
      .join('\n')}</ng-content>`;
  },
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
  const contextVars = blockOptions?.contextVars || [];
  const outputVars = blockOptions?.outputVars || [];
  const childComponents = blockOptions?.childComponents || [];
  const domRefs = blockOptions?.domRefs || [];

  if (mappers[json.name]) {
    return mappers[json.name](json, options, blockOptions);
  }

  if (isChildren(json)) {
    return `<ng-content></ng-content>`;
  }

  if (json.properties._text) {
    return json.properties._text;
  }
  if (/props\.slot/.test(json.bindings._text?.code as string)) {
    const selector = kebabCase(json.bindings._text?.code?.replace('props.slot', ''));
    return `<ng-content select="[${selector}]"></ng-content>`;
  }

  if (json.bindings._text?.code) {
    return `{{${stripStateAndPropsRefs(json.bindings._text.code as string, {
      // the context is the class
      contextVars: [],
      outputVars,
      domRefs,
    })}}}`;
  }

  let str = '';

  const needsToRenderSlots = [];

  if (checkIsForNode(json)) {
    const indexName = json.scope.indexName;
    str += `<ng-container *ngFor="let ${json.scope.forName} of ${stripStateAndPropsRefs(
      json.bindings.each?.code,
      {
        contextVars,
        outputVars,
        domRefs,
      },
    )}${indexName ? `; let ${indexName} = index` : ''}">`;
    str += json.children.map((item) => blockToAngular(item, options, blockOptions)).join('\n');
    str += `</ng-container>`;
  } else if (json.name === 'Show') {
    str += `<ng-container *ngIf="${stripStateAndPropsRefs(json.bindings.when?.code, {
      contextVars,
      outputVars,
      domRefs,
    })}">`;
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
      if (key === '_spread') {
        continue;
      }
      if (key.startsWith('$')) {
        continue;
      }

      const { code, arguments: cusArgs = ['event'] } = json.bindings[key]!;
      // TODO: proper babel transform to replace. Util for this
      const useValue = stripStateAndPropsRefs(code as string, {
        contextVars,
        outputVars,
        domRefs,
      }).replace(/"/g, '&quot;');

      if (key.startsWith('on')) {
        let event = key.replace('on', '').toLowerCase();
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
        const finalValue = removeSurroundingBlock(useValue.replace(regexp, replacer));
        str += ` (${event})="${finalValue}" `;
      } else if (key === 'class') {
        str += ` [class]="${useValue}" `;
      } else if (key === 'ref') {
        str += ` #${useValue} `;
      } else if (isSlotProperty(key)) {
        const lowercaseKey =
          key.replace('slot', '')[0].toLowerCase() + key.replace('slot', '').substring(1);
        needsToRenderSlots.push(`${useValue.replace(/(\/\>)|\>/, ` ${lowercaseKey}>`)}`);
      } else if (BINDINGS_MAPPER[key]) {
        str += ` [${BINDINGS_MAPPER[key]}]="${useValue}"  `;
      } else if (key.includes('-')) {
        str += ` [attr.${key}]="${useValue}" `;
      } else {
        str += ` [${key}]="${useValue}" `;
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

export const componentToAngular: TranspilerGenerator<ToAngularOptions> =
  (userOptions = {}) =>
  ({ component: _component }) => {
    const DEFAULT_OPTIONS = {
      preserveImports: false,
    };

    const options = { ...DEFAULT_OPTIONS, ...userOptions };

    // Make a copy we can safely mutate, similar to babel's toolchain
    let json = fastClone(_component);
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

    const metaOutputVars: string[] = (json.meta?.useMetadata?.outputs as string[]) || [];
    const contextVars = Object.keys(json?.context?.get || {});
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

    const outputVars = uniq([...metaOutputVars, ...getPropFunctions(json)]);
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

    const stateVars = Object.keys(json?.state || {});

    const componentsUsed = Array.from(getComponentsUsed(json)).filter(
      (item) => item.length && isUpperCase(item[0]) && !BUILT_IN_COMPONENTS.has(item),
    );

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

    const blockOptions = {
      contextVars,
      outputVars,
      domRefs: [], // the template doesn't need the this keyword.
      childComponents,
    };

    let template = json.children
      .map((item) => blockToAngular(item, options, blockOptions))
      .join('\n');
    if (options.prettier !== false) {
      template = tryFormat(template, 'html');
    }

    stripMetaProperties(json);

    const dataString = getStateObjectStringFromComponent(json, {
      format: 'class',
      valueMapper: (code) =>
        stripStateAndPropsRefs(code, {
          replaceWith: 'this.',
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
    let str = dedent`
    import { ${outputs.length ? 'Output, EventEmitter, \n' : ''} ${
      options?.experimental?.inject ? 'Inject, forwardRef,' : ''
    } Component ${domRefs.size ? ', ViewChild, ElementRef' : ''}${
      props.size ? ', Input' : ''
    } } from '@angular/core';
    ${options.standalone ? `import { CommonModule } from '@angular/common';` : ''}

    ${json.types ? json.types.join('\n') : ''}
    ${!json.defaultProps ? '' : `const defaultProps = ${json5.stringify(json.defaultProps)}\n`}
    ${renderPreComponent({
      component: json,
      target: 'angular',
      excludeMitosisComponents: !options.standalone && !options.preserveImports,
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
              ? ` = ${stripStateAndPropsRefs(argument, {
                  replaceWith: 'this.',
                  contextVars,
                  outputVars,
                  domRefs: Array.from(domRefs),
                  stateVars,
                })}`
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
              ${stripStateAndPropsRefs(json.hooks.onInit?.code, {
                replaceWith: 'this.',
                contextVars,
                outputVars,
              })}
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
                ${stripStateAndPropsRefs(json.hooks.onMount?.code, {
                  replaceWith: 'this.',
                  contextVars,
                  outputVars,
                  domRefs: Array.from(domRefs),
                  stateVars,
                })}
                `
              }
            }`
      }

      ${
        !json.hooks.onUpdate?.length
          ? ''
          : `ngAfterContentChecked() {
              ${json.hooks.onUpdate.reduce((code, hook) => {
                code += stripStateAndPropsRefs(hook.code, {
                  replaceWith: 'this.',
                  contextVars,
                  outputVars,
                  domRefs: Array.from(domRefs),
                  stateVars,
                });
                return code + '\n';
              }, '')}
            }`
      }

      ${
        !json.hooks.onUnMount
          ? ''
          : `ngOnDestroy() {
              ${stripStateAndPropsRefs(json.hooks.onUnMount.code, {
                replaceWith: 'this.',
                contextVars,
                outputVars,
                domRefs: Array.from(domRefs),
                stateVars,
              })}
            }`
      }

    }
  `;

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
