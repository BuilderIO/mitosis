import { componentToMitosis } from '@/generators/mitosis';
import { builderContentToMitosisComponent } from '@/parsers/builder';
import { describe, test } from 'vitest';

describe('Builder Invalid JSX Flag', () => {
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
                        children: [],
                        tagName: 'input',
                        properties: {
                          type: 'input',
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
      escapeInvalidCode: true,
    });
    expect(builderToMitosis).toMatchInlineSnapshot(`
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
                      "children": [],
                      "meta": {},
                      "name": "input",
                      "properties": {
                        "type": "input",
                      },
                      "scope": {},
                      "slots": {},
                    },
                  ],
                  "title": [
                    {
                      "@type": "@builder.io/mitosis/node",
                      "bindings": {},
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
    const mitosis = componentToMitosis({ prettier: false })({
      component: builderToMitosis,
    });
    expect(mitosis).toMatchInlineSnapshot(`
      "import { BuilderAccordion } from '@components';










      export default function MyComponent(props) {









        return (
          <BuilderAccordion  />
          )
      }"
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
    expect(builderToMitosis).toMatchInlineSnapshot(`
      {
        "@type": "@builder.io/mitosis/component",
        "children": [
          {
            "@type": "@builder.io/mitosis/node",
            "bindings": {},
            "blocksSlots": {
              "slides": [
                {
                  "content": [
                    {
                      "@type": "@builder.io/mitosis/node",
                      "bindings": {
                        "onClick": {
                          "async": undefined,
                          "bindingType": "expression",
                          "code": "{ state.pasttime = !state.pasttime;
       }",
                          "type": "single",
                        },
                      },
                      "blocksSlots": {},
                      "children": [],
                      "meta": {},
                      "name": "div",
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
            "name": "BuilderCarousel",
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
    const mitosis = componentToMitosis({ prettier: false })({
      component: builderToMitosis,
    });
    expect(mitosis).toMatchInlineSnapshot(`
      "import { BuilderCarousel } from '@components';










      export default function MyComponent(props) {









        return (
          <BuilderCarousel  />
          )
      }"
    `);
  });
});
