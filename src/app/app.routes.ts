import { Routes } from '@angular/router';
import { AuthGuard } from './guards/auth/auth.guard';

import { NotFoundComponent } from './features/not-found/not-found.component';
import { LoginComponent } from './features/login/login.component';


export const routes: Routes = [
  { path: '', component: LoginComponent },
  {
    path: 'upload',
    loadComponent: () => import(`./features/file-upload/file-upload.component`).then(mod => mod.FileUploadComponent),
    canActivate: [AuthGuard]
  },
  {
    path: 'customers',
    loadChildren: () => import(`./features/customer/customer.routes`).then(routes => routes.routes),
    canActivate: [AuthGuard]
  },
  {
    path: 'terminal-route',
    loadComponent: () => import(`./features/terminal-route/terminal-route.component`).then(mod => mod.TerminalRouteComponent),
    canActivate: [AuthGuard]
  },
  {
    path: '**', component: NotFoundComponent
  },
];

// export const routes: Routes = [
//   {
//     path: 'users',
//     component: ManageUsersComponent,
//     canActivate: [AuthGuard, RoleAuthGuard],
//     data: { user_roles: ['admin'] },
//   },
