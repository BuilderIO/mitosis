import { TraverseContext } from 'neotraverse';
import { getStyles, setStyles } from '../helpers/get-styles';
import { traverseNodes } from '../helpers/traverse-nodes';
import { MitosisComponent } from '../types/mitosis-component';
import { MitosisStyles } from '../types/mitosis-styles';

type MapStylesOptions = {
  map: (styles: MitosisStyles, context: TraverseContext) => MitosisStyles;
};

export const mapStyles = (pluginOptions: MapStylesOptions) => (options: any) => ({
  json: {
    pre: (json: MitosisComponent) => {
      traverseNodes(json, (node, context) => {
        const styles = getStyles(node);
        setStyles(node, pluginOptions.map(styles || {}, context));
      });
    },
  },
});
