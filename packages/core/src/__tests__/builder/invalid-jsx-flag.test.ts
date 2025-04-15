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

    test('escaping invalid binding does not crash jsx generatoron element', () => {
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

    // Text components have a different code path for bindings than other components
    test('escaping invalid binding does not crash jsx generator on Text component', () => {
      const builderJson = {
        data: {
          blocks: [
            {
              '@type': '@builder.io/sdk:Element' as const,
              bindings: {
                onClick: 'state.',
                foo: 'bar + ',
              },
              component: {
                name: 'Text',
                options: {
                  text: 'Text',
                },
              },
            },
          ],
        },
      };
      const builderToMitosis = builderContentToMitosisComponent(builderJson, {
        escapeInvalidCode: true,
      });
      const mitosis = componentToMitosis({})({
        component: builderToMitosis,
      });
      expect(mitosis).toMatchInlineSnapshot(`
        "export default function MyComponent(props) {
          return (
            <div
              onClick={(event) => \`state. [INVALID CODE]\`}
              foo={\`bar +  [INVALID CODE]\`}
            >
              Text
            </div>
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

    test('invalid binding is dropped on element', () => {
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

    // Text components have a different code path for bindings than other components
    test('invalid binding is dropped on Text component', () => {
      const builderJson = {
        data: {
          blocks: [
            {
              '@type': '@builder.io/sdk:Element' as const,
              bindings: {
                onClick: 'state.',
                foo: 'bar',
              },
              component: {
                name: 'Text',
                options: {
                  text: 'Text',
                },
              },
            },
          ],
        },
      };
      const builderToMitosis = builderContentToMitosisComponent(builderJson);
      const mitosis = componentToMitosis({})({
        component: builderToMitosis,
      });
      expect(mitosis).toMatchInlineSnapshot(`
        "export default function MyComponent(props) {
          return <div foo={bar}>Text</div>;
        }
        "
      `);
    });
  });
});

// https://github.com/BuilderIO/builder-internal/blob/39d18b50928f8c843255637a7c07c41d4277127c/packages/app/functions/transpile.worker.ts#L26-L42
describe('export default transpiling', () => {
  test('convert on element', () => {
    const builderJson = {
      data: {
        blocks: [
          {
            '@type': '@builder.io/sdk:Element' as const,
            bindings: {
              foo: 'export default bar',
            },
            code: {
              bindings: {
                foo: 'export default bar',
              },
            },
          },
        ],
      },
    };
    const builderToMitosis = builderContentToMitosisComponent(builderJson, {
      escapeInvalidCode: true,
    });
    const mitosis = componentToMitosis({})({
      component: builderToMitosis,
    });
    expect(mitosis).toMatchInlineSnapshot(`
      "export default function MyComponent(props) {
        return (
          <div
            foo={function () {
              return bar;
            }}
          />
        );
      }
      "
    `);
  });

  /// Text components have a different code path for bindings than other components
  test('convert on Text component', () => {
    const builderJson = {
      data: {
        blocks: [
          {
            '@type': '@builder.io/sdk:Element' as const,
            bindings: {
              foo: 'export default bar',
            },
            code: {
              bindings: {
                foo: 'export default bar',
              },
            },
            component: {
              name: 'Text',
              options: {
                text: 'Text',
              },
            },
          },
        ],
      },
    };
    const builderToMitosis = builderContentToMitosisComponent(builderJson, {
      escapeInvalidCode: true,
    });
    const mitosis = componentToMitosis({})({
      component: builderToMitosis,
    });
    expect(mitosis).toMatchInlineSnapshot(`
      "export default function MyComponent(props) {
        return (
          <div
            foo={function () {
              return bar;
            }}
          >
            Text
          </div>
        );
      }
      "
    `);
  });
});
