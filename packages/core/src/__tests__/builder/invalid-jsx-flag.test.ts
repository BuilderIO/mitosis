import { componentToMitosis } from '@/generators/mitosis';
import { builderContentToMitosisComponent } from '@/parsers/builder';
import { describe, test } from 'vitest';

describe('Builder Invalid JSX Flag', () => {
  describe('escapeInvalidCode: true', () => {
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

      expect(builderToMitosis.children[0].bindings.style).toMatchInlineSnapshot(`
        {
          "bindingType": "expression",
          "code": "{ marginTop: \`state.isDropdownOpen ? window.innerWidth <= 640 ? \\"25
        0px\\" : \\"100px\\" : \\"0\\" [INVALID CODE]\`, \\"@media (max-width: 991px)\\": { marginTop: \`state.isDropdownOpen ? window.innerWidth <= 640 ? \\"25
        0px\\" : \\"100px\\" : \\"0\\" [INVALID CODE]\` }, }",
          "type": "single",
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

      expect(builderToMitosis.children[0].bindings).toMatchInlineSnapshot(`
        {
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

  describe('escapeInvalidCode: false', () => {
    test('invalid CSS binding is dropped', () => {
      const builderJson = {
        data: {
          blocks: [
            {
              '@type': '@builder.io/sdk:Element' as const,
              bindings: {
                'style.marginTop':
                  'state.isDropdownOpen ? window.innerWidth <= 640 ? "25\r\n0px" : "100px" : "0"',
                'responsiveStyles.medium.marginTop': 'state.marginTop',
              },
            },
          ],
        },
      };
      const builderToMitosis = builderContentToMitosisComponent(builderJson);

      expect(builderToMitosis.children[0].bindings.style).toMatchInlineSnapshot(`
        {
          "bindingType": "expression",
          "code": "{ \\"@media (max-width: 991px)\\": { marginTop: state.marginTop }, }",
          "type": "single",
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
                \\"@media (max-width: 991px)\\": {
                  marginTop: state.marginTop,
                },
              }}
            />
          );
        }
        "
      `);
    });

    test('invalid binding is dropped', () => {
      const builderJson = {
        data: {
          blocks: [
            {
              '@type': '@builder.io/sdk:Element' as const,
              bindings: {
                onClick: 'state.',
                foo: 'bar',
              },
            },
          ],
        },
      };
      const builderToMitosis = builderContentToMitosisComponent(builderJson);

      expect(builderToMitosis.children[0].bindings).toMatchInlineSnapshot(`
        {
          "foo": {
            "bindingType": "expression",
            "code": "bar",
            "type": "single",
          },
        }
      `);

      const mitosis = componentToMitosis({})({
        component: builderToMitosis,
      });
      expect(mitosis).toMatchInlineSnapshot(`
        "export default function MyComponent(props) {
          return <div foo={bar} />;
        }
        "
      `);
    });
  });
});
