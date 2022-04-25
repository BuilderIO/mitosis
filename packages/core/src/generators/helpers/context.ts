import { MitosisComponent } from '../../types/mitosis-component';

export const hasContext = (component: MitosisComponent) =>
  Boolean(
    Object.keys(component.context.get).length ||
      Object.keys(component.context.set).length,
  );
