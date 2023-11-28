export type MitosisStyles = Omit<
  Partial<CSSStyleDeclaration>,
  | 'length'
  | 'getPropertyPriority'
  | 'getPropertyValue'
  | 'item'
  | 'removeProperty'
  | 'setProperty'
  | 'parentRule'
>;
