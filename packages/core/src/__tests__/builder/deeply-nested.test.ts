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
                  },
                ],
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
              items={[
                {
                  foo: [
                    <div>
                      <br />
                    </div>,
                    <br />,
                  ],
                  bar: <br />,
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
            items={{
              foo: [
                <div>
                  <br />
                </div>,
                <br />,
              ],
              bar: <br />,
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
