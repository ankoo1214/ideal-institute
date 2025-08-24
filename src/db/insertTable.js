import db from './createTable';

export const insertTable = (tableName, data) => {
  return new Promise((resolve, reject) => {
    // Basic validations
    if (!tableName || typeof tableName !== 'string') {
      return reject(new Error('Invalid table name'));
    }

    if (!data || typeof data !== 'object') {
      return reject(new Error('Data must be a valid object'));
    }

    const sid = data.sid || data.id || data.fId;
    if (!sid) {
      return reject(new Error('Missing unique identifier (sid, id, or fId)'));
    }

    try {
      db.transaction(tx => {
        tx.executeSql(
          `INSERT INTO ${tableName} (sid, data) VALUES (?, ?)`,
          [sid, JSON.stringify(data)],
          (txObj, resultSet) => {
            if (resultSet.rowsAffected > 0) {
              resolve(resultSet);
            } else {
              reject(new Error('Insert failed, no rows affected'));
            }
          },
          (txObj, error) => {
            console.error('SQL Insert Error:', error);
            reject(error);
          },
        );
      });
    } catch (err) {
      console.error('Transaction Error:', err);
      reject(err);
    }
  });
};
