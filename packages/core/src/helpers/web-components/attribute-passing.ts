import { MitosisComponent } from '@/types/mitosis-component';
import { BaseTranspilerOptions } from '@/types/transpiler';

export const ROOT_REF = '_root';

export const getAttributePassingString = (typescript?: boolean) => {
  return (
    '/**\n' +
    ' * Passes `aria-*`, `data-*` & `class` attributes to correct child. Used in angular and stencil.\n' +
    ' * @param element  the ref for the component\n' +
    ' * @param customElementSelector  the custom element like `my-component`\n' +
    ' */\n' +
    `private enableAttributePassing(element${
      typescript ? ': HTMLElement | null' : ''
    }, customElementSelector${typescript ? ': string' : ''}) {
` +
    '  const parent = element?.closest(customElementSelector);\n' +
    '  if (element && parent) {\n' +
    '    const attributes = parent.attributes;\n' +
    '    for (let i = 0; i < attributes.length; i++) {\n' +
    '      const attr = attributes.item(i);\n' +
    "      if (attr && (attr.name.startsWith('data-') || attr.name.startsWith('aria-'))) {\n" +
    '        element.setAttribute(attr.name, attr.value);\n' +
    '        parent.removeAttribute(attr.name);\n' +
    '      }\n' +
    "      if (attr && attr.name === 'class') {\n" +
    "        const isWebComponent = attr.value.includes('hydrated');\n" +
    "        const value = attr.value.replace('hydrated', '').trim();\n" +
    "        const currentClass = element.getAttribute('class');\n" +
    "        element.setAttribute(attr.name, `${currentClass ? `${currentClass} ` : ''}${value}`);\n" +
    '        if (isWebComponent) {\n' +
    '          // Stencil is using this class for lazy loading component\n' +
    "          parent.setAttribute('class', 'hydrated');\n" +
    '        } else {\n' +
    '          parent.removeAttribute(attr.name);\n' +
    '        }\n' +
    '      }\n' +
    '    }\n' +
    '  }\n' +
    '};'
  );
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
