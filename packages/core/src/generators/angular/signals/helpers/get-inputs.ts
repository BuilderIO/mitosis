import type { MitosisComponent } from '@/types/mitosis-component';

export const getSignalInputs = ({
  props,
  json,
  writeableSignals,
  requiredSignals,
}: {
  props: string[];
  json: MitosisComponent;
  writeableSignals: string[];
  requiredSignals: string[];
}) => {
  const propsTypeRef = json.propsTypeRef !== 'any' ? json.propsTypeRef : undefined;
  return props
    .map((prop) => {
      const hasDefaultProp = json.defaultProps && json.defaultProps.hasOwnProperty(prop);
      const propType = propsTypeRef ? `${propsTypeRef}["${prop}"]` : 'any';
      const defaultProp = hasDefaultProp ? `defaultProps["${prop}"]` : '';
      return `${prop}: ${
        writeableSignals.includes(prop) ? 'ModelSignal' : 'InputSignal'
      }<${propType}> = ${writeableSignals.includes(prop) ? 'model' : 'input'}${
        requiredSignals.includes(prop) ? '.required' : ''
      }<${propType}>(${defaultProp})`;
    })
    .join('\n');
};
