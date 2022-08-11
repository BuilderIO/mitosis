import { mapValues } from 'lodash';
import { JSONObject, _JSON } from '../types/json';
import { MitosisComponent, StateValue } from '../types/mitosis-component';

export const checkHasState = (component: MitosisComponent) =>
  Boolean(Object.keys(component.state).length);

const mapJsonToStateValue = (value: _JSON): StateValue => ({
  code: value,
  type: 'data',
});

export const mapJsonObjectToStateValue = (value: JSONObject): MitosisComponent['state'] =>
  mapValues(value, mapJsonToStateValue);
