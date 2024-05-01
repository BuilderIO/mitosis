import { Show, useStore } from '@builder.io/mitosis';
import type { Todo as TodoType } from '../shared/todos-state';
import todosState from '../shared/todos-state';

export type TodoProps = {
  todo: TodoType;
};

export default function Todo(props: TodoProps) {
  const state = useStore({
    editing: false,
    toggle() {
      const newBool: boolean = !props.todo.completed;
      props.todo.completed = newBool;
    },
  });

  return (
    <li class={`${props.todo.completed ? 'completed' : ''} ${state.editing ? 'editing' : ''}`}>
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
