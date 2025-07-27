import SQLite from 'react-native-sqlite-storage';

const db = SQLite.openDatabase({ name: 'students.db', location: 'default' });

/**
 * Create a table with dynamic name and schema
 * @param {string} tableName
 * @param {string} schema - e.g. "id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT"
 */
export const createTable = (tableName, schema) => {
  return new Promise((resolve, reject) => {
    db.transaction(tx => {
      const query = `CREATE TABLE IF NOT EXISTS ${tableName} (${schema})`;
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
