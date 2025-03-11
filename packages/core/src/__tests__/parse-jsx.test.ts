import { parseJsx } from '../parsers/jsx';
import { parseStateObjectToMitosisState } from '../parsers/jsx/state';
import { SPEC } from './data/jsx-json.spec';
import { runTestsForJsx } from './test-generator';

import basicBooleanAttribute from './data/basic-boolean-attribute.raw.tsx?raw';
import buttonWithMetadata from './data/blocks/button-with-metadata.raw.tsx?raw';
import basicPropsDestructureRaw from './data/props/basic-props-destructure.raw.tsx?raw';
import basicPropsRaw from './data/props/basic-props.raw.tsx?raw';

describe('Parse JSX', () => {
  test('parseStateObject', () => {
    const out = parseStateObjectToMitosisState(SPEC);
    expect(out).toMatchSnapshot();
  });
  test('boolean attribute', () => {
    const out = parseJsx(basicBooleanAttribute);
    expect(out).toMatchSnapshot();
  });
  test('metadata', () => {
    const json = parseJsx(buttonWithMetadata);
    expect(json).toMatchSnapshot();
  });

  test('custom mitosis package', () => {
    expect(parseJsx(basicPropsRaw)).toEqual(parseJsx(basicPropsDestructureRaw));
  });

  runTestsForJsx();
});

describe('null values', () => {
  test('null is removed from For', () => {
    const result = parseJsx(`
     export default function MyComponent() {
       return (
         <>
            <For>
             {null}
            </For>
         </>
       );
     }
    `);
    expect(result.children[0].children[0]).toMatchInlineSnapshot(`
      {
        "@type": "@builder.io/mitosis/node",
        "bindings": {},
        "children": [],
        "meta": {},
        "name": "For",
        "properties": {},
        "scope": {},
      }
    `);
  });
  test('null expression is removed', () => {
    const result = parseJsx(`
     export default function MyComponent() {
       return (
         <>
            {null}
         </>
       );
     }
    `);
    expect(result.children[0].children).toMatchInlineSnapshot('[]');
  });

  test('null in logical expression is removed', () => {
    const result = parseJsx(`
     export default function MyComponent() {
       return (
         <>
            {foo && null}
         </>
       );
     }
    `);
    expect(result.children[0].children[0]).toMatchInlineSnapshot(`
      {
        "@type": "@builder.io/mitosis/node",
        "bindings": {
          "when": {
            "bindingType": "expression",
            "code": "foo",
            "type": "single",
          },
        },
        "children": [],
        "meta": {},
        "name": "Show",
        "properties": {},
        "scope": {},
      }
    `);
  });

  test('null in conditional expression is removed', () => {
    const result = parseJsx(`
     export default function MyComponent() {
       return (
         <>
            {foo ? "A" : null}
         </>
       );
     }
    `);
    expect(result.children[0].children[0]).toMatchInlineSnapshot(`
      {
        "@type": "@builder.io/mitosis/node",
        "bindings": {
          "when": {
            "bindingType": "expression",
            "code": "foo",
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
              "_text": "A",
            },
            "scope": {},
          },
        ],
        "meta": {},
        "name": "Show",
        "properties": {},
        "scope": {},
      }
    `);
  });
  test('null in map is removed', () => {
    const result = parseJsx(`
     export default function MyComponent() {
       return (
         <>
            {[].map(() => {
              return null;
            })}
         </>
       );
     }
    `);
    expect(result.children[0].children[0]).toMatchInlineSnapshot(`
      {
        "@type": "@builder.io/mitosis/node",
        "bindings": {
          "each": {
            "bindingType": "expression",
            "code": "[]",
            "type": "single",
          },
        },
        "children": [],
        "meta": {},
        "name": "For",
        "properties": {},
        "scope": {},
      }
    `);
  });
  test('null in Show is removed', () => {
    const result = parseJsx(`
     export default function MyComponent() {
       return (
         <>
            <Show when={true} else={null}>A</Show>
         </>
       );
     }
    `);
    expect(result.children[0].children[0]).toMatchInlineSnapshot(`
      {
        "@type": "@builder.io/mitosis/node",
        "bindings": {
          "when": {
            "bindingType": "expression",
            "code": "true",
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
              "_text": "A",
            },
            "scope": {},
          },
        ],
        "meta": {},
        "name": "Show",
        "properties": {},
        "scope": {},
      }
    `);
  });
});
