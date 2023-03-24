import Head from "next/head";
import { useEffect, useState } from "react";
import styles from "./index.module.css";

let dbPointer = 142;

export default function Home() {
  //const [unfilteredInput, setUnfilteredInput] = useState("");
  //const [sessionId, setSessionId] = useState("");
  //const [filterResult, setFilterResult] = useState();
  //const [dbResult, setDbResult] = useState();
  const [dataInput, setDataInput] = useState("");
  //const [result, setResult] = useState();
  const [result1, setResult1] = useState(' ');
  const [result2, setResult2] = useState(' ');
  const [result3, setResult3] = useState(' ');
  const [results, setResults] = useState({});
  //const [saveResult, setSaveResult] = useState();
  const [chatModel, setChatModel] = useState('gpt-3.5-turbo');
  const models = [
    {displayName:'ChatGPT 3.5', modelName: 'gpt-3.5-turbo'}, 
    {displayName:'ChatGPT 3', modelName: 'text-davinci-003'}, 
    {displayName:'Custom Model', modelName: 'flan_t5_large'}
  ];

  async function onSubmit(event) {
    event.preventDefault();
    try {
      const response = await fetch("/api/generate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ chat: dataInput, model: chatModel }),
      });

      const data = await response.json();
      if (response.status !== 200) {
        throw data.error || new Error(`Request failed with status ${response.status}`);
      }

      setResults({...results, [chatModel]: data.result});
      console.log(results);

      /*if (result3 !== ' ') {
        setResult3(' ');
        setResult2(' ');
        setResult1(data.result);
      } else if (result2 !== ' ') {
        setResult3(data.result);
      } else if (result1 !== ' ') {
        setResult2(data.result);
      } else {
        setResult1(data.result);
      }*/
      //setResult(data.result);
      //setDataInput("");
    } catch(error) {
      // Consider implementing your own error handling logic here
      console.error(error);
      alert(error.message);
    }
  }

  function getOptions() {
    let options = [];
    for (let model of models) {
      options.push(getOption(model));
    }
    return options;
  }

  function getOption(model) {
    return (<option value={model.modelName}>{model.displayName}</option>);
  }

  function getRows() {
    let rows = [];
    for (let model of models) {
      rows.push(getRow(model));
    }
    return rows;
  }

  function getRow(model) {
    return (<div className={styles.myrow}><div className={styles.titlecell}>{model.displayName}</div><div className={styles.resultcell}>{results[model.modelName]}</div></div>);
  }

  return (
    <div>
      <Head>
        <title>XA Chat Summarizer</title>
        <link rel="icon" href="/xa.png" />
      </Head>

      <main className={styles.main}>
        <img src="/xa.png" className={styles.icon} />
        <h3>Summarize a chat</h3>
        <form onSubmit={onSubmit}>
          <select 
            id="selectModel" 
            onChange={(e) => setChatModel(e.target.value)}
          >
              {getOptions()}
          </select>
          <textarea
            type="text"
            name="chat"
            placeholder="Enter text of chat"
            value={dataInput}
            onChange={(e) => setDataInput(e.target.value)}
            rows="10"
          ></textarea>
          <input type="submit" value="Generate summary" />
        </form>
        <div className={styles.mytable}>
          {getRows()}
        </div>
      </main>
    </div>
    );

  /*async function submitJson(event) {
    event.preventDefault();
    try {
      const response = await fetch("/api/filterText", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ unfiltered: unfilteredInput }),
      });

      const data = await response.json();
      if (response.status !== 200) {
        throw data.error || new Error(`Request failed with status ${response.status}`);
      }

      setFilterResult(data.result);
      setDataInput(data.result);
    } catch(error) {
      // Consider implementing your own error handling logic here
      console.error(error);
      alert(error.message);
    }
  }

  const prevDb = (event) => {
    event.preventDefault();
    if (dbPointer <= 0) {
      alert("At first record.");
      return;
    }
    dbPointer--;
    console.log(`Loading record at pointer ${dbPointer}`);
    loadDb();
  };

  const nextDb = (event) => {
    event.preventDefault();
    dbPointer++;
    console.log(`Loading record at pointer ${dbPointer}`);
    loadDb();
  };

  async function loadDb() {
    try {
      const response = await fetch("/api/loadDb", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ action: 'fetch', dbPointer: dbPointer }),
      });

      const data = await response.json();
      if (response.status !== 200) {
        throw data.error || new Error(`Request failed with status ${response.status}`);
      }

      //setDbResult(data.result);
      setUnfilteredInput(data.result[0].chat_json);
      setSessionId(data.result[0].xasession_id);

    } catch(error) {
      // Consider implementing your own error handling logic here
      console.error(error);
      alert(error.message);
    }
  }

  const saveFiltered = (event) => {
    event.preventDefault();
    saveDb('Filtered chat');
  };

  const saveSummary = (event) => {
    event.preventDefault();
    saveDb('Summary');
  };

  async function saveDb(which) {
    try {
      const response = await fetch("/api/loadDb", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ action: which, filterResult: filterResult, summary: result, sessionId: sessionId }),
      });

      const data = await response.json();
      if (response.status !== 200) {
        throw data.error || new Error(`Request failed with status ${response.status}`);
      }

      if (data.result !== '') {
        setSaveResult(which + ' saved successfully.');
      } else {
        setSaveResult('No results');
      }

    } catch(error) {
      // Consider implementing your own error handling logic here
      console.error(error);
      alert(error.message);
    }
  }*/

  /*return (
    <div>
      <Head>
        <title>OpenAI Quickstart</title>
        <link rel="icon" href="/xa.png" />
      </Head>

      <main className={styles.main}>
        <img src="/xa.png" className={styles.icon} />
        <h3>Load chat from DB</h3>
        <form>
          <input type="submit" value="Load previous from DB" onClick={prevDb} /><input type="submit" value="Load next from DB" onClick={nextDb} />
        </form>
        <div className={styles.result}>{dbResult}</div>
        <h3>Transform chat transcript json to text</h3>
        <form onSubmit={submitJson}>
          <textarea
            type="text"
            name="unfiltered"
            placeholder="Enter transcript json"
            value={unfilteredInput}
            onChange={(e) => setUnfilteredInput(e.target.value)}
            rows="10"
          ></textarea>
          <p>{sessionId}</p>
          <input type="submit" value="Filter text" />
        </form>
        <div className={styles.result}>{filterResult}</div>
        <h3>Summarize a chat</h3>
        <form>
          <textarea
            type="text"
            name="chat"
            placeholder="Enter text of chat"
            value={dataInput}
            onChange={(e) => setDataInput(e.target.value)}
            rows="10"
          ></textarea>
          <input type="submit" value="Generate summary" onClick={onSubmit} /><input type="submit" value="Save Filtered Chat" onClick={saveFiltered} />
        </form>
        <h3>Edit Summary</h3>
        <form>
          <textarea
            type="text"
            name="summary"
            placeholder="Enter text of summary"
            value={result}
            onChange={(e) => setResult(e.target.value)}
            rows="10"
          ></textarea>
          <input type="submit" value="Save Summary" onClick={saveSummary} />
        </form>
        <div className={styles.result}>{saveResult}</div>
      </main>
    </div>
  );*/
}
