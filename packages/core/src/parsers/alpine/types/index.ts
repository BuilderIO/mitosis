import { BaseNode } from 'estree';

export interface AlpineDirective {
  type: 'AlpineDirective';
  name: string;
  value: string;
  modifiers: string[];
}

export interface AlpineData {
  type: 'AlpineData';
  value: string;
  parsed: Record<string, any>;
}

export interface AlpineExpression {
  type: 'AlpineExpression';
  value: string;
  ast: BaseNode;
}

export interface AlpineNode {
  type: 'AlpineNode';
  tagName: string;
  attributes: Record<string, string>;
  directives: AlpineDirective[];
  children: AlpineNode[];
  text?: string;
}

export interface AlpineAST {
  type: 'AlpineAST';
  root: AlpineNode;
  data: AlpineData | null;
}
