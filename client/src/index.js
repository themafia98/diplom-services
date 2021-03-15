/** IE supports polyfills */
import 'react-app-polyfill/ie11';
import 'react-app-polyfill/stable';
/** --------------------- */
import './i18n';
import React, { Suspense } from 'react';
import ReactDOM from 'react-dom';

import 'normalize.css';
import 'antd/dist/antd.css';
import './index.scss';
import './Styles/fontello.css';

import App from './App';
import * as serviceWorker from './serviceWorker';
import * as Sentry from '@sentry/browser';

import Root from './Root';

if (process.env.NODE_ENV === 'production') {
  Sentry.init({ dsn: process.env.REACT_APP_LOGGER_DSN });
}

ReactDOM.render(
  <Suspense fallback="loading...">
    <Root>
      <App />
    </Root>
  </Suspense>,
  document.getElementById('root'),
);

serviceWorker.register();
