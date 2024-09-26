import { ProcessBindingOptions } from '@/generators/stencil/helpers';
import { MitosisNode } from '@/types/mitosis-node';

const bindingOpenChar = '{';
const bindingCloseChar = '}';

// This should really be a preprocessor mapping the `class` attribute binding based on what other values have
// to make this more pluggable
export const collectClassString = (
  json: MitosisNode,
  processBinding: (code: string, processBindingOptions: ProcessBindingOptions) => string,
  processBindingOptions: ProcessBindingOptions,
): string | null => {
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
    dynamicClasses.push(processBinding(json.bindings.class.code, processBindingOptions));
    delete json.bindings.class;
  }
  if (typeof json.bindings.className?.code === 'string') {
    dynamicClasses.push(processBinding(json.bindings.className.code, processBindingOptions));
    delete json.bindings.className;
  }

  const staticClassesString = staticClasses.join(' ');

  const dynamicClassesString = dynamicClasses.join(" + ' ' + ");

  const hasStaticClasses = Boolean(staticClasses.length);

  const hasDynamicClasses = Boolean(dynamicClasses.length);

  if (hasStaticClasses && !hasDynamicClasses) {
    return `"${staticClassesString}"`;
  }

  if (hasDynamicClasses && !hasStaticClasses) {
    return `${bindingOpenChar}${dynamicClassesString}${bindingCloseChar}`;
  }

  if (hasDynamicClasses && hasStaticClasses) {
    return `${bindingOpenChar}"${staticClassesString} " + ${dynamicClassesString}${bindingCloseChar}`;
  }

  return null;
};
