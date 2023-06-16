import { createSingleBinding } from '../../../helpers/bindings';
import type { MitosisNode } from '../../../types/mitosis-node';
import type { SveltosisComponent } from '../types';

function replaceGroupWithChecked(node: MitosisNode, isArray = false) {
  if (node.bindings.group?.code?.length) {
    const bindingValue = node.bindings.value?.code;
    const propertyValue = node.properties.value;
    const groupBinding = node.bindings.group.code;

    let code = '';

    if (isArray) {
      code = bindingValue
        ? `${groupBinding}.includes(${bindingValue})`
        : `${groupBinding}.includes('${propertyValue}')`;
    } else {
      code = bindingValue
        ? `${groupBinding} === ${bindingValue}`
        : `${groupBinding} === '${propertyValue}'`;
    }

    node.bindings['checked'] = createSingleBinding({
      code,
    });
    delete node.bindings.group;
  }
}

/* post-processes bindings
  bind:group https://svelte.dev/docs#template-syntax-element-directives-bind-group
  bind:property https://svelte.dev/docs#template-syntax-component-directives-bind-this
  bind:this https://svelte.dev/docs#template-syntax-component-directives-bind-this

  - replaces group binding with checked for checkboxes and radios (supported inputs for bind:group)
  - adds onChange for bind:group and bind:property (event.target.value OR event.target.checked)
*/
export function processBindings(json: SveltosisComponent, node: MitosisNode) {
  let name;
  let target = 'event.target.value';
  let binding = '';
  let isArray = false;

  if (Object.prototype.hasOwnProperty.call(node.bindings, 'group')) {
    name = 'group';
    binding = node.bindings.group?.code ?? '';

    if (binding.startsWith('state.')) {
      const stateObject = json.state[binding.replace(/^state\./, '')];
      isArray = Array.isArray(stateObject?.code);
    }

    replaceGroupWithChecked(node, isArray);

    if (node.properties.type === 'checkbox' && !node.properties.value) {
      target = 'event.target.checked';
    }
  } else if (Object.prototype.hasOwnProperty.call(node.bindings, 'this')) {
    name = 'ref';
    binding = node.bindings.this?.code ?? '';
  } else if (
    Object.prototype.hasOwnProperty.call(node.bindings, 'onChange') &&
    node.properties.type === 'checkbox'
  ) {
    target = 'event.target.checked';
    binding = node.bindings.onChange?.code.split('=')[0] ?? '';
  }

  let onChangeCode = `${binding} = ${target}`;

  // If the binding is an array, we should push / splice rather than assigning
  if (isArray) {
    onChangeCode = `event.target.checked ? ${binding}.push(${target}) : ${binding}.splice(${binding}.indexOf(${
      node.properties.value ? `'${node.properties.value}'` : node.bindings.value?.code
    }), 1)`;
  }

  if (name !== 'ref' && binding) {
    node.bindings['onChange'] = createSingleBinding({
      code: onChangeCode,
      arguments: ['event'],
    });
  }
}
