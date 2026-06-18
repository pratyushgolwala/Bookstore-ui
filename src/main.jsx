import React from 'react';
import ReactDOM from 'react-dom/client';
import { Provider } from 'react-redux';
import { BrowserRouter } from 'react-router-dom';

import App from './App';
import { store } from './store';
import { initApiClient } from './services/apiClient';
import { initAssistantClient } from './services/assistantService';
import './index.css';

// Wire the Redux store into the API client so it can attach tokens
// and dispatch refresh/logout actions automatically.
initApiClient(store);
// The assistant client shares the same store for JWT access tokens.
initAssistantClient(store);

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <Provider store={store}>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </Provider>
  </React.StrictMode>,
);
