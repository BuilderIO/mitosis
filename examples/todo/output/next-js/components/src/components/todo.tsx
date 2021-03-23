import { useState } from "react";
import todosState from "../shared/todos-state";

export default function Todo(props) {
  const [editing, setEditing] = useState(() => false);
  function toggle() {
    props.todo.completed = !props.todo.completed;
  }

  return (
    <>
      <li
        className={`${props.todo.completed ? "completed" : ""} ${
          editing ? "editing" : ""
        }`}
      >
        <div className="view">
          <input
            className="toggle"
            type="checkbox"
            checked={props.todo.completed}
            onClick={(event) => {
              {
                toggle();
              }
            }}
          />

          <label
            onDblClick={(event) => {
              {
                setEditing(true);
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

        {Boolean(editing) && (
          <>
            <input
              className="edit"
              value={props.todo.text}
              onBlur={(event) => {
                {
                  setEditing(false);
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
