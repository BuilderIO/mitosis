import * as babel from '@babel/core';
import generate from '@babel/generator';
import * as parser from '@babel/parser';
import * as types from '@babel/types';

import { pickBy, some } from 'lodash';

import type { SveltosisComponent } from '../types';

export function isTypeScriptComponent(string_: string) {
  const regex = createTagRegex('script', 'gi');
  let isTypeScript = false;
  // match all
  string_.replace(regex, (...match) => {
    const { lang } = parseAttributes((match?.length && match[1]) || '');
    if (lang === 'ts') isTypeScript = true;
    return '';
  });
  return isTypeScript;
}

/** Create a tag matching regexp. */
export function createTagRegex(tagName: string, flags?: string): RegExp {
  return new RegExp(`/<!--[^]*?-->|<${tagName}(\\s[^]*?)?(?:>([^]*?)<\\/${tagName}>|\\/>)`, flags);
}

/** Transform an attribute string into a key-value object */
export function parseAttributes(attributesString: string): Record<string, any> {
  return attributesString
    .split(/\s+/)
    .filter(Boolean)
    .reduce((accumulator: Record<string, string | boolean>, attribute) => {
      const [name, value] = attribute.split('=');

      // istanbul ignore next
      accumulator[name] = value ? value.replace(/["']/g, '') : true;

      return accumulator;
    }, {});
}

function getScriptContent(markup: string, module: boolean): string {
  const regex = createTagRegex('script', 'gi');
  let match: RegExpMatchArray | null;

  while ((match = regex.exec(markup)) !== null) {
    const { context } = parseAttributes(match[1] || '');

    if ((context !== 'module' && !module) || (context === 'module' && module)) {
      return match[2];
    }
  }

  return '';
}

export function collectTypes(string_: string, json: SveltosisComponent) {
  const module = getScriptContent(string_, true); // module
  const instance = getScriptContent(string_, false); // instance

  function traverse(script_: string) {
    const ast = parser.parse(script_, {
      sourceType: 'module',
      plugins: ['typescript'],
    });

    babel.traverse(ast, {
      enter(path) {
        // alias or interface (e.g. type Props = { } or interface Props {} )
        if (
          types.isTSTypeAliasDeclaration(path.node) ||
          types.isTSInterfaceDeclaration(path.node)
        ) {
          json.types = [...(json.types ?? []), generate(path.node).code];
          path.skip();
        } else if (types.isTSTypeAnnotation(path.node)) {
          // add to actual ref
          const reference = generate(path.parent).code;
          const type = generate(path.node.typeAnnotation).code;

          // add to ref
          if (Object.prototype.hasOwnProperty.call(json.refs, reference)) {
            json.refs[reference].typeParameter = type;
          }

          // temp add to prop object.
          // after having finished traversing, we'll create the prop type declaration
          if (Object.prototype.hasOwnProperty.call(json.props, reference)) {
            json.props[reference].type = type;
          }
        }
      },
    });
  }

  traverse(module);

  traverse(instance);

  // add prop type declaration to json.types and set the propsTypeRef
  if (some(json.props, (property) => !!property.type)) {
    let propertyTypeDeclaration = `type Props = {`;

    propertyTypeDeclaration += Object.keys(pickBy(json.props, (property: any) => !!property.type))
      .map((key) => {
        return `${key}: ${json.props[key].type};`;
      })
      .join('\n');

    propertyTypeDeclaration += '}';

    json.types = [...(json.types ?? []), propertyTypeDeclaration];
    json.propsTypeRef = 'Props';
  }
}
