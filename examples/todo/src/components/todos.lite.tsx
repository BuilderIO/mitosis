import { For, Show } from '@jsx-lite/core';
import { todosState } from '../shared/todos-state';
import Todo from './todo.lite';

export type TodosProps = {};

export default function Todos(props: TodosProps) {
  return (
    <section class="main">
      <Show when={todosState.todos.length}>
        <input
          class="toggle-all"
          type="checkbox"
          checked={todosState.allCompleted}
          onClick={() => {
            const newValue = !todosState.allCompleted;
            for (const todo of todosState.todos) {
              todo.completed = newValue;
            }
          }}
        />
      </Show>
      <ul class="todo-list">
        <For each={todosState.todos}>{(todo) => <Todo todo={todo} />}</For>
      </ul>
    </section>
  );
}
