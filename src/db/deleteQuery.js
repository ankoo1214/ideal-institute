import db from './createTable';

export const deleteStudentFromDb = sid => {
  return new Promise((resolve, reject) => {
    db.transaction(tx => {
      tx.executeSql(
        'DELETE FROM students WHERE sid = ?',
        [sid],
        (_, result) => resolve(result),
        (_, error) => reject(error),
      );
    });
  });
};
