import {
  ContextGetInfo,
  ContextSetInfo,
  ContextType,
  MitosisComponent,
} from '../../types/mitosis-component';

export const hasContext = (component: MitosisComponent) =>
  hasSetContext(component) || hasGetContext(component);

export const hasSetContext = (component: MitosisComponent) =>
  Object.keys(component.context.set).length > 0;

export const hasGetContext = (component: MitosisComponent) =>
  Object.keys(component.context.get).length > 0;

export const getContextType = ({
  component,
  context,
}: {
  component: MitosisComponent;
  context: ContextGetInfo | ContextSetInfo;
}): ContextType => {
  return component.meta.useMetadata?.context?.[context.name] || context.type || 'normal';
};
