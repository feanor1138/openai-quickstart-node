import Client from "pg-native";

// Wrapper for a transaction.  This automatically re-calls the operation with
// the client as an argument as long as the database server asks for
// the transaction to be retried.
async function retryTxn(client, operation, callback) {
  const backoffInterval = 100; // millis
  const maxTries = 5;
  let tries = 0;

  while (true) {
    await client.query('BEGIN;');

    tries++;

    try {
      console.log("entered retryTxn");
      const result = await operation(client, callback);
      await client.query('COMMIT;');
      return result;
    } catch (err) {
      console.log("had error in retryTxn");
      await client.query('ROLLBACK;');

      if (err.code !== '40001' || tries == maxTries) {
        throw err;
      } else {
        console.log('Transaction failed. Retrying.');
        console.log(err.message);
        await new Promise(r => setTimeout(r, tries * backoffInterval));
      }
    }
  }
}


/*async function getData(client, callback) {
  console.log("entered getData");
  const selectStatement = "select xasession_id, '[ { \"interaction\": ' || cast(string_agg(cast(payloads as string), '}, { \"interaction\": ' order by start_time) as string) || '}]' as chat_json from chatmessage group by xasession_id order by xasession_id limit 1;";
  await client.query(selectStatement, callback);
}*/

export default async function (req, res) {

  const connectionString = process.env.DATABASE_URL;
  const client = new Client();
  try {
    client.connectSync(connectionString);
  } catch(err) {
    res.status(500).json({
      error: {
        message: 'An error occurred during your request.',
      }
    });
    return;
  }
  console.log('connected!');
  let results = null;
  const action = req.body ? req.body.action : 'fetch';
  
  try {
    let sql = '';
    const sessionId = req.body ? req.body.sessionId : '';
    switch (action) {
      case 'fetch':
        const dbPointer = req.body ? req.body.dbPointer : 0;
        sql = "select xasession_id, '[ { \"interaction\": ' || cast(string_agg(cast(payloads as string), '}, { \"interaction\": ' order by start_time) as string) || '}]' as chat_json from chatmessage group by xasession_id order by xasession_id limit " + (dbPointer + 1) + " offset " + dbPointer + ";";
        break;
      case 'Filtered chat':
        const filterResult = req.body ? req.body.filterResult : '';
        sql = "update chatmessage set combined_filtered = E'" + filterResult.replace(/'/g, "\\'") + "' where xasession_id = '" + sessionId + "';";
        break;
      case 'Summary':
        const summary = req.body ? req.body.summary : '';
        sql = "update chatmessage set summary = E'" + summary.replace(/'/g, "\\'") + "' where xasession_id = '" + sessionId + "';";
        break;
      default:
        break;
    }
    console.log(`sql: ${sql}`);
    if (sql !== '') {
      results = client.querySync(sql);
    }
  } catch(err) {
    console.log(err);
    res.status(500).json({
      error: {
        message: 'An error occurred during your request.',
      }
    });
    return;
  }

  if (results) {
    res.status(200).json({ result: results });
  } else {
    res.status(200).json({result: ''});
  }



/*    const cb = async (err, res) => {
      if (err) throw err;

      let rows = [];
      if (res.rows.length > 0) {
        res.rows.forEach((row) => {
          console.log(`row ${row}`);
          rows.push(row);
        });
      }
      res.status(200).json({ result: JSON.stringify(rows) });
    };*/

}