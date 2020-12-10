import * as CSS from 'csstype';
import json5 from 'json5';
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
    console.warn('Could not json 5 parse css', err);
    return null;
  }
  return css;
};

export const setStyles = (json: JSXLiteNode, styles: JSXLiteStyles) => {
  json.bindings.css = json5.stringify(styles);
};
