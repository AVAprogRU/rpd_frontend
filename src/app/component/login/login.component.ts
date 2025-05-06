import { Component } from '@angular/core';
import {FormControl, FormGroup} from "@angular/forms";
import {TokenService} from "../../service/auth/token.service";
import {AuthService} from "../../service/auth/auth.service";
import {User} from "../../model/User";

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent {
  private tokenStorage: TokenService;
  private authService: AuthService;

  save: boolean = false;
  isLoggedIn: boolean = false;
  isLoginFailed: boolean = false;
  errorMessage: string = '';

  form = new FormGroup({
    email: new FormControl(''),
    password: new FormControl(''),
  });

  constructor(tokenStorage: TokenService, auth: AuthService) {
    this.authService = auth;
    this.tokenStorage = tokenStorage;
  }

  ngOnInit(): void {
    const jwt = this.tokenStorage.getToken();
    if (jwt != null) {
      this.isLoggedIn = true;
    }
  }

  public login():void {
    let email = <string>this.form.value.email;
    let password = <string>this.form.value.password;
    let account;
    this.authService.login(email, password).subscribe(
      (data) => {
        this.isLoggedIn = true;
        account = this.getAccountFromDTO(data);
        this.tokenStorage.saveUser(account);
        this.tokenStorage.saveToken(account.token);
        // alert('Вы вошли в систему');
        this.reloadPage();
      },
      error => {
        this.errorMessage = error.error.message;
    }
    );
  }

  public signOut(): void {
    this.tokenStorage.signOut();
    this.save = true;
    this.reloadPage();
  }

  private getAccountFromDTO(data: any): User {
    return {
      token: data.token,
      user: data.user,
      roles: data.roles.map((role: any) => ({"name": role.name}))
    };
  }

  private reloadPage(): void {
    window.location.reload();
  }
}
