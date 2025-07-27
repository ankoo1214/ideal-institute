import db from './createTable'; // or your SQLite db instance

export const fetchStudents = () => {
  return new Promise((resolve, reject) => {
    db.transaction(tx => {
      tx.executeSql(
        'SELECT data FROM students',
        [],
        (txObj, { rows: { length, item } }) => {
          const students = [];
          for (let i = 0; i < length; i++) {
            try {
              students.push(JSON.parse(item(i).data));
            } catch (e) {
              console.error('JSON parse error:', e);
            }
          }
          resolve(students);
        },
        (txObj, error) => {
          reject(error);
        },
      );
    });
  });
};
