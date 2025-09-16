import { Injectable } from '@angular/core';
import { MatSnackBar, MatSnackBarRef, SimpleSnackBar } from '@angular/material/snack-bar';

@Injectable({
  providedIn: 'root',
})
export class SnackbarService {
  constructor(private readonly snackBar: MatSnackBar) {}

  /**
   * Show a snackbar with a message and action, and optional config.
   * Returns the MatSnackBarRef for further handling (e.g., onAction).
   */
  open(message: string, action: string = 'Close', config: any = {}): MatSnackBarRef<SimpleSnackBar> {
    // Always show snackbar at the top
    const mergedConfig = {
      verticalPosition: 'top',
      horizontalPosition: 'center',
      ...config,
    };
    return this.snackBar.open(message, action, mergedConfig);
  }

  /**
   * Show an error snackbar for explicit deny and refresh on close.
   */
  showAuthDeny(message: string): void {
    const snackBarRef = this.open(message, 'Close', {
      duration: undefined,
      panelClass: ['custom-snackbar-container', 'toast-error'],
    });
    snackBarRef.onAction().subscribe(() => {
      window.location.reload();
    });
  }
}
