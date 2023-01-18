import { MitosisNode } from '../../../types/mitosis-node';
import { ToSolidOptions } from '../types';

// This should really be a preprocessor mapping the `class` attribute binding based on what other values have
// to make this more pluggable
export const collectClassString = (json: MitosisNode, options: ToSolidOptions): string | null => {
  const staticClasses: string[] = [];

  if (json.properties.class) {
    staticClasses.push(json.properties.class);
    delete json.properties.class;
  }
  if (json.properties.className) {
    staticClasses.push(json.properties.className);
    delete json.properties.className;
  }

  const dynamicClasses: string[] = [];
  if (typeof json.bindings.class?.code === 'string') {
    dynamicClasses.push(json.bindings.class.code as any);
    delete json.bindings.class;
  }
  if (typeof json.bindings.className?.code === 'string') {
    dynamicClasses.push(json.bindings.className.code as any);
    delete json.bindings.className;
  }
  if (
    typeof json.bindings.css?.code === 'string' &&
    json.bindings.css.code.trim().length > 4 &&
    options.stylesType === 'styled-components'
  ) {
    dynamicClasses.push(`css(${json.bindings.css.code})`);
  }
  delete json.bindings.css;
  const staticClassesString = staticClasses.join(' ');

  const dynamicClassesString = dynamicClasses.join(" + ' ' + ");

  const hasStaticClasses = Boolean(staticClasses.length);
  const hasDynamicClasses = Boolean(dynamicClasses.length);

  if (hasStaticClasses && !hasDynamicClasses) {
    return `"${staticClassesString}"`;
  }

  if (hasDynamicClasses && !hasStaticClasses) {
    return `{${dynamicClassesString}}`;
  }

  if (hasDynamicClasses && hasStaticClasses) {
    return `{"${staticClassesString} " + ${dynamicClassesString}}`;
  }

  return null;
};
