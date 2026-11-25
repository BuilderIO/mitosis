import { componentToBuilder } from '@/generators/builder';
import { parseJsx } from '@/parsers/jsx';
import { describe, expect, test } from 'vitest';

const findImage = (blocks: any[]): any => {
  for (const block of blocks ?? []) {
    if (block.component?.name === 'Image') return block;
    const nested = findImage(block.children ?? []);
    if (nested) return nested;
  }
};

describe('Linked built-in elements', () => {
  test.each([
    ['$tagName', '$tagName="a"'],
    ['_tagName', '_tagName="a"'],
  ])('keeps the anchor tag and href when encoded as %s', (_label, tagAttr) => {
    const code = `
      import { Fragment, Image } from "@components";
      export default function MyComponent(props) {
        return (
          <Fragment>
            <Image ${tagAttr} href="/" image="https://example.com/a.jpg" linkUrl="/" />
          </Fragment>
        );
      }
    `;
    const builderJson: any = componentToBuilder()({ component: parseJsx(code) });
    const image = findImage(builderJson.data.blocks);

    expect(image.tagName).toBe('a');
    expect(image.properties).toEqual({ href: '/' });
    expect(image.component.options.href).toBeUndefined();
    expect(image.component.options.linkUrl).toBe('/');
  });

  test('does not add tag or properties to an unlinked Image', () => {
    const code = `
      import { Fragment, Image } from "@components";
      export default function MyComponent(props) {
        return (
          <Fragment>
            <Image image="https://example.com/a.jpg" />
          </Fragment>
        );
      }
    `;
    const builderJson: any = componentToBuilder()({ component: parseJsx(code) });
    const image = findImage(builderJson.data.blocks);

    expect(image.tagName).toBeUndefined();
    expect(image.properties).toBeUndefined();
  });
  test('keeps a plain href input on a component that is not linked', () => {
    const code = `
      import { Fragment, MyLink } from "@components";
      export default function MyComponent(props) {
        return (
          <Fragment>
            <MyLink href="/pricing" label="Go" />
          </Fragment>
        );
      }
    `;
    const builderJson: any = componentToBuilder()({ component: parseJsx(code) });
    const link = findImage(builderJson.data.blocks) ?? builderJson.data.blocks[0].children[0];

    expect(link.component.options.href).toBe('/pricing');
    expect(link.properties).toBeUndefined();
    expect(link.tagName).toBeUndefined();
  });

  test('does not set a tag on a component that has a tag but no href', () => {
    const code = `
      import { Fragment, Image } from "@components";
      export default function MyComponent(props) {
        return (
          <Fragment>
            <Image $tagName="section" image="https://example.com/a.jpg" />
          </Fragment>
        );
      }
    `;
    const builderJson: any = componentToBuilder()({ component: parseJsx(code) });
    const image = findImage(builderJson.data.blocks);

    expect(image.tagName).toBeUndefined();
    expect(image.properties).toBeUndefined();
  });
  test('keeps a plain href input on a non-anchor component with a tag', () => {
    const code = `
      import { Fragment, Image } from "@components";
      export default function MyComponent(props) {
        return (
          <Fragment>
            <Image $tagName="section" href="/pricing" image="https://example.com/a.jpg" />
          </Fragment>
        );
      }
    `;
    const builderJson: any = componentToBuilder()({ component: parseJsx(code) });
    const image = findImage(builderJson.data.blocks);

    expect(image.component.options.href).toBe('/pricing');
    expect(image.tagName).toBeUndefined();
    expect(image.properties).toBeUndefined();
  });
});
