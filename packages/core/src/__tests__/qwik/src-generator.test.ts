import {
  File,
  isStatement,
  SrcBuilder,
  SrcBuilderOptions,
  Symbol,
} from '../../generators/qwik/src-generator';

describe('src-generator', () => {
  describe('isStatement', () => {
    test('is an expression', () => {
      expect(isStatement('a.b')).toBe(false);
      expect(isStatement('a.b!')).toBe(false);
      expect(isStatement('1?2:"bar"')).toBe(false);
      expect(isStatement('"var x; return foo + \'\\"\';"')).toBe(false);
      expect(isStatement('"foo" + `bar\nbaz`')).toBe(false);
      expect(isStatement('(...)()')).toBe(false);
    });
    test('regression', () => {
      expect(isStatement('props.attributes?.class || props.attributes?.className')).toBe(false);
    });

    test('is a statement', () => {
      expect(isStatement('var x; return x;')).toBe(true);
      expect(isStatement('var x')).toBe(true);
    });

    test('regressions', () => {
      expect(
        isStatement(
          "if(state.deviceSize == \"small\"){    \r\n    return\r\n}\r\n\r\nif (state.imageLeft){    \r\n    return 'row-reverse'\r\n}\r\n\r\nreturn 'row'",
        ),
      ).toBe(true);
      expect(isStatement("if (state.imageLeft){     return 'flex-direction: row-reverse;' }")).toBe(
        true,
      );
      expect(isStatement('() => null')).toBe(true);
    });
  });

  describe('import', () => {
    let options: SrcBuilderOptions;
    let src: SrcBuilder;
    describe('module', () => {
      beforeEach(() => {
        options = {
          isJSX: true,
          isPretty: true,
          isTypeScript: false,
          isModule: true,
          isBuilder: false,
        };
        src = new SrcBuilder(new File('test', options, '', ''), options);
      });
      test('import to string', () => {
        src.import('module', [new Symbol('importName', 'asLocalName')]);
        expect(src.toString().trim()).toEqual('import{importName as asLocalName}from"module";');
      });
      test('import from default', () => {
        src.import('module', [new Symbol('default', 'asLocalName')]);
        expect(src.toString().trim()).toEqual('import asLocalName from"module";');
      });
    });
    describe('require', () => {
      beforeEach(() => {
        options = {
          isJSX: true,
          isPretty: true,
          isTypeScript: false,
          isModule: false,
          isBuilder: false,
        };
        src = new SrcBuilder(new File('test', options, '', ''), options);
      });
      test('import to string', () => {
        src.import('module', [new Symbol('importName', 'asLocalName')]);
        expect(src.toString().trim()).toEqual('const asLocalName=require("module").importName;');
      });
      test('import from default', () => {
        src.import('module', [new Symbol('default', 'asLocalName')]);
        expect(src.toString().trim()).toEqual('const asLocalName=require("module");');
      });
    });
  });
});
