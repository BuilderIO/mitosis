import {isFirstLetterLowerCase} from './is-first-letter-lower-case'
import { MitosisNode } from '../types/mitosis-node';
/*
 * This function does side-effects on `json`
 */
export const mapCamelCasedHtmlAttributes = (json: MitosisNode) => {
  const isBuiltInHtmlElement = isFirstLetterLowerCase(json.name) && !json.name.includes('-');

  if (!isBuiltInHtmlElement) {
    return;
  }
  for (let key in json.bindings) {
    const isBuiltInHtmlAttrName = !key.includes('-')
    if (isBuiltInHtmlAttrName) {
      const newKey = key.toLowerCase() as keyof MitosisNode['bindings']
      // if json[newKey] already exists: show a warning and don't override
      json.bindings[newKey] = json.bindings[key];
      delete json.bindings[key];
    }
  }  

  // repeat the above loop for json.properties too
  for (let key in json.properties) {
    const isBuiltInHtmlAttrName = !key.includes('-')
    if (isBuiltInHtmlAttrName) {
      const newKey = key.toLowerCase()
      // if json[newKey] already exists: show a warning and don't override
      
      json.properties[newKey] = json.properties[key];
      delete json.properties[key];
    }
  }  
}