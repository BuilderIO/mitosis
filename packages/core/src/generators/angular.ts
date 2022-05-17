import dedent from 'dedent';
import { format } from 'prettier/standalone';
import { collectCss } from '../helpers/collect-styles';
import { fastClone } from '../helpers/fast-clone';
import { getRefs } from '../helpers/get-refs';
import { getStateObjectStringFromComponent } from '../helpers/get-state-object-string';
import { mapRefs } from '../helpers/map-refs';
import { renderPreComponent } from '../helpers/render-imports';
import { stripStateAndPropsRefs } from '../helpers/strip-state-and-props-refs';
import { selfClosingTags } from '../parsers/jsx';
import { MitosisNode } from '../types/mitosis-node';
import {
  runPostCodePlugins,
  runPostJsonPlugins,
  runPreCodePlugins,
  runPreJsonPlugins,
} from '../modules/plugins';
import isChildren from '../helpers/is-children';
import { getProps } from '../helpers/get-props';
import { kebabCase } from 'lodash';
import { stripMetaProperties } from '../helpers/strip-meta-properties';
import { removeSurroundingBlock } from '../helpers/remove-surrounding-block';
import { BaseTranspilerOptions, Transpiler } from '../types/config';
import { indent } from '../helpers/indent';

export interface ToAngularOptions extends BaseTranspilerOptions {}

interface AngularBlockOptions {
  contextVars?: string[];
  outputVars?: string[];
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
          const selector = kebabCase(
            json.bindings.name?.replace('props.slot', ''),
          );
          return `select="[${selector}]"`;
        }

        return `${json.bindings[binding]}`;
      })
      .join('\n')}></ng-content>`;
  },
};

export const blockToAngular = (
  json: MitosisNode,
  options: ToAngularOptions = {},
  blockOptions: AngularBlockOptions = {},
): string => {
  const contextVars = blockOptions?.contextVars || [];
  const outputVars = blockOptions?.outputVars || [];
  if (mappers[json.name]) {
    return mappers[json.name](json, options, blockOptions);
  }

  if (isChildren(json)) {
    return `<ng-content></ng-content>`;
  }

  if (json.properties._text) {
    return json.properties._text;
  }
  if (/props\.slot/.test(json.bindings._text as string)) {
    const selector = kebabCase(json.bindings._text?.replace('props.slot', ''));
    return `<ng-content select="[${selector}]"></ng-content>`;
  }

  if (json.bindings._text) {
    return `{{${stripStateAndPropsRefs(json.bindings._text as string, {
      contextVars,
      outputVars,
    })}}}`;
  }

  let str = '';

  const needsToRenderSlots = [];

  if (json.name === 'For') {
    str += `<ng-container *ngFor="let ${
      json.properties._forName
    } of ${stripStateAndPropsRefs(json.bindings.each as string, {
      contextVars,
      outputVars,
    })}">`;
    str += json.children
      .map((item) => blockToAngular(item, options, blockOptions))
      .join('\n');
    str += `</ng-container>`;
  } else if (json.name === 'Show') {
    str += `<ng-container *ngIf="${stripStateAndPropsRefs(
      json.bindings.when as string,
      { contextVars, outputVars },
    )}">`;
    str += json.children
      .map((item) => blockToAngular(item, options, blockOptions))
      .join('\n');
    str += `</ng-container>`;
  } else {
    str += `<${json.name} `;

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
      if (key === 'className') {
        str += ` class="${value}" `;
      } else {
        str += ` ${key}="${value}" `;
      }
    }
    for (const key in json.bindings) {
      if (key === '_spread') {
        continue;
      }
      if (key.startsWith('$')) {
        continue;
      }
      const value = json.bindings[key] as string;
      // TODO: proper babel transform to replace. Util for this
      const useValue = stripStateAndPropsRefs(value, {
        contextVars,
        outputVars,
      });

      if (key.startsWith('on')) {
        let event = key.replace('on', '').toLowerCase();
        if (
          event === 'change' &&
          json.name === 'input' /* todo: other tags */
        ) {
          event = 'input';
        }
        // TODO: proper babel transform to replace. Util for this
        const finalValue = removeSurroundingBlock(
          useValue.replace(/event\./g, '$event.'),
        );
        str += ` (${event})="${finalValue}" `;
      } else if (key === 'className') {
        str += ` [class]="${useValue}" `;
      } else if (key === 'ref') {
        str += ` #${useValue} `;
      } else if (key.startsWith('slot')) {
        const lowercaseKey =
          key.replace('slot', '')[0].toLowerCase() +
          key.replace('slot', '').substring(1);
        needsToRenderSlots.push(
          `${useValue.replace(/(\/\>)|\>/, ` ${lowercaseKey}>`)}`,
        );
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
      str += json.children
        .map((item) => blockToAngular(item, options, blockOptions))
        .join('\n');
    }

    str += `</${json.name}>`;
  }
  return str;
};

export const componentToAngular =
  (options: ToAngularOptions = {}): Transpiler =>
  ({ component }) => {
    // Make a copy we can safely mutate, similar to babel's toolchain
    let json = fastClone(component);
    if (options.plugins) {
      json = runPreJsonPlugins(json, options.plugins);
    }
    const outputVars: string[] =
      (json.meta?.useMetadata?.outputs as string[]) || [];
    const outputs = outputVars.map((variableName) => {
      if (options?.experimental?.outputs) {
        return options?.experimental?.outputs(json, variableName);
      }
      return `@Output() ${variableName} = new EventEmitter<any>()`;
    });
    const contextVars = Object.keys(json?.context?.get || {});
    const hasInjectable = Boolean(contextVars.length);
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

    const props = getProps(component);
    // remove props for outputs
    outputVars.forEach((variableName) => {
      props.delete(variableName);
    });
    const hasOnInit = Boolean(
      component.hooks?.onInit || component.hooks?.onMount,
    );

    const refs = Array.from(getRefs(json));
    mapRefs(json, (refName) => `this.${refName}.nativeElement`);

    if (options.plugins) {
      json = runPostJsonPlugins(json, options.plugins);
    }
    let css = collectCss(json);
    if (options.prettier !== false) {
      css = tryFormat(css, 'css');
    }

    let template = json.children
      .map((item) => blockToAngular(item, options, { contextVars, outputVars }))
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
        }),
    });

    let str = dedent`
    import { ${outputs.length ? 'Output, EventEmitter, \n' : ''} ${
      options?.experimental?.inject ? 'Inject, forwardRef,' : ''
    } Component ${refs.length ? ', ViewChild, ElementRef' : ''}${
      props.size ? ', Input' : ''
    } } from '@angular/core';
    ${renderPreComponent(json)}

    @Component({
      selector: '${kebabCase(json.name || 'my-component')}',
      template: \`
        ${indent(template, 8).replace(/`/g, '\\`').replace(/\$\{/g, '\\${')}
      \`,
      ${
        css.length
          ? `styles: [
        \`${indent(css, 8)}\`
      ],`
          : ''
      }
    })
    export default class ${component.name} {
      ${outputs.join('\n')}

      ${Array.from(props)
        .filter((item) => !item.startsWith('slot'))
        .map((item) => `@Input() ${item}: any`)
        .join('\n')}

      ${refs
        .map((refName) => `@ViewChild('${refName}') ${refName}: ElementRef`)
        .join('\n')}

      ${dataString}

      ${!hasInjectable ? '' : `constructor(\n${injectables.join(',\n')}) {}`}

      ${
        !hasOnInit
          ? ''
          : `ngOnInit() {
              ${
                !component.hooks?.onInit
                  ? ''
                  : `
                ${stripStateAndPropsRefs(component.hooks.onInit?.code, {
                  replaceWith: 'this.',
                  contextVars,
                  outputVars,
                })}
                `
              }
              ${
                !component.hooks?.onMount
                  ? ''
                  : `
                ${stripStateAndPropsRefs(component.hooks.onMount?.code, {
                  replaceWith: 'this.',
                  contextVars,
                  outputVars,
                })}
                `
              }
            }`
      }

      ${
        !component.hooks.onUpdate?.length
          ? ''
          : `ngAfterContentChecked() {
              ${component.hooks.onUpdate.reduce((code, hook) => {
                code += stripStateAndPropsRefs(hook.code, {
                  replaceWith: 'this.',
                  contextVars,
                  outputVars,
                });
                return code + '\n';
              }, '')}
            }`
      }

      ${
        !component.hooks.onUnMount
          ? ''
          : `ngOnDestroy() {
              ${stripStateAndPropsRefs(component.hooks.onUnMount.code, {
                replaceWith: 'this.',
                contextVars,
                outputVars,
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
