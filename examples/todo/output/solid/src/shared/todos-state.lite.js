import { useMetadata } from "@builder.io/mitosis";
useMetadata({
  type: "service"
});
var stdin_default = {
  todos: [],
  addTodo(text) {
    this.todos.push({
      completed: false,
      text
    });
  },
  get allCompleted() {
    return this.todos.filter((item) => item.completed).length === this.todos.length;
  }
};
export {
  stdin_default as default
};
