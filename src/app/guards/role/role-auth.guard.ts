import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';

export const RoleAuthGuard: CanActivateFn = (route, state) => {
  const router = inject(Router);
  const snackBar = inject(MatSnackBar);

  const allowedRoles: string[] = route.data['user_roles'] || [];
  const userRoles: string[] = JSON.parse(localStorage.getItem('user_roles') || '[]');

  const hasAccess = userRoles.some(role =>
    allowedRoles.map(r => r.toLowerCase()).includes(role.toLowerCase())
  );

  if (hasAccess) {
    return true;
  } else {
    snackBar.open('Access Denied', 'Close', {
      duration: 3000,
      horizontalPosition: 'center',
      verticalPosition: 'top',
      panelClass: ['snack-bar-error']
    });

    return router.parseUrl('/');
  }
};
