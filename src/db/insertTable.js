import db from './createTable';

export const insertTable = (tableName, data) => {
  const sid = data.sid || data.id;

  return new Promise((resolve, reject) => {
    db.transaction(tx => {
      tx.executeSql(
        `INSERT INTO ${tableName} (sid, data) VALUES (?, ?)`,
        [sid, JSON.stringify(data)],
        (txObj, resultSet) => resolve(resultSet),
        (txObj, error) => reject(error),
      );
    });
  });
};
