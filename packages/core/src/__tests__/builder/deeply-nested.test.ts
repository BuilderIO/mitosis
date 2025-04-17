import { componentToBuilder } from '@/generators/builder';
import { componentToMitosis } from '@/generators/mitosis';
import { builderContentToMitosisComponent } from '@/parsers/builder';
import { parseJsx } from '@/parsers/jsx';
import { describe, test } from 'vitest';

describe('Deeply Nested Builder Components', () => {
  test('parse array with deeply nested elements', () => {
    const builderJson = {
      data: {
        blocks: [
          {
            '@type': '@builder.io/sdk:Element' as const,
            component: {
              name: 'TestComponent',
              options: {
                prop: null,
                items: [
                  {
                    foo: [
                      {
                        '@type': '@builder.io/sdk:Element',
                        tagName: 'div',
                        children: [
                          {
                            '@type': '@builder.io/sdk:Element',
                            tagName: 'br',
                          },
                        ],
                      },
                      {
                        '@type': '@builder.io/sdk:Element',
                        tagName: 'br',
                      },
                    ],
                    bar: {
                      '@type': '@builder.io/sdk:Element',
                      tagName: 'br',
                    },
                    baz: [
                      {
                        a: {
                          '@type': '@builder.io/sdk:Element',
                          tagName: 'br',
                        },
                      },
                    ],
                  },
                ],
              },
            },
          },
        ],
      },
    };
    const builderToMitosis = builderContentToMitosisComponent(builderJson, {
      enableBlocksSlots: true,
    });
    expect(builderToMitosis).toMatchInlineSnapshot(`
      {
        "@type": "@builder.io/mitosis/component",
        "children": [
          {
            "@type": "@builder.io/mitosis/node",
            "bindings": {
              "prop": {
                "bindingType": "expression",
                "code": "null",
                "type": "single",
              },
            },
            "blocksSlots": {
              "items": [
                {
                  "bar": {
                    "@type": "@builder.io/mitosis/node",
                    "bindings": {},
                    "children": [],
                    "meta": {},
                    "name": "br",
                    "properties": {},
                    "scope": {},
                    "slots": {},
                  },
                  "baz": [
                    {
                      "a": {
                        "@type": "@builder.io/mitosis/node",
                        "bindings": {},
                        "children": [],
                        "meta": {},
                        "name": "br",
                        "properties": {},
                        "scope": {},
                        "slots": {},
                      },
                    },
                  ],
                  "foo": [
                    {
                      "@type": "@builder.io/mitosis/node",
                      "bindings": {},
                      "children": [
                        {
                          "@type": "@builder.io/mitosis/node",
                          "bindings": {},
                          "children": [],
                          "meta": {},
                          "name": "br",
                          "properties": {},
                          "scope": {},
                          "slots": {},
                        },
                      ],
                      "meta": {},
                      "name": "div",
                      "properties": {},
                      "scope": {},
                      "slots": {},
                    },
                    {
                      "@type": "@builder.io/mitosis/node",
                      "bindings": {},
                      "children": [],
                      "meta": {},
                      "name": "br",
                      "properties": {},
                      "scope": {},
                      "slots": {},
                    },
                  ],
                },
              ],
            },
            "children": [],
            "meta": {},
            "name": "TestComponent",
            "properties": {
              "$tagName": undefined,
            },
            "scope": {},
            "slots": {},
          },
        ],
        "context": {
          "get": {},
          "set": {},
        },
        "exports": {},
        "hooks": {
          "onEvent": [],
          "onMount": [],
        },
        "imports": [],
        "inputs": undefined,
        "meta": {
          "useMetadata": {
            "httpRequests": undefined,
          },
        },
        "name": "MyComponent",
        "refs": {},
        "state": {},
        "subComponents": [],
      }
    `);
    const mitosis = componentToMitosis()({ component: builderToMitosis });
    expect(mitosis).toMatchInlineSnapshot(`
      "import { TestComponent } from \\"@components\\";

      export default function MyComponent(props) {
        return (
          <TestComponent
            prop={null}
            items={[
              {
                foo: [
                  <div>
                    <br />
                  </div>,
                  <br />,
                ],
                bar: <br />,
                baz: [{ a: <br /> }],
              },
            ]}
          />
        );
      }
      "
    `);

    const backToMitosis = parseJsx(mitosis);
    const backToBuilder = componentToBuilder()({ component: backToMitosis });
    expect(backToBuilder).toMatchInlineSnapshot(`
      {
        "data": {
          "blocks": [
            {
              "@type": "@builder.io/sdk:Element",
              "actions": {},
              "bindings": {},
              "children": [],
              "code": {
                "actions": {},
                "bindings": {},
              },
              "component": {
                "name": "TestComponent",
                "options": {
                  "items": [
                    {
                      "bar": {
                        "@type": "@builder.io/sdk:Element",
                        "actions": {},
                        "bindings": {},
                        "children": [],
                        "code": {
                          "actions": {},
                          "bindings": {},
                        },
                        "properties": {},
                        "tagName": "br",
                      },
                      "baz": [
                        {
                          "a": {
                            "@type": "@builder.io/sdk:Element",
                            "actions": {},
                            "bindings": {},
                            "children": [],
                            "code": {
                              "actions": {},
                              "bindings": {},
                            },
                            "properties": {},
                            "tagName": "br",
                          },
                        },
                      ],
                      "foo": [
                        {
                          "@type": "@builder.io/sdk:Element",
                          "actions": {},
                          "bindings": {},
                          "children": [
                            {
                              "@type": "@builder.io/sdk:Element",
                              "actions": {},
                              "bindings": {},
                              "children": [],
                              "code": {
                                "actions": {},
                                "bindings": {},
                              },
                              "properties": {},
                              "tagName": "br",
                            },
                          ],
                          "code": {
                            "actions": {},
                            "bindings": {},
                          },
                          "properties": {},
                          "tagName": "div",
                        },
                        {
                          "@type": "@builder.io/sdk:Element",
                          "actions": {},
                          "bindings": {},
                          "children": [],
                          "code": {
                            "actions": {},
                            "bindings": {},
                          },
                          "properties": {},
                          "tagName": "br",
                        },
                      ],
                    },
                  ],
                  "prop": null,
                },
              },
            },
          ],
          "jsCode": "",
          "tsCode": "",
        },
      }
    `);
  });
  test('parse object with deeply nested elements', () => {
    const builderJson = {
      data: {
        blocks: [
          {
            '@type': '@builder.io/sdk:Element' as const,
            component: {
              name: 'TestComponent',
              options: {
                prop: null,
                items: {
                  foo: [
                    {
                      '@type': '@builder.io/sdk:Element',
                      tagName: 'div',
                      children: [
                        {
                          '@type': '@builder.io/sdk:Element',
                          tagName: 'br',
                        },
                      ],
                    },
                    {
                      '@type': '@builder.io/sdk:Element',
                      tagName: 'br',
                    },
                  ],
                  bar: {
                    '@type': '@builder.io/sdk:Element',
                    tagName: 'br',
                  },
                  baz: [
                    {
                      a: {
                        '@type': '@builder.io/sdk:Element',
                        tagName: 'br',
                      },
                    },
                  ],
                },
              },
            },
          },
        ],
      },
    };
    const builderToMitosis = builderContentToMitosisComponent(builderJson, {
      enableBlocksSlots: true,
    });
    expect(builderToMitosis).toMatchInlineSnapshot(`
      {
        "@type": "@builder.io/mitosis/component",
        "children": [
          {
            "@type": "@builder.io/mitosis/node",
            "bindings": {
              "prop": {
                "bindingType": "expression",
                "code": "null",
                "type": "single",
              },
            },
            "blocksSlots": {
              "items": {
                "bar": {
                  "@type": "@builder.io/mitosis/node",
                  "bindings": {},
                  "children": [],
                  "meta": {},
                  "name": "br",
                  "properties": {},
                  "scope": {},
                  "slots": {},
                },
                "baz": [
                  {
                    "a": {
                      "@type": "@builder.io/mitosis/node",
                      "bindings": {},
                      "children": [],
                      "meta": {},
                      "name": "br",
                      "properties": {},
                      "scope": {},
                      "slots": {},
                    },
                  },
                ],
                "foo": [
                  {
                    "@type": "@builder.io/mitosis/node",
                    "bindings": {},
                    "children": [
                      {
                        "@type": "@builder.io/mitosis/node",
                        "bindings": {},
                        "children": [],
                        "meta": {},
                        "name": "br",
                        "properties": {},
                        "scope": {},
                        "slots": {},
                      },
                    ],
                    "meta": {},
                    "name": "div",
                    "properties": {},
                    "scope": {},
                    "slots": {},
                  },
                  {
                    "@type": "@builder.io/mitosis/node",
                    "bindings": {},
                    "children": [],
                    "meta": {},
                    "name": "br",
                    "properties": {},
                    "scope": {},
                    "slots": {},
                  },
                ],
              },
            },
            "children": [],
            "meta": {},
            "name": "TestComponent",
            "properties": {
              "$tagName": undefined,
            },
            "scope": {},
            "slots": {},
          },
        ],
        "context": {
          "get": {},
          "set": {},
        },
        "exports": {},
        "hooks": {
          "onEvent": [],
          "onMount": [],
        },
        "imports": [],
        "inputs": undefined,
        "meta": {
          "useMetadata": {
            "httpRequests": undefined,
          },
        },
        "name": "MyComponent",
        "refs": {},
        "state": {},
        "subComponents": [],
      }
    `);
    const mitosis = componentToMitosis()({ component: builderToMitosis });
    expect(mitosis).toMatchInlineSnapshot(`
      "import { TestComponent } from \\"@components\\";

      export default function MyComponent(props) {
        return (
          <TestComponent
            prop={null}
            items={{
              foo: [
                <div>
                  <br />
                </div>,
                <br />,
              ],
              bar: <br />,
              baz: [{ a: <br /> }],
            }}
          />
        );
      }
      "
    `);

    const backToMitosis = parseJsx(mitosis);
    const backToBuilder = componentToBuilder()({ component: backToMitosis });
    expect(backToBuilder).toMatchInlineSnapshot(`
      {
        "data": {
          "blocks": [
            {
              "@type": "@builder.io/sdk:Element",
              "actions": {},
              "bindings": {},
              "children": [],
              "code": {
                "actions": {},
                "bindings": {},
              },
              "component": {
                "name": "TestComponent",
                "options": {
                  "items": {
                    "bar": {
                      "@type": "@builder.io/sdk:Element",
                      "actions": {},
                      "bindings": {},
                      "children": [],
                      "code": {
                        "actions": {},
                        "bindings": {},
                      },
                      "properties": {},
                      "tagName": "br",
                    },
                    "baz": [
                      {
                        "a": {
                          "@type": "@builder.io/sdk:Element",
                          "actions": {},
                          "bindings": {},
                          "children": [],
                          "code": {
                            "actions": {},
                            "bindings": {},
                          },
                          "properties": {},
                          "tagName": "br",
                        },
                      },
                    ],
                    "foo": [
                      {
                        "@type": "@builder.io/sdk:Element",
                        "actions": {},
                        "bindings": {},
                        "children": [
                          {
                            "@type": "@builder.io/sdk:Element",
                            "actions": {},
                            "bindings": {},
                            "children": [],
                            "code": {
                              "actions": {},
                              "bindings": {},
                            },
                            "properties": {},
                            "tagName": "br",
                          },
                        ],
                        "code": {
                          "actions": {},
                          "bindings": {},
                        },
                        "properties": {},
                        "tagName": "div",
                      },
                      {
                        "@type": "@builder.io/sdk:Element",
                        "actions": {},
                        "bindings": {},
                        "children": [],
                        "code": {
                          "actions": {},
                          "bindings": {},
                        },
                        "properties": {},
                        "tagName": "br",
                      },
                    ],
                  },
                  "prop": null,
                },
              },
            },
          ],
          "jsCode": "",
          "tsCode": "",
        },
      }
    `);
  });
  test('do not parse components with mapper even if feature is enabled', () => {
    const builderJson = {
      data: {
        blocks: [
          {
            '@type': '@builder.io/sdk:Element' as const,
            component: {
              name: 'Columns',
              options: {
                columns: [
                  {
                    blocks: [
                      {
                        '@type': '@builder.io/sdk:Element' as const,
                      },
                    ],
                  },
                ],
              },
            },
          },
        ],
      },
    };
    const builderToMitosis = builderContentToMitosisComponent(builderJson, {
      enableBlocksSlots: true,
    });
    const mitosis = componentToMitosis()({ component: builderToMitosis });
    expect(mitosis).toMatchInlineSnapshot(`
      "import { Columns, Column } from \\"@components\\";

      export default function MyComponent(props) {
        return (
          <Columns>
            <Column>
              <div />
            </Column>
          </Columns>
        );
      }
      "
    `);

    const backToMitosis = parseJsx(mitosis);
    const backToBuilder = componentToBuilder()({ component: backToMitosis });
    expect(backToBuilder).toMatchInlineSnapshot(`
      {
        "data": {
          "blocks": [
            {
              "@type": "@builder.io/sdk:Element",
              "actions": {},
              "bindings": {},
              "children": [],
              "code": {
                "actions": {},
                "bindings": {},
              },
              "component": {
                "name": "Columns",
                "options": {
                  "columns": [
                    {
                      "blocks": [
                        {
                          "@type": "@builder.io/sdk:Element",
                          "actions": {},
                          "bindings": {},
                          "children": [],
                          "code": {
                            "actions": {},
                            "bindings": {},
                          },
                          "properties": {},
                          "tagName": "div",
                        },
                      ],
                    },
                  ],
                },
              },
            },
          ],
          "jsCode": "",
          "tsCode": "",
        },
      }
    `);
  });
  test('do not transform deeply nested object when feature disabled', () => {
    const builderJson = {
      data: {
        blocks: [
          {
            '@type': '@builder.io/sdk:Element' as const,
            component: {
              name: 'TestComponent',
              options: {
                prop: null,
                items: {
                  foo: [
                    {
                      '@type': '@builder.io/sdk:Element',
                      tagName: 'div',
                      children: [
                        {
                          '@type': '@builder.io/sdk:Element',
                          tagName: 'br',
                        },
                      ],
                    },
                    {
                      '@type': '@builder.io/sdk:Element',
                      tagName: 'br',
                    },
                  ],
                  bar: {
                    '@type': '@builder.io/sdk:Element',
                    tagName: 'br',
                  },
                },
              },
            },
          },
        ],
      },
    };
    const builderToMitosis = builderContentToMitosisComponent(builderJson);
    const mitosis = componentToMitosis()({ component: builderToMitosis });
    expect(mitosis).toMatchInlineSnapshot(`
      "import { TestComponent } from \\"@components\\";

      export default function MyComponent(props) {
        return (
          <TestComponent
            prop={null}
            items={{
              foo: [
                {
                  \\"@type\\": \\"@builder.io/sdk:Element\\",
                  tagName: \\"div\\",
                  children: [
                    {
                      \\"@type\\": \\"@builder.io/sdk:Element\\",
                      tagName: \\"br\\",
                    },
                  ],
                },
                {
                  \\"@type\\": \\"@builder.io/sdk:Element\\",
                  tagName: \\"br\\",
                },
              ],
              bar: {
                \\"@type\\": \\"@builder.io/sdk:Element\\",
                tagName: \\"br\\",
              },
            }}
          />
        );
      }
      "
    `);

    const backToMitosis = parseJsx(mitosis);
    const backToBuilder = componentToBuilder()({ component: backToMitosis });
    expect(backToBuilder).toMatchInlineSnapshot(`
      {
        "data": {
          "blocks": [
            {
              "@type": "@builder.io/sdk:Element",
              "actions": {},
              "bindings": {},
              "children": [],
              "code": {
                "actions": {},
                "bindings": {},
              },
              "component": {
                "name": "TestComponent",
                "options": {
                  "items": {
                    "bar": {
                      "@type": "@builder.io/sdk:Element",
                      "tagName": "br",
                    },
                    "foo": [
                      {
                        "@type": "@builder.io/sdk:Element",
                        "children": [
                          {
                            "@type": "@builder.io/sdk:Element",
                            "tagName": "br",
                          },
                        ],
                        "tagName": "div",
                      },
                      {
                        "@type": "@builder.io/sdk:Element",
                        "tagName": "br",
                      },
                    ],
                  },
                  "prop": null,
                },
              },
            },
          ],
          "jsCode": "",
          "tsCode": "",
        },
      }
    `);
  });
});
