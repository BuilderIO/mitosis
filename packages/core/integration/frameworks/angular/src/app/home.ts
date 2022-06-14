import { Component } from '@angular/core';

@Component({
  selector: 'home',
  template: `
    <div class="div-1">
      <h2>Hello, {{ name }} !</h2>

      <input [value]="name" (input)="name = $event.target.value" />
    </div>
  `,
  styles: [
    `
      .div-1 {
        text-align: center;
        color: steelblue;
      }
    `,
  ],
})
export default class Home {
  name = 'Steve';
}
