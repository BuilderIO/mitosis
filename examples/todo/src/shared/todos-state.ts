import { useMetadata } from '@builder.io/mitosis';

export type Todo = {
  completed: boolean;
  text: string;
};

useMetadata({
  type: 'service',
});

export default {
  todos: [] as Todo[],
  addTodo(text: string) {
    this.todos.push({
      completed: false,
      text,
    });
  },
  get allCompleted() {
    return this.todos.filter((item) => item.completed).length === this.todos.length;
  },
};
