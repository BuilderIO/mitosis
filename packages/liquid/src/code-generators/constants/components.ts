import { BuilderElement } from '@builder.io/sdk';
import { Options } from '../interfaces/options';

export interface ComponentInfo {
  component: (block: BuilderElement, options: Options, attributes?: string) => string;
  noWrap?: boolean;
  name: string;
  // We now minimize builder-id's when generating liquid. For backwards compatibility,
  // if something requires a full builder ID, flag it here. Currently only
  // custom-code.tsx needs this that dependency is intended to be removed
  // https://github.com/BuilderIO/builder/blob/c68ebcd/packages/react/src/blocks/CustomCode.tsx#L29:L29
  preserveFullBuilderId?: boolean;
}

export function component(info: ComponentInfo) {
  components[info.name] = info;
  return info.component;
}

export function getComponentInfo(name: string) {
  return components[name];
}

export function getComponent(name: string) {
  const info = getComponentInfo(name);
  return info && info.component;
}

export const components: { [key: string]: ComponentInfo | undefined } = {};
