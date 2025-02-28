import { MitosisComponent } from '@/types/mitosis-component';

export const getDefaultProps = (json: MitosisComponent) => {
  if (!json.defaultProps) return '';
  const defaultPropsString = Object.keys(json.defaultProps)
    .map((prop) => {
      const value = json.defaultProps!.hasOwnProperty(prop)
        ? json.defaultProps![prop]?.code
        : 'undefined';
      return `${prop}: ${value}`;
    })
    .join(',');
  if (defaultPropsString) {
    return `props = {${defaultPropsString}, ...props}`;
  }
  return '';
};
