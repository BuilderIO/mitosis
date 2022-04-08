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

const mappers: {
  [key: string]: (json: MitosisNode, options: ToAngularOptions) => string;
} = {
  Fragment: (json, options) => {
    return `<div>${json.children
      .map((item) => blockToAngular(item, options))
      .join('\n')}</div>`;
  },
};

export const blockToAngular = (
  json: MitosisNode,
  options: ToAngularOptions = {},
): string => {
  if (mappers[json.name]) {
    return mappers[json.name](json, options);
  }

  if (isChildren(json)) {
    return `<ng-content></ng-content>`;
  }

  if (json.properties._text) {
    return json.properties._text;
  }

  if (json.bindings._text) {
    return `{{${stripStateAndPropsRefs(json.bindings._text as string)}}}`;
  }

  let str = '';

  if (json.name === 'For') {
    str += `<ng-container *ngFor="let ${
      json.properties._forName
    } of ${stripStateAndPropsRefs(json.bindings.each as string)}">`;
    str += json.children
      .map((item) => blockToAngular(item, options))
      .join('\n');
    str += `</ng-container>`;
  } else if (json.name === 'Show') {
    str += `<ng-container *ngIf="${stripStateAndPropsRefs(
      json.bindings.when as string,
    )}">`;
    str += json.children
      .map((item) => blockToAngular(item, options))
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
      str += ` ${key}="${value}" `;
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
      const useValue = stripStateAndPropsRefs(value);

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
      } else if (key === 'ref') {
        str += ` #${useValue} `;
      } else {
        str += ` [${key}]="${useValue}" `;
      }
    }
    if (selfClosingTags.has(json.name)) {
      return str + ' />';
    }
    str += '>';
    if (json.children) {
      str += json.children
        .map((item) => blockToAngular(item, options))
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

    const props = getProps(component);

    const refs = Array.from(getRefs(json));
    mapRefs(json, (refName) => `this.${refName}.nativeElement`);

    if (options.plugins) {
      json = runPostJsonPlugins(json, options.plugins);
    }
    let css = collectCss(json);
    if (options.prettier !== false) {
      css = tryFormat(css, 'css');
    }

    let template = json.children.map((item) => blockToAngular(item)).join('\n');
    if (options.prettier !== false) {
      template = tryFormat(template, 'html');
    }

    stripMetaProperties(json);

    const dataString = getStateObjectStringFromComponent(json, {
      format: 'class',
      valueMapper: (code) =>
        stripStateAndPropsRefs(code, { replaceWith: 'this.' }),
    });

    let str = dedent`
    import { Component ${refs.length ? ', ViewChild, ElementRef' : ''}${
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
      ${Array.from(props)
        .map((item) => `@Input() ${item}: any`)
        .join('\n')}

      ${refs
        .map((refName) => `@ViewChild('${refName}') ${refName}: ElementRef`)
        .join('\n')}

      ${
        !component.hooks.onMount
          ? ''
          : `ngOnInit() {
              ${stripStateAndPropsRefs(component.hooks.onMount.code, {
                replaceWith: 'this.',
              })}
            }`
      }

      ${
        !component.hooks.onUpdate?.length
          ? ''
          : `ngAfterContentChecked() {
              ${component.hooks.onUpdate.map((hook) =>
                stripStateAndPropsRefs(hook.code, {
                  replaceWith: 'this.',
                }),
              )}
            }`
      }

      ${
        !component.hooks.onUnMount
          ? ''
          : `ngOnDestroy() {
              ${stripStateAndPropsRefs(component.hooks.onUnMount.code, {
                replaceWith: 'this.',
              })}
            }`
      }

      ${dataString}
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
