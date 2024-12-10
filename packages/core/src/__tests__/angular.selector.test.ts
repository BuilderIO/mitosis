import { parse } from '../../src/generators/angular/selector-parser.js';

describe('Angular selectors', () => {
  test('should parse gnarly selectors', () => {
    expect(parse('ccc.c1#wat[co].c2[counter="cool"]#wat[x=\'y\'].c3')).toEqual({
      tagName: 'ccc',
      id: 'wat',
      classes: ['c1', 'c2', 'c3'],
      attributes: {
        co: undefined,
        counter: '"cool"',
        x: "'y'",
      },
    });
  });
});
