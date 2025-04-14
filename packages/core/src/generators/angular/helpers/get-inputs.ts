import { ToAngularOptions } from '@/generators/angular/types';
import type { MitosisComponent } from '@/types/mitosis-component';

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
