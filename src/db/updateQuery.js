import db from './createTable';
export const updateStudentInDb = (id, studentObj) => {
  return new Promise((resolve, reject) => {
    db.transaction(tx => {
      tx.executeSql(
        'UPDATE students SET data = ? WHERE id = ?',
        [JSON.stringify(studentObj), id],
        (txObj, resultSet) => resolve(resultSet),
        (_, error) => reject(error),
      );
    });
  });
};
