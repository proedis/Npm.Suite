import { createRoot } from 'react-dom/client';

import App from './App';

import { ClientProvider } from '@proedis/react-client';
import client from './config';


createRoot(document.getElementById('root')!).render(
  <ClientProvider client={client}>
    <App />
  </ClientProvider>
);
