import { Component, Inject } from '@angular/core';
import { Observable, map, startWith } from 'rxjs';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { AppModule } from '../../../app.module';
import { UserRole } from '../../../enums/user-role.enum';
import { ManageUserService } from '../../../services/users/manage-user.service';

@Component({
  selector: 'app-edit-user-dialog',
  standalone: true,
  imports: [AppModule],
  templateUrl: './edit-user-dialog.component.html',
  styleUrls: ['./edit-user-dialog.component.scss'],
})

export class EditUserDialogComponent {
  allRoles: string[] = Object.values(UserRole); // ✅ use enum
  filteredRoles!: Observable<string[]>;
  roleInputControl = new FormControl('');

  userForm = new FormGroup({
    id: new FormControl('', [Validators.required]),
    email: new FormControl('', [Validators.required, Validators.email]),
    roles: new FormControl<string[]>([], []),
    status: new FormControl<boolean>(true, []),
  });

  errorMessage: string | null = null;
  isLoading = false;

  constructor(
    public dialogRef: MatDialogRef<EditUserDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { user: any },
    private manageUserService: ManageUserService,
    private snackBar: MatSnackBar
  ) {
    this.userForm.patchValue({
      id: data.user.id,
      email: data.user.email,
      roles: data.user.roles,
      status: data.user.status,
    });

    this.filteredRoles = this.roleInputControl.valueChanges.pipe(
      startWith(''),
      map(value => this._filterRoles(value || ''))
    );
  }

  private _filterRoles(value: string): string[] {
    const filterValue = value.toLowerCase();
    const selectedRoles = this.userForm.value.roles || [];

    return this.allRoles
      .filter(role => role.toLowerCase().includes(filterValue))
      .filter(role => !selectedRoles.includes(role));
  }

  addRole(event: any): void {
    const value = (event.option?.value || event.value || '').trim();
    const currentRoles = this.userForm.value.roles || [];

    if (value && this.allRoles.includes(value) && !currentRoles.includes(value)) {
      this.userForm.patchValue({
        roles: [...currentRoles, value]
      });
    }

    this.roleInputControl.setValue('');
  }

  removeRole(role: string): void {
    const currentRoles = this.userForm.value.roles || [];
    this.userForm.patchValue({
      roles: currentRoles.filter(r => r !== role)
    });
  }

  onCancel(): void {
    this.dialogRef.close();
  }

  onSubmit(): void {
    if (this.userForm.valid) {
      this.isLoading = true;
      this.errorMessage = null;

      const formData = this.userForm.value;

      this.manageUserService.updateUser(formData).subscribe({
        next: () => {
          this.snackBar.open('User details updated successfully', 'Close', {
            duration: 5000,
          });
          this.dialogRef.close(true);
        },
        error: (err) => {
          const errorMsg = err.error?.error || err.error?.message || 'Failed to update user';
          this.showError(errorMsg);
        },
        complete: () => {
          this.isLoading = false;
        },
      });
    }
  }

  showError(message: string): void {
    this.errorMessage = message;
    this.isLoading = false;
    this.dialogRef.disableClose = false;
  }
}
