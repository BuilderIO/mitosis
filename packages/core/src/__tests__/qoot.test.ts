import { outputFileAsync } from 'fs-extra-promise';
import { componentToQoot } from '../generators/qoot';
import { parseJsx } from '../parsers/jsx';

const todo = require('../../../../examples/todo/src/components/todo.lite');
const todos = require('../../../../examples/todo/src/components/todos.lite');

const debugFiles = true;

describe('Qoot', () => {
  test('Todo', async () => {
    const json = parseJsx(todo);
    const output = componentToQoot(json);
    expect(output).toMatchSnapshot();
    if (debugFiles) {
      for (const file of output.files) {
        await outputFileAsync('dist/test/qoot/' + file.path, file.contents);
      }
    }
  });

  test('Todos', () => {
    const json = parseJsx(todos);
    const output = componentToQoot(json);
    expect(output).toMatchSnapshot();
  });
});
