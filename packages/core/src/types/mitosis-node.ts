import { JSONObject } from './json';

export type SpreadType = 'normal' | 'event-handlers';

type BindingProperties =
  | {
      type: 'spread';
      spreadType: SpreadType;
    }
  | {
      type: 'single';
    };

export type Binding = {
  code: string;
  arguments?: string[];
} & BindingProperties;

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
    [key: string]: Binding | undefined;
  };
  children: MitosisNode[];
  /**
   * Key-value store of slots. The key is the slot name and the value is an array of nodes.
   * It is used when components have props that are also nodes
   */
  slots: { [key: string]: MitosisNode[] };
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
