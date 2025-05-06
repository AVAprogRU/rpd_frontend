import {Person} from "./Person";
import {Role} from "./Role";

export interface User {
  token: string;
  user: Person;
  roles: Role[];
}
