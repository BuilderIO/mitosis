import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import Home from './home';
import Studio from './studio';

const routes: Routes = [{ path: '', component: Home }, { path: 'studio', component: Studio }];

@NgModule({
  imports: [
    RouterModule.forRoot(routes, {
      initialNavigation: 'enabled',
    }),
  ],
  exports: [RouterModule],
})
export class AppRoutingModule {}
