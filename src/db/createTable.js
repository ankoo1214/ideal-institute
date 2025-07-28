import SQLite from 'react-native-sqlite-storage';

const db = SQLite.openDatabase({ name: 'students.db', location: 'default' });

/**
 * Create a table with dynamic name and schema
 * @param {string} tableName
 * @param {string} schema - e.g. "id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT"
 */
export const createTable = tableName => {
  return new Promise((resolve, reject) => {
    db.transaction(tx => {
      const query = `CREATE TABLE IF NOT EXISTS ${tableName} (id INTEGER PRIMARY KEY AUTOINCREMENT, data TEXT, sid TEXT)`;
      tx.executeSql(
        query,
        [],
        () => resolve(),
        (txObj, error) => reject(error),
      );
    });
  });
};

export default db; // export db for reuse
