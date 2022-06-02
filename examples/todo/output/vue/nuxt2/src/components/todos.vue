<template>
  <section class="main">
    <input
      class="toggle-all"
      type="checkbox"
      v-if="todosState.todos.length"
      :checked="todosState.allCompleted"
      @click="
        const newValue = !todosState.allCompleted;

        for (const todoItem of todosState.todos) {
          todoItem.completed = newValue;
        }
      "
    />

    <ul class="todo-list">
      <todo
        v-for="(todo, index) in todosState.todos"
        :todo="todo"
        :key="index"
      ></todo>
    </ul>
  </section>
</template>
<script>
import todosState from "../shared/todos-state";
import Todo from "./todo";

export default {
  name: "todos",
  components: { todo: async () => Todo },

  data: () => ({ todosState }),
};
</script>
