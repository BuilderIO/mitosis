type JSXLiteNode = {
  '@type': '@jsx-lite/node';
  children: JSXLiteNode[];
};

type JSONPrimitive = string | null | number | boolean;
type JSONObject = { [key: string]: JSON };
type JSON = JSONPrimitive | JSONObject | JSON[];

type JSXLiteComponent = {
  '@type': '@jsx-lite/component';
  state: { [key: string]: JSON };
  children: JSXLiteNode[];
};

export function parse(jsx: string): JSXLiteComponent {
  // TODO
  return null as any;
}
