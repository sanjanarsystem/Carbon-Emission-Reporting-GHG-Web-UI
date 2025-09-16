import { HttpClient, HttpEvent, HttpEventType, HttpHeaders, HttpRequest, HttpResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { AuthService } from '../auth/auth.service';
import { environment } from '../../../environments/environment';


@Injectable({
  providedIn: 'root',
})
export class S3FileUploadService {

  constructor(private http: HttpClient, private authService: AuthService) { }

  getDynamicSignedUrlS3Upload(fileName: string): Observable<HttpResponse<string>> {

    const authToken = this.authService.getAndValidateAccessToken();
    console.log('New authToken retrieved by getDynamicSignedUrlS3Upload: ', authToken);

    const headers = new HttpHeaders({
      'Content-Type': 'text/plain',
      Authorization: `Bearer ${authToken}`
    });

    return this.http.get<string>(
      `${environment.signedURLEndPoint}?fileName=${fileName}`,
      {
        headers,
        observe: 'response'
      }
    );

  }

  uploadFile(file: File, presignedUrl: string): Observable<any> {
    const authToken = this.authService.getAndValidateAccessToken();
    console.log('authToken retrieved by uploadFile: ', authToken);
    const headers = new HttpHeaders({
      'Content-Type': 'text/plain',
      // Authorization: `Bearer ${authToken}`
    });

    const req = new HttpRequest('PUT', presignedUrl, file, {
      headers: headers,
      reportProgress: true
    });

    return this.http.request(req).pipe(

      map((event: HttpEvent<any>) => {
        switch (event.type) {
          case HttpEventType.UploadProgress:
            const progress = Math.round((100 * event.loaded) / (event.total ?? 1));
            return progress;
          case HttpEventType.DownloadProgress:
            const progressD = Math.round((100 * event.loaded) / (event.total ?? 1));
            return progressD;
          case HttpEventType.Response:
            return event.body; // Return the response body as text
          default:
            return 0;
        }
      })
    );
  }

}

export interface UploadProgress {
  loaded: number;
  total: number;
  percentage: number;
}
