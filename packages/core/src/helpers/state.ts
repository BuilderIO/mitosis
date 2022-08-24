import { MitosisComponent } from '../types/mitosis-component';

export const checkHasState = (component: MitosisComponent) =>
  Boolean(Object.keys(component.state).length);
