import { Injectable } from '@angular/core';
import {User} from "../../model/User";

@Injectable({
  providedIn: 'root'
})
export class TokenService {
  jwtKey: string;
  userKey: string;

  constructor() {
    this.jwtKey = 'auth-token';
    this.userKey = 'auth-user';
  }

  public signOut(): void {
    window.sessionStorage.clear();
  }

  public getToken(): string | null {
    return window.sessionStorage.getItem(this.jwtKey);
  }

  public saveToken(jwt: string): void {
    window.sessionStorage.removeItem(this.jwtKey);
    window.sessionStorage.setItem(this.jwtKey, jwt);
  }

  public getUser(): User | null {
    const user = window.sessionStorage.getItem(this.userKey);
    if (user != null) {
      return JSON.parse(user);
    } else {
      return null;
    }
  }

  public saveUser(user: User) {
    window.sessionStorage.removeItem(this.userKey);
    window.sessionStorage.setItem(this.userKey, JSON.stringify(user));
  }
}
