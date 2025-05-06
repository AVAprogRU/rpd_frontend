import { Injectable } from '@angular/core';
import {Observable} from "rxjs";
import {HttpClient, HttpHeaders, HttpParams} from "@angular/common/http";
import {environment} from "../../../environments/environment";

@Injectable({
  providedIn: 'root'
})
export class AdminService {
  private httpOptions: { headers: HttpHeaders };
  private address = environment.serverUrl + environment.serverPort;

  constructor(private http: HttpClient) {
    this.httpOptions = {
      headers: new HttpHeaders({ 'Content-Type': 'application/json' }),
    };
  }

  public assign(note: string, disciplineId: string, teacherId: string): Observable<any> {
    const params = new HttpParams()
      .set('disciplineId', disciplineId)
      .set('teacherId', teacherId)
      .set('note', note);
    return this.http.post(this.address + '/secured/admin/assign', {}, { params });
  }

  public getTeachers(): Observable<any> {
    return this.http.get(
      this.address + '/secured/admin/teachers',
      this.httpOptions
    );
  }

  public getDisciplines(): Observable<any> {
    return this.http.get(
      this.address + '/secured/admin/disciplines',
      this.httpOptions
    );
  }
}
