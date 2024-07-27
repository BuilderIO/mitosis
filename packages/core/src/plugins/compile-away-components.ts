import { mapValues } from 'lodash';
import traverse, { TraverseContext } from 'neotraverse/legacy';
import { isMitosisNode } from '../helpers/is-mitosis-node';
import { MitosisComponent } from '../types/mitosis-component';
import { MitosisNode } from '../types/mitosis-node';

export const getRenderOptions = (node: MitosisNode) => {
  return {
    ...mapValues(node.properties, (value) => `"${value}"`),
    ...mapValues(node.bindings, (value) => `{${value}}`),
  };
};

type CompileAwayComponentsOptions = {
  components: {
    [key: string]: (node: MitosisNode, context: TraverseContext) => MitosisNode | void;
  };
};

/**
 * @example
 *    componentToReact(mitosisJson, {
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
export const compileAwayComponents =
  (pluginOptions: CompileAwayComponentsOptions) => (options?: any) => ({
    json: {
      pre: (json: MitosisComponent) => {
        traverse(json).forEach(function (item) {
          if (isMitosisNode(item)) {
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
