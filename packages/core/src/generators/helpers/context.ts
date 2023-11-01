import {
  ContextGetInfo,
  ContextSetInfo,
  MitosisComponent,
  ReactivityType,
} from '@/types/mitosis-component';

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
}): ReactivityType => {
  // TO-DO: remove useMetadata check if no longer needed.
  return component.meta.useMetadata?.contextTypes?.[context.name] || context.type || 'normal';
};
