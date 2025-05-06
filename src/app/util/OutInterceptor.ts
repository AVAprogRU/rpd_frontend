import {
  HTTP_INTERCEPTORS,
  HttpEvent,
  HttpHandler,
  HttpHeaders,
  HttpInterceptor,
  HttpRequest
} from "@angular/common/http";
import {TokenService} from "../service/auth/token.service";
import {Injectable} from "@angular/core";
import {Observable} from "rxjs";

@Injectable()
export class AuthInterceptor implements HttpInterceptor {
  private jwt: string | null;
  private tokenStorage: TokenService;

  constructor(tokenStorage: TokenService) {
    this.jwt = "";
    this.tokenStorage = tokenStorage;
  }

  intercept(outgoingRequest: HttpRequest<any>, httpHandler: HttpHandler): Observable<HttpEvent<any>> {
    this.jwt = this.tokenStorage.getToken();
    const request = outgoingRequest.clone({
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + this.jwt
      })
    });
    return httpHandler.handle(request);
  }
}

export const authInterceptorProviders = [
  { provide: HTTP_INTERCEPTORS, useClass: AuthInterceptor, multi: true }
];
