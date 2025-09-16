import { MatSort } from '@angular/material/sort';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatPaginator } from '@angular/material/paginator';
import { Component, OnInit, ViewChild } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { AddUserDialogComponent } from './add-user-dialog/add-user-dialog.component';
import { EditUserDialogComponent } from './edit-user-dialog/edit-user-dialog.component';
import { ConfirmDeleteDialogComponent } from './confirm-delete-dialog/confirm-delete-dialog.component';
import { AppModule } from '../../app.module';
import { ManageUserService } from '../../services/users/manage-user.service';

@Component({
  selector: 'app-manage-users',
  standalone: true,
  imports: [
    AppModule
  ],
  templateUrl: './manage-users.component.html',
  styleUrls: ['./manage-users.component.scss'],
})
export class ManageUsersComponent implements OnInit {
  displayedColumns: string[] = [
    'email',
    'roles',
    'status',
    'created',
    'actions',
  ];
  dataSource = new MatTableDataSource<any>();
  isLoading = false;
  error: string | null = null;

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  constructor(
    private manageUserService: ManageUserService,
    private dialog: MatDialog,
    private snackBar: MatSnackBar
  ) { }

  ngOnInit(): void {
    this.fetchUserRoles();
  }

  fetchUserRoles(): void {
    this.isLoading = true;
    this.manageUserService.getUserRoles().subscribe({
      next: (response) => {
        this.dataSource.data = response.users || [];
        this.dataSource.paginator = this.paginator;
      },
      error: (err) => {
        this.error = err?.message || 'Failed to fetch users.';
      },
      complete: () => {
        this.isLoading = false;
      },
    });
  }

  deleteUser(user: any): void {
    const dialogRef = this.dialog.open(ConfirmDeleteDialogComponent, {
      width: '400px',
      data: { email: user.email, userId: user.id },
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.isLoading = true;
        this.manageUserService.deleteUser(user.id).subscribe({
          next: () => {
            this.snackBar.open('User deleted successfully', 'Close', {
              duration: 3000,
            });
            this.fetchUserRoles();
          },
          error: (err) => {
            const errorMsg =
              err.error?.error || err.message || 'Failed to delete user';
            this.snackBar.open(errorMsg, 'Close', {
              duration: 5000,
              panelClass: ['error-snackbar'],
            });
          },
          complete: () => (this.isLoading = false),
        });
      }
    });
  }

  onAddUser(): void {
    const dialogRef = this.dialog.open(AddUserDialogComponent, {
      width: '500px',
      data: { roles: [] },
    });

    const dialogComponent = dialogRef.componentInstance;

    dialogComponent.dialogRef.afterClosed().subscribe((formData) => {
      if (!formData) return;
    });

    dialogComponent.userForm.valueChanges.subscribe(() => {
      dialogComponent.errorMessage = null;
    });

    dialogComponent.onSubmit = () => {
      if (dialogComponent.userForm.valid) {
        dialogComponent.isLoading = true;
        dialogComponent.errorMessage = null;

        const payload = {
          ...dialogComponent.userForm.value,
          status: !!dialogComponent.userForm.value.status,
        };

        this.manageUserService.addUser(payload).subscribe({
          next: () => {
            this.snackBar.open('New user added successfully', 'Close', {
              duration: 3000,
            });
            dialogRef.close(true);
            this.fetchUserRoles();
          },
          error: (err) => {
            const errorMsg =
              err?.error?.error || err?.message || 'Failed to add user';
            dialogComponent.showError(errorMsg);
          },
          complete: () => (dialogComponent.isLoading = false),
        });
      }
    };
  }

  onEdit(user: any): void {
    const dialogRef = this.dialog.open(EditUserDialogComponent, {
      width: '500px',
      disableClose: true,
      data: {
        user: {
          id: user.id,
          email: user.email,
          roles: [...user.roles],
          status: !!user.status,
        },
        allRoles: ['Admin', 'Editor', 'Viewer'],
      },
    });

    const dialogComponent = dialogRef.componentInstance;

    dialogComponent.userForm.valueChanges.subscribe(() => {
      dialogComponent.errorMessage = null;
    });

    dialogComponent.onSubmit = () => {
      if (dialogComponent.userForm.valid) {
        dialogComponent.isLoading = true;
        dialogComponent.errorMessage = null;

        const updatedUser = {
          id: dialogComponent.userForm.value.id,
          email: dialogComponent.userForm.value.email,
          roles: dialogComponent.userForm.value.roles,
          status: !!dialogComponent.userForm.value.status,
        };

        this.manageUserService.updateUser(updatedUser).subscribe({
          next: () => {
            this.snackBar.open('User updated successfully', 'Close', {
              duration: 3000,
              panelClass: ['success-snackbar'],
            });
            dialogRef.close(true);
            this.fetchUserRoles();
          },
          error: (err) => {
            const errorMsg =
              err?.error?.error || err?.message || 'Failed to update user';
            dialogComponent.showError(errorMsg);
          },
          complete: () => {
            dialogComponent.isLoading = false;
          },
        });
      }
    };
  }

  applyFilter(event: Event): void {
    const filterValue = (event.target as HTMLInputElement).value
      .trim()
      .toLowerCase();
    this.dataSource.filter = filterValue;
  }
}
