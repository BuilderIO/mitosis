import { BuilderElement } from '@builder.io/sdk';
import { describe, expect, test } from 'vitest';
import { getStyleStringFromBlock } from '../../parsers/builder/builder';

const options = {
  escapeInvalidCode: true,
  includeMeta: true,
  includeSpecialBindings: true,
};

describe('Responsive Styles', () => {
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

  test('should handle invalid code with escapeInvalidCode option', () => {
    const block: BuilderElement = {
      '@type': '@builder.io/sdk:Element',
      bindings: {
        'component.options.responsiveStyles.medium.flexDirection': 'invalid code {',
        'component.options.responsiveStyles.small.flexDirection': 'also invalid }',
      },
    };

    const result = getStyleStringFromBlock(block, { escapeInvalidCode: true });

    // Should contain the escaped invalid code
    expect(result).toContain('`invalid code { [INVALID CODE]`');
    expect(result).toContain('`also invalid } [INVALID CODE]`');
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
