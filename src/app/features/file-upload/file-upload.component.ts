import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatSnackBarModule } from "@angular/material/snack-bar";
import { SnackbarService } from '../../shared/dialog/snackbar.service';

import { HttpResponse } from '@angular/common/http';
import { S3FileUploadService, UploadProgress } from '../../services/file-upload/s3-file-upload.service';

@Component({
  selector: 'app-file-upload',
  standalone: true,
  imports: [
    CommonModule,
    MatButtonModule,
    MatIconModule,
    MatListModule,
    MatProgressBarModule,
    MatSnackBarModule
  ],
  templateUrl: './file-upload.component.html',
  styleUrls: ['./file-upload.component.scss']
})
export class FileUploadComponent {

  /**
   * Show snackbar for explicit deny error and refresh page on close
   */
  reset(): void {
    this.files = []; // Clear the files array
    this.progress = 0; // Reset progress
    this.uploading = false; // Reset uploading state
    this.cdr.detectChanges(); // Force Angular to update the view
  }
  isDragging = false;
  isUploading = false;
  signedUrlObject: any;

  defaultErrorMessage = 'Failed to upload file to S3 bucket.';

  currentUpload: {
    fileName: string;
    progress: UploadProgress;
  } | null = null;

  files: File[] = [];
  uploading: boolean = false;
  progress: number = 0; // Progress value (0-100)


  private readonly maxFileSize = 3 * 1024 * 1024 * 1024; // 3 GB

  constructor(
    private s3FileUploadService: S3FileUploadService,
    private cdr: ChangeDetectorRef,
    private snackbarService: SnackbarService) { }

  ngOnInit(): void { }

  onDrop(event: DragEvent): void {
    event.preventDefault();
    if (event.dataTransfer?.files) {
      Array.from(event.dataTransfer.files).forEach(file => this.files.push(file));
    }
  }

  onDragOver(event: DragEvent): void {
    event.preventDefault();
  }

  removeFile(index: number): void {
    this.files.splice(index, 1);
  }

  onFileSelected(event: Event): void {

    const input = event.target as HTMLInputElement;

    if (input.files && input.files.length > 0) {
      this.files.push(input.files[0]);
      input.value = ''; // Reset input name to allow re-selection of the same file
    }

  }

  UploadLargeFile() {
    if (!this.files || this.files.length === 0) {
      alert('Please select a file!');
      return;
    }

    // Don't proceed if already uploading
    if (this.uploading) {
      return;
    }

    this.uploading = true;
    const file = this.files[0];

    // Initialize progress tracking
    this.currentUpload = {
      fileName: file.name,
      progress: { loaded: 0, total: file.size, percentage: 0 }
    };

    console.log('s3FileUploadService.getDynamicSignedUrlS3Upload');
  this.s3FileUploadService.getDynamicSignedUrlS3Upload(file.name).subscribe({
      next: (response: HttpResponse<string>) => {
        console.log('Recieved response from getDynamicSignedUrlS3Upload' + response.status + ' ' + response.statusText
          + "this.defaultErrorMessage" + this.defaultErrorMessage);

        // Just in case the response is not 200, handle it gracefully
        if (response.status !== 200) {
          const errorMsg = (typeof response.body === 'string' && response.body) ? response.body : this.defaultErrorMessage;
          this.snackbarService.open(errorMsg, 'Close', {
            duration: 10000,
            horizontalPosition: 'center',

            panelClass: ['custom-snackbar-container', 'toast-error'],
          });
          this.uploading = false; // Reset uploading state on error
          return;
        }

        this.signedUrlObject = response.body;
        console.log('signedUrlObject: ', this.signedUrlObject);


        // Handle API response: object (success or error) or string (error)
        if (typeof this.signedUrlObject === 'string') {
          // String error message
          if (this.signedUrlObject.includes('User is not authorized to access this resource with an explicit deny')) {
            this.snackbarService.showAuthDeny('User is not authorized to access this resource with an explicit deny');
          } else {
            this.snackbarService.open(this.signedUrlObject, 'Close', {
              duration: 10000,
              horizontalPosition: 'center',

              panelClass: ['custom-snackbar-container', 'toast-error'],
            });
          }
          this.uploading = false;
          return;
        }

        if (this.signedUrlObject == null || this.signedUrlObject === '') {
          this.snackbarService.open(this.defaultErrorMessage, 'Close', {
            duration: 10000,
            horizontalPosition: 'center',

            panelClass: ['custom-snackbar-container', 'toast-error'],
          });
          this.uploading = false;
          return;
        }

        // If response is an object with a message property, treat as error
        if (typeof this.signedUrlObject === 'object' && this.signedUrlObject.message) {
          if (this.signedUrlObject.message.includes('User is not authorized to access this resource with an explicit deny')) {
            this.snackbarService.showAuthDeny(this.signedUrlObject.message);
          } else {
            this.snackbarService.open(this.signedUrlObject.message, 'Close', {
              duration: 10000,
              horizontalPosition: 'center',

              panelClass: ['custom-snackbar-container', 'toast-error'],
            });
          }
          this.uploading = false;
          return;
        }

        // If response is an object with uploadUrl, proceed with upload
        const signedUrlS3Upload = this.signedUrlObject.uploadUrl;
        console.log('signedUrlS3Upload: ', signedUrlS3Upload);
        if (!signedUrlS3Upload) {
          const errorMsg = this.signedUrlObject?.error || this.defaultErrorMessage;
          this.snackbarService.open(errorMsg, 'Close', {
            duration: 10000,
            horizontalPosition: 'center',

            panelClass: ['custom-snackbar-container', 'toast-error'],
          });
          this.uploading = false;
          return;
        }

        // Success: upload file
        console.log('File to upload using signedUrlS3Upload: ', file);
        this.s3FileUploadService.uploadFile(file, signedUrlS3Upload)
          .subscribe(event => {
            if (typeof event === 'number') {
              this.progress = event;
            } else {
              // Always show success for successful upload
              this.files.splice(0, 1); // Remove the file from the list after successful upload
              this.snackbarService.open('File uploaded successfully!', 'Close', {
                duration: 10000,
                horizontalPosition: 'center',

                panelClass: ['custom-snackbar-container', 'toast-success'],
              });
              this.reset(); // Reset the component state after successful upload
            }
          });
      },
      error: (err) => {
        console.error('Error getting signed URL:', err);
        
        let errorMessage = this.defaultErrorMessage;
        console.log("err.error",err.error);
        console.log("err.error.message",err.error.message);
        console.log('type of err.error',typeof err.error);
        
        // Handle different types of error responses
        if (err?.error) {
          if (typeof err.error === 'string') {
            // String error response
            if (err.error.includes('User is not authorized to access this resource with an explicit deny')) {
              this.snackbarService.showAuthDeny('User is not authorized to access this resource with an explicit deny');
              this.uploading = false;
              return;
            }
            errorMessage = err.error;
          } else if (typeof err.error === 'object' && err.error.message) {
            // JSON object error response with message property
            if (err.error.message.includes('User is not authorized to access this resource with an explicit deny')) {
              this.snackbarService.showAuthDeny(err.error.message);
              this.uploading = false;
              return;
            }
            errorMessage = err.error.message;
          }
        }
        
        // Show the extracted error message
        this.snackbarService.open(errorMessage, 'Close', {
          duration: 10000,
          horizontalPosition: 'center',
          panelClass: ['custom-snackbar-container', 'toast-error'],
        });
        this.uploading = false;
      }
    });
  }
}