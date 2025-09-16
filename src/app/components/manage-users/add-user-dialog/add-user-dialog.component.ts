
import { Component, Inject } from '@angular/core';
import { Observable, map, startWith } from 'rxjs';
import { MatSnackBar } from '@angular/material/snack-bar';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { UserRole } from '../../../enums/user-role.enum';
import { AppModule } from '../../../app.module';
import { ManageUserService } from '../../../services/users/manage-user.service';

@Component({
  selector: 'app-add-user-dialog',
  standalone: true,
  imports: [AppModule],
  templateUrl: './add-user-dialog.component.html',
  styleUrls: ['./add-user-dialog.component.scss']
})
export class AddUserDialogComponent {
  statuses = ['active', 'inactive'];
  allRoles: string[] = Object.values(UserRole); // ✅ Enum values to array
  filteredRoles!: Observable<string[]>;
  roleInputControl = new FormControl('');

  userForm = new FormGroup({
    email: new FormControl('', [Validators.required, Validators.email]),
    roles: new FormControl<string[]>([], []),
    status: new FormControl(true),  // default checked
  });

  errorMessage: string | null = null;
  isLoading = false;

  constructor(
    public dialogRef: MatDialogRef<AddUserDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private manageUserService: ManageUserService,
    private snackBar: MatSnackBar
  ) {
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
    this.dialogRef.close(null);
  }

  onSubmit(): void {
    if (this.userForm.valid) {
      this.isLoading = true;
      this.errorMessage = null;

      const formData = this.userForm.value;

      this.manageUserService.addUser(formData).subscribe({
        next: () => {
          this.snackBar.open('User added successfully', 'Close', { duration: 3000 });
          this.dialogRef.close(true);
        },
        error: (err) => {
          const errorMsg = err.error?.error || err.error?.message || 'Failed to add user';
          this.showError(errorMsg);
        },
        complete: () => {
          this.isLoading = false;
        }
      });
    }
  }

  showError(message: string): void {
    this.errorMessage = message;
    this.isLoading = false;
    this.dialogRef.disableClose = false;
  }
}
