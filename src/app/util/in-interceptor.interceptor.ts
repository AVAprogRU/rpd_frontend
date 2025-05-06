import { Injectable } from '@angular/core';
import {
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpInterceptor, HttpErrorResponse
} from '@angular/common/http';
import {catchError, Observable, of} from 'rxjs';

@Injectable()
export class InInterceptorInterceptor implements HttpInterceptor {

  constructor() {}

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<void>> {
    return next.handle(req).pipe(
      catchError((error: HttpErrorResponse) => {
        let errorMessage = '';
        // Client-side error
        errorMessage = `${error.error}`;
        switch (error.status) {
          case 400:
            console.error('Bad Request');
            break;
          case 401:
            console.error('Unauthorized');
            break;
          case 403:
            console.error('Forbidden');
            break;
          case 404:
            console.error('Not Found');
            break;
          case 500:
            console.error('Internal Server Error');
            break;
          default:
            console.error(`Unexpected status code: ${error.status}`);
        }
        // Show alert message
        alert(`${errorMessage}`);
        console.error('Error details:', error);
        return of();
      })
    );
  }
}
