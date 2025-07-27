import SQLite from 'react-native-sqlite-storage';

const db = SQLite.openDatabase({ name: 'students.db', location: 'default' });

export const initStudentTable = () => {
  db.transaction(tx => {
    tx.executeSql(
      'CREATE TABLE IF NOT EXISTS students (id INTEGER PRIMARY KEY AUTOINCREMENT, data TEXT, sid TEXT)',
    );
  });
};

export const insertStudent = studentObj => {
  const sid = studentObj.sid || studentObj.id; // assuming sid is in the object

  return new Promise((resolve, reject) => {
    db.transaction(tx => {
      tx.executeSql(
        'INSERT INTO students (sid, data) VALUES (?, ?)',
        [sid, JSON.stringify(studentObj)],
        (txObj, resultSet) => resolve(resultSet),
        (txObj, error) => reject(error),
      );
    });
  });
};
