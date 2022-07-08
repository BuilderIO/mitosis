import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppComponent } from './app.component';
import { MitosisModule } from './mitosis.module';

@NgModule({
  declarations: [AppComponent],
  imports: [BrowserModule, MitosisModule],
  providers: [],
  bootstrap: [AppComponent],
})
export class AppModule {}
