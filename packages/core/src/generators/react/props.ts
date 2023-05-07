import { MitosisComponent } from '@builder.io/mitosis';

export const getPropsDefinition = ({ json }: { json: MitosisComponent }) => {
  if (!json.defaultProps) return '';
  const defaultPropsString = Object.keys(json.defaultProps)
    .map((prop) => {
      const value = json.defaultProps!.hasOwnProperty(prop)
        ? json.defaultProps![prop]?.code
        : 'undefined';
      return `${prop}: ${value}`;
    })
    .join(',');
  return `${json.name}.defaultProps = {${defaultPropsString}};`;
};
