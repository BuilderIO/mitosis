import { getStyles, setStyles } from '../helpers/get-styles';
import { JSXLiteComponent } from '../types/mitosis-component';
import { TraverseContext } from 'traverse';
import { JSXLiteStyles } from '../types/mitosis-styles';
import { tarverseNodes } from '../helpers/traverse-nodes';

type MapStylesOptions = {
  map: (styles: JSXLiteStyles, context: TraverseContext) => JSXLiteStyles;
};

export const mapStyles = (pluginOptions: MapStylesOptions) => (
  options: any,
) => ({
  json: {
    pre: (json: JSXLiteComponent) => {
      tarverseNodes(json, (node, context) => {
        const styles = getStyles(node);
        setStyles(node, pluginOptions.map(styles || {}, context));
      });
    },
  },
});
