import { Component } from "@angular/core";

@Component({
  selector: "home",
  template: `
    <h1 class="h1-1">Hello world!</h1>
  `,
  styles: [
    `
      .h1-1 {
        text-align: center;
      }
    `,
  ],
})
export default class Home {}
