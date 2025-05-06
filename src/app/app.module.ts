import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppComponent } from './app.component';
import { LoginComponent } from './component/login/login.component';
import { HomeComponent } from './component/home/home.component';
import {RouterLink} from "@angular/router";
import {AuthInterceptor, authInterceptorProviders} from "./util/OutInterceptor";
import {appRoutingModule} from "./app.routing";
import {HTTP_INTERCEPTORS, HttpClientModule} from "@angular/common/http";
import {FormsModule, ReactiveFormsModule} from "@angular/forms";
import { AdminComponent } from './component/admin/admin.component';
import { TeacherComponent } from './component/teacher/teacher.component';
import {InInterceptorInterceptor} from "./util/in-interceptor.interceptor";

@NgModule({
  declarations: [
    AppComponent,
    LoginComponent,
    HomeComponent,
    AdminComponent,
    TeacherComponent
  ],
  imports: [
    BrowserModule,
    appRoutingModule,
    HttpClientModule,
    RouterLink,
    FormsModule,
    ReactiveFormsModule,
  ],
  providers: [
    { provide: HTTP_INTERCEPTORS, useClass: AuthInterceptor, multi: true },
    { provide: HTTP_INTERCEPTORS, useClass: InInterceptorInterceptor, multi: true }
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
