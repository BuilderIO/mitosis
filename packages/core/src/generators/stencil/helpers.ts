import { ToStencilOptions } from '@/generators/stencil/types';
import { dashCase } from '@/helpers/dash-case';
import { stripStateAndPropsRefs } from '@/helpers/strip-state-and-props-refs';
import { MitosisState } from '@/types/mitosis-component';

export const isEvent = (key: string): boolean => key.startsWith('on');

export const processBinding = (code: string) =>
  stripStateAndPropsRefs(code, { replaceWith: 'this.' });

export const getTagName = (name: string, { prefix }: ToStencilOptions): string => {
  const dashName = dashCase(name);

  if (prefix) {
    const dashPrefix = prefix.endsWith('-') ? prefix : `${prefix}-`;
    if (!dashName.startsWith(dashPrefix)) {
      return `${dashPrefix}${dashName}`;
    }
  }

  return dashName;
};

export const getPropsAsCode = (
  props: string[],
  defaultProps?: MitosisState | undefined,
  propsTypeRef?: string,
): string => {
  return props
    .map((item: string) => {
      const defaultProp: string | undefined = defaultProps ? defaultProps[item]?.code : undefined;
      const defaultPropString = defaultProp ? ` = ${defaultProp}` : '';

      if (isEvent(item)) {
        return `@Event() ${item}: any${defaultPropString}`;
      }

      const type = propsTypeRef ? `${propsTypeRef}["${item}"]` : 'any';
      return `@Prop() ${item}: ${type}${defaultPropString}`;
    })
    .join(';\n');
};

/**
 * We need to "emit" events those can be on multiple places, so we do it as post step
 */
export const postCodeEvents = (str: string, events: string[]): string => {
  let code = str;
  if (events.length) {
    for (const event of events) {
      code = code.replaceAll(`this.${event}(`, `this.${event}.emit(`);
    }
  }
  return code;
};

/**
 * Stencil doesn't support default exports, this is a workaround
 */
export const postCodeChildComponentImports = (str: string, childComponents: string[]): string => {
  let code = str;
  if (childComponents.length > 1) {
    for (const child of childComponents) {
      code = code.replaceAll(`import  ${child} from`, `import {${child}} from`);
    }
  }
  return code;
};
