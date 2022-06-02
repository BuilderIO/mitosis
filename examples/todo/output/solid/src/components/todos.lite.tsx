import { Show, For } from "solid-js";

import todosState from "../shared/todos-state.lite";
import Todo from "./todo.lite";

function Todos(props) {
  return (
    <section class="main">
      <Show when={todosState.todos.length}>
        <input
          class="toggle-all"
          type="checkbox"
          checked={todosState.allCompleted}
          onClick={(event) => {
            const newValue = !todosState.allCompleted;

            for (const todoItem of todosState.todos) {
              todoItem.completed = newValue;
            }
          }}
        />
      </Show>
      <ul class="todo-list">
        <For each={todosState.todos}>
          {(todo, _index) => {
            const index = _index();
            return <Todo todo={todo}></Todo>;
          }}
        </For>
      </ul>
    </section>
  );
}

export default Todos;
