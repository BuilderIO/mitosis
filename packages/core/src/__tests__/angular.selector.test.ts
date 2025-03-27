import { parseSelector } from '@/generators/angular/helpers/parse-selector';

describe('Angular selectors', () => {
  test('should parse gnarly selectors', () => {
    expect(parseSelector('ccc.c1#wat[co].c2[counter="cool"]#wat[x=\'y\'].c3')).toEqual({
      element: 'ccc',
      classNames: ['c1', 'c2', 'c3'],
      attributes: {
        co: '',
        counter: 'cool',
        id: 'wat',
        x: 'y',
      },
    });
  });

  test('parsing multiple returns only the first', () => {
    expect(parseSelector('dropzone, [dropzone]')).toEqual({
      element: 'dropzone',
      classNames: [],
      attributes: {},
    });
  });

  test(':not parses but is unused', () => {
    expect(parseSelector('list-item:not(.foo)')).toEqual({
      element: 'list-item',
      classNames: [],
      attributes: {},
    });
  });
});
