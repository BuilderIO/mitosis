import {isFirstLetterLowerCase} from './is-first-letter-lower-case'
import { MitosisNode } from '../types/mitosis-node';
import fs from 'fs'
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

    if (!isBuiltInHtmlAttrName) continue

    const newKey = key.toLowerCase() as keyof MitosisNode['bindings']

    if(newKey in json.bindings) {
      continue
    }
    json.bindings[newKey] = json.bindings[key];
    delete json.bindings[key];

  }  

  for (let key in json.properties) {
    const isBuiltInHtmlAttrName = !key.includes('-')

    if (!isBuiltInHtmlAttrName) continue

    const newKey = key.toLowerCase()

    if(newKey in json.properties) {
      continue
    }

    json.properties[newKey] = json.properties[key];
    delete json.properties[key];

  }  
}