import { mapValues } from 'lodash';
import traverse, { TraverseContext } from 'traverse';
import { isJsxLiteNode } from '../helpers/is-mitosis-node';
import { JSXLiteComponent } from '../types/mitosis-component';
import { JSXLiteNode } from '../types/mitosis-node';

export const getRenderOptions = (node: JSXLiteNode) => {
  return {
    ...mapValues(node.properties, (value) => `"${value}"`),
    ...mapValues(node.bindings, (value) => `{${value}}`),
  };
};

type CompileAwayComponentsOptions = {
  components: {
    [key: string]: (
      node: JSXLiteNode,
      context: TraverseContext,
    ) => JSXLiteNode | void;
  };
};

/**
 * @example
 *    componentToReact(jsxLiteJson, {
 *      plugins: [
 *        compileAwayComponents({
 *          Image: (node) => {
 *             return jsx(`
 *               <div>
 *                 <img src="${node.properties.image}" />
 *               </div>
 *             `);
 *          }
 *        })
 *      ]
 *    })
 */
export const compileAwayComponents = (
  pluginOptions: CompileAwayComponentsOptions,
) => (options?: any) => ({
  json: {
    pre: (json: JSXLiteComponent) => {
      traverse(json).forEach(function(item) {
        if (isJsxLiteNode(item)) {
          const mapper = pluginOptions.components[item.name];
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
