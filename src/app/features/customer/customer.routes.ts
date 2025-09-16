import { Routes } from '@angular/router';
import { CustomerComponent } from './customer.component';
import { AuthGuard } from '../../guards/auth/auth.guard';

export const routes: Routes = [
  {
    path: '', component: CustomerComponent, children: [
      {
        path: '',
        redirectTo: 'active',
        pathMatch: 'full'
      },
      {
        path: 'active',
        loadComponent: () =>
          import('./active-customers/active-customers.component').then(
            (mod) => mod.ActiveCustomersComponent
          ),
        canActivate: [AuthGuard],
      },
      {
        path: 'enable',
        loadComponent: () =>
          import('./enable-customers/enable-customers.component').then(
            (mod) => mod.EnableCustomersComponent
          ),
        canActivate: [AuthGuard],
      }
    ],
  },
];