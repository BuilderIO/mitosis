import { JSONObject } from './json';

export type SpreadType = 'normal' | 'event-handlers';
export type BindingType = 'function' | 'expression';

type BindingProperties =
  | {
      type: 'spread';
      spreadType: SpreadType;
      /**
       * TODO: remove these once we've cleaned up the code that uses them.
       * they don't need to be here since they only exist for functions
       */
      async?: boolean;
      arguments?: string[];
    }
  | {
      type: 'single';
      bindingType: Extract<BindingType, 'function'>;
      async?: boolean;
      arguments?: string[];
    }
  | {
      type: 'single';
      bindingType: Extract<BindingType, 'expression'>;
      /**
       * TODO: remove these once we've cleaned up the code that uses them.
       * they don't need to be here since they only exist for functions
       */
      async?: boolean;
      arguments?: string[];
    };

export type Binding = {
  code: string;
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
  slots?: { [key: string]: MitosisNode[] };
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

export type ShowNode = BaseNode & {
  name: 'Show';
};

export type MitosisNode = BaseNode | ForNode;

export const checkIsForNode = (node: MitosisNode): node is ForNode => node.name === 'For';

export const checkIsShowNode = (node: MitosisNode): node is ShowNode => node.name === 'Show';
