import { getStyles, setStyles } from '../helpers/get-styles';
import { MitosisComponent } from '../types/mitosis-component';
import { TraverseContext } from 'traverse';
import { MitosisStyles } from '../types/mitosis-styles';
import { tarverseNodes } from '../helpers/traverse-nodes';

type MapStylesOptions = {
  map: (styles: MitosisStyles, context: TraverseContext) => MitosisStyles;
};

export const mapStyles =
  (pluginOptions: MapStylesOptions) => (options: any) => ({
    json: {
      pre: (json: MitosisComponent) => {
        tarverseNodes(json, (node, context) => {
          const styles = getStyles(node);
          setStyles(node, pluginOptions.map(styles || {}, context));
        });
      },
    },
  });
