import { createTable } from './createTable';
import { insertTable } from './insertTable';

const STUDENT_TABLE = 'students';
const STUDENT_SCHEMA =
  'id INTEGER PRIMARY KEY AUTOINCREMENT, data TEXT, SID TEXT';

export const initStudentTable = () => {
  return createTable(STUDENT_TABLE, STUDENT_SCHEMA);
};

export const insertStudent = studentObj => {
  return insertTable(STUDENT_TABLE, 'data', studentObj, sid);
};
