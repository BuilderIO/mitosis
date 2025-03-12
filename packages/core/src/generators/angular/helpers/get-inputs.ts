import { AngularApi, ToAngularOptions } from '@/generators/angular/types';
import type { MitosisComponent } from '@/types/mitosis-component';

export const getInputImports = (api?: AngularApi): string[] => {
  if (api === 'signals') {
    return ['input'];
  }

  return ['Input'];
};

export const getInputs = ({
  props,
  json,
  options,
}: {
  props: string[];
  json: MitosisComponent;
  options: ToAngularOptions;
}) => {
  const propsTypeRef = json.propsTypeRef !== 'any' ? json.propsTypeRef : undefined;
  if (options.api === 'signals') {
    return props
      .map((prop) => {
        const hasDefaultProp = json.defaultProps && json.defaultProps.hasOwnProperty(prop);
        const propType = propsTypeRef ? `${propsTypeRef}["${prop}"]` : 'any';
        const defaultProp = hasDefaultProp ? `defaultProps["${prop}"]` : '';
        return `${prop} = input<${propType}>(${defaultProp})`;
      })
      .join('\n');
  }

  return props
    .map((prop) => {
      const hasDefaultProp = json.defaultProps && json.defaultProps.hasOwnProperty(prop);
      const propType = propsTypeRef ? `${propsTypeRef}["${prop}"]` : 'any';
      let propDeclaration = `@Input() ${prop}${
        options.typescript ? `${hasDefaultProp ? '' : '!'}: ${propType}` : ''
      }`;
      if (hasDefaultProp) {
        propDeclaration += ` = defaultProps["${prop}"]`;
      }
      return propDeclaration;
    })
    .join('\n');
};
