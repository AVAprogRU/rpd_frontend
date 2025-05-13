import { Injectable } from '@angular/core';
import {HttpClient, HttpHeaders, HttpParams} from "@angular/common/http";
import {environment} from "../../../environments/environment";
import {forkJoin, map, Observable} from "rxjs";
import {Paragraph} from "../../model/Paragraph";
import {TableDataDTO} from "../../model/table/TableDataDTO";

@Injectable({
  providedIn: 'root'
})
export class TeacherService {
  private httpOptions: { headers: HttpHeaders };
  private address = environment.serverUrl + environment.serverPort;

  constructor(private http: HttpClient) {
    this.httpOptions = {
      headers: new HttpHeaders({ 'Content-Type': 'application/json' }),
    };
  }

  public reDraftRPD(paragraphs: Paragraph[], tables: TableDataDTO[],
                    teacherId: number, rpdId: number): Observable<any> {
    let placeholders = paragraphs.reduce((map, paragraph) => {
      map[paragraph.placeholder] = paragraph.sample;
      return map;
    }, {} as Record<string, string>);
    const params = new HttpParams().set('teacherId', teacherId).set('rpdId', rpdId);
    return this.http.post(
      this.address + '/secured/rpd/import/draft',
      {
        'placeholders': placeholders,
        'tables': tables
      },
      { params }
    )
  }

  public draftRPD(paragraphs: Paragraph[], tables: TableDataDTO[],
                  teacherId: number, disciplineId: number): Observable<any> {
    let placeholders = paragraphs.reduce((map, paragraph) => {
      map[paragraph.placeholder] = paragraph.sample;
      return map;
    }, {} as Record<string, string>);
    const params = new HttpParams().set('disciplineId', disciplineId).set('teacherId', teacherId);
    return this.http.post(
      this.address + '/secured/rpd/draft',
      {
        'placeholders': placeholders,
        'tables': tables
      },
      { params }
    );
  }

  public getRPDbyId(id: number): Observable<any> {
    const params = new HttpParams().set('id', id);
    return this.http.get(
      this.address + '/secured/rpd/crud/get',
      { params }
    );
  }

  public createMergedRPD(selectedDisciplineId: number ,
                         selectedRPDToImportId: number): Observable<any> {
    const params = new HttpParams()
      .set('selectedDisciplineId', selectedDisciplineId)
      .set('selectedRPDToImportId', selectedRPDToImportId);
    return this.http.get(
      this.address + '/secured/rpd/import/merged',
      {params}
    );
  }

  public getRPDByProperties(enrollYear: number, disciplineName: string,
                            authorName: string, programCode: string): Observable<any> {
    const params = new HttpParams()
      .set('enrollYear', enrollYear)
      .set('disciplineName', disciplineName)
      .set('authorName', authorName)
      .set('programCode', programCode);
    return this.http.get(
      this.address + '/secured/rpd/crud/find',
      { params }
    )
  }

  public getDisciplineEssentials(targetDisciplineId: number): Observable<any> {
    const params = new HttpParams().set('disciplineId', targetDisciplineId);
    return  this.http.get(this.address + '/secured/technical/essentials', { params });
  }

  public getTemplateParagraphs(): Observable<any> {
    return forkJoin({
      placeholders: this.http.get<string[]>(
        this.address + '/secured/technical/placeholders'
      ),
      translations: this.http.get<{ [key: string]: string }>(
        this.address + '/secured/technical/translation'
      ),
      samples: this.http.get<{ [key: string]: string }>(
        this.address + '/secured/technical/samples'
      ),
    }).pipe(map(({ placeholders, translations, samples }) => {
        return placeholders.map((placeholder) => ({
          placeholder,
          translation: translations[placeholder],
          sample: samples[placeholder] || '',
        }));
      })
    );
  }

  public getTemplateTables(targetDisciplineId: number): Observable<any> {
    return this.http.get(this.address + '/secured/technical/tables/' + targetDisciplineId);
  }
}
