import { componentToQoot } from '../generators/qoot';
import { parseJsx } from '../parsers/jsx';

const todo = require('../../../../examples/todo/src/components/todo.lite');
const todos = require('../../../../examples/todo/src/components/todos.lite');

describe('Qoot', () => {
  test('Todo', () => {
    const json = parseJsx(todo);
    const output = componentToQoot(json);
    expect(output).toMatchSnapshot();
  });

  test('Todos', () => {
    const json = parseJsx(todo);
    const output = componentToQoot(json);
    expect(output).toMatchSnapshot();
  });
});
