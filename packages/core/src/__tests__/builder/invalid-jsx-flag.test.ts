import { componentToMitosis } from '@/generators/mitosis';
import { builderContentToMitosisComponent } from '@/parsers/builder';
import { describe, test } from 'vitest';

describe('Builder Invalid JSX Flag', () => {
  test('escaping invalid CSS binding does not crash jsx generator', () => {
    const builderJson = {
      data: {
        blocks: [
          {
            '@type': '@builder.io/sdk:Element' as const,
            bindings: {
              'style.marginTop':
                'state.isDropdownOpen ? window.innerWidth <= 640 ? "25\r\n0px" : "100px" : "0"',
              'responsiveStyles.medium.marginTop':
                'state.isDropdownOpen ? window.innerWidth <= 640 ? "25\r\n0px" : "100px" : "0"',
            },
          },
        ],
      },
    };
    const builderToMitosis = builderContentToMitosisComponent(builderJson, {
      escapeInvalidCode: true,
    });

    expect(builderToMitosis.children[0]).toMatchInlineSnapshot(`
      {
        "@type": "@builder.io/mitosis/node",
        "bindings": {
          "style": {
            "bindingType": "expression",
            "code": "{ marginTop: \`state.isDropdownOpen ? window.innerWidth <= 640 ? \\"25
      0px\\" : \\"100px\\" : \\"0\\" [INVALID CODE]\`, \\"@media (max-width: 991px)\\": { marginTop: \`state.isDropdownOpen ? window.innerWidth <= 640 ? \\"25
      0px\\" : \\"100px\\" : \\"0\\" [INVALID CODE]\` }, }",
            "type": "single",
          },
        },
        "children": [],
        "meta": {},
        "name": "div",
        "properties": {},
        "scope": {},
        "slots": {},
      }
    `);

    const mitosis = componentToMitosis({})({
      component: builderToMitosis,
    });
    expect(mitosis).toMatchInlineSnapshot(`
      "export default function MyComponent(props) {
        return (
          <div
            style={{
              marginTop: \`state.isDropdownOpen ? window.innerWidth <= 640 ? \\"25
      0px\\" : \\"100px\\" : \\"0\\" [INVALID CODE]\`,
              \\"@media (max-width: 991px)\\": {
                marginTop: \`state.isDropdownOpen ? window.innerWidth <= 640 ? \\"25
      0px\\" : \\"100px\\" : \\"0\\" [INVALID CODE]\`,
              },
            }}
          />
        );
      }
      "
    `);
  });

  test('escaping invalid binding does not crash jsx generator', () => {
    const builderJson = {
      data: {
        blocks: [
          {
            '@type': '@builder.io/sdk:Element' as const,
            bindings: {
              onClick: 'state.',
              foo: 'bar + ',
            },
          },
        ],
      },
    };
    const builderToMitosis = builderContentToMitosisComponent(builderJson, {
      escapeInvalidCode: true,
    });

    expect(builderToMitosis.children[0]).toMatchInlineSnapshot(`
      {
        "@type": "@builder.io/mitosis/node",
        "bindings": {
          "foo": {
            "bindingType": "expression",
            "code": "\`bar +  [INVALID CODE]\`",
            "type": "single",
          },
          "onClick": {
            "bindingType": "expression",
            "code": "\`state. [INVALID CODE]\`",
            "type": "single",
          },
        },
        "children": [],
        "meta": {},
        "name": "div",
        "properties": {},
        "scope": {},
        "slots": {},
      }
    `);

    const mitosis = componentToMitosis({})({
      component: builderToMitosis,
    });
    expect(mitosis).toMatchInlineSnapshot(`
      "export default function MyComponent(props) {
        return (
          <div
            onClick={(event) => \`state. [INVALID CODE]\`}
            foo={\`bar +  [INVALID CODE]\`}
          />
        );
      }
      "
    `);
  });
});
