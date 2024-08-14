import * as React from 'react';


function App() {

  const [ count, setCount ] = React.useState(0);

  return (
    <React.Fragment>
      <h1>Vite + React</h1>
      <div className="card">
        <button onClick={() => setCount((count) => count + 1)}>
          count is {count}
        </button>
        <p>
          Edit <code>src/App.tsx</code> and save to test HMR
        </p>
      </div>
    </React.Fragment>
  );
}

export default App;
