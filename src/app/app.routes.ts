import { Routes } from '@angular/router';
import { SourceManagerComponent } from './pages/source-manager/source-manager.component';
import { SalvoListComponent } from './pages/salvo-list/salvo-list.component';

export const routes: Routes = [
  {
    path: '',
    component: SourceManagerComponent,
  },
  {
    path: 'list',
    component: SalvoListComponent,
  },
  { path: '**', redirectTo: '/' },
];
