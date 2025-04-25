import { createSingleBinding } from '../../helpers/bindings';
import { MitosisNode } from '../../types/mitosis-node';

/**
 * Parses an Alpine.js directive into a Mitosis binding
 */
export function parseDirective(directive: string, value: string): MitosisNode['bindings'] {
  const bindings: MitosisNode['bindings'] = {};

  switch (directive) {
    case 'x-text':
      bindings._text = createSingleBinding({ code: value });
      break;
    case 'x-data':
      // x-data will be handled separately as it defines the component's state
      break;
    default:
      // For other directives, create a binding with the directive name as the key
      bindings[directive] = createSingleBinding({ code: value });
  }

  return bindings;
}

/**
 * Parses an Alpine.js data object into a Mitosis state object
 */
export function parseDataObject(dataString: string): Record<string, any> {
  try {
    // Remove the outer curly braces and parse the JSON
    const jsonString = dataString.trim().replace(/^{|}$/g, '');
    return JSON.parse(`{${jsonString}}`);
  } catch (e) {
    // If parsing fails, return an empty object
    return {};
  }
} 