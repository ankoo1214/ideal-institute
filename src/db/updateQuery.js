import db from './createTable';

export const updateInDb = (tablename, id, studentObj) => {
  return new Promise((resolve, reject) => {
    if (!tablename || !id || !studentObj) {
      console.error('❌ updateInDb Error: Missing required parameters', {
        tablename,
        id,
        studentObj,
      });
      reject(
        new Error(
          'Invalid arguments: tablename, id, and studentObj are required',
        ),
      );
      return;
    }

    db.transaction(
      tx => {
        tx.executeSql(
          `UPDATE ${tablename} SET data = ? WHERE sid = ?`,
          [JSON.stringify(studentObj), id],
          (txObj, resultSet) => {
            if (resultSet.rowsAffected === 0) {
              console.warn(
                `⚠️ No record found with sid = ${id} in table ${tablename}`,
              );
              reject(new Error(`No record updated. sid=${id}`));
            } else {
              console.log(`✅ Successfully updated sid=${id} in ${tablename}`);
              resolve(resultSet);
            }
          },
          (_, error) => {
            console.error(`❌ SQL Error while updating ${tablename}:`, error);
            reject(error);
          },
        );
      },
      txError => {
        console.error('❌ Transaction Error:', txError);
        reject(txError);
      },
    );
  });
};
