import { For, Show, createContext } from '@builder.io/mitosis';
import todosState from '../shared/todos-state';
import Header from './header.svelte';
import Todo from './todo.lite';

export type TodosProps = {};

export default function Todos(props: TodosProps) {
  createContext(todosState);

  return (
    <section class="main">
      <Header name={'World'}>Hello</Header>
      <Show when={todosState.todos.length}>
        <input
          class="toggle-all"
          type="checkbox"
          checked={todosState.allCompleted}
          onClick={() => {
            const newValue = !todosState.allCompleted;
            for (const todoItem of todosState.todos) {
              todoItem.completed = newValue;
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
