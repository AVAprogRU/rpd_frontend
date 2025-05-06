import {Position} from "./Position";
import {Discipline} from "./Discipline";

export interface Person {
  id: number;
  name: String;
  lastname: String;
  patronymic: String;
  email: String;
  position: Position;
  assigned_disciplines: Discipline[];
}
