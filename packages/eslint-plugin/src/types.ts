import * as ESTree from 'estree';

interface NodeWithParent extends ESTree.BaseNode {
  parent: NodeWithParent;
  type: NodeType;
}

interface JSXExpressionContainer extends NodeWithParent {
  type: 'JSXExpressionContainer';
  expression: NodeExt;
}

interface JSXAttribute extends NodeWithParent {
  type: 'JSXAttribute';
  name: { name: {} };
  value: JSXExpressionContainer;
}

interface JSXOpeningElement extends NodeWithParent {
  type: 'JSXOpeningElement';
  attributes: JSXAttribute[];
}

declare module 'eslint' {
  export namespace Rule {
    interface NodeListener {
      JSXOpeningElement?(node: JSXOpeningElement): void;
      JSXAttribute?(node: JSXAttribute): void;
      JSXExpressionContainer?(node: JSXExpressionContainer): void;
    }
  }
}

// There's some issues with babel's types and eslint's types cooperating so
// this is a stop gap solution.
type NodeJSX = JSXExpressionContainer | JSXAttribute | JSXOpeningElement;
type NodeExt = ESTree.Node | NodeJSX;
type NodeType = NodeExt['type'];
