import { Plugin } from '../../types/plugins';
import { traverseNodes } from '../traverse-nodes';
import {mapCamelCasedHtmlAttributes} from '../map-camel-cased-html-attributes'
export const CAMEL_CASE_PLUGIN: Plugin = () => ({
  json: {
    post: (json) => {
      traverseNodes(json, (node) => {
        mapCamelCasedHtmlAttributes(node);
      });
    },
  },
})