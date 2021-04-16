import { outputFileAsync } from 'fs-extra-promise';
import { componentToQoot, File } from '../generators/qoot';
import { parseJsx } from '../parsers/jsx';

const todo = require('../../../../examples/todo/src/components/todo.lite');
const todos = require('../../../../examples/todo/src/components/todos.lite');

const debugFiles = true;

const debugOutput = async (output: { files: File[] }) => {
  if (debugFiles) {
    for (const file of output.files) {
      await outputFileAsync('dist/test/qoot/' + file.path, file.contents);
    }
  }
};

describe('Qoot', () => {
  test('Todo', async () => {
    const json = parseJsx(todo);
    const output = await componentToQoot(json);
    expect(output).toMatchSnapshot();
    debugOutput(output);
  });

  test('Todo bundle', async () => {
    const json = parseJsx(todo);
    const output = await componentToQoot(json, {
      bundle: true,
    });
    expect(output).toMatchSnapshot();
    debugOutput(output);
  });

  test('Todos', async () => {
    const json = parseJsx(todos);
    const output = await componentToQoot(json);
    expect(output).toMatchSnapshot();
    debugOutput(output);
  });
});
