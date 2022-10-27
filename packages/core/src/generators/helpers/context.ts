import {
  ContextGetInfo,
  ContextSetInfo,
  ContextType,
  MitosisComponent,
} from '../../types/mitosis-component';

export const hasContext = (component: MitosisComponent) =>
  Boolean(Object.keys(component.context.get).length || Object.keys(component.context.set).length);

export const getContextType = ({
  component,
  context,
}: {
  component: MitosisComponent;
  context: ContextGetInfo | ContextSetInfo;
}): ContextType => {
  return (component.meta.useMetadata?.context as any)?.[context.name] || context.type || 'normal';
};
