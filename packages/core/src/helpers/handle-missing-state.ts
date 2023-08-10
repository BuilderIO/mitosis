import { MitosisComponent } from '..';
import { getStateUsed } from './get-state-used';

export function handleMissingState(json: MitosisComponent) {
  const stateUsed = getStateUsed(json);
  Array.from(stateUsed).forEach((property) => {
    if (!(property in json.state)) {
      json.state[property] = { code: 'null', type: 'property', propertyType: 'normal' };
    }
  });
}
