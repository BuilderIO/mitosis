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
  });
});
