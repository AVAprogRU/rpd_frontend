import {Term} from "./Term";

export interface Essentials {
  fullEducationFormat: boolean;
  eveningEducationFormat: boolean;
  extramuralEducationFormat: boolean;
  masterDegree: boolean;
  bachelorDegree: boolean;
  specialistDegree: boolean;
  examAttestationType: boolean;
  testAttestationType: boolean;
  diffTestAttestationType: boolean;
  hasCoursework: boolean;
  enrollYear: number;
  disciplineName: string;
  programCode: string;
  terms: Term[];
  achievementsIndicators: string[];
}
