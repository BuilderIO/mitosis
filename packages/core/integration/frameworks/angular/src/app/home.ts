import { Component } from '@angular/core';

@Component({
  selector: 'home',
  template: `
    <div class="div-1">
      <h2>Hello, {{ name }} !</h2>

      <input [value]="name" (change)="name = $event.target.value" />
    </div>
  `,
  styles: [
    `
      .div-1 {
        text-align: center;
      }
    `,
  ],
})
export default class Home {
  name = 'Steve';
}
