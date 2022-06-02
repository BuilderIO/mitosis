import { Show } from "solid-js";

import { createMutable } from "solid-js/store";

import todosState from "../shared/todos-state.lite";

function Todo(props) {
  const state = createMutable({
    editing: false,
    toggle() {
      props.todo.completed = !props.todo.completed;
    },
  });

  return (
    <li
      class={`${props.todo.completed ? "completed" : ""} ${
        state.editing ? "editing" : ""
      }`}
    >
      <div class="view">
        <input
          class="toggle"
          type="checkbox"
          checked={props.todo.completed}
          onClick={(event) => {
            state.toggle();
          }}
        />
        <label
          onDblClick={(event) => {
            state.editing = true;
          }}
        >
          {props.todo.text}
        </label>
        <button
          class="destroy"
          onClick={(event) => {
            todosState.todos.splice(todosState.todos.indexOf(props.todo));
          }}
        ></button>
      </div>
      <Show when={state.editing}>
        <input
          class="edit"
          value={props.todo.text}
          onBlur={(event) => {
            state.editing = false;
          }}
          onKeyUp={(event) => {
            props.todo.text = event.target.value;
          }}
        />
      </Show>
    </li>
  );
}

export default Todo;
