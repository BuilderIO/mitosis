import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import Home from './home';

const routes: Routes = [{ path: '', component: Home }];

@NgModule({
  imports: [
    RouterModule.forRoot(routes, {
      initialNavigation: 'enabled',
    }),
  ],
  exports: [RouterModule],
})
export class AppRoutingModule {}
