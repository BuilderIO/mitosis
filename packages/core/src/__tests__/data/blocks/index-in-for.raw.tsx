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
          {state.todos.map((todo, index) => (
            <input
              type="checkbox"
              checked={todo.completed}
              foo={{
                bar: 1 + index,
              }}
              onX={() => {
                console.log('onX');
              }}
              onClick={(event) => {
                console.log('clicked', event);
                state.todos[index].completed = !state.todos[0].completed;
              }}
              onChange={(event) => {
                console.log('this is todo item: ', index);
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
