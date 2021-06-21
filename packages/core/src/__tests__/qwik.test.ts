import { outputFileAsync } from 'fs-extra-promise';
import { componentToQwik, File } from '../generators/qwik';
import { parseJsx } from '../parsers/jsx';

const todo = require('../../../../examples/todo/src/components/todo.lite');
const todos = require('../../../../examples/todo/src/components/todos.lite');

const debugFiles = true;

const debugOutput = async (output: { files: File[] }) => {
  if (debugFiles) {
    for (const file of output.files) {
      await outputFileAsync('dist/test/qwik/' + file.path, file.contents);
    }
  }
};

describe('Qwik', () => {
  test('Todo', async () => {
    const json = parseJsx(todo);
    const output = await componentToQwik(json);
    expect(output).toMatchSnapshot();
    debugOutput(output);
  });

  test('Todo bundle', async () => {
    const json = parseJsx(todo);
    const output = await componentToQwik(json, {
      bundle: true,
    });
    expect(output).toMatchSnapshot();
    debugOutput(output);
  });

  test('Todos', async () => {
    const json = parseJsx(todos);
    const output = await componentToQwik(json);
    expect(output).toMatchSnapshot();
    debugOutput(output);
  });
});
