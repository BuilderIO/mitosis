import '@builder.io/mitosis/dist/src/jsx-types';
import todosState from '../shared/todos-state.lite';
import { Show, useState } from '@builder.io/mitosis';
import { Todo as TodoType } from '../shared/todos-state.lite';

export type TodoProps = {
  todo: TodoType;
};

export default function Todo(props: TodoProps) {
  const state = useState({
    editing: false,
    toggle() {
      props.todo.completed = !props.todo.completed;
    },
  });

  return (
    <li
      class={`${props.todo.completed ? 'completed' : ''} ${
        state.editing ? 'editing' : ''
      }`}
    >
      <div class="view">
        <input
          class="toggle"
          type="checkbox"
          checked={props.todo.completed}
          onClick={() => {
            state.toggle();
          }}
        />
        <label
          onDblClick={() => {
            state.editing = true;
          }}
        >
          {props.todo.text}
        </label>
        <button
          class="destroy"
          onClick={() => {
            todosState.todos.splice(todosState.todos.indexOf(props.todo));
          }}
        ></button>
      </div>
      <Show when={state.editing}>
        <input
          class="edit"
          value={props.todo.text}
          onBlur={() => {
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
