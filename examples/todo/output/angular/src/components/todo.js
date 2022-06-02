import { Component, Input } from "@angular/core";

import todosState from "../shared/todos-state.lite";

@Component({
  selector: "todo",
  template: `
    <li
      [class]="\`\${todo.completed ? 'completed' : ''} \${editing ? 'editing' : ''}\`"
    >
      <div class="view">
        <input
          class="toggle"
          type="checkbox"
          [checked]="todo.completed"
          (click)="
         toggle();
       "
        />

        <label
          (dblclick)="
         editing = true;
       "
        >
          {{todo.text}}
        </label>

        <button
          class="destroy"
          (click)="
         todosState.todos.splice(todosState.todos.indexOf(todo));
       "
        ></button>
      </div>

      <ng-container *ngIf="editing">
        <input
          class="edit"
          [value]="todo.text"
          (blur)="
         editing = false;
       "
          (keyup)="
         todo.text = $event.target.value;
       "
        />
      </ng-container>
    </li>
  `,
})
export default class Todo {
  @Input() todo: any;

  editing = false;
  toggle() {
    this.todo.completed = !this.todo.completed;
  }
}
