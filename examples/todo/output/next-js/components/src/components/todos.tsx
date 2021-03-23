import todosState from "../shared/todos-state";
import Todo from "./todo";

export default function Todos(props) {
  return (
    <>
      <section className="main">
        {Boolean(todosState.todos.length) && (
          <>
            <input
              className="toggle-all"
              type="checkbox"
              checked={todosState.allCompleted}
              onClick={(event) => {
                {
                  const newValue = !todosState.allCompleted;

                  for (const todoItem of todosState.todos) {
                    todoItem.completed = newValue;
                  }
                }
              }}
            />
          </>
        )}

        <ul className="todo-list">
          {todosState.todos.map((todo) => (
            <>
              <Todo todo={todo}></Todo>
            </>
          ))}
        </ul>
      </section>
    </>
  );
}
