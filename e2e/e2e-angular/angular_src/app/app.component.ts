import { Component } from '@angular/core';
import { Homepage } from './src/homepage';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  standalone: true,
  imports: [Homepage],
})
export class AppComponent {
  pathname = window.location.pathname;
}
