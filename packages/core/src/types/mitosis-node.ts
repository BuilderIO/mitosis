import { JSONObject } from './json';

export type BaseNode = {
  '@type': '@builder.io/mitosis/node';
  meta: JSONObject;
  name: string;
  scope: {};
  /**
   * Key-value store of string values for DOM attributes.
   * ```js
   * {
   *   defaultValue: 'initial text',
   *   width: '100px',
   * }
   * ```
   */
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
  bindings: {
    [key: string]: { code: string; arguments?: string[]; type?: string } | undefined;
  };
  children: MitosisNode[];
};

export type SpecialNodesNames = 'For' | 'Fragment' | 'Show' | 'Slot';

export type ForNode = BaseNode & {
  name: 'For';
  scope: {
    forName: string | undefined;
    indexName: string | undefined;
    collectionName: string | undefined;
  };
};

export type MitosisNode = BaseNode | ForNode;

export const checkIsForNode = (node: MitosisNode): node is ForNode => node.name === 'For';
