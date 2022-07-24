// This is a hand-written module, to match the exact names/paths of the
// components we are using from Mitosis output. Ideally this would be generated
// by Mitosis, and/or Angular 14 "standalone components" would be generated.

import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import MyComponent from './lib/angular/src/components/my-component';
import ItemList from './lib/angular/src/components/item-list';

@NgModule({
  declarations: [MyComponent, ItemList],
  imports: [CommonModule],
  exports: [MyComponent, ItemList],
})
export class MitosisModule {}
