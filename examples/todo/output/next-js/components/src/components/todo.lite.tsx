import { useLocalObservable } from "mobx-react-lite";
import * as todosState from "../shared/todos-state.lite";

export default function Todo(props) {
  const state = useLocalObservable(() => ({
    editing: false,
    toggle() {
      props.todo.completed = !props.todo.completed;
    },
  }));

  return (
    <>
      <li
        className={`${props.todo.completed ? "completed" : ""} ${
          state.editing ? "editing" : ""
        }`}
      >
        <div className="view">
          <input
            className="toggle"
            type="checkbox"
            checked={props.todo.completed}
            onClick={(event) => {
              {
                state.toggle();
              }
            }}
          />

          <label
            onDblClick={(event) => {
              {
                state.editing = true;
              }
            }}
          >
            {props.todo.text}
          </label>

          <button
            className="destroy"
            onClick={(event) => {
              {
                todosState.todos.splice(todosState.todos.indexOf(props.todo));
              }
            }}
          ></button>
        </div>

        {Boolean(state.editing) && (
          <>
            <input
              className="edit"
              value={props.todo.text}
              onBlur={(event) => {
                {
                  state.editing = false;
                }
              }}
              onKeyUp={(event) => {
                {
                  props.todo.text = event.target.value;
                }
              }}
            />
          </>
        )}
      </li>
    </>
  );
}
