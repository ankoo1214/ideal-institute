import db from './createTable';
export const dropStudentTable = () => {
  return new Promise((resolve, reject) => {
    db.transaction(tx => {
      tx.executeSql(
        'DROP TABLE IF EXISTS students',
        [],
        (_, result) => {
          console.log('✅ Students table dropped successfully:', result);
          resolve(result);
        },
        (_, error) => {
          console.error('❌ Error dropping students table:', error);
          reject(error);
        },
      );
    });
  });
};
