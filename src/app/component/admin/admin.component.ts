import { Component } from '@angular/core';
import {FormControl, FormGroup} from "@angular/forms";
import {Discipline} from "../../model/Discipline";
import {Person} from "../../model/Person";
import {AdminService} from "../../service/department/admin.service";
import {FileService} from "../../service/department/file.service";
import {error} from "@angular/compiler-cli/src/transformers/util";
import {splitNsName} from "@angular/compiler";

@Component({
  selector: 'app-admin',
  templateUrl: './admin.component.html',
  styleUrls: ['./admin.component.css']
})
export class AdminComponent {
  private fileService: FileService;
  private adminService: AdminService;

  teachers: Person[] = [];
  disciplines: Discipline[] = [];
  form = new FormGroup({
    selectTeacher: new FormControl(),
    selectDiscipline: new FormControl(),
    inputNote: new FormControl(),
  });

  constructor(fileService: FileService, adminService: AdminService) {
    this.fileService = fileService;
    this.adminService = adminService;
  }

  ngOnInit(): void {
    this.initTeachers();
    this.initDiscipline();
  }

  initTeachers(): void {
    this.adminService.getTeachers().subscribe(
      (data) => {
        this.teachers = data;
      },
      (error) => {
        alert('Ошибка загрузки спсика преподавателей с сервера!');
      }
    );
  }

  initDiscipline(): void {
    this.adminService.getDisciplines().subscribe(
      (data) => {
        this.disciplines = data;
      },
      (error) => {
        alert('Ошибка загрузки списка дисциплин с сервера!');
      }
    );
  }

  assignRPD(): void {
    let note = <string> this.form.controls['inputNote'].value;
    let disciplineId = <string> this.form.controls['selectDiscipline'].value;
    let teacherId = <string> this.form.controls['selectTeacher'].value;
    this.adminService.assign(note, disciplineId, teacherId).subscribe(
      data => {
        alert('Assigned')
      },
      error => {
        alert('Unable to assign: ' + error.error.message);
    }
    );
  }

  uploadTemplateFile(event: any): void {
    let file = event.target.files[0];
    if (!(this.getFileExtension(file) === 'docx')) {
      alert('Wrong extension');
      return;
    }
    let reader = new FileReader();
    reader.readAsDataURL(file);
    let base64: string = '';
    reader.onload = () => {
      base64 = <string> reader.result;
      this.fileService.uploadTemplate(base64.split(',')[1]).subscribe(
        data => {
          alert('Uploaded');
          this.reloadPage();
        },
        error => {
          alert('failed');
          this.reloadPage();
        }
      );
    }
  }

  uploadTeacherFile(event: any): void {
    let file = event.target.files[0];
    if (!(this.getFileExtension(file) === 'xlsx')) {
      alert('Wrong extension');
      return;
    }
    let reader = new FileReader();
    reader.readAsDataURL(file);
    let base64: string = '';
    reader.onload = () => {
      base64 = <string> reader.result;
      this.fileService.uploadTeachers(base64.split(',')[1]).subscribe(
        data => {
          alert('Uploaded');
        },
        error => {
          alert('failed');
        }
      );
    }
  }

  uploadTranslationFile(event: any): void {
    let file = event.target.files[0];
    if (!(this.getFileExtension(file) === 'json')) {
      alert('Wrong extension');
      return;
    }
    let reader = new FileReader();
    reader.readAsText(file);
    reader.onload = () => {
      console.log(<string> reader.result);
      let translations = JSON.parse(<string> reader.result);
      this.fileService.uploadTranslation(translations).subscribe(
        data => {
          alert('Uploaded');
        },
        error => {
          alert('failed');
        }
      );
    }
  }

  uploadDisciplineFile(event: any): void {
    let file = event.target.files[0];
    if (!(this.getFileExtension(file) === 'json')) {
      alert('Wrong extension');
      return;
    }
    let reader = new FileReader();
    reader.readAsText(file);
    reader.onload = () => {
      console.log(<string> reader.result);
      let disciplines = JSON.parse(<string> reader.result);
      this.fileService.uploadDisciplines(disciplines).subscribe(
        data => {
          alert('Uploaded');
        },
        error => {
          alert('failed');
        }
      );
    }
  }

  uploadSampleFile(event: any): void {
    let file = event.target.files[0];
    if (!(this.getFileExtension(file) === 'json')) {
      alert('Wrong extension');
      return;
    }
    let reader = new FileReader();
    reader.readAsText(file);
    reader.onload = () => {
      console.log(<string> reader.result);
      let samples = JSON.parse(<string> reader.result);
      this.fileService.uploadSamples(samples).subscribe(
        data => {
          alert('Uploaded');
        },
        error => {
          alert('failed');
        }
      );
    }
  }

  getTemplateFile(): void {
    this.fileService.getTemplateFile().subscribe(
      data => {
        const base64 = data.binary_string;
        this.saveFile(base64, 'rpd_template.docx', 'application/octet-stream');
      },
      error => {
        alert('Failed to upload the file');
      }
    )
  }

  getTeacherFile(): void {
    this.fileService.getTeacherFile().subscribe(
      data => {
        const base64 = data.binary_string;
        this.saveFile(base64, 'teachers.xlsx', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
      },
      error => {
        alert('Failed to upload the file');
      }
    )
  }

  getTranslationFile(): void {
    this.fileService.getTranslationFile().subscribe(
      data => {
        const base64 = data.binary_string;
        this.saveFile(base64, 'translation.json','application/json');
      },
      error => {
        alert('Failed to upload the file');
      }
    )
  }

  getSampleFile(): void {
    this.fileService.getSampleFile().subscribe(
      data => {
        const base64 = data.binary_string;
        this.saveFile(base64, 'samples.json','application/json');
      },
      error => {
        alert('Failed to upload the file');
      }
    )
  }

  getDisciplineFile(): void {
    this.fileService.getDisciplineFile().subscribe(
      data => {
        const base64 = data.binary_string;
        this.saveFile(base64, 'disciplines.json','application/json');
      },
      error => {
        alert('Failed to upload the file');
      }
    )
  }

  private saveFile(base64Data: string, fileName: string, typeFile: string) {
    try {
      const binaryString = window.atob(base64Data);
      const len = binaryString.length;
      const bytes = new Uint8Array(len);
      for (let i = 0; i < len; i++) {
        bytes[i] = binaryString.charCodeAt(i);
      }
      const blob = new Blob([bytes], {
        type: typeFile,
      });
      const link = document.createElement('a');
      link.href = window.URL.createObjectURL(blob);
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error('Ошибка при сохранении файла:', error);
    }
  }

  private getFileExtension(theFile: File): string {
    let parts = theFile.name.split('.');
    return theFile.name.split('.')[parts.length - 1];
  }

  private reloadPage(): void {
    window.location.reload();
  }
}
