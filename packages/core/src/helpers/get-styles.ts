import * as CSS from 'csstype';
import json5 from 'json5';
import { size } from 'lodash';
import { MitosisNode } from '../types/mitosis-node';
import { MitosisStyles } from '../types/mitosis-styles';

export const getStyles = (json: MitosisNode) => {
  if (!json.bindings.css) {
    return null;
  }
  let css: MitosisStyles;
  try {
    css = json5.parse(json.bindings.css?.code as string);
  } catch (err) {
    console.warn('Could not json 5 parse css', err, json.bindings.css.code);
    return null;
  }
  return css;
};

export const setStyles = (json: MitosisNode, styles: MitosisStyles | null) => {
  if (!size(styles)) {
    delete json.bindings.css;
  } else {
    json.bindings.css = { code: json5.stringify(styles) };
  }
};
