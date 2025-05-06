import { ImageDTO } from './ImageDTO';
import { InRowHeader } from './InRowHeader';
import {Sums} from "../Sums";

export interface TableDTO {
  column_numbering: boolean;
  row_numbering: boolean;
  rows: string[][];
  in_row_headers: InRowHeader[];
  sums: Sums[];
  total_sum: Sums;
  images: ImageDTO[];
}
