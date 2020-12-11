import * as CSS from 'csstype';
import json5 from 'json5';
import { size } from 'lodash';
import { JSXLiteNode } from '../types/jsx-lite-node';
import { JSXLiteStyles } from '../types/jsx-lite-styles';

export const getStyles = (json: JSXLiteNode) => {
  if (!json.bindings.css) {
    return null;
  }
  let css: JSXLiteStyles;
  try {
    css = json5.parse(json.bindings.css as string);
  } catch (err) {
    console.warn('Could not json 5 parse css', err, json.bindings.css);
    return null;
  }
  return css;
};

export const setStyles = (json: JSXLiteNode, styles: JSXLiteStyles | null) => {
  if (!size(styles)) {
    delete json.bindings.css;
  } else {
    json.bindings.css = json5.stringify(styles);
  }
};
