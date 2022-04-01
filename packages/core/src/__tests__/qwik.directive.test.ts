import { Image } from '../generators/qwik/directives';

describe('qwik directives', () => {
  const partial = expect.objectContaining;
  beforeEach(() => {
    (global as any).h = mockH;
  });
  afterEach(() => ((global as any).h = undefined));
  describe('Image', () => {
    test('altText', () => {
      expect(
        Image({ altText: 'foo', image: 'http://some.url' }).children[0][0],
      ).toEqual(
        partial({
          tag: 'img',
          props: partial({ src: 'http://some.url', alt: 'foo' }),
        }),
      );
      expect(Image({ image: 'http://some.url' }).children[0][0]).toEqual(
        partial({
          tag: 'img',
          props: partial({ src: 'http://some.url', role: 'presentation' }),
        }),
      );
    });
    test('builder-pixel is eager', () => {
      expect(
        Image({
          builderBlock: { id: 'builder-pixel-foo' },
          image: 'http://some.url',
        }).children[0][0],
      ).toEqual(
        partial({
          tag: 'img',
          props: partial({ loading: 'eager' }),
        }),
      );
    });
    test('images are lazy loaded', () => {
      expect(
        Image({
          image: 'http://some.url',
        }).children[0][0],
      ).toEqual(
        partial({
          tag: 'img',
          props: partial({ loading: 'lazy' }),
        }),
      );
    });
    test('builder.io URLs are served using webp', () => {
      expect(
        find(
          'source',
          Image({
            image: 'http://foo.builder.io/foo',
          }),
        ),
      ).toEqual(
        partial({
          tag: 'source',
          props: partial({
            srcset: srcSet('http://foo.builder.io/foo?format=webp'),
            type: 'image/webp',
          }),
        }),
      );
    });
    test('maxWidth is added to the srcs', () => {
      expect(
        find(
          'source',
          Image({
            image: 'http://foo.builder.io/foo',
            srcsetSizes: '1234 456',
          }),
        ),
      ).toEqual(
        partial({
          tag: 'source',
          props: partial({
            srcset: srcSet('http://foo.builder.io/foo?format=webp', '1234 456'),
            type: 'image/webp',
          }),
        }),
      );
    });
    test('anchor should wrap in <a>', () => {
      expect(
        find(
          'a',
          Image({
            image: 'http://some.url',
            href: 'my-url',
          }),
        ),
      ).toEqual(
        partial({
          tag: 'a',
          props: partial({ href: 'my-url' }),
        }),
      );
    });
  });
});

function find(tag: string, jsx: MockJSX): MockJSX | undefined {
  if (tag == jsx.tag) return jsx;
  return findInChildren(tag, jsx.children);

  function findInChildren(tag: string, jsxs: MockJSX[]): MockJSX | undefined {
    let value: MockJSX | undefined = undefined;
    for (let i = 0; i < jsxs.length; i++) {
      const jsx = jsxs[i];
      if (Array.isArray(jsx)) {
        value = findInChildren(tag, jsx);
      } else {
        value = find(tag, jsx);
      }
      if (value) return value;
    }
    return undefined;
  }
}

const mockH = (
  tag: string,
  props: Record<string, any>,
  children: any[],
): MockJSX => ({
  tag,
  props,
  children,
});

interface MockJSX {
  tag: string;
  props: Record<string, any>;
  children: MockJSX[];
}

function srcSet(url: string, additionalSizes: string = ''): any {
  return ['100', '200', '400', '800', '1200', '1600', '2000']
    .concat(additionalSizes ? additionalSizes.split(' ') : [])
    .map((size) => {
      const parsedUrl = new URL(url);
      parsedUrl.searchParams.set('width', size);
      return `${parsedUrl} ${size}w`;
    })
    .join(', ');
}
