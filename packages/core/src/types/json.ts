// Pure JSON
export type JSONPrimitive = string | null | number | boolean | undefined;
export type JSONObject = { [key: string]: JSON };
export type JSON = JSONPrimitive | JSONObject | JSON[];

// JSON mixed with babel nodes for intermediary compilation steps
export type JSONPrimitiveOrNode = JSONPrimitive | babel.Node;
export type JSONOrNodeObject = { [key: string]: JSONOrNode };
export type JSONOrNode = JSONPrimitiveOrNode | JSONOrNodeObject | JSONOrNode[];
