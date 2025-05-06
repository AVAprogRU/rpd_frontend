import { Injectable } from '@angular/core';
import {HttpClient, HttpHeaders} from "@angular/common/http";
import {Observable} from "rxjs";
import {environment} from "../../../environments/environment";

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private http: HttpClient;
  private address: string;
  private httpOptions: { headers: HttpHeaders };

  constructor(http: HttpClient) {
    this.http = http;
    this.address = environment.serverUrl + environment.serverPort;
    this.httpOptions = {
      headers: new HttpHeaders({ 'Content-Type': 'application/json' }),
    };
  }

  public login(login: string, password: string): Observable<any> {
    return this.http.post(
      this.address + '/public/authentication/login',
      {
        'login': login,
        'password': password,
      },
      this.httpOptions
    );
  }
}
