import { parse } from '../generators/angular/parse-selector';

describe('Angular selectors', () => {
  test('should parse gnarly selectors', () => {
    expect(parse('ccc.c1#wat[co].c2[counter="cool"]#wat[x=\'y\'].c3')).toEqual({
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
});
