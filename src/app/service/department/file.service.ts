import { Injectable } from '@angular/core';
import {HttpClient, HttpHeaders} from "@angular/common/http";
import {environment} from "../../../environments/environment";
import {Observable} from "rxjs";

@Injectable({
  providedIn: 'root'
})
export class FileService {
  private httpOptions: { headers: HttpHeaders };
  private address = environment.serverUrl + environment.serverPort;

  private getPath: string = '/secured/setup/documents';
  private uploadPath: string = '/secured/setup'

  private templateEndpoint: string = '/template';
  private teacherEndpoint: string = '/teachers';
  private translationEndpoint: string = '/translation';
  private sampleEndpoint: string = '/samples';
  private disciplineEndpoint: string = '/disciplines';

  constructor(private http: HttpClient) {
    this.httpOptions = {
      headers: new HttpHeaders({ 'Content-Type': 'application/json' }),
    };
  }

  public getTemplateFile(): Observable<any> {
    return this.getFile(this.templateEndpoint);
  }

  public getTeacherFile(): Observable<any> {
    return this.getFile(this.teacherEndpoint);
  }

  public getTranslationFile(): Observable<any> {
    return this.getFile(this.translationEndpoint);
  }

  public getSampleFile(): Observable<any> {
    return this.getFile(this.sampleEndpoint);
  }

  public getDisciplineFile(): Observable<any> {
    return this.getFile(this.disciplineEndpoint);
  }

  public uploadTemplate(base64: string): Observable<any> {
    return this.sendFileToEndpoint(base64, this.templateEndpoint);
  }

  public uploadTeachers(base64: string): Observable<any> {
    return this.sendFileToEndpoint(base64, this.teacherEndpoint);
  }

  public uploadTranslation(json: string): Observable<any> {
    return this.http.post(
      this.address + this.uploadPath + this.translationEndpoint,
      json,
      this.httpOptions
    )
  }

  public uploadSamples(json: string): Observable<any> {
    return this.http.post(
      this.address + this.uploadPath + this.sampleEndpoint,
      json,
      this.httpOptions
    )
  }

  public uploadDisciplines(json: string): Observable<any> {
    return this.http.post(
      this.address + this.uploadPath + this.disciplineEndpoint,
      json,
      this.httpOptions
    )
  }

  private getFile(endpoint: string): Observable<any> {
    return this.http.get(this.address + this.getPath + endpoint);
  }

  private sendFileToEndpoint(base64: string, endpoint: string): Observable<any> {
    return this.http.post(
      this.address + this.uploadPath + endpoint,
      {
        "binary_string": base64
      },
      this.httpOptions
    )
  }
}
