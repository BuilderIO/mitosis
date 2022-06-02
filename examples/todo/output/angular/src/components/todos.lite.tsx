import { Component } from "@angular/core";

import todosState from "../shared/todos-state.lite";
import Todo from "./todo.lite";

@Component({
  selector: "todos",
  template: `
    <section class="main">
      <ng-container *ngIf="todosState.todos.length">
        <input
          class="toggle-all"
          type="checkbox"
          [checked]="todosState.allCompleted"
          (click)="
      const newValue = !todosState.allCompleted;

      for (const todoItem of todosState.todos) {
        todoItem.completed = newValue;
      }
    "
        />
      </ng-container>

      <ul class="todo-list">
        <ng-container *ngFor="let todo of todosState.todos">
          <todo [todo]="todo"></todo>
        </ng-container>
      </ul>
    </section>
  `,
})
export default class Todos {}
