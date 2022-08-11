import * as babel from '@babel/core';
import { JSONOrNode, JSONOrNodeObject } from '../../types/json';

const { types } = babel;

const arrayToAst = (array: JSONOrNode[]) => types.arrayExpression(array.map(jsonToAst));

export const jsonToAst = (json: JSONOrNode): babel.types.Expression => {
  if (types.isNode(json)) {
    if (types.isJSXText(json)) {
      return types.stringLiteral(json.value);
    }
    return json as babel.types.Expression;
  }
  switch (typeof json) {
    case 'undefined':
      return types.identifier('undefined');
    case 'string':
      return types.stringLiteral(json);
    case 'number':
      return types.numericLiteral(json);
    case 'boolean':
      return types.booleanLiteral(json);
    case 'object':
      if (!json) {
        return types.nullLiteral();
      }
      if (Array.isArray(json)) {
        return arrayToAst(json);
      }
      return jsonObjectToAst(json);
  }
};

const jsonObjectToAst = (json: JSONOrNodeObject): babel.types.Expression => {
  if (!json) {
    // TO-DO: This looks concerning...
    return json as any;
  }
  const properties: babel.types.ObjectProperty[] = [];
  for (const key in json) {
    const value = json[key];
    if (value === undefined) {
      continue;
    }
    const keyAst = types.stringLiteral(key);
    const valueAst = jsonToAst(value);
    properties.push(types.objectProperty(keyAst, valueAst as any));
  }
  const newNode = types.objectExpression(properties);

  return newNode;
};
