import {Component, OnInit} from '@angular/core';
import {TokenService} from "./service/auth/token.service";

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  private tokenService: TokenService;

  isLogged: boolean = false;
  isAdmin: boolean = false;
  isTeacher: boolean = false;

  constructor(tokenService: TokenService) {
    this.tokenService = tokenService;
    const user = this.tokenService.getUser();
    console.log(JSON.stringify(user));
    this.isLogged = (user != null);
    const roles = user?.roles.map(role => role.name).join(',');
    this.isAdmin = roles != null && roles.includes('ADMIN');
    this.isTeacher = roles != null && roles.includes('TEACHER');
  }
}
