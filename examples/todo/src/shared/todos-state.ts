export type Todo = {
  completed: boolean;
  text: string;
};

// Becomes context, service, etc
export const todosState = {
  todos: [] as Todo[],
  addTodo(text: string) {
    this.todos.push({
      completed: false,
      text,
    });
  },
  get allCompleted() {
    return (
      this.todos.filter((item) => item.completed).length === this.todos.length
    );
  },
};
