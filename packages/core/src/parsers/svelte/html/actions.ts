import { generate } from 'astring';
import { uniqueName } from '../helpers/string';

import type { Element } from 'svelte/types/compiler/interfaces';
import type { SveltosisComponent } from '../types';

export function parseAction(
  json: SveltosisComponent,
  nodeReference: string,
  attribute: Element['attributes'][number],
) {
  const methodName = attribute.name;
  let parameters = '';

  if (['Identifier', 'ObjectExpression'].includes(attribute.expression?.type)) {
    parameters = generate(attribute.expression);
  }

  const actionHandler = uniqueName(Object.keys(json.state), 'actionHandler');

  json.state[actionHandler] = {
    code: 'null',
    type: 'property',
    propertyType: 'normal',
  };

  const initHandler = `if (${nodeReference}) { ${actionHandler} = ${methodName}(${nodeReference}, ${parameters}); };\n`;

  json.hooks.onMount.push({
    code: initHandler,
  });

  // Handle Destroy / Re-Mount
  const onReferenceUpdate = `
    if (!${nodeReference} && ${actionHandler}) { 
      ${actionHandler}?.destroy(); 
      ${actionHandler} = null; 
    } else if (${nodeReference} && !${actionHandler}) { 
      ${initHandler} 
    };\n
  `;

  json.hooks.onUpdate = json.hooks.onUpdate || [];

  json.hooks.onUpdate.push({
    code: onReferenceUpdate,
    deps: `[${nodeReference}]`,
  });

  // Handle Update
  if (parameters) {
    const onUpdate = `${actionHandler}?.update(${parameters})\n`;

    json.hooks.onUpdate.push({
      code: onUpdate,
      deps: `[${parameters}]`,
    });
  }
}
