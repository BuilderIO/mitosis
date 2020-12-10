import { mapValues, omit, pick } from 'lodash';
import { parseNode } from 'src/helpers/parse-node';
import { TraverseContext } from 'traverse';
import { createJSXLiteNode } from '../helpers/create-jsx-lite-node';
import { JSXLiteNode } from '../types/jsx-lite-node';
import { compileAwayComponents } from './compile-away-components';

const getRenderOptions = (node: JSXLiteNode) => {
  return {
    ...mapValues(node.properties, (value) => `"${value}"`),
    ...mapValues(node.bindings, (value) => `{${value}}`),
  };
};

const components: {
  [key: string]: (
    node: JSXLiteNode,
    context: TraverseContext,
  ) => JSXLiteNode | void;
} = {
  Columns(node: JSXLiteNode, context) {
    return createJSXLiteNode({});
  },
  Image(node: JSXLiteNode, context) {
    const options = getRenderOptions(node);
    return parseNode(`
      <div>
        <img src=${options.image} />
      </div>
    `);
  },
};

type CompileAwayBuilderComponentsOptions = {
  only?: string[];
  omit?: string[];
};

export const compileAwayBuilderComponents = (
  pluginOptions: CompileAwayBuilderComponentsOptions = {},
) => (options?: any) => {
  let obj = components;
  if (pluginOptions.omit) {
    obj = omit(obj, pluginOptions.omit);
  }
  if (pluginOptions.only) {
    obj = pick(obj, pluginOptions.only);
  }
  return compileAwayComponents({ components: obj });
};
