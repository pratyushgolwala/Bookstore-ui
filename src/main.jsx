import React from 'react';
import ReactDOM from 'react-dom/client';
import { Provider } from 'react-redux';
import { BrowserRouter } from 'react-router-dom';

import App from './App';
import { store } from './store';
import { initApiClient } from './services/apiClient';
import { initAnalyticsClient } from './services/analyticsService';
import { initAssistantClient } from './services/assistantService';
import { initTrackingClient } from './services/trackingService';
import { initDeliveryClient } from './services/deliveryService';
import './index.css';

// Wire the Redux store into the API client so it can attach tokens
// and dispatch refresh/logout actions automatically.
initApiClient(store);
// Wire the store into the analytics client so it can attach the access token.
initAnalyticsClient(store);
// The assistant client shares the same store for JWT access tokens.
initAssistantClient(store);
// The tracking client shares the same store for JWT access tokens.
initTrackingClient(store);
// The delivery (classification/dispatch) client shares the same store too.
initDeliveryClient(store);

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <Provider store={store}>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </Provider>
  </React.StrictMode>,
);
