export type FigmaProp = {
  type: 'instance' | 'string' | 'boolean' | 'enum' | 'children' | 'textContent';
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  value?: Record<string, any>;
  key: string;
};

export type FigmaCodeConnect = {
  name: string;
  url: string;
  props: Record<string, FigmaProp>;
};
