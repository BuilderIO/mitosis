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
    const output = componentToQoot(json);
    expect(output).toMatchSnapshot();
    debugOutput(output);
  });

  test('Todos', () => {
    const json = parseJsx(todos);
    const output = componentToQoot(json);
    expect(output).toMatchSnapshot();
    debugOutput(output);
  });
});
