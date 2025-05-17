import {ChangeDetectorRef, Component} from '@angular/core';
import {Essentials} from "../../model/Essentials";
import {TokenService} from "../../service/auth/token.service";
import {Discipline} from "../../model/Discipline";
import {TeacherService} from "../../service/department/teacher.service";
import {Person} from "../../model/Person";
import {TableDataDTO} from "../../model/table/TableDataDTO";
import {Paragraph} from "../../model/Paragraph";
import {Term} from "../../model/Term";
import {DomSanitizer} from "@angular/platform-browser";
import {TableDTO} from "../../model/table/TableDTO";
import {FormControl, FormGroup} from "@angular/forms";
import {RPDEntity} from "../../model/RPDEntity";
import {InRowHeader} from "../../model/table/InRowHeader";
import {animateChild} from "@angular/animations";

@Component({
  selector: 'app-teacher',
  templateUrl: './teacher.component.html',
  styleUrls: ['./teacher.component.css']
})
export class TeacherComponent {
  private tokenService: TokenService;
  private teacherService: TeacherService;

  templateTables: TableDataDTO[] = [];
  templateParagraphs: Paragraph[] = [];
  codes: string[] = [];
  sectionNumbers: number[] = [];
  markedCells: {tableIndex: number, rowIndex: number, cellIndex: number}[] = [];
  validated: boolean = false;

  contentTableIndex: number = 7;
  assessmentTableIndex: number = 17;
  tableOffset: number = this.contentTableIndex - 2; // 2 non-alignment tables before the 1st content table
  editedTableData: any = [];

  teacher: Person | undefined;
  disciplineEssentials: Essentials | undefined;
  assignedDisciplines: Discipline[] = [];
  selectedDisciplineId: number | undefined;

  importForm: FormGroup = new FormGroup({
    year: new FormControl(''),
    disciplineName: new FormControl(''),
    authorName: new FormControl(''),
    programCode: new FormControl('')
  });
  selectedRPDToImportId: number = 0;
  foundRPDVersions: RPDEntity[] = [];
  importInitialized: boolean = false;

  constructor(tokenService: TokenService, teacherService: TeacherService,
              private cdr: ChangeDetectorRef, private sanitizer: DomSanitizer) {
    this.tokenService = tokenService;
    this.teacherService = teacherService;
    this.downloadAssignedDisciplines();
    this.downloadTeacherData();
  }

  // workflow \\
  initializeWorkflow(): void {
    this.importInitialized = false;
    this.downloadChosenDisciplineEssentials();
    this.downloadTemplateParagraphs();
    this.downloadTemplateTables();
  }

  initializeImport(): void {
    this.importInitialized = true;
    this.teacherService.getRPDbyId(this.selectedRPDToImportId).subscribe(
      data => {
        let rpd: RPDEntity = data;
        // setup essentials
        this.disciplineEssentials = {
          terms: rpd.body.terms,
          achievementsIndicators: rpd.body?.competences?.map((comp: any) => {return comp.achievementsIndicators?.map((ind: any) => {<string>ind.code})}),
          hasCoursework: rpd.body.has_coursework,
          enrollYear: rpd.enroll_year,
          disciplineName: rpd.discipline_name,
          programCode: rpd.program_code,
          testAttestationType: rpd.body.test_attestation_type,
          diffTestAttestationType: rpd.body.diff_test_attestation_type,
          extramuralEducationFormat: rpd.body.extramural_education_format,
          examAttestationType: rpd.body.exam_attestation_type,
          fullEducationFormat: rpd.body.full_education_format,
          bachelorDegree: rpd.body.bachelor_degree,
          eveningEducationFormat: rpd.body.evening_education_format,
          masterDegree: rpd.body.master_degree,
          specialistDegree: rpd.body.specialist_degree
        };
        // merge paragraphs
        /*this.teacherService.getTemplateParagraphs().subscribe(
          data => {
            this.templateParagraphs = data;
            let rpdParagraphs = this.createParagraphArray(rpd.body.placeholders);
            this.templateParagraphs.forEach((templateParagraph: Paragraph) => {
              rpdParagraphs.forEach((rpdParagraph: Paragraph) => {
                if (templateParagraph.placeholder == rpdParagraph.placeholder) {
                  templateParagraph.sample = rpdParagraph.sample;
                }
              });
            });
          }
        );*/
        // extract codes
        this.codes = rpd.body.competences.map((competence: any) => {
          return competence.achievement_indicators?.map((indicator: any) => {
            return indicator.code;
          });
        });
        this.codes = this.codes.join(',').split(',');
        console.log(JSON.stringify(this.codes));
        // extract from data.body.tables
        this.templateTables = this.extractTableData(rpd.body.tables);
        this.processImportedTables();
      }
    );
  }

  initializeImportNew(): void {
    // Проверка на null и преобразование
    if (this.selectedDisciplineId === undefined || this.selectedRPDToImportId === null) {
      alert('Не выбрана дисциплина или РПД для импорта');
      return;
    }
    this.importInitialized = true;
    this.teacherService.createMergedRPD(this.selectedDisciplineId, this.selectedRPDToImportId).subscribe(
      data => {
        let rpd: RPDEntity = data;
        // setup essentials
        this.disciplineEssentials = {
          terms: rpd.body.terms,
          achievementsIndicators: rpd.body?.competences?.map((comp: any) => {return comp.achievementsIndicators?.map((ind: any) => {<string>ind.code})}),
          hasCoursework: rpd.body.has_coursework,
          enrollYear: rpd.enroll_year,
          disciplineName: rpd.discipline_name,
          programCode: rpd.program_code,
          testAttestationType: rpd.body.test_attestation_type,
          diffTestAttestationType: rpd.body.diff_test_attestation_type,
          extramuralEducationFormat: rpd.body.extramural_education_format,
          examAttestationType: rpd.body.exam_attestation_type,
          fullEducationFormat: rpd.body.full_education_format,
          bachelorDegree: rpd.body.bachelor_degree,
          eveningEducationFormat: rpd.body.evening_education_format,
          masterDegree: rpd.body.master_degree,
          specialistDegree: rpd.body.specialist_degree
        };
        // merge paragraphs
        this.teacherService.getTemplateParagraphs().subscribe(
          data => {
            this.templateParagraphs = data;
            let rpdParagraphs = this.createParagraphArray(rpd.body.placeholders);
            this.templateParagraphs.forEach((templateParagraph: Paragraph) => {
              rpdParagraphs.forEach((rpdParagraph: Paragraph) => {
                if (templateParagraph.placeholder == rpdParagraph.placeholder) {
                  templateParagraph.sample = rpdParagraph.sample;
                }
              });
            });
          }
        );
        // вынимаем индикаторы
        this.codes = rpd.body.competences.map((competence: any) => {
          return competence.achievement_indicators?.map((indicator: any) => {
            return indicator.code;
          });
        });
        this.codes = this.codes.join(',').split(','); //хз gpt рекомендует .flat()
        console.log(JSON.stringify(this.codes));
        // extract from data.body.tables
        this.templateTables = this.extractTableData(rpd.body.tables);
        this.processImportedTables();
      }
    );
  }

  // RPD \\
  saveFileToDesktop(base64: string, fileName: string, contentType: string): void {
    try {
      const binaryString = window.atob(base64);
      const length = binaryString.length;
      const bytes = new Uint8Array(length);
      for (let j = 0; j < length; j++) {
        bytes[j] = binaryString.charCodeAt(j);
      }
      const blob = new Blob([bytes], {type: contentType});
      const link = document.createElement('a');
      link.href = window.URL.createObjectURL(blob);
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch(exception) {
      console.log(JSON.stringify(exception));
    }
  }

  validate(): void {
    let validationList = '';
    // paragraphs are not empty
    for (let j = 0; j < this.templateParagraphs.length; j++) {
      let paragraph: Paragraph = this.templateParagraphs[j];
      if (paragraph.sample === '') {
        validationList += '- All paragraphs must be filled out\n';
        break;
      }
    }
    // отключил проверку наполняемости таблиц (она не работает так, как надо)
   /* for (let j = 0; j < this.templateTables.length; j++) {
      let table: TableDataDTO = this.templateTables[j];
      if (table.body.rows.length > 0) {
        validationList += '- All tables must be filled out\n';
        break;
      }
    }*/
    // imported hours are matched in section table
    //this.importLabAndSeminarHoursToSections();  тоже мешает отправлять
    // all sums in tables 5-7 are matched
    // seminar table (5)
    const seminarTableIndex = this.contentTableIndex - this.tableOffset + 2;
    const seminarTable = this.templateTables[seminarTableIndex];
    let columns: number[] = [];
    let inRowHeadersToValidate: InRowHeader[] = [];
    let termsCount = this.disciplineEssentials?.terms.filter(term => term.classroom_activities.seminar_hours != 0).length || 0;
    for (let j = 1; j <= termsCount * 2; j += 2) {
      inRowHeadersToValidate.push(seminarTable.body.in_row_headers[j]);
    }
    columns = [2];
    this.validateTable(seminarTableIndex, inRowHeadersToValidate, columns);

    // laboratory table (6)
    const laboratoryTableIndex = this.contentTableIndex - this.tableOffset + 3;
    const laboratoryTable = this.templateTables[laboratoryTableIndex];
    inRowHeadersToValidate = [];
    termsCount = this.disciplineEssentials?.terms.filter(term => term.classroom_activities.laboratory_hours != 0).length || 0;
    for (let j = 1; j <= termsCount * 2; j += 2) {
      inRowHeadersToValidate.push(laboratoryTable.body.in_row_headers[j]);
    }
    columns = [1];
    this.validateTable(laboratoryTableIndex, inRowHeadersToValidate, columns);

    // solo work table (7)
    const soloTableIndex = this.contentTableIndex - this.tableOffset + 4;
    const soloTable: TableDataDTO = this.templateTables[soloTableIndex];
    inRowHeadersToValidate = [soloTable.body.in_row_headers[0]];
    columns = [1];
    let j = 1;
    this.disciplineEssentials?.terms.forEach(term => {
      j++;
      columns.push(j);
    });
    this.validateTable(soloTableIndex, inRowHeadersToValidate, columns);

    // validate practice hours control sum
    this.validatePracticeHoursCums();

    // marked cells check
    if (this.markedCells.length != 0) {
      console.log(this.markedCells);
      validationList += '- All control sums must be satisfied\n';
    }

    // final
    if (validationList != '') {
      alert(validationList);
    } else {
      this.validated = true;
    }
  }

  validatePracticeHoursCums(): void {
    const seminarTableIndex = this.contentTableIndex - this.tableOffset + 2;
    const seminarTable = this.templateTables[seminarTableIndex];
    const practiceHoursSeminarColIndex = 3;
    const laboratoryTableIndex = this.contentTableIndex - this.tableOffset + 3;
    const laboratoryTable = this.templateTables[laboratoryTableIndex];
    const practiceHoursLaboratoryColIndex = 2;
    let terms: Term[] = this.disciplineEssentials?.terms || [];
    let headerRows: number[] = [];
    for (let j = 1; j <= terms.length * 2; j++) {
      headerRows.push(j);
    }
    for (let j = 0; j < terms.length;j ++) {
      let term: Term = terms[j];
      let headerRow: number = headerRows[j];
      let targetSum: number = term.practice_hours;

      let seminarPart: number = 0;
      if (term.classroom_activities.seminar_hours != 0) {
        seminarPart = this.getSumAboveInRowHeader(seminarTable.body.in_row_headers[headerRow], seminarTableIndex, practiceHoursSeminarColIndex);
      }
      let laboratoryPart: number = 0;
      if (term.classroom_activities.laboratory_hours != 0) {
        laboratoryPart = this.getSumAboveInRowHeader(laboratoryTable.body.in_row_headers[headerRow], laboratoryTableIndex, practiceHoursLaboratoryColIndex);
      }

      let presentSum: number = seminarPart + laboratoryPart;
      if (presentSum != -1) {
        if (term.classroom_activities.seminar_hours != 0) {
          seminarTable.body.rows[seminarTable.body.in_row_headers[headerRow].row - 1][practiceHoursSeminarColIndex] = seminarPart + '';
        }
        if (term.classroom_activities.laboratory_hours != 0) {
          laboratoryTable.body.rows[laboratoryTable.body.in_row_headers[headerRow].row - 1][practiceHoursLaboratoryColIndex] = laboratoryPart + '';
        }
        if (targetSum != presentSum) {
          if (term.classroom_activities.seminar_hours != 0) {
            this.addMarkedCell(seminarTableIndex, seminarTable.body.in_row_headers[headerRow].row - 1, practiceHoursSeminarColIndex);
          }
          if (term.classroom_activities.laboratory_hours != 0) {
            this.addMarkedCell(laboratoryTableIndex, laboratoryTable.body.in_row_headers[headerRow].row - 1, practiceHoursLaboratoryColIndex);
          }
        } else {
          this.removeMarkedCellIfExists(seminarTableIndex, seminarTable.body.in_row_headers[headerRow].row - 1, practiceHoursSeminarColIndex);
          this.removeMarkedCellIfExists(laboratoryTableIndex, laboratoryTable.body.in_row_headers[headerRow].row - 1, practiceHoursLaboratoryColIndex);
        }
      }
    }
  }

  validateTable(tableIndex: number, headersToValidate: InRowHeader[], columns: number[]): void {
    let targetTable: TableDataDTO = this.templateTables[tableIndex];
    headersToValidate.forEach((header: InRowHeader) => {
      columns.forEach((column: number) => {
        let targetSum: number = Number(targetTable.body.rows[header.row - 1][column]);
        let tableIndex: number = this.templateTables.indexOf(targetTable);
        let presentSum: number = this.getSumAboveInRowHeader(header, tableIndex, column);
        if (presentSum != -1) {
          if (targetSum != presentSum) {
            this.addMarkedCell(tableIndex, header.row - 1, column);
          } else {
            this.removeMarkedCellIfExists(tableIndex, header.row - 1, column);
          }
        }
      })
    });
  }

  importLabAndSeminarHoursToSections(): void {
    this.shareSections();
    // seminar table
    let seminarSectionNumColumnIndex = 4;
    let seminarHoursOnSectionColIndex = 2;

    let seminarHoursOnSections: Map<Number, Number> = new Map<Number, Number>();
    seminarHoursOnSections.set(0, 0);
    seminarHoursOnSections = this.getHoursOnSections(
      this.contentTableIndex - this.tableOffset + 2,
      seminarSectionNumColumnIndex, seminarHoursOnSectionColIndex
    );

    // laboratory table
    let laboratorySectionNumColIndex = 3;
    let laboratoryHoursOnSectionColIndex = 1

    let laboratoryHoursOnSections: Map<Number, Number> = new Map<Number, Number>();
    laboratoryHoursOnSections.set(0, 0);
    laboratoryHoursOnSections = this.getHoursOnSections(
      this.contentTableIndex - this.tableOffset + 3,
      laboratorySectionNumColIndex, laboratoryHoursOnSectionColIndex
    );

    //section table
    let sectionTable: TableDataDTO = this.templateTables[this.contentTableIndex - this.tableOffset];
    let sectionTableHeaderRows = sectionTable.body.in_row_headers.map((header: InRowHeader) => header.row);

    let seminarHoursColumnIndex = 2;
    let laboratoryHoursColumnIndex = 3;

    for (let row = 0; row < sectionTable.body.rows.length; row++) {
      if (!sectionTableHeaderRows.includes(row + 1)) {
        let rowSectionNum = sectionTable.body.rows[row][0].match(/\d+/);
        let num: number = 0;
        if (rowSectionNum != null) {
          num = Number(rowSectionNum[0]);
        }
        sectionTable.body.rows[row][seminarHoursColumnIndex] = '' + seminarHoursOnSections.get(num);
        sectionTable.body.rows[row][laboratoryHoursColumnIndex] = '' + laboratoryHoursOnSections.get(num);
      }
    }

    // indicate if the input doesn't satisfy term sum
    let inRowHeadersToValidate: InRowHeader[] = [];
    let termsCount = this.disciplineEssentials?.terms.length || 0;
    for (let j = 1; j <= termsCount * 2; j += 2) {
      inRowHeadersToValidate.push(sectionTable.body.in_row_headers[j]);
    }
    let columnsToValidate: number[] = [1, 2, 3, 4, 5];

    inRowHeadersToValidate.forEach((header: InRowHeader) => {
      columnsToValidate.forEach((column: number) => {
        let targetSum: number = Number(sectionTable.body.rows[header.row - 1][column]);
        let tableIndex: number = this.templateTables.indexOf(sectionTable);
        let presentSum: number = this.getSumAboveInRowHeader(header, tableIndex, column);
        if (presentSum != -1) {
          if (targetSum != presentSum) {
            this.addMarkedCell(tableIndex, header.row - 1, column);
          } else {
            this.removeMarkedCellIfExists(tableIndex, header.row - 1, column);
          }
        }
      });
    });
  }

  shareSections(): void {
    let sectionTable: TableDataDTO = this.templateTables[this.contentTableIndex - this.tableOffset];
    let headerRows: number[] = sectionTable.body.in_row_headers.map((header: InRowHeader) => header.row);
    let sections: string[] = [];
    for (let row = 0; row < sectionTable.body.rows.length; row++) {
      if (!headerRows.includes(row + 1)) {
        sections.push(sectionTable.body.rows[row][0]);
      }
    }
    let lectureTable: TableDataDTO = this.templateTables[this.contentTableIndex - this.tableOffset + 1];
    let presentSections: string[] = lectureTable.body.rows.map((row: string[]) => {return row[1].split('\n')[0]});
    sections.forEach((section: string) => {
      let sectionNumber = section.match(/\d+/);
      if (sectionNumber != null && !presentSections.includes(section)) {
        lectureTable.body.rows.push([sectionNumber[0], (section + '\n')]);
      }
    });
    presentSections = lectureTable.body.rows.map((row: string[]) => {return row[1].split('\n')[0]});
    // update present section numbers
    presentSections.forEach((section: string) => {
      let newNumber = section.match(/\d+/);
      if (newNumber != null) {
        if (!this.sectionNumbers.includes(Number(newNumber[0]))) {
          this.sectionNumbers.push(Number(newNumber[0]));
        }
      }
    });
    this.cdr.detectChanges();
  }

  draft(): void {
    let tables: TableDataDTO[] = this.captureEditedData();
    const paragraphs: Paragraph[] = this.templateParagraphs;
    const teacherId = this.teacher?.id || -1;

    const fileName = 'RPD.docx';
    const contentType = 'application/octet-stream'

    if (!this.importInitialized) {
      const disciplineId = this.selectedDisciplineId || -1;
      this.teacherService.draftRPD(paragraphs, tables, teacherId, disciplineId).subscribe(
        data => {
          let base64 = data.binary_string;
          this.saveFileToDesktop(base64, fileName, contentType);
        }
      );
    } else {
      const rpdId = this.selectedRPDToImportId || -1;
      this.teacherService.reDraftRPD(paragraphs, tables, teacherId, rpdId).subscribe(
        data => {
          let base64 = data.binary_string;
          this.saveFileToDesktop(base64, fileName, contentType);
        }
      );
    }
  }

  findRPD(): void {
    let enrollYear = <number> this.importForm.controls['year'].value;
    let disciplineName = <string> this.importForm.controls['disciplineName'].value;
    let authorName = <string> this.importForm.controls['authorName'].value;
    let programCode = <string> this.importForm.controls['programCode'].value;

    this.teacherService.getRPDByProperties(enrollYear, disciplineName, authorName, programCode).subscribe(
      data => {
        this.foundRPDVersions = data;
      }
    );
  }

  // table structure methods \\
  addRowAfter(tableIndex: number, rowIndex: number): void {
    const table = this.templateTables[tableIndex];
    const newRow = new Array(table.maxColumns).fill('');
    const position = Math.max(0, Math.min(rowIndex + 1, table['body'].rows.length));
    table['body'].rows.splice(position, 0, newRow);
    this.adjustRowsOnAdd(tableIndex, rowIndex, true);
    this.cdr.detectChanges();
  }

  addRowBefore(tableIndex: number, rowIndex: number): void {
    const table = this.templateTables[tableIndex];
    if (!table) return;
    const newRow = new Array(table.maxColumns).fill('');
    const position = Math.max(0, Math.min(rowIndex, table['body'].rows.length));
    table['body'].rows.splice(position, 0, newRow);
    this.adjustRowsOnAdd(tableIndex, rowIndex, false);
    this.cdr.detectChanges();
  }

  addSpannedRowToTable(tableIndex: number, rowIndex: number): void {
    const table = this.templateTables[tableIndex];
    const newRow = [''];
    const position = Math.max(0, Math.min(rowIndex + 1, table['body'].rows.length));
    table['body'].rows.splice(position, 0, newRow);

    this.templateTables[tableIndex]['body'].in_row_headers.push({
      row: rowIndex + 1,
      text: ''
    })

    this.adjustRowsOnAdd(tableIndex, rowIndex, true);
    this.cdr.detectChanges();
  }

  presetResultRow(array: string[], tableIndex: number): void {
    let body: TableDTO = this.templateTables[tableIndex]['body'];

    body.rows.push(array);

    body.in_row_headers?.push({
      row: body.rows.length,
      text: 'Preset'
    });

    this.cdr.detectChanges();
  }

  adjustRowsOnAdd(tableIndex: number, anchorRowIndex: number, addAfter: boolean) {
    const table = this.templateTables[tableIndex];
    if (!table) return;

    const incrementIndex = addAfter ? anchorRowIndex + 1 : anchorRowIndex;

    table.body.in_row_headers?.forEach(rowHeader => {
      if (rowHeader.row > incrementIndex) {
        rowHeader.row += 1;
      }
    });

    table.body.images?.forEach(image => {
      if (image.row >= incrementIndex) {
        image.row += 1;
      }
    });

    this.adjustMarkedCellsOnRowAdd(tableIndex, anchorRowIndex, addAfter);
  }

  adjustRowsOnDelete(tableIndex: number, rowIndex: number) {
    const table = this.templateTables[tableIndex];
    if (!table) return;

    // Remove InRowHeaders corresponding to the deleted row
    table.body.in_row_headers = table.body.in_row_headers?.filter(rowHeader => rowHeader.row !== rowIndex + 1);

    // Remove Images corresponding to the deleted row
    table.body.images = table.body.images?.filter(image => image.row !== rowIndex);

    // Adjust indexes for remaining InRowHeaders
    table.body.in_row_headers?.forEach(rowHeader => {
      if (rowHeader.row > rowIndex) {
        rowHeader.row -= 1;
      }
    });

    // Adjust indexes for remaining Images
    table.body.images?.forEach(image => {
      if (image.row >= rowIndex) {
        image.row -= 1;
      }
    });

    this.adjustMarkedCellsOnRowDelete(tableIndex, rowIndex)
  }

  deleteRow(tableIndex: number, rowIndex: number): void {
    const table = this.templateTables[tableIndex];
    table.body.rows.splice(rowIndex, 1);
    this.adjustRowsOnDelete(tableIndex, rowIndex);
    this.updateMaxColumns();
  }

  updateMaxColumns(): void {
    this.templateTables.forEach(table => {
      table.maxColumns = Math.max(...table.body.rows.map(row => row.length), table.displayedHeaders.length);
    });
  }

  isCellMarked(tableIndex: number, rowIndex: number, cellIndex: number): boolean {
    return this.markedCells.some((cell: any) =>
      cell.tableIndex === tableIndex &&
      cell.rowIndex === rowIndex &&
      cell.cellIndex === cellIndex
    );
  }

  // table gathering methods \\
  onInput(event: any, tableIndex: number, rowIndex: number, cellIndex: number): void {
    this.templateTables[tableIndex].body.rows[rowIndex][cellIndex] = event.target.value;
  }

  captureEditedData(): TableDataDTO[] {
    this.editedTableData = [...this.templateTables];
    // DTOs preparations for the server
    // send tables #3+
    let startIndex = this.contentTableIndex - this.tableOffset;
    let payload: TableDataDTO[] = this.templateTables.slice(startIndex, this.templateTables.length);
    // set assessment tables as []
    payload[this.assessmentTableIndex - this.tableOffset - startIndex].body.rows = [];
    payload[this.assessmentTableIndex - this.tableOffset - startIndex + 1].body.rows = [];

    payload.forEach(table => {
      if (Array.isArray(table.body.rows)
        && table.body.rows.length > 0
        && Array.isArray(table.body.rows[0])
        && table.body.rows[0].length === 0) {
        table.body.rows.shift();
      }
    });

    console.log(JSON.stringify(payload));

    return payload;
  }

  // cell image handling\\
  openImageUploadDialog(tableIndex: number, rowIndex: number, cellIndex: number): void {
    const fileInput = document.createElement('input');
    fileInput.type = 'file';
    fileInput.accept = 'image/png';
    fileInput.onchange = () => {
      const file = fileInput.files?.[0];
      if (file) {
        this.convertImageToBase64(file, (base64) => {
          this.addImageToTable(tableIndex, rowIndex, cellIndex, base64);
        });
      }
    };
    fileInput.click();
  }

  convertImageToBase64(file: File, callback: (base64: string) => void): void {
    const reader = new FileReader();
    reader.onload = () => {
      const base64Result = reader.result as string;
      callback(base64Result);
    };
    reader.onerror = (error) => {
      console.error('Error reading file:', error);
    };
    reader.readAsDataURL(file);
  }

  addImageToTable(tableIndex: number, rowIndex: number, cellIndex: number, base64: string): void {
    const table = this.templateTables[tableIndex];
    if (!table.body.images) {
      table.body.images = [];
    }
    table.body.images.push({
      bytes: base64,
      row: rowIndex,
      col: cellIndex
    });
    this.cdr.detectChanges();
  }

  getImageForCell(tableIndex: number, rowIndex: number, cellIndex: number): string | null {
    const table = this.templateTables[tableIndex];
    const image = table.body.images?.find(img => img.row === rowIndex && img.col === cellIndex);
    return image ? this.sanitizer.bypassSecurityTrustUrl(image.bytes) as string : null;
  }

  // checkbox handling \\
  onCheckboxChange(event: Event, tableIndex: number, rowIndex: number, cellIndex: number): void {
    const table = this.templateTables[tableIndex];
    if (!table) return;

    const target = event.target as HTMLInputElement;
    const code = target.value;
    const row = table.body.rows[rowIndex];
    let cellValue = row[cellIndex];

    if (!cellValue) {
      cellValue = '';
    }
    // как я понял такой разделитель нужен чтоб сразу в документ вставлять с переносом строк
    const selectedCodes = cellValue.split('\n').filter(value => value);

    if (target.checked) {
      if (!selectedCodes.includes(code)) {
        selectedCodes.push(code);
      }
    } else {
      const codeIndex = selectedCodes.indexOf(code);
      if (codeIndex !== -1) {
        selectedCodes.splice(codeIndex, 0);
      }
    }
    row[cellIndex] = selectedCodes.join('\n');
    this.cdr.detectChanges();
  }

  isCheckboxChecked(code: string, cellValue: string): boolean {
    if (!cellValue) return false;
    const selectedCodes = cellValue.split('\n').filter(value => value);
    return selectedCodes.includes(code);
  }

  // tracking methods\\
  trackByPlaceholder(index: number, paragraph: Paragraph): string {
    return paragraph.placeholder;
  }

  trackByTableIndex(index: number, table: TableDataDTO): number {
    return index;
  }

  trackByRowIndex(index: number, row: string[]): number {
    return index;
  }

  trackByCellIndex(index: number, cell: string): number {
    return index;
  }

  // RPD workflow methods \\
  private downloadChosenDisciplineEssentials(): void {
    if (this.selectedDisciplineId != null) {
      this.teacherService.getDisciplineEssentials(this.selectedDisciplineId).subscribe(
        data => {
          this.disciplineEssentials = this.extractEssentials(data);
          this.codes = this.disciplineEssentials.achievementsIndicators.map((indicator: any) => {return indicator.code}
          );
        },
        error => {
          alert('Failed to download essentials: ' + error.message);
        }
      );
    }
  }

  private downloadTemplateParagraphs(): void {
    this.teacherService.getTemplateParagraphs().subscribe(
      data => {
        this.templateParagraphs = data;
      },
      error => {
        alert('Failed to get template paragraphs: ' + error.error.message);
      }
    )
  }

  private downloadTemplateTables(): void {
    if (this.selectedDisciplineId != null) {
      this.teacherService.getTemplateTables(this.selectedDisciplineId).subscribe(
        data => {
          this.templateTables = this.extractTableData(data);
          this.processTemplateTables();
        },
        error => {
          alert('Failed to download template tables: ' + error.message);
        }
      );
    }
  }

  // потом заменить на processTemplateTables() потому что по сути они одинаковы
  private processImportedTables(): void {
    console.log(JSON.stringify(this.templateTables));
    console.log('-------before--^-------------------------');
    this.templateTables = this.templateTables.map(table => this.processEmptyRows(table));
    this.templateTables = this.templateTables.map(table => this.processEmptyCells(table));
    this.templateTables = this.templateTables.map(table => this.processMandatoryTables(table));
    this.templateTables = this.templateTables.map(table => this.processHiddenTableHeaders(table));
    this.updateMaxColumns();
    console.log(JSON.stringify(this.templateTables));
    console.log('-------after--^-------------------------');
    this.cdr.detectChanges();
  }

  private processTemplateTables(): void {
    console.log(JSON.stringify(this.templateTables));
    console.log('-------before--^-------------------------');
    this.templateTables = this.templateTables.map((table: TableDataDTO) => this.processEmptyRows(table));
    this.templateTables = this.templateTables.map(table => this.processEmptyCells(table));
    this.templateTables = this.templateTables.map(table => this.processHiddenTableHeaders(table));
    this.templateTables = this.templateTables.map(table => this.processMandatoryTables(table));
    this.updateMaxColumns();
    console.log(JSON.stringify(this.templateTables));
    console.log('-------after--^-------------------------');
    this.cdr.detectChanges();
  }

  private processMandatoryTables(table: TableDataDTO): TableDataDTO {
    if (this.disciplineEssentials?.terms != null) {
      let terms: Term[] = this.disciplineEssentials.terms;
      let lectureHours: number[] = terms.map((term: Term) => term.classroom_activities.lecture_hours);
      let seminarHours: number[] = terms.map((term: Term) => term.classroom_activities.seminar_hours);
      let laboratoryHours: number[] = terms.map((term: Term) => term.classroom_activities.laboratory_hours);
      let soloHours: number[] = terms.map((term: Term) => term.solo_hours);
      let testHours: number[] = terms.map((term: Term) => term.classroom_activities.test_hours);
      let courseworkHours: number[] = terms.map((term: Term) => term.classroom_activities.coursework_hours);
      let courseprojectHours: number[] = terms.map((term: Term) => term.classroom_activities.courseproject_hours);

      let index: number = this.templateTables.indexOf(table);

      // prefilled tables (competences and intensity)
      if (index == 0 || index == 1) {
        table.readonly = true;
        if (index == 1) {
          table.body.rows[0].splice(0, 0, '', '');
        }
      }

      // content tables
      // discipline sections table
      if (index == this.contentTableIndex - this.tableOffset) {
        table.hidden = false;
        let CWorCPHours = this.getSum(courseworkHours) ;
        if (this.getSum(courseprojectHours) >= CWorCPHours) {
          CWorCPHours = this.getSum(courseprojectHours)
        }
        let totalSum: any[] = [
          'Total Sum:', this.getSum(lectureHours), this.getSum(seminarHours), this.getSum(laboratoryHours), CWorCPHours, this.getSum(soloHours)
        ];
        terms.forEach((term: Term) => {
          let CWorCPHours = term.classroom_activities.coursework_hours;
          if (term.classroom_activities.courseproject_hours != 0) {
            CWorCPHours = term.classroom_activities.courseproject_hours
          }
          let sums: any[] = [
            'Sum term ' + term.number + ':',
            term.classroom_activities.lecture_hours,
            term.classroom_activities.seminar_hours,
            term.classroom_activities.laboratory_hours,
            CWorCPHours,
            term.solo_hours
          ];
          this.presetResultRow(['Term ' + term.number], index);
          this.addControlSumRow(index, sums);
        });
        this.addControlSumRow(index, totalSum);
      }

      // lecture table
      if ((index == this.contentTableIndex - this.tableOffset + 1) && (this.getSum(lectureHours) == 0)) {
        table.hidden = true;
        table.body = this.createEmptyTableDTO();    //если у нас таблица скрыта, то и наполнения не должно быть
      }

      // seminar table
      if (index == this.contentTableIndex - this.tableOffset + 2) {
        terms.forEach((term: Term) => {
          let sums: any[] = [
            'Sum ' + term.number + ' term:',
            '',
            term.classroom_activities.seminar_hours,
            '',
            ''
          ];
          if (term.classroom_activities.seminar_hours != 0) {
            this.presetResultRow([('Term ' + term.number)], index)
            this.addControlSumRow(index, sums);
          }
        });
      }
      if ((index == this.contentTableIndex - this.tableOffset + 2) && (this.getSum(seminarHours) == 0)) {
        table.hidden = true;
        table.body =  this.createEmptyTableDTO();  //если у нас таблица скрыта, то и наполнения не должно быть
      }

      // laboratory table
      if (index == this.contentTableIndex - this.tableOffset + 3) {
        terms.forEach((term: Term) => {
          let sums: any[] = [
            'Sum ' + term.number + ' term:',
            term.classroom_activities.laboratory_hours,
            '',
            ''
          ];
          if (term.classroom_activities.laboratory_hours != 0) {
            this.presetResultRow([('Term ' + term.number)], index)
            this.addControlSumRow(index, sums);
          }
        });
      }
      if ((index == this.contentTableIndex - this.tableOffset + 3) && (this.getSum(laboratoryHours) == 0)) {
        table.hidden = true;
        table.body =  this.createEmptyTableDTO();
      }

      // solo work table
      if (index == this.contentTableIndex - this.tableOffset + 4) {
        let sums = ['Total sum:', '' + this.getSum(soloHours)];
        terms.forEach(term => {sums.push('' + term.solo_hours)});
        this.presetResultRow(sums, index);
      }
      if ((index == this.contentTableIndex - this.tableOffset + 4) && (this.getSum(soloHours) == 0)) {
        table.hidden = true;
        table.body =  this.createEmptyTableDTO();
      }

      // attestation tables
      // assessment table
      if ((index == this.assessmentTableIndex - this.tableOffset)) {
        table.readonly = true;
        table.hidden = false;
      }
      // competence criteria table
      if ((index == this.assessmentTableIndex - this.tableOffset + 1)) {
        table.readonly = true;
        table.hidden = false;
      }
      // exam questions table
      if (index == this.assessmentTableIndex - this.tableOffset + 2) {
        table.indicatored  = true;
        this.templateTables[index].imageable = true;
        terms.forEach((term: Term) => {
          this.presetResultRow([('Term ' + term.number)], index);
        });
      }
      if ((index == this.assessmentTableIndex - this.tableOffset + 2) && (!this.disciplineEssentials.examAttestationType)) {
        table.hidden = true;
        table.body =  this.createEmptyTableDTO();
      }
      // diff test/test questions table
      if (index == this.assessmentTableIndex - this.tableOffset + 3) {
        table.indicatored  = true;
        this.templateTables[index].imageable = true;
        terms.forEach((term: Term) => {
          this.presetResultRow([('Term ' + term.number)], index);
        });
      }
      if ((index == this.assessmentTableIndex - this.tableOffset + 3)
        && (!this.disciplineEssentials.diffTestAttestationType && !this.disciplineEssentials.testAttestationType)) {
        table.hidden = true;
        table.body =  this.createEmptyTableDTO();
      }
      // coursework/courseproject table
      if ((index == this.assessmentTableIndex - this.tableOffset + 4) && (!this.disciplineEssentials.hasCoursework)) {
        table.hidden = true;
        table.body =  this.createEmptyTableDTO();
      }
      // test (Q&A) table
      if (index == this.assessmentTableIndex - this.tableOffset + 5) {
        table.hidden = false;
      }
      if (index == this.assessmentTableIndex - this.tableOffset + 5) {
        table.indicatored  = true;
        this.templateTables[index].imageable = true;
      }
      // test table
      if (index == this.assessmentTableIndex - this.tableOffset + 6) {
        this.templateTables[index].imageable = true;
        terms.forEach((term: Term) => {
          this.presetResultRow([('Term ' + term.number)], index);
        });
      }
      if ((index == this.assessmentTableIndex - this.tableOffset + 6)
        && (this.getSum(testHours) == 0)
        && (!this.disciplineEssentials?.extramuralEducationFormat || this.disciplineEssentials.hasCoursework)) {
        table.hidden = true;
        table.body = this.createEmptyTableDTO();
      }

      if (this.importInitialized &&
         (index == this.assessmentTableIndex - this.tableOffset + 2 ||
          index == this.assessmentTableIndex - this.tableOffset + 3 ||
          index == this.assessmentTableIndex - this.tableOffset + 5))
      {
        this.cleanUpCompetences(table, this.codes);
        // Добавляю чекбокс, который обязательно должны снять при редактировании
        if (!this.codes.includes("ПК")) {
          this.codes.push("ПК");
        }
      }

    }
    return table;
  }

  private processHiddenTableHeaders(table: TableDataDTO): TableDataDTO {
    const columnsToRemove: number[] = table.headers
      .map((header: string, index: number) => (header.includes('п/п') ? index : -1))
      .filter((index: number) => index !== -1);

    table.displayedHeaders = table.headers.filter((header: string, index: number) =>
      !columnsToRemove.includes(index)
    );

    if (!this.importInitialized) {
      table.body.rows = table.body.rows.map((row: string[]) =>
        row.filter((_, index: number) => !columnsToRemove.includes(index))
      );
    }

    if (columnsToRemove.length != 0) {
      table.body.row_numbering = true;
    }

    return table;
  }

  private processEmptyCells(table: TableDataDTO): TableDataDTO {
    this.templateTables.forEach(table => {
      if (Array.isArray(table.body.rows)
        && table.body.rows.length > 0
        && Array.isArray(table.body.rows[0])
        && table.body.rows[0].length === 0) {
        table.body.rows.shift();
      }
    });

    if (this.importInitialized) {
      let headerRows: number[] = [];
      table.body.in_row_headers.forEach(header => {
        headerRows.push(header.row);
      });
      for (let row = 0; row < table.body.rows.length; row++) {
        if (!headerRows.includes(row)) {
          table.body.rows[row] = table.body.rows[row].filter((cell: string) => cell.trim() !== '');
        }
      }
    } else {
      table.body.rows = table.body.rows.map((row: string[]) =>
        row.filter((cell: string) => cell.trim() !== '')
      );
    }
    return table;
  }

  private processEmptyRows(table: TableDataDTO): TableDataDTO {
    // Ensure array properties are not null
    table.headers = table.headers || [];
    table.displayedHeaders = table.displayedHeaders || [];
    table.body.rows = table.body.rows || [];
    table.body.in_row_headers = table.body.in_row_headers || [];
    table.body.sums = table.body.sums || [];
    return table;
  }

  // extraction methods \\
  private extractTableData(data: any): TableDataDTO[] {
    return data.map((table: any) => ({
      name: table.name,
      headers: table.headers,
      maxColumns: 0,
      hidden: false,
      readonly: false,
      imageable: false,
      displayedHeaders: [],
      body: {
        column_numbering: table.body?.column_numbering || false,
        row_numbering: table.body?.row_numbering || false,
        rows: table.body?.rows || [],
        in_row_headers: table.body?.in_row_headers?.map((header: any) => ({
          row: header.row,
          text: header.text
        })) || [],
        total_sum: {
          row: table.body?.total_sum?.row,
          text: table.body?.total_sum?.text,
          columns: table.body?.total_sum?.columns
        } || null,
        sums: table.body?.check_sums?.map((sum: any) => ({
          row: sum.row,
          text: sum.text,
          columns: sum.columns
        })) || [],
        images: table.body?.images?.map((img: any) => ({
          bytes: img.bytes,
          row: img.row,
          col: img.col
        })) || []
      }
    }));
  }

  private extractEssentials(data: any): Essentials {
    return {
      fullEducationFormat: data.full_education_format,
      eveningEducationFormat: data.evening_education_format,
      extramuralEducationFormat: data.extramural_education_format,
      masterDegree: data.master_degree,
      bachelorDegree: data.bachelor_degree,
      specialistDegree: data.specialist_degree,
      examAttestationType: data.exam_attestation_type,
      testAttestationType: data.test_attestation_type,
      diffTestAttestationType: data.diff_test_attestation_type,
      hasCoursework: data.has_coursework,
      enrollYear: data.enroll_year,
      disciplineName: data.discipline_name,
      programCode: data.program_code,
      terms: data.terms.map((term: any) => ({
        id: term.id,
        number: term.number,
        total_intensity: term.total_intensity,
        practice_hours: term.practice_hours,
        total_classroom_hours: term.total_classroom_hours,
        solo_hours: term.solo_hours,
        intermediate_exam_type: term.intermediate_exam_type,
        classroom_activities: {
          courseproject_hours: term.classroom_activities.courseproject_hours,
          coursework_hours: term.classroom_activities.coursework_hours,
          test_hours: term.classroom_activities.test_hours,
          seminar_hours: term.classroom_activities.seminar_hours,
          exam_hours: term.classroom_activities.exam_hours,
          lecture_hours: term.classroom_activities.lecture_hours,
          laboratory_hours: term.classroom_activities.laboratory_hours
        }
      })),
      achievementsIndicators: data.achievements_indicators.map((ai: any) => ({
        code: ai.code,
        description: ai.description
      }))
    };
  }

  private downloadAssignedDisciplines(): void {
    const user = this.tokenService.getUser();
    if (user != null) {
      if (user.user.assigned_disciplines != null) {
        this.assignedDisciplines = user.user.assigned_disciplines;
      }
    }
  }

  private downloadTeacherData(): void {
    const user = this.tokenService.getUser();
    if (user != null) {
      this.teacher = user.user;
    }
  }

  // support \\
  private getSum(array: number[]) {
    return array.reduce((accumulator, currentValue) => accumulator + currentValue, 0)
  }

  private addControlSumRow(tableIndex: number, row: any[]): void {
    const result: string[] = row.map(cell => cell + '');
    this.presetResultRow(result, tableIndex);
  }

  private createParagraphArray(json: Record<string, string>): Paragraph[] {
    const paragraphArray: Paragraph[] = [];

    for (const key in json) {
      if (Object.prototype.hasOwnProperty.call(json, key)) {
        const value = json[key];
        const paragraph: Paragraph = {
          placeholder: key,
          sample: value,
          translation: ''
        };
        paragraphArray.push(paragraph);
      }
    }

    return paragraphArray;
  }

  private getSumAboveInRowHeader(inRowHeader: InRowHeader, tableIndex: number, columnIndex: number): number {
    const table = this.templateTables[tableIndex];
    const { rows, in_row_headers } = table.body;
    let currentRowIndex = inRowHeader.row - 2;

    let sum = 0;
    let foundValidRow = false;

    while (currentRowIndex >= 0) {
      const isCurrentRowHeader = in_row_headers.some(header => header.row - 1 === currentRowIndex);

      if (isCurrentRowHeader) {
        break;
      }

      const cellValue = rows[currentRowIndex][columnIndex];

      if (cellValue != null) {
        sum += Number(cellValue);
        foundValidRow = true;
      }
      currentRowIndex--;
    }

    if (!foundValidRow) {
      return -1;
    }
    return sum;
  }

  private addMarkedCell(tableIndex: number, rowIndex: number, cellIndex: number): void {
    const cellExists = this.markedCells.some(cell =>
      cell.tableIndex === tableIndex &&
      cell.rowIndex === rowIndex &&
      cell.cellIndex === cellIndex
    );

    const markedInTable = this.markedCells.filter(cell => cell.tableIndex == tableIndex).length;

    if (!cellExists) {
      this.markedCells.push({tableIndex, rowIndex, cellIndex});
    }
  }

  private removeMarkedCellIfExists(tableIndex: number, rowIndex: number, cellIndex: number): void {
    const cellIndexToRemove = this.markedCells.findIndex(cell =>
      cell.tableIndex === tableIndex &&
      cell.rowIndex === rowIndex &&
      cell.cellIndex === cellIndex
    );
    if (cellIndexToRemove !== -1) {
      this.markedCells.splice(cellIndexToRemove, 1);
    }
  }

  private getHoursOnSections(sourceTableIndex: number, sectionColIndex: number, hoursColIndex: number): Map<number, number> {
    let table: TableDataDTO = this.templateTables[sourceTableIndex];
    let headerRows: number[] = table.body.in_row_headers.map((header: InRowHeader) => {return header.row});
    let rows: string[][] = table.body.rows;

    let hoursOnSections: Map<number, number> = new Map<number, number>();
    hoursOnSections.set(0, 0);

    this.sectionNumbers.sort((a, b) => a - b);
    this.sectionNumbers.forEach((num: number) => {
      let hoursSum = 0;
      for (let row = 0; row < rows.length; row++) {
        if (headerRows.includes(row + 1)) {
          continue;
        }
        let cell = rows[row][sectionColIndex];
        let rowSectionNums: number[] = [];
        if (cell.split(',').length != 0) {
          rowSectionNums = cell.split(',').map(Number);
        } else {
          rowSectionNums.push(Number(cell));
        }
        if (rowSectionNums.includes(num)) {
          hoursSum += Number(rows[row][hoursColIndex]);
        }
      }
      hoursOnSections.set(num, hoursSum);
    });

    return hoursOnSections;
  }

  private adjustMarkedCellsOnRowAdd(tableIndex: number, anchorRowIndex: number, addAfter: boolean): void {
    this.markedCells.forEach(cell => {
      if (cell.tableIndex === tableIndex) {
        if ((addAfter && cell.rowIndex > anchorRowIndex) || (!addAfter && cell.rowIndex >= anchorRowIndex)) {
          cell.rowIndex++;
        }
      }
    });
  }

  private adjustMarkedCellsOnRowDelete(tableIndex: number, anchorRowIndex: number): void {
    this.markedCells = this.markedCells.filter(cell => {
      if (cell.tableIndex === tableIndex) {
        if (cell.rowIndex > anchorRowIndex) {
          cell.rowIndex--;
          return true;
        } else if (cell.rowIndex === anchorRowIndex) {
          return false;
        }
      }
      return true;
    });
  }

  /**
   * Создает пустой TableDTO. Используется для очистки скрытых таблиц.
   * */
  private createEmptyTableDTO(): TableDTO {
    return {
      column_numbering: false,
      row_numbering: false,
      rows: [],
      in_row_headers: [],
      sums: [],
      total_sum: {
        row: 0,
        text: '',
        columns: []
      },
      images: []
    };
  }

  /**
   * Очищает выбранные коды индикаторов ПерсонКомпетенц не соответсвующие ПК дисциплины.
   * Также добавлет якобы выбранный индикатор, чтоб препод обязательно снимал его.
   * @param table таблица
   * @param codes коды индикаторов ПК соответсующей дисциплины
   * */
  private cleanUpCompetences(table: TableDataDTO, codes: string[]): TableDataDTO {
    const headerRows = table.body.in_row_headers.map(h => h.row);
    table.body.rows = table.body.rows.map((row, rowIndex) => {
      // Пропустить строки-заголовки и строки с одной ячейкой
      if (headerRows.includes(rowIndex + 1) || row.length < 2) {
        return row;
      }

      const originalCell = row[1] || '';
      const selectedCodes = originalCell.split('\n').map(code => code.trim()).filter(code => codes.includes(code));

      // Добавим "ПК", если его ещё нет
      if (!selectedCodes.includes("ПК")) {
        selectedCodes.push("ПК");
      }
      row[1] = selectedCodes.join('\n');

      return row;
    });

    return table;
  }
}
