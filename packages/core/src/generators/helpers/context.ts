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
  key,
}: {
  component: MitosisComponent;
  context: ContextGetInfo | ContextSetInfo;
  key: string;
}): ContextType => {
  return (component.meta.useMetadata?.context as any)?.[key] || context.type || 'normal';
};
