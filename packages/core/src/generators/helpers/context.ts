import { MitosisComponent } from '../../types/mitosis-component';

export const hasContext = (component: MitosisComponent) =>
  hasSetContext(component) || hasGetContext(component);

export const hasSetContext = (component: MitosisComponent) =>
  Object.keys(component.context.get).length > 0;

export const hasGetContext = (component: MitosisComponent) =>
  Object.keys(component.context.set).length > 0;
