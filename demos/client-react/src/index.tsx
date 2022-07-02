import 'core-js/stable';
import 'regenerator-runtime/runtime';

import Authenticake from '@authenticake/client';
import React from 'react';
import ReactDOM from 'react-dom';
import { BrowserRouter, Link } from 'react-router-dom';

import App from './components/App';

// webpack dev server is configured to proxy /api
const api = 'api/auth';

const AppWithRouter = () => (
  <Authenticake API={api} linkComponent={Link} linkComponentHrefAttr="to">
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </Authenticake>
);

ReactDOM.render(<AppWithRouter />, document.getElementById('root'));
