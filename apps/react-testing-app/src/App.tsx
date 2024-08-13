import * as React from 'react';

import { useClient, useClientState } from '@proedis/react-client';


function App() {

  const [ count, setCount ] = React.useState(0);
  const client = useClient();

  console.log(useClientState());

  const handleClientLogin = React.useCallback(
    () => {
      client.login({ username: 'm.cavanna@proedis.net', password: '..T0poT1na' });
    },
    []
  );

  const handleClientLogout = React.useCallback(
    () => {
      client.logout();
    },
    []
  );

  return (
    <React.Fragment>
      <h1>Vite + React</h1>
      <div className="card">
        <button onClick={() => setCount((count) => count + 1)}>
          count is {count}
        </button>
        <div>
          <button onClick={handleClientLogin}>
            Login
          </button>
        </div>
        <div>
          <button onClick={handleClientLogout}>
            Logout
          </button>
        </div>
        <p>
          Edit <code>src/App.tsx</code> and save to test HMR
        </p>
      </div>
    </React.Fragment>
  );
}

export default App;
