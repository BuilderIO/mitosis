import { convertMethodToFunction } from '../../generators/qwik/helpers/convert-method-to-function';
import { MethodMap } from '../../generators/qwik/helpers/state';

describe('convertMethodToFunction', () => {
  const methodMap: MethodMap = {
    methodA: 'method',
    getterB: 'getter',
    getCssFromFont: 'method',
  };
  const lexicalArgs = ['props', 'state'];

  describe('rewrite', () => {
    test('method', () => {
      expect(convertMethodToFunction('this.methodA(123)', methodMap, lexicalArgs)).toEqual(
        'methodA(props,state,123)',
      );
    });
    test('getter', () => {
      expect(convertMethodToFunction('this.getterB', methodMap, lexicalArgs)).toEqual(
        'getterB(props,state)',
      );
    });
    test('method binding', () => {
      expect(convertMethodToFunction('this.methodA', methodMap, lexicalArgs)).toEqual(
        'methodA.bind(null,props,state)',
      );
    });
    test('handle comments', () => {
      expect(convertMethodToFunction('//\nreturn this.getterB;', methodMap, lexicalArgs)).toEqual(
        '//\nreturn getterB(props,state);',
      );
    });

    test('braces', () => {
      let code = 'getFontCss({}: {}) { this.getCssFromFont(font) }';
      expect(convertMethodToFunction(code, methodMap, lexicalArgs)).toEqual(
        'getFontCss({}: {}) { getCssFromFont(props,state,font) }',
      );
    });
  });

  describe('string', () => {
    test('should not rewrite string', () => {
      expect(convertMethodToFunction('"this.getterB"', methodMap, lexicalArgs)).toEqual(
        '"this.getterB"',
      );
    });
    test('should rewrite template string', () => {
      expect(
        convertMethodToFunction('`${this.getterB}this.getterB`', methodMap, lexicalArgs),
      ).toEqual('`${getterB(props,state)}this.getterB`');
    });
  });
});
