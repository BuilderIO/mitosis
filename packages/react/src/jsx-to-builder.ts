import * as ts from 'typescript';
import { BuilderElement } from '@builder.io/sdk';
import * as json5 from 'json5';

interface Options {
  reactMode?: boolean;
}

type Json = string | boolean | null | JsonObject | JsonArray;

type JsonArray = Json[];

type JsonObject = { [key: string]: Json | undefined };

const isNode = (thing: unknown): thing is ts.Node => {
  return thing && typeof (thing as ts.Node).getLeadingTriviaWidth === 'function';
};

const printer = ts.createPrinter({ newLine: ts.NewLineKind.LineFeed });

// HACK
let sharedFile: ts.SourceFile | null = null;

const jsonToAst = (json: Json | undefined | ts.Node): ts.Node => {
  if (isNode(json)) {
    return json;
  }
  switch (typeof json) {
    case 'undefined':
      return ts.createIdentifier('undefined');
    case 'string':
    case 'number':
    case 'boolean':
      return ts.createLiteral(json);
    case 'object':
      if (!json) {
        return ts.createNull();
      }
      if (Array.isArray(json)) {
        return arrayToAst(json);
      }
      return jsonObjectToAst(json);
  }
};

const arrayToAst = (array: JsonArray) => {
  return ts.createArrayLiteral(array.map(item => jsonToAst(item)) as ts.Expression[]);
};

const jsonObjectToAst = (json: JsonObject): ts.ObjectLiteralExpression => {
  if (!json) {
    return json;
  }
  const properties: ts.PropertyAssignment[] = [];
  for (const key in json) {
    const value = json[key];
    if (value === undefined) {
      continue;
    }
    const keyCanBeIdentifier = /^[a-z][a-z0-9]?^/i.test(key);
    const keyAst = keyCanBeIdentifier ? ts.createIdentifier(key) : ts.createStringLiteral(key);
    const valueAst = jsonToAst(value);
    properties.push(ts.createPropertyAssignment(keyAst, valueAst as any));
  }
  const newNode = ts.createObjectLiteral(properties);

  return newNode;
};

const isUppercaseChar = (char: string) => Boolean(char && char.toUpperCase() === char);
const lowerCaseFirstChar = (str: string) => str && str[0].toLowerCase() + str.slice(1);

const jsxTextToObject = (node: ts.JsxText): BuilderElement | null => {
  const { text } = node;
  if (!text.trim()) {
    return null;
  }

  return {
    '@type': '@builder.io/sdk:Element',
    component: {
      name: 'Builder:RawText',
      options: { text: text.replace(/\s+/g, ' ').trim() },
    },
  };
};

const jsxElementToObject = (
  node: ts.JsxElement | ts.JsxSelfClosingElement
): BuilderElement | null => {
  if (ts.isJsxText(node)) {
    return jsxTextToObject(node);
  }

  const openingElement = ts.isJsxSelfClosingElement(node) ? node : node.openingElement;

  const obj: BuilderElement & { code: any } = {
    '@type': '@builder.io/sdk:Element',
    tagName: openingElement.tagName.getText(),
    // TODO: bindings and actions
    properties: {},
    responsiveStyles: {},
    code: {
      actions: {},
      bindings: {},
    },
  };

  for (const attribute of openingElement.attributes.properties) {
    const name = attribute.name!.getText();
    if (ts.isJsxAttribute(attribute)) {
      switch (name) {
        case 'css': {
          obj.responsiveStyles!.large = (attribute.initializer as any).expression;
          break;
        }
        case 'uid': {
          obj.id = 'builder-' + (attribute.initializer as any).text;
          break;
        }
        default: {
          if (name.startsWith('on')) {
            const actionName = lowerCaseFirstChar(name.slice(2));
            obj.code.actions[actionName] = printer
              .printNode(
                ts.EmitHint.Unspecified,
                (attribute.initializer as any).expression.body,
                sharedFile!
              )
              .replace(/^{|}$/g, '');
          } else {
            obj.properties![name] =
              // If no initializer it's a boolean attribute for `true`, a,a
              // <input checked /> is synonymous with checked={true}
              !attribute.initializer
                ? true
                : // Initializer is an expression if things like `foo={bar}`
                  (attribute.initializer as any).expression ??
                  // Initializer is text for tjhings like `foo="bar"`
                  (attribute.initializer as any).text;
          }
        }
      }
    }

    let childIsComponent = false;
    const children = ts.isJsxElement(node) ? node.children : null;

    if (children?.length === 1) {
      const child = children[0];

      const componentName = ts.isJsxElement(child) && child.openingElement.tagName.getText();
      childIsComponent = Boolean(
        ts.isJsxElement(child) && componentName && isUppercaseChar(componentName[0])
      );

      if (childIsComponent) {
        obj.component = {
          name: componentName as string,
          options: {},
        };
        if (ts.isJsxElement(child)) {
          for (const attribute of child.openingElement.attributes.properties) {
            if (ts.isJsxAttribute(attribute)) {
              const name = attribute.name!.getText();
              obj.component.options[name] = (attribute.initializer as any).expression;
            }
          }
        }
      }
    }

    if (!childIsComponent) {
      obj.children = children
        ?.map(child => jsxElementToObject(child as ts.JsxElement))
        .filter(Boolean) as BuilderElement[];
    }

    // Map props by schema
  }

  return obj;
};

export const transform = (options: Options = {}) => (context: ts.TransformationContext) => {
  const previousOnSubstituteNode = context.onSubstituteNode;

  context.enableSubstitution(ts.SyntaxKind.JsxElement);
  context.enableSubstitution(ts.SyntaxKind.JsxSelfClosingElement);
  context.enableSubstitution(ts.SyntaxKind.JsxFragment);
  context.enableSubstitution(ts.SyntaxKind.FunctionDeclaration);

  context.onSubstituteNode = (hint, sourceNode) => {
    let node = sourceNode;
    node = previousOnSubstituteNode(hint, node);

    if (ts.isFunctionDeclaration(node)) {
      // Handle this
    } else if (ts.isJsxElement(node)) {
      const obj = jsxElementToObject(node as ts.JsxElement) as unknown;
      node = jsonObjectToAst(obj as JsonObject);
    } else if (ts.isJsxSelfClosingElement(node)) {
      const obj = jsxElementToObject(node as ts.JsxSelfClosingElement) as unknown;
      node = jsonObjectToAst(obj as JsonObject);
    } else if (ts.isJsxFragment(node)) {
      node = ts.createArrayLiteral(
        node.children
          .map(item =>
            jsonObjectToAst((jsxElementToObject(item as ts.JsxElement) as unknown) as JsonObject)
          )
          .filter(Boolean)
      );
    }

    return node;
  };

  return (file: ts.SourceFile) => {
    sharedFile = file;

    return file;
  };
};

export function tsxToBuilder(tsString: string, options: Options = {}) {
  const str = ts
    .transpileModule(tsString, {
      compilerOptions: {
        jsx: ts.JsxEmit.Preserve,
      },
      transformers: {
        before: [transform(options)],
      },
    })
    .outputText.trim()
    .replace(/;$/, '');

  // Yoink the JSON
  const jsonStr = str.match(/\[[\s\S]+\]/)?.[0] || '';

  if (!jsonStr) {
    return [];
  }

  // Use Json 5 to allow any form of JSON object in JS to be parsed,
  // e.g. keys as identifier ({ foo: 'bar' }) instead of double quoted strings
  // { "foo": "bar" }
  const arr = json5.parse(jsonStr);

  const index = tsString.indexOf('<>');
  const beforeCode = tsString.slice(0, index);
  const afterCode = tsString.slice(tsString.lastIndexOf('</>') + 3);
  const createInlineCode = (code: string) => ({
    '@type': '@builder.io/sdk:Element',
    component: {
      name: 'Builder:Snippet',
      options: { code },
    },
  });

  return [
    beforeCode.trim() && createInlineCode(beforeCode),
    ...arr,
    afterCode.trim() && createInlineCode(afterCode),
  ].filter(Boolean);
}
