import { E2eApp } from '@builder.io/e2e-app/alpine';
import Alpine from 'alpinejs';

window.Alpine = Alpine;

console.log('hello', E2eApp);

Alpine.data('e2e-app', E2eApp);

document.getElementById('app')!.innerHTML = E2eApp;

Alpine.start();
