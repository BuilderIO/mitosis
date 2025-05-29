import { componentToBuilder } from '@/generators/builder';
import { componentToMitosis } from '@/generators/mitosis';
import { builderContentToMitosisComponent } from '@/parsers/builder';
import { parseJsx } from '@/parsers/jsx';
import { describe, test } from 'vitest';

describe('Builder Text node', () => {
  test('preserve Text component', () => {
    const builderJson = {
      data: {
        blocks: [
          {
            '@type': '@builder.io/sdk:Element' as const,
            id: 'builder-281c8c0da7be4f8a923f872d4825f14d',
            component: {
              name: 'Text',
              options: {
                text: '<h1>Hello World</h1>',
              },
            },
          },
        ],
      },
    };
    const builderToMitosis = builderContentToMitosisComponent(builderJson);

    expect(builderToMitosis.children[0]).toMatchInlineSnapshot(`
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
              "_text": "<h1>Hello World</h1>",
            },
            "scope": {},
          },
        ],
        "meta": {},
        "name": "div",
        "properties": {},
        "scope": {},
      }
    `);

    const mitosis = componentToMitosis({})({
      component: builderToMitosis,
    });
    expect(mitosis).toMatchInlineSnapshot(`
      "export default function MyComponent(props) {
        return (
          <div>
            <h1>Hello World</h1>
          </div>
        );
      }
      "
    `);

    const backToMitosis = parseJsx(mitosis);
    expect(backToMitosis.children[0]).toMatchInlineSnapshot(`
      {
        "@type": "@builder.io/mitosis/node",
        "bindings": {},
        "children": [
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
                  "_text": "Hello World",
                },
                "scope": {},
              },
            ],
            "meta": {},
            "name": "h1",
            "properties": {},
            "scope": {},
          },
        ],
        "meta": {},
        "name": "div",
        "properties": {},
        "scope": {},
      }
    `);

    const backToBuilder = componentToBuilder()({ component: backToMitosis });
    // no data loss means the component payloads are exactly the same
    expect(backToBuilder.data!.blocks![0].component).toEqual(builderJson.data.blocks[0].component);
  });
});
