import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppComponent } from './app.component';
import { HomepageModule } from './src/homepage';

@NgModule({
  declarations: [AppComponent],
  imports: [BrowserModule, HomepageModule],
  providers: [],
  bootstrap: [AppComponent],
})
export class AppModule {}
