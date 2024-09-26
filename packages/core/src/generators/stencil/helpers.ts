import { ToStencilOptions } from '@/generators/stencil/types';
import { dashCase } from '@/helpers/dash-case';
import { stripStateAndPropsRefs } from '@/helpers/strip-state-and-props-refs';
import { MitosisState } from '@/types/mitosis-component';
import { MitosisNode } from '@/types/mitosis-node';

export const isEvent = (key: string): boolean => key.startsWith('on');

/**
 * We need to "emit" events those can be on multiple places, so we do it as post step
 */
const appendEmits = (str: string, events: string[]): string => {
  let code = str;
  if (events.length) {
    for (const event of events) {
      code = code.replaceAll(`props.${event}(`, `props.${event}.emit(`);
    }
  }
  return code;
};

export type ProcessBindingOptions = { events: string[] };

export const processBinding = (code: string, { events }: ProcessBindingOptions) => {
  return stripStateAndPropsRefs(appendEmits(code, events), { replaceWith: 'this.' });
};

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

      const type =
        propsTypeRef &&
        propsTypeRef !== 'any' &&
        propsTypeRef !== 'unknown' &&
        propsTypeRef !== 'never'
          ? `${propsTypeRef}["${item}"]`
          : 'any';
      return `@Prop() ${item}: ${type}${defaultPropString}`;
    })
    .join(';\n');
};

/**
 * Check for root element if it needs a wrapping <Host>
 * @param children
 */
export const needsWrap = (children: MitosisNode[]): boolean => {
  if (children.length !== 1) {
    return true;
  } else if (children.length === 1) {
    const firstChild = children.at(0);
    if (firstChild?.name === 'Show' || firstChild?.name === 'For') {
      return true;
    }
  }

  return false;
};

/**
 * Dynamically creates all imports from `@stencil/core`
 * @param wrap
 * @param events
 * @param props
 * @param dataString
 */
export const getStencilCoreImportsAsString = (
  wrap: boolean,
  events: string[],
  props: string[],
  dataString: string,
): string => {
  const stencilCoreImports: Record<string, boolean> = {
    Component: true,
    h: true,
    Fragment: true,
    Host: wrap,
    Event: events.length > 0,
    Prop: props.length > 0,
    State: dataString.length > 0,
  };
  return Object.entries(stencilCoreImports)
    .map(([key, bool]) => (bool ? key : ''))
    .filter((key) => !!key)
    .join(', ');
};
