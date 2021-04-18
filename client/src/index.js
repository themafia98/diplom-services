/** IE supports polyfills */
import 'react-app-polyfill/ie11';
import 'react-app-polyfill/stable';
/** --------------------- */
import './i18n';
import React, { Suspense, StrictMode } from 'react';
import ReactDOM from 'react-dom';

import 'normalize.css';
import 'antd/dist/antd.css';
import './index.scss';
import './Styles/fontello.css';

import Fallback from 'Pages/Fallback';
import App from './App';
import * as serviceWorker from './serviceWorker';
import * as Sentry from '@sentry/browser';

import Root from './Root';

if (process.env.NODE_ENV === 'production') {
  Sentry.init({ dsn: process.env.REACT_APP_LOGGER_DSN });
}

ReactDOM.render(
  <StrictMode>
    <Suspense fallback={<Fallback />}>
      <Root>
        <App />
      </Root>
    </Suspense>
  </StrictMode>,
  document.getElementById('root'),
);

serviceWorker.register();
