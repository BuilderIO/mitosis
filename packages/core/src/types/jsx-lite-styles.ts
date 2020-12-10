export type JSXLiteStyles = Omit<
  Partial<CSSStyleDeclaration>,
  | 'length'
  | 'getPropertyPriority'
  | 'getPropertyValue'
  | 'item'
  | 'removeProperty'
  | 'setProperty'
>;
