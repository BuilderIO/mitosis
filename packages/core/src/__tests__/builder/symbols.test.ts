import { componentToBuilder } from '@/generators/builder';
import { componentToMitosis } from '@/generators/mitosis';
import { builderContentToMitosisComponent } from '@/parsers/builder';
import { parseJsx } from '@/parsers/jsx';
import { describe, test } from 'vitest';

describe('Builder Symbols', () => {
  test('no data loss occurs when parsing and generating symbols', () => {
    const builderJson = {
      data: {
        blocks: [
          {
            '@type': '@builder.io/sdk:Element' as const,
            id: 'builder-281c8c0da7be4f8a923f872d4825f14d',
            component: {
              name: 'Symbol',
              options: {
                symbol: {
                  data: {},
                  model: 'symbol',
                  entry: 'ce58d5d74c21469496725f27b8781498',
                  ownerId: 'YJIGb4i01jvw0SRdL5Bt',
                  global: false,
                },
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
        "bindings": {
          "symbol": {
            "bindingType": "expression",
            "code": "{\\"data\\":{},\\"model\\":\\"symbol\\",\\"entry\\":\\"ce58d5d74c21469496725f27b8781498\\",\\"ownerId\\":\\"YJIGb4i01jvw0SRdL5Bt\\",\\"global\\":false}",
            "type": "single",
          },
        },
        "children": [],
        "meta": {},
        "name": "Symbol",
        "properties": {},
        "scope": {},
      }
    `);

    const mitosis = componentToMitosis({})({
      component: builderToMitosis,
    });
    expect(mitosis).toMatchInlineSnapshot(`
      "import { Symbol } from \\"@components\\";

      export default function MyComponent(props) {
        return (
          <Symbol
            symbol={{
              data: {},
              model: \\"symbol\\",
              entry: \\"ce58d5d74c21469496725f27b8781498\\",
              ownerId: \\"YJIGb4i01jvw0SRdL5Bt\\",
              global: false,
            }}
          />
        );
      }
      "
    `);

    const backToMitosis = parseJsx(mitosis);
    expect(backToMitosis.children[0]).toMatchInlineSnapshot(`
      {
        "@type": "@builder.io/mitosis/node",
        "bindings": {
          "symbol": {
            "bindingType": "expression",
            "code": "{
        data: {},
        model: \\"symbol\\",
        entry: \\"ce58d5d74c21469496725f27b8781498\\",
        ownerId: \\"YJIGb4i01jvw0SRdL5Bt\\",
        global: false
      }",
            "type": "single",
          },
        },
        "children": [],
        "meta": {},
        "name": "Symbol",
        "properties": {},
        "scope": {},
      }
    `);

    const backToBuilder = componentToBuilder()({ component: backToMitosis });
    // no data loss means the component payloads are exactly the same
    expect(backToBuilder.data!.blocks![0].component).toEqual(builderJson.data.blocks[0].component);
  });
});
