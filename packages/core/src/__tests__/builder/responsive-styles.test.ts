import { BuilderElement } from '@builder.io/sdk';
import { describe, expect, test } from 'vitest';
import { getStyleStringFromBlock } from '../../parsers/builder/builder';

const options = {
  escapeInvalidCode: true,
  includeMeta: true,
  includeSpecialBindings: true,
};

describe('Responsive Styles', () => {
  test('preserve bound media query styles when converting to mitosis', () => {
    const content = {
      data: {
        blocks: [
          {
            '@type': '@builder.io/sdk:Element' as const,
            bindings: {
              'responsiveStyles.small.left': 'state.left',
              'responsiveStyles.small.top': 'state.top',
              'responsiveStyles.large.color': 'state.color',
              'style.fontSize': 'state.fontSize',
              'style.background': '"red"',
              'responsiveStyles.large.background': '"green"',
            },
          },
        ],
      },
    };

    const mitosis = builderContentToMitosisComponent(content);
    expect(mitosis.children[0].bindings).toMatchInlineSnapshot(`
      {
        "style": {
          "bindingType": "expression",
          "code": "{ fontSize: state.fontSize, background: \\"red\\", \\"@media (max-width: 640px)\\": { left: state.left, top: state.top }, \\"@media (max-width: 1200px)\\": { color: state.color, background: \\"green\\" }, }",
          "type": "single",
        },
      }
    `);

    const jsx = componentToMitosis()({ component: mitosis });
    expect(jsx).toMatchInlineSnapshot(`
          "export default function MyComponent(props) {
            return (
              <div
                style={{
                  fontSize: state.fontSize,
                  background: \\"red\\",
                  \\"@media (max-width: 640px)\\": {
                    left: state.left,
                    top: state.top,
                  },
                  \\"@media (max-width: 1200px)\\": {
                    color: state.color,
                    background: \\"green\\",
                  },
                }}
              />
            );
          }
          "
        `);

    const json = componentToBuilder()({ component: mitosis });
    expect(json).toMatchInlineSnapshot(`
          {
            "data": {
              "blocks": [
                {
                  "@type": "@builder.io/sdk:Element",
                  "actions": {},
                  "bindings": {
                    "responsiveStyles.large.background": "\\"green\\"",
                    "responsiveStyles.large.color": "state.color",
                    "responsiveStyles.small.left": "state.left",
                    "responsiveStyles.small.top": "state.top",
                    "style.background": "\\"red\\"",
                    "style.fontSize": "state.fontSize",
                  },
                  "children": [],
                  "code": {
                    "actions": {},
                    "bindings": {},
                  },
                  "properties": {},
                  "tagName": "div",
                },
              ],
              "jsCode": "",
              "tsCode": "",
            },
          }
        `);
  });
  test('should handle component.options.responsiveStyles correctly', () => {
    const block: BuilderElement = {
      '@type': '@builder.io/sdk:Element',
      bindings: {
        'component.options.responsiveStyles.medium.flexDirection':
          'state.reverseColumnsWhenStacked && (state.stackColumnsAt === "tablet" || state.stackColumnsAt === "mobile") ? "column-reverse" : undefined',
        'component.options.responsiveStyles.small.flexDirection':
          'state.reverseColumnsWhenStacked && state.stackColumnsAt === "mobile" ? "column-reverse" : undefined',
      },
    };

    const result = getStyleStringFromBlock(block, options);
    console.log('Test 1 - Actual result:', result);

    // Should contain both media queries
    expect(result).toContain('@media (max-width: 991px)');
    expect(result).toContain('@media (max-width: 640px)');

    // Should contain the correct flexDirection bindings
    expect(result).toContain(
      'flexDirection: state.reverseColumnsWhenStacked && (state.stackColumnsAt === "tablet" || state.stackColumnsAt === "mobile") ? "column-reverse" : undefined',
    );
    expect(result).toContain(
      'flexDirection: state.reverseColumnsWhenStacked && state.stackColumnsAt === "mobile" ? "column-reverse" : undefined',
    );
  });

  test('should handle multiple responsive styles for the same breakpoint', () => {
    const block: BuilderElement = {
      '@type': '@builder.io/sdk:Element',
      bindings: {
        'component.options.responsiveStyles.medium.flexDirection':
          'state.reverseColumnsWhenStacked ? "column-reverse" : "column"',
        'component.options.responsiveStyles.medium.alignItems': 'state.alignItems || "center"',
        'component.options.responsiveStyles.medium.justifyContent':
          'state.justifyContent || "flex-start"',
      },
    };

    const result = getStyleStringFromBlock(block, options);

    // Should contain the media query
    expect(result).toContain('@media (max-width: 991px)');

    // Should contain all three style properties
    expect(result).toContain(
      'flexDirection: state.reverseColumnsWhenStacked ? "column-reverse" : "column"',
    );
    expect(result).toContain('alignItems: state.alignItems || "center"');
    expect(result).toContain('justifyContent: state.justifyContent || "flex-start"');
  });

  test('should handle empty bindings', () => {
    const block: BuilderElement = {
      '@type': '@builder.io/sdk:Element',
      bindings: {},
    };

    const result = getStyleStringFromBlock(block, options);
    expect(result).toBe('');
  });
});
