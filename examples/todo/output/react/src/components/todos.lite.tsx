import { useState } from "react";
import todosState from "../shared/todos-state.lite";
import Todo from "./todo.lite";

export default function Todos(props) {
  const [lite, setLite] = useState(() => null);

  return (
    <section className="main">
      {todosState.todos.length ? (
        <>
          <input
            className="toggle-all"
            type="checkbox"
            checked={todosState.allCompleted}
            onClick={(event) => {
              const newValue = !todosState.allCompleted;

              for (const todoItem of todosState.todos) {
                todoItem.completed = newValue;
              }
            }}
          />
        </>
      ) : null}

      <ul className="todo-list">
        {todosState.todos?.map((todo) => (
          <Todo todo={todo} />
        ))}
      </ul>
    </section>
  );
}
