import {RouterModule, Routes} from "@angular/router";
import {LoginComponent} from "./component/login/login.component";
import {HomeComponent} from "./component/home/home.component";
import {AdminComponent} from "./component/admin/admin.component";
import {TeacherComponent} from "./component/teacher/teacher.component";

const routes: Routes = [
  { path: '', component: HomeComponent },
  { path: 'login', component: LoginComponent },
  { path: 'teacher', component: TeacherComponent },
  { path: 'admin', component: AdminComponent },
  { path: '**', redirectTo: '' }
];

export const appRoutingModule = RouterModule.forRoot(routes);
