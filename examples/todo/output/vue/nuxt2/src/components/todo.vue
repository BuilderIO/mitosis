<template>
  <li
    :class="
      _classStringToObject(
        `${this.todo.completed ? 'completed' : ''} ${
          this.editing ? 'editing' : ''
        }`
      )
    "
  >
    <div class="view">
      <input
        class="toggle"
        type="checkbox"
        :checked="todo.completed"
        @click="toggle()"
      />
      <label @dblclick="editing = true">
        {{ todo.text }}
      </label>
      <button
        class="destroy"
        @click="todosState.todos.splice(todosState.todos.indexOf(todo))"
      ></button>
    </div>

    <input
      class="edit"
      v-if="editing"
      :value="todo.text"
      @blur="editing = false"
      @keyup="todo.text = $event.target.value"
    />
  </li>
</template>
<script>
import todosState from "../shared/todos-state";

export default {
  name: "todo",

  props: ["todo"],

  data: () => ({ editing: false, todosState }),

  methods: {
    toggle() {
      this.todo.completed = !this.todo.completed;
    },
    _classStringToObject(str) {
      const obj = {};
      if (typeof str !== "string") {
        return obj;
      }
      const classNames = str.trim().split(/\s+/);
      for (const name of classNames) {
        obj[name] = true;
      }
      return obj;
    },
  },
};
</script>
