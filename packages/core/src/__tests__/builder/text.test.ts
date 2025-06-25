import { componentToBuilder } from '@/generators/builder';
import { componentToMitosis } from '@/generators/mitosis';
import { dedent } from '@/helpers/dedent';
import { builderContentToMitosisComponent } from '@/parsers/builder';
import { parseJsx } from '@/parsers/jsx';
import {
  compileAwayBuilderComponentsFromTree,
  components as compileAwayComponents,
} from '@/plugins/compile-away-builder-components';
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
        "children": [],
        "meta": {},
        "name": "Text",
        "properties": {
          "$tagName": undefined,
          "text": "<h1>Hello World</h1>",
        },
        "scope": {},
        "slots": {},
      }
    `);

    const mitosis = componentToMitosis({})({
      component: builderToMitosis,
    });
    expect(mitosis).toMatchInlineSnapshot(`
      "import { Text } from \\"@components\\";

      export default function MyComponent(props) {
        return <Text text=\\"<h1>Hello World</h1>\\" />;
      }
      "
    `);

    const backToMitosis = parseJsx(mitosis);
    expect(backToMitosis.children[0]).toMatchInlineSnapshot(`
      {
        "@type": "@builder.io/mitosis/node",
        "bindings": {},
        "children": [],
        "meta": {},
        "name": "Text",
        "properties": {
          "text": "<h1>Hello World</h1>",
        },
        "scope": {},
      }
    `);

    const backToBuilder = componentToBuilder()({ component: backToMitosis });
    // no data loss means the component payloads are exactly the same
    expect(backToBuilder.data!.blocks![0].component).toEqual(builderJson.data.blocks[0].component);
  });
  test('compile away Text component', () => {
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
            responsiveStyles: {
              large: {
                color: 'red',
              },
            },
          },
        ],
      },
    };
    const builderToMitosis = builderContentToMitosisComponent(builderJson);

    compileAwayBuilderComponentsFromTree(builderToMitosis, compileAwayComponents);

    expect(builderToMitosis.children[0]).toMatchInlineSnapshot(`
      {
        "@type": "@builder.io/mitosis/node",
        "bindings": {
          "css": {
            "bindingType": "expression",
            "code": "{\\"color\\":\\"red\\"}",
            "type": "single",
          },
        },
        "children": [
          {
            "@type": "@builder.io/mitosis/node",
            "bindings": {},
            "children": [],
            "meta": {},
            "name": "div",
            "properties": {
              "$tagName": undefined,
              "_text": "<h1>Hello World</h1>",
            },
            "scope": {},
            "slots": {},
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
          <div
            css={{
              color: \\"red\\",
            }}
          >
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
        "bindings": {
          "css": {
            "bindingType": "expression",
            "code": "{
        color: \\"red\\"
      }",
            "type": "single",
          },
        },
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
    expect(backToBuilder.data!.blocks![0]).toMatchInlineSnapshot(`
      {
        "@type": "@builder.io/sdk:Element",
        "actions": {},
        "bindings": {},
        "children": [
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
                    "text": "Hello World",
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
            "tagName": "h1",
          },
        ],
        "code": {
          "actions": {},
          "bindings": {},
        },
        "properties": {},
        "responsiveStyles": {
          "large": {
            "color": "red",
          },
        },
        "tagName": "div",
      }
    `);
  });
  test('create Text node from jsx', () => {
    const code = dedent`
    export default function MyComponent(props) {
      return (
        <p><Text text="hello world" /></p>
      )
    }
    `;
    const component = parseJsx(code);
    const builderJson = componentToBuilder()({ component });
    expect(builderJson.data!.blocks![0]).toMatchInlineSnapshot(`
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
              "name": "Text",
              "options": {
                "text": "hello world",
              },
            },
          },
        ],
        "code": {
          "actions": {},
          "bindings": {},
        },
        "properties": {},
        "tagName": "p",
      }
    `);
    const backToMitosis = builderContentToMitosisComponent(builderJson);
    expect(backToMitosis.children[0]).toMatchInlineSnapshot(`
      {
        "@type": "@builder.io/mitosis/node",
        "bindings": {},
        "children": [
          {
            "@type": "@builder.io/mitosis/node",
            "bindings": {},
            "children": [],
            "meta": {},
            "name": "Text",
            "properties": {
              "$tagName": undefined,
              "text": "hello world",
            },
            "scope": {},
            "slots": {},
          },
        ],
        "meta": {},
        "name": "p",
        "properties": {},
        "scope": {},
        "slots": {},
      }
    `);

    //compileAwayBuilderComponentsFromTree(backToMitosis, compileAwayComponents);

    expect(backToMitosis).toMatchInlineSnapshot(`
      {
        "@type": "@builder.io/mitosis/component",
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
                "name": "Text",
                "properties": {
                  "$tagName": undefined,
                  "text": "hello world",
                },
                "scope": {},
                "slots": {},
              },
            ],
            "meta": {},
            "name": "p",
            "properties": {},
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

    const backToJSX = componentToMitosis()({
      component: backToMitosis,
    });
    expect(backToJSX).toMatchInlineSnapshot(`
      "import { Text } from \\"@components\\";

      export default function MyComponent(props) {
        return (
          <p>
            <Text text=\\"hello world\\" />
          </p>
        );
      }
      "
    `);
  });
});
