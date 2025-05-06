import {Term} from "./Term";
import {TableDataDTO} from "./table/TableDataDTO";

export interface RPD {
  full_education_format: boolean;
  evening_education_format: boolean;
  extramural_education_format: boolean;

  master_degree: boolean;
  bachelor_degree: boolean;
  specialist_degree: boolean;

  exam_attestation_type: boolean;
  test_attestation_type: boolean;
  diff_test_attestation_type: boolean;

  has_coursework: boolean;

  competences: any[];
  placeholders: Record<string, string>;
  tables: TableDataDTO[];
  terms: Term[];
  total_term: Term;
}
