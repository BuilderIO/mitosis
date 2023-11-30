// This is a hand-written module, to match the exact names/paths of the
// components we are using from Mitosis output. Ideally this would be generated
// by Mitosis, and/or Angular 14 "standalone components" would be generated.

import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';

import { components } from './mitosis-component-list';

@NgModule({
  declarations: [...components],
  imports: [CommonModule],
  exports: [...components],
})
export class MitosisModule {}
