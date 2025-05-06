import { TableDTO } from './TableDTO';

export interface TableDataDTO {
  name: string;
  headers: string[];
  maxColumns: number;
  displayedHeaders: string[],
  body: TableDTO;
  hidden: boolean;
  readonly: boolean;
  imageable: boolean;
  indicatored: boolean;
}
