import { componentToBuilder } from '@/generators/builder';
import { componentToMitosis } from '@/generators/mitosis';
import { builderContentToMitosisComponent } from '@/parsers/builder';
import { parseJsx } from '@/parsers/jsx';
import { describe, test } from 'vitest';

describe('Builder Invalid JSX Flag', () => {
  test.only('liam2', () => {
    const jsx = parseJsx(`export default function MyFunction() { 
      return (
        <Cmp
          items={{
            foo: [<div><br /></div>],
            bar: [<br />],
            baz: <div></div>
          }}
        />
      )
    }`);

    expect(jsx.children[0]).toMatchInlineSnapshot(`
      {
        "@type": "@builder.io/mitosis/node",
        "bindings": {},
        "blocksSlots": {
          "items": {
            "bar": [
              {
                "@type": "@builder.io/mitosis/node",
                "bindings": {},
                "blocksSlots": {},
                "children": [],
                "meta": {},
                "name": "br",
                "properties": {},
                "scope": {},
              },
            ],
            "baz": {
              "@type": "@builder.io/mitosis/node",
              "bindings": {},
              "blocksSlots": {},
              "children": [],
              "meta": {},
              "name": "div",
              "properties": {},
              "scope": {},
            },
            "foo": [
              {
                "@type": "@builder.io/mitosis/node",
                "bindings": {},
                "blocksSlots": {},
                "children": [
                  {
                    "@type": "@builder.io/mitosis/node",
                    "bindings": {},
                    "blocksSlots": {},
                    "children": [],
                    "meta": {},
                    "name": "br",
                    "properties": {},
                    "scope": {},
                  },
                ],
                "meta": {},
                "name": "div",
                "properties": {},
                "scope": {},
              },
            ],
          },
        },
        "children": [],
        "meta": {},
        "name": "Cmp",
        "properties": {},
        "scope": {},
      }
    `);
  });
  test('liam', () => {
    const jsx = parseJsx(`export default function MyFunction() { 
      return (
        <Cmp
          items={[
            { foo: [<div><br /></div>], bar: [<br />], baz: <div></div> }
          ]}
        />
      )
    }`);
    expect(jsx.children[0]).toMatchInlineSnapshot(`
      {
        "@type": "@builder.io/mitosis/node",
        "bindings": {},
        "blocksSlots": {
          "items": [
            {
              "bar": [
                {
                  "@type": "@builder.io/mitosis/node",
                  "bindings": {},
                  "blocksSlots": {},
                  "children": [],
                  "meta": {},
                  "name": "br",
                  "properties": {},
                  "scope": {},
                },
              ],
              "baz": {
                "@type": "@builder.io/mitosis/node",
                "bindings": {},
                "blocksSlots": {},
                "children": [],
                "meta": {},
                "name": "div",
                "properties": {},
                "scope": {},
              },
              "foo": [
                {
                  "@type": "@builder.io/mitosis/node",
                  "bindings": {},
                  "blocksSlots": {},
                  "children": [
                    {
                      "@type": "@builder.io/mitosis/node",
                      "bindings": {},
                      "blocksSlots": {},
                      "children": [],
                      "meta": {},
                      "name": "br",
                      "properties": {},
                      "scope": {},
                    },
                  ],
                  "meta": {},
                  "name": "div",
                  "properties": {},
                  "scope": {},
                },
              ],
            },
          ],
        },
        "children": [],
        "meta": {},
        "name": "Cmp",
        "properties": {},
        "scope": {},
      }
    `);
  });
  test('compile accordion', () => {
    const builderJson = {
      data: {
        blocks: [
          {
            '@type': '@builder.io/sdk:Element' as const,
            '@version': 2,
            id: 'builder-e5da40f1af054a0bae1d090bec37b620',
            component: {
              name: 'Builder:Accordion',
              options: {
                items: [
                  {
                    title: [
                      {
                        '@type': '@builder.io/sdk:Element',
                        '@version': 2,
                        id: 'builder-f1b81f6bcad34f4b96c1f4d081086890',
                        children: [],
                        component: {
                          name: 'Text',
                          options: {
                            text: 'Title Text',
                          },
                        },
                      },
                    ],
                    detail: [
                      {
                        '@type': '@builder.io/sdk:Element',
                        '@version': 2,
                        id: 'builder-f1b81f6bcad34f4b96c1f4d081086890',
                        children: [
                          {
                            '@type': '@builder.io/sdk:Element' as const,
                            '@version': 2,
                            id: 'builder-e5da40f1af054a0bae1d090bec37b620',
                            component: {
                              name: 'Builder:Accordion',
                              options: {
                                items: [
                                  {
                                    title: [
                                      {
                                        '@type': '@builder.io/sdk:Element',
                                        '@version': 2,
                                        id: 'builder-f1b81f6bcad34f4b96c1f4d081086890',
                                        children: [],
                                        component: {
                                          name: 'Text',
                                          options: {
                                            text: 'Title Text',
                                          },
                                        },
                                      },
                                      {
                                        '@type': '@builder.io/sdk:Element',
                                        '@version': 2,
                                        id: 'builder-f1b81f6bcad34f4b96c1f4d081086890',
                                        children: [],
                                        component: {
                                          name: 'Text',
                                          options: {
                                            text: 'Title Part Two',
                                          },
                                        },
                                      },
                                    ],
                                    detail: [
                                      {
                                        '@type': '@builder.io/sdk:Element',
                                        '@version': 2,
                                        id: 'builder-f1b81f6bcad34f4b96c1f4d081086890',
                                        children: [],
                                        tagName: 'div',
                                      },
                                    ],
                                  },
                                ],
                              },
                            },
                          },
                        ],
                        tagName: 'div',
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
      escapeInvalidCode: true,
    });
    const mitosis = componentToMitosis()({
      component: builderToMitosis,
    });
    expect(mitosis).toMatchInlineSnapshot(`
      "import { BuilderAccordion } from \\"@components\\";

      export default function MyComponent(props) {
        return (
          <BuilderAccordion
            items={[
              {
                title: [<div>Title Text</div>],
                detail: [
                  <div>
                    <BuilderAccordion
                      items={[
                        {
                          title: [<div>Title Text</div>, <div>Title Part Two</div>],
                          detail: [<div />],
                        },
                      ]}
                    />
                  </div>,
                ],
              },
            ]}
          />
        );
      }
      "
    `);

    const backToMitosis = parseJsx(mitosis);
    expect(backToMitosis).toMatchInlineSnapshot(`
      {
        "@type": "@builder.io/mitosis/component",
        "children": [
          {
            "@type": "@builder.io/mitosis/node",
            "bindings": {},
            "blocksSlots": {
              "items": [
                {
                  "detail": [
                    {
                      "@type": "@builder.io/mitosis/node",
                      "bindings": {},
                      "blocksSlots": {},
                      "children": [
                        {
                          "@type": "@builder.io/mitosis/node",
                          "bindings": {},
                          "blocksSlots": {
                            "items": [
                              {
                                "detail": [
                                  {
                                    "@type": "@builder.io/mitosis/node",
                                    "bindings": {},
                                    "blocksSlots": {},
                                    "children": [],
                                    "meta": {},
                                    "name": "div",
                                    "properties": {},
                                    "scope": {},
                                  },
                                ],
                                "title": [
                                  {
                                    "@type": "@builder.io/mitosis/node",
                                    "bindings": {},
                                    "blocksSlots": {},
                                    "children": [
                                      {
                                        "@type": "@builder.io/mitosis/node",
                                        "bindings": {},
                                        "children": [],
                                        "meta": {},
                                        "name": "div",
                                        "properties": {
                                          "_text": "Title Text",
                                        },
                                        "scope": {},
                                      },
                                    ],
                                    "meta": {},
                                    "name": "div",
                                    "properties": {},
                                    "scope": {},
                                  },
                                  {
                                    "@type": "@builder.io/mitosis/node",
                                    "bindings": {},
                                    "blocksSlots": {},
                                    "children": [
                                      {
                                        "@type": "@builder.io/mitosis/node",
                                        "bindings": {},
                                        "children": [],
                                        "meta": {},
                                        "name": "div",
                                        "properties": {
                                          "_text": "Title Part Two",
                                        },
                                        "scope": {},
                                      },
                                    ],
                                    "meta": {},
                                    "name": "div",
                                    "properties": {},
                                    "scope": {},
                                  },
                                ],
                              },
                            ],
                          },
                          "children": [],
                          "meta": {},
                          "name": "BuilderAccordion",
                          "properties": {},
                          "scope": {},
                        },
                      ],
                      "meta": {},
                      "name": "div",
                      "properties": {},
                      "scope": {},
                    },
                  ],
                  "title": [
                    {
                      "@type": "@builder.io/mitosis/node",
                      "bindings": {},
                      "blocksSlots": {},
                      "children": [
                        {
                          "@type": "@builder.io/mitosis/node",
                          "bindings": {},
                          "children": [],
                          "meta": {},
                          "name": "div",
                          "properties": {
                            "_text": "Title Text",
                          },
                          "scope": {},
                        },
                      ],
                      "meta": {},
                      "name": "div",
                      "properties": {},
                      "scope": {},
                    },
                  ],
                },
              ],
            },
            "children": [],
            "meta": {},
            "name": "BuilderAccordion",
            "properties": {},
            "scope": {},
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
        "imports": [
          {
            "importKind": "value",
            "imports": {
              "BuilderAccordion": "BuilderAccordion",
            },
            "path": "@components",
          },
        ],
        "inputs": [],
        "meta": {},
        "name": "MyComponent",
        "refs": {},
        "state": {},
        "subComponents": [],
      }
    `);

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
                "name": "Builder:Accordion",
                "options": {
                  "items": [
                    {
                      "detail": [
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
                              "component": {
                                "name": "Builder:Accordion",
                                "options": {
                                  "items": [
                                    {
                                      "detail": [
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
                                      "title": [
                                        {
                                          "@type": "@builder.io/sdk:Element",
                                          "actions": {},
                                          "bindings": {},
                                          "children": [
                                            {
                                              "@type": "@builder.io/sdk:Element",
                                              "bindings": {},
                                              "component": {
                                                "name": "Text",
                                                "options": {
                                                  "text": "Title Text",
                                                },
                                              },
                                              "tagName": "span",
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
                                          "children": [
                                            {
                                              "@type": "@builder.io/sdk:Element",
                                              "bindings": {},
                                              "component": {
                                                "name": "Text",
                                                "options": {
                                                  "text": "Title Part Two",
                                                },
                                              },
                                              "tagName": "span",
                                            },
                                          ],
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
                          "code": {
                            "actions": {},
                            "bindings": {},
                          },
                          "properties": {},
                          "tagName": "div",
                        },
                      ],
                      "title": [
                        {
                          "@type": "@builder.io/sdk:Element",
                          "actions": {},
                          "bindings": {},
                          "children": [
                            {
                              "@type": "@builder.io/sdk:Element",
                              "bindings": {},
                              "component": {
                                "name": "Text",
                                "options": {
                                  "text": "Title Text",
                                },
                              },
                              "tagName": "span",
                            },
                          ],
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
  test('compile carousel', () => {
    const builderJson = {
      data: {
        blocks: [
          {
            '@type': '@builder.io/sdk:Element' as const,
            '@version': 2,
            id: 'builder-01964d9c9f664d708ce2c0f2ce60d6bf',
            component: {
              name: 'Builder:Carousel',
              options: {
                slides: [
                  {
                    content: [
                      {
                        '@type': '@builder.io/sdk:Element',
                        '@version': 2,
                        actions: {
                          click: 'state.pasttime=!state.pasttime',
                        },
                        code: {
                          actions: {
                            click: 'state.pasttime = !state.pasttime;\n',
                          },
                        },
                        id: 'builder-885fec6ed5c14957a492c29c4ea7efc4',
                        children: [],
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
      escapeInvalidCode: true,
    });
    const mitosis = componentToMitosis()({
      component: builderToMitosis,
    });
    expect(mitosis).toMatchInlineSnapshot(`
      "import { BuilderCarousel } from \\"@components\\";

      export default function MyComponent(props) {
        return (
          <BuilderCarousel
            slides={[
              {
                content: [
                  <div
                    onClick={(event) => {
                      state.pasttime = !state.pasttime;
                    }}
                  />,
                ],
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
              "bindings": {
                "component.options.slides": " return [{
        content: [<div onClick={event => {
          state.pasttime = !state.pasttime;
        }} />]
      }]",
              },
              "children": [],
              "code": {
                "actions": {},
                "bindings": {
                  "component.options.slides": "[{
        content: [<div onClick={event => {
          state.pasttime = !state.pasttime;
        }} />]
      }]",
                },
              },
              "component": {
                "name": "Builder:Carousel",
                "options": {},
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
