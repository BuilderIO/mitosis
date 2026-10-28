import { componentToBuilder } from '@/generators/builder';
import { componentToMitosis } from '@/generators/mitosis';
import { babelTransformExpression } from '@/helpers/babel-transform';
import { builderContentToMitosisComponent } from '@/parsers/builder';
import { parseJsx } from '@/parsers/jsx';
import { describe, expect, test } from 'vitest';

const nestedText = {
  '@type': '@builder.io/sdk:Element',
  '@version': 2,
  id: 'builder-nested',
  tagName: 'div',
  bindings: {
    'style.color': 'var _virtual_index=state.theme.colors.text;return _virtual_index',
  },
  code: { bindings: { 'style.color': 'state.theme.colors.text' } },
  component: { name: 'Text', options: { text: '<p>hi</p>' } },
};

const customTabContent = {
  react_none_gen1: [],
  graphql_none_gen1: [nestedText],
};

const content = {
  data: {
    blocks: [
      {
        '@type': '@builder.io/sdk:Element',
        id: 'builder-root',
        component: { name: 'CodeSnippets', options: { customTabContent } },
      },
    ],
  },
} as any;

describe('object options holding Builder blocks', () => {
  test('treats an object literal with an underscored first key as an expression', () => {
    // Parsed as a labeled block (`foo_bar: [1];`) when not recognized as an object literal.
    expect(babelTransformExpression(`{foo_bar: [1]}`, {})).toBe('{\n  foo_bar: [1]\n}');
  });

  test('serializes to Mitosis JSX and parses back to the same option value', () => {
    const jsx = componentToMitosis()({ component: builderContentToMitosisComponent(content) });
    const roundTripped = componentToBuilder()({ component: parseJsx(jsx) }) as any;
    const option =
      roundTripped.data.blocks[0].children?.[0]?.component?.options?.customTabContent ??
      roundTripped.data.blocks[0].component.options.customTabContent;
    expect(option).toEqual(customTabContent);
  });
});
