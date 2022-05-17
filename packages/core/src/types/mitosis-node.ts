import { JSONObject } from './json';

export type MitosisNode = {
  '@type': '@builder.io/mitosis/node';
  name: string;
  meta: JSONObject;
  /**
   * Key-value store of string values for DOM attributes.
   * ```js
   * {
   *   defaultValue: 'initial text',
   *   width: '100px',
   * }
   * ```
   */
  scope: { [key: string]: Array<string> };
  properties: { [key: string]: string | undefined };
  /**
   * Key-value store of expression values for DOM attributes. These are always represented as strings.
   *
   * ```js
   * {
   *   disabled: "state.isDisabled",
   *   defaultValue: "`${props.text} + ' initial'`",
   *   width: "props.width * 10",
   *   height: "100",
   * }
   * ```
   */
  bindings: { [key: string]: string | undefined };
  children: MitosisNode[];
};
