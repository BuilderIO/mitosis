import { MitosisComponent } from '@/types/mitosis-component';
import { BaseTranspilerOptions } from '@/types/transpiler';

export const ROOT_REF = '_root';

export const getAttributePassingString = (typescript?: boolean, exceptions?: string[]) => {
  return `/**
 * Passes attributes to correct child. Used in angular and stencil.
 * @param element  the ref for the component
 * @param customElementSelector the custom element like \`my-component\`
 */
private enableAttributePassing(element${
    typescript ? ': HTMLElement | null' : ''
  }, customElementSelector${typescript ? ': string' : ''}) {
const parent = element?.closest(customElementSelector);
    if (element && parent) {
      const attributes = parent.attributes;
      for (let i = 0; i < attributes.length; i++) {
        const attr = attributes.item(i);
        if (!attr) continue;

        if (attr.name === 'class') {
          const isWebComponent = attr.value.includes('hydrated');
          const value = attr.value.replace('hydrated', '').trim();
          const currentClass = element.getAttribute('class');
          element.setAttribute(
            attr.name,     
            \`\${currentClass ? \`\${currentClass} \` : ''}\${value}\`
          );
          if (isWebComponent) {
            // Stencil is using this class for lazy loading component
            parent.setAttribute('class', 'hydrated');
          } else {
            parent.removeAttribute(attr.name);
          }
        } else if (!attr.name.startsWith('_')${
          exceptions?.length ? `&& ![${exceptions.join(',')}].includes(attr)` : ''
        }) {
          element.setAttribute(attr.name, attr.value)
          parent.removeAttribute(attr.name);
        }
      }
    }
};`;
};

export const shouldAddAttributePassing = (json: MitosisComponent, options: BaseTranspilerOptions) =>
  options.attributePassing?.enabled || json.meta.useMetadata?.attributePassing?.enabled;

export const getAddAttributePassingRef = (
  json: MitosisComponent,
  options: BaseTranspilerOptions,
) => {
  return (
    json.meta.useMetadata?.attributePassing?.customRef ||
    options.attributePassing?.customRef ||
    ROOT_REF
  );
};
