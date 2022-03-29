import { outputFileAsync } from 'fs-extra-promise';
import { File } from '../generators/qwik';
import { addComponent, createFileSet, FileSet } from '../generators/qwik/index';
import { isStatement } from '../generators/qwik/src-generator';
import { builderContentToMitosisComponent } from '../parsers/builder';
import { parseJsx } from '../parsers/jsx';
import {
  compileAwayBuilderComponentsFromTree,
  components as compileAwayComponents,
} from '../plugins/compile-away-builder-components';
import {
  convertBuilderContentToSymbolHierarchy,
  convertBuilderElementToMitosisComponent,
} from '../symbols/symbol-processor';

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
      await debugOutput(fileSet);
      expect(toObj(fileSet)).toMatchSnapshot();
    });

    test('Todo.cjs', async () => {
      const json = parseJsx(todo);
      const fileSet = createFileSet({ output: 'cjs', jsx: false });
      addComponent(fileSet, json);
      await debugOutput(fileSet);
      expect(toObj(fileSet)).toMatchSnapshot();
    });

    test('Todo.js', async () => {
      const json = parseJsx(todo);
      const fileSet = createFileSet({
        output: 'mjs',
        jsx: false,
      });
      addComponent(fileSet, json);
      await debugOutput(fileSet);
      expect(toObj(fileSet)).toMatchSnapshot();
    });
  });

  describe('todos', () => {
    test('Todo.tsx', async () => {
      const json = parseJsx(todos);
      const fileSet = createFileSet({ output: 'ts' });
      addComponent(fileSet, json);
      await debugOutput(fileSet);
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
      await debugOutput(fileSet);
      expect(toObj(fileSet)).toMatchSnapshot();
    });
  });

  test('page-with-symbol', async () => {
    const component = builderContentToMitosisComponent(
      require('./qwik.test.page-with-symbol.json'),
    );
    const fileSet = createFileSet({ output: 'mjs', jsx: false });

    addComponent(fileSet, component);
    await debugOutput(fileSet);
    expect(toObj(fileSet)).toMatchSnapshot();
  });

  test('button', async () => {
    const component = builderContentToMitosisComponent(
      require('./qwik.test.button.json'),
    );
    const fileSet = createFileSet({ output: 'mjs', jsx: false });

    addComponent(fileSet, component);
    await debugOutput(fileSet);
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
    await debugOutput(fileSet);
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
    await debugOutput(fileSet);
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
    const fileSet = createFileSet({ output: 'mjs', jsx: false });

    addComponent(fileSet, component);
    await debugOutput(fileSet);
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
    await debugOutput(fileSet);
    expect(toObj(fileSet)).toMatchSnapshot();
  });

  test('For', async () => {
    const component = builderContentToMitosisComponent(
      require('./qwik.test.for-loop.json'),
      {
        includeBuilderExtras: true,
        preserveTextBlocks: true,
      },
    );
    compileAwayBuilderComponentsFromTree(component, compileAwayComponents);
    const fileSet = createFileSet({ output: 'mjs', jsx: true });

    addComponent(fileSet, component);
    await debugOutput(fileSet);
    expect(toObj(fileSet)).toMatchSnapshot();
  });

  describe('component', () => {
    test('bindings', async () => {
      // https://builder.io/content/0937630137c94676ba24f95d9d12e426/edit
      // https://cdn.builder.io/api/v2/content/page/0937630137c94676ba24f95d9d12e426?apiKey=23dfd7cef1104af59f281d58ec525923&noTraverse=false&preserveAllFields=true&single=true&cachbust=true
      const content = require('./qwik.test.component-binding.json');
      const state: Record<string, any> = {};
      const hierarchy = convertBuilderContentToSymbolHierarchy(content, {
        collectComponentState: state,
      });
      expect(state).toMatchSnapshot();
      const fileSet = createFileSet({ output: 'mjs', jsx: true });
      hierarchy.depthFirstSymbols.forEach((builderComponent) => {
        const mitosisComponent =
          convertBuilderElementToMitosisComponent(builderComponent);
        mitosisComponent &&
          addComponent(fileSet, mitosisComponent, { isRoot: false });
      });

      const component = builderContentToMitosisComponent(content, {
        includeBuilderExtras: true,
        preserveTextBlocks: true,
      });
      compileAwayBuilderComponentsFromTree(component, compileAwayComponents);

      addComponent(fileSet, component);
      await debugOutput(fileSet);
      expect(toObj(fileSet)).toMatchSnapshot();
    });
    test('component inputs', async () => {
      const content = require('./qwik.test.component-inputs.json');
      const state: Record<string, any> = {};
      expect(state).toMatchSnapshot();
      const fileSet = createFileSet({ output: 'cjs', jsx: true });
      const component = builderContentToMitosisComponent(content, {
        includeBuilderExtras: true,
        preserveTextBlocks: true,
      });

      addComponent(fileSet, component);
      await debugOutput(fileSet);
      expect(toObj(fileSet)).toMatchSnapshot();
    });
  });

  test('show-hide', async () => {
    const content = require('./qwik.test.show-hide.json');
    const state: Record<string, any> = {};
    expect(state).toMatchSnapshot();
    const fileSet = createFileSet({ output: 'mjs', jsx: true });
    const component = builderContentToMitosisComponent(content, {
      includeBuilderExtras: true,
      preserveTextBlocks: true,
    });

    addComponent(fileSet, component);
    await debugOutput(fileSet);
    expect(toObj(fileSet)).toMatchSnapshot();
  });

  test('bindings', async () => {
    // https://builder.io/content/5d5a2d612df542978577d83c0aefad1e
    // https://cdn.builder.io/api/v2/content/page/5d5a2d612df542978577d83c0aefad1e?apiKey=23dfd7cef1104af59f281d58ec525923
    const content = require('./qwik.test.bindings.json');
    const state: Record<string, any> = {};
    expect(state).toMatchSnapshot();
    const fileSet = createFileSet({ output: 'cjs', jsx: false });
    const component = builderContentToMitosisComponent(content, {
      includeBuilderExtras: true,
      preserveTextBlocks: true,
    });
    compileAwayBuilderComponentsFromTree(component, compileAwayComponents);

    addComponent(fileSet, component);
    await debugOutput(fileSet);
    expect(toObj(fileSet)).toMatchSnapshot();
  });

  describe('src-generator', () => {
    test('should format code', () => {
      const file = new File(
        'test.js',
        {
          isPretty: true,
          isTypeScript: false,
          isJSX: true,
          isModule: true,
        },
        '',
        '',
      );
      file.src.emit('const x=1');
      expect(file.toString()).toEqual('const x = 1;\n');
    });
  });

  describe('helper functions', () => {
    describe('isStatement', () => {
      test('is an expression', () => {
        expect(isStatement('a.b')).toBe(false);
        expect(isStatement('1?2:"bar"')).toBe(false);
        expect(isStatement('"var x; return foo + \'\\"\';"')).toBe(false);
        expect(isStatement('"foo" + `bar\nbaz`')).toBe(false);
        expect(isStatement('(...)()')).toBe(false);
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
