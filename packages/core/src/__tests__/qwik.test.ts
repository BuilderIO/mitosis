import { outputFileAsync } from 'fs-extra-promise';
import { builderContentToMitosisComponent } from '..';
import { File } from '../generators/qwik';
import { addComponent, createFileSet, FileSet } from '../generators/qwik/index';
import { isStatement } from '../generators/qwik/src-generator';
import { parseJsx } from '../parsers/jsx';
import {
  compileAwayBuilderComponentsFromTree,
  components as compileAwayComponents,
} from '../plugins/compile-away-builder-components';

const todo = require('../../../../examples/todo/src/components/todo.lite');
const todos = require('../../../../examples/todo/src/components/todos.lite');

const debugFiles = true;

const debugOutput = async (fileSet: FileSet) => {
  const testName = expect.getState().currentTestName;
  const base = 'dist/test/' + testName.split(' ').join('/') + '/';
  if (debugFiles) {
    for (const key in fileSet) {
      const file = (fileSet as any)[key];
      await outputFileAsync(base + file.path, file.contents);
    }
  }
};

describe('qwik', () => {
  describe('todo', () => {
    test('Todo.tsx', async () => {
      const json = parseJsx(todo);
      const fileSet = createFileSet({ output: 'ts' });
      addComponent(fileSet, json);
      debugOutput(fileSet);
      expect(toObj(fileSet)).toMatchSnapshot();
    });

    test('Todo.cjs', async () => {
      const json = parseJsx(todo);
      const fileSet = createFileSet({ output: 'cjs', jsx: false });
      addComponent(fileSet, json);
      debugOutput(fileSet);
      expect(toObj(fileSet)).toMatchSnapshot();
    });

    test('Todo.js', async () => {
      const json = parseJsx(todo);
      const fileSet = createFileSet({
        output: 'mjs',
        minify: true,
        jsx: false,
      });
      addComponent(fileSet, json);
      debugOutput(fileSet);
      expect(toObj(fileSet)).toMatchSnapshot();
    });
  });

  describe('todos', () => {
    test('Todo.tsx', async () => {
      const json = parseJsx(todos);
      const fileSet = createFileSet({ output: 'ts' });
      addComponent(fileSet, json);
      debugOutput(fileSet);
      expect(toObj(fileSet)).toMatchSnapshot();
    });
  });

  describe('hello_world', () => {
    test('stylesheet', async () => {
      const component = builderContentToMitosisComponent(
        require('./qwik.test.hello_world.json'),
      );
      const fileSet = createFileSet({ output: 'mjs' });

      addComponent(fileSet, component);
      debugOutput(fileSet);
      expect(toObj(fileSet)).toMatchSnapshot();
    });
  });

  test('page-with-symbol', async () => {
    const component = builderContentToMitosisComponent(
      require('./qwik.test.page-with-symbol.json'),
    );
    const fileSet = createFileSet({ output: 'mjs', jsx: false });

    addComponent(fileSet, component);
    debugOutput(fileSet);
    expect(toObj(fileSet)).toMatchSnapshot();
  });

  test('button', async () => {
    const component = builderContentToMitosisComponent(
      require('./qwik.test.button.json'),
    );
    const fileSet = createFileSet({ output: 'mjs', jsx: false });

    addComponent(fileSet, component);
    debugOutput(fileSet);
    expect(toObj(fileSet)).toMatchSnapshot();
  });

  test('svg', async () => {
    const component = builderContentToMitosisComponent(
      require('./qwik.test.svg.json'),
      {
        includeBuilderExtras: true,
        preserveTextBlocks: true,
      },
    );
    const fileSet = createFileSet({ output: 'mjs', jsx: false });

    addComponent(fileSet, component);
    debugOutput(fileSet);
    expect(toObj(fileSet)).toMatchSnapshot();
  });

  test('Image', async () => {
    const component = builderContentToMitosisComponent(
      require('./qwik.test.image.json'),
      {
        includeBuilderExtras: true,
        preserveTextBlocks: true,
      },
    );
    const fileSet = createFileSet({ output: 'mjs', jsx: false });

    addComponent(fileSet, component);
    debugOutput(fileSet);
    expect(toObj(fileSet)).toMatchSnapshot();
  });

  test('Image.slow', async () => {
    const component = builderContentToMitosisComponent(
      require('./qwik.test.image.json'),
      {
        includeBuilderExtras: true,
        preserveTextBlocks: true,
      },
    );
    compileAwayBuilderComponentsFromTree(component, compileAwayComponents);
    const fileSet = createFileSet({ output: 'mjs', jsx: false });

    addComponent(fileSet, component);
    debugOutput(fileSet);
    expect(toObj(fileSet)).toMatchSnapshot();
  });

  test('Accordion', async () => {
    const component = builderContentToMitosisComponent(
      require('./qwik.test.accordion.json'),
      {
        includeBuilderExtras: true,
        preserveTextBlocks: true,
      },
    );
    compileAwayBuilderComponentsFromTree(component, compileAwayComponents);
    const fileSet = createFileSet({ output: 'mjs', jsx: true });

    addComponent(fileSet, component);
    debugOutput(fileSet);
    expect(toObj(fileSet)).toMatchSnapshot();
  });

  describe('helper functions', () => {
    describe('isStatement', () => {
      test('is an expression', () => {
        expect(isStatement('a.b')).toBe(false);
        expect(isStatement('1?2:"bar"')).toBe(false);
        expect(isStatement('"var x; return foo + \'\\"\';"')).toBe(false);
        expect(isStatement('"foo" + `bar\nbaz`')).toBe(false);
      });

      test('is a statement', () => {
        expect(isStatement('var x; return x;')).toBe(true);
        expect(isStatement('var x')).toBe(true);
      });
    });
  });
});

function toObj(fileSet: FileSet): any {
  const obj: Record<string, string> = {};
  for (const key in fileSet) {
    if (Object.prototype.hasOwnProperty.call(fileSet, key)) {
      const file: File = (fileSet as any)[key];
      obj[file.path] = file.contents;
    }
  }
  return obj;
}
