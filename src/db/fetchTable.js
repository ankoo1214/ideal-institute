import db from './createTable';

export const fetchTable = tableName => {
  return new Promise((resolve, reject) => {
    db.transaction(tx => {
      tx.executeSql(
        `SELECT data from ${tableName}`,
        [],
        (txObj, { rows: { length, item } }) => {
          const list = [];
          for (let i = 0; i < length; i++) {
            try {
              list.push(JSON.parse(item(i).data));
            } catch (e) {
              console.error('JSON parse error:', e);
            }
          }
          resolve(list);
        },
        (txObj, error) => {
          reject(error);
        },
      );
    });
  });
};
