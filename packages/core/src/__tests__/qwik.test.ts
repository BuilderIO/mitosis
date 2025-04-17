import { mkdirSync, writeFileSync } from 'fs';
import { resolve } from 'path';
import stripAnsi from 'strip-ansi';
import { File } from '../generators/qwik';
import { componentToQwik } from '../generators/qwik/component-generator';
import { FileSet, addComponent, createFileSet } from '../generators/qwik/index';
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
import { runTestsForTarget } from './test-generator';

import todo from '../../../../examples/todo/src/components/todo.lite.tsx?raw';
import todos from '../../../../examples/todo/src/components/todos.lite.tsx?raw';

const debugFiles = true;

const debugOutput = async (fileSet: FileSet) => {
  const testName = stripAnsi(expect.getState().currentTestName as string);
  const base = 'dist/test/' + testName.split(/[\s>]+/g).join('/') + '/';
  if (debugFiles) {
    for (const key in fileSet) {
      const file = (fileSet as any)[key];
      await mkdirSync(base, { recursive: true });
      await writeFileSync(resolve(base, file.path), file.contents);
    }
  }
};

describe('qwik', () => {
  runTestsForTarget({ options: {}, target: 'qwik', generator: componentToQwik });

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
        require('./qwik/specs/qwik.test.hello_world.json'),
      );
      const fileSet = createFileSet({ output: 'mjs' });

      addComponent(fileSet, component);
      await debugOutput(fileSet);
      expect(toObj(fileSet)).toMatchSnapshot();
    });
  });

  test('page-with-symbol', async () => {
    const component = builderContentToMitosisComponent(
      require('./qwik/specs/qwik.test.page-with-symbol.json'),
    );
    const fileSet = createFileSet({ output: 'mjs', jsx: false });

    addComponent(fileSet, component);
    await debugOutput(fileSet);
    expect(toObj(fileSet)).toMatchSnapshot();
  });

  test('button', async () => {
    const component = builderContentToMitosisComponent(
      require('./qwik/specs/qwik.test.button.json'),
    );
    const fileSet = createFileSet({ output: 'mjs', jsx: false });

    addComponent(fileSet, component);
    await debugOutput(fileSet);
    expect(toObj(fileSet)).toMatchSnapshot();
  });

  test('svg', async () => {
    const component = builderContentToMitosisComponent(require('./qwik/specs/qwik.test.svg.json'), {
      includeBuilderExtras: true,
      preserveTextBlocks: true,
    });
    const fileSet = createFileSet({ output: 'mjs', jsx: false });

    addComponent(fileSet, component);
    await debugOutput(fileSet);
    expect(toObj(fileSet)).toMatchSnapshot();
  });

  test('Image', async () => {
    const component = builderContentToMitosisComponent(
      require('./qwik/specs/qwik.test.image.json'),
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
      require('./qwik/specs/qwik.test.image.json'),
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

  test.only('Accordion', async () => {
    const component = builderContentToMitosisComponent(
      require('./qwik/specs/qwik.test.accordion.json'),
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
      require('./qwik/specs/qwik.test.for-loop.json'),
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
      // https://cdn.builder.io/api/v2/content/page/0937630137c94676ba24f95d9d12e426?apiKey=23dfd7cef1104af59f281d58ec525923&noTraverse=false&preserveAllFields=true&single=true&cachebust=true
      const content = require('./qwik/specs/qwik.test.component-binding.json');
      const state: Record<string, any> = {};
      const hierarchy = convertBuilderContentToSymbolHierarchy(content, {
        collectComponentState: state,
      });
      expect(state).toMatchSnapshot();
      const fileSet = createFileSet({ output: 'mjs', jsx: true });
      hierarchy.depthFirstSymbols.forEach((builderComponent) => {
        const mitosisComponent = convertBuilderElementToMitosisComponent(builderComponent);
        mitosisComponent && addComponent(fileSet, mitosisComponent, { isRoot: false });
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
      const content = require('./qwik/specs/qwik.test.component-inputs.json');
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
    const content = require('./qwik/specs/qwik.test.show-hide.json');
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
    const content = require('./qwik/specs/qwik.test.bindings.json');
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

  test('for-loop.bindings', async () => {
    const component = require('./qwik/specs/qwik.test.for-loop.binding.json');
    const fileSet = createFileSet({ output: 'cjs', jsx: false });
    compileAwayBuilderComponentsFromTree(component, compileAwayComponents);
    addComponent(fileSet, component);
    await debugOutput(fileSet);
    expect(toObj(fileSet)).toMatchSnapshot();
  });

  test('mount', async () => {
    const content = require('./qwik/specs/qwik.test.mount.json');
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
    let file: File;
    beforeEach(() => {
      file = new File(
        'test.js',
        {
          isPretty: true,
          isTypeScript: false,
          isJSX: true,
          isModule: true,
          isBuilder: true,
        },
        '',
        '',
      );
    });

    test('should format code', () => {
      file.src.emit('const x=1');
      expect(file.toString()).toEqual('const x = 1;\n');
    });

    test('should deal with empty bindings', () => {
      file.src.jsxBegin('Image', {}, { image: '' });
      file.src.jsxEnd('Image');
      expect(file.toString()).toEqual('<Image></Image>;\n');
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
