/**
 * Flow control based on Solid
 *
 * https://github.com/ryansolid/solid/blob/master/packages/solid/src/rendering/flow.ts
 * https://github.com/ryansolid/solid/blob/master/documentation/rendering.md
 *
 * These elements all compile away so they return `null`
 */

export function For<T, U extends JSX.Element>(props: {
  each?: readonly T[];
  children: (item: T, index: number) => U;
}): JSX.Element {
  return null as JSX.Element;
}

export function Show<T>(props: {
  when: T | undefined | null | false;
  else?: JSX.Element;
  children?: JSX.Element | null;
}): JSX.Element {
  return null as JSX.Element;
}
