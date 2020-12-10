import traverse, { TraverseContext } from 'traverse';
import { JSXLiteComponent } from '../types/jsx-lite-component';
import { isJsxLiteNode } from '../helpers/is-jsx-lite-node';
import { JSXLiteNode } from '../types/jsx-lite-node';
import { createJSXLiteNode } from '../helpers/create-jsx-lite-node';
import { parseJsx } from '../parsers/jsx';
import { mapValues } from 'lodash';

const jsx = (str: string) => {
  return parseJsx(`
    export default function MyCompoennt() {
      return (${str})
    }
  `).children[0];
};

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
    return jsx(`
      <div>
        <img src=${options.image} />
      </div>
    `);
  },
};

type CompileAwayBuilderComponentsOptions = {
  only?: string[];
};

export const compileAwayBuilderComponents = (
  pluginOptions: CompileAwayBuilderComponentsOptions = {},
) => (options?: any) => ({
  json: {
    pre: (json: JSXLiteComponent) => {
      traverse(json).forEach(function (item) {
        if (isJsxLiteNode(item)) {
          if (pluginOptions.only && !pluginOptions.only.includes(item.name)) {
            return;
          }
          const mapper = components[item.name];
          if (mapper) {
            const result = mapper(item, this);
            if (result) {
              this.update(result);
            }
          }
        }
      });
    },
  },
});
