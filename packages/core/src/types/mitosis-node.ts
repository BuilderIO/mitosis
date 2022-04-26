import { JSONObject } from './json';

export type MitosisNode = {
  '@type': '@builder.io/mitosis/node';
  name: string;
  meta: JSONObject;
  /**
   * Key-value store of static values for DOM attributes.
   * ```js
   * {
   *   disabled: false,
   *   defaultValue: 'initial text`,
   *   width: 100,
   * }
   * ```
   */
  properties: { [key: string]: string | undefined };
  // TODO: I think in our usage these values are always strings. Make a decision and change to reflect
  /**
   * Key-value store of _dynamic_ values for DOM attributes.
   *
   * ```js
   * {
   *   disabled: state.isDisabled,
   *   defaultValue: `${props.text} + ' initial'`,
   *   width: props.width * 10,
   * }
   * ```
   */
  bindings: { [key: string]: string | undefined };
  children: MitosisNode[];
};
