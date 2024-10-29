import { useState } from '@builder.io/mitosis';

export default function MyComponent(props) {
  const [todos, setTodos] = useState([
    { id: 1, completed: false },
    { id: 2, completed: false },
  ]);

  return (
    <div>
      {todos.map((todo) => (
        <div>
          {state.todos.map((todo) => (
            <input
              type="checkbox"
              checked={todo.completed}
              onChange={(event) => {
                const index = state.todos.findIndex((t) => t.id === todo.id);
                state.todos[index].completed = event.target.checked;
              }}
            />
          ))}
        </div>
      ))}
    </div>
  );
}
