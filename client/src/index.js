/** IE supports polyfills */
import 'core-js/features';
import 'react-app-polyfill/ie9';
import 'react-app-polyfill/ie11';
import 'react-app-polyfill/stable';
/** --------------------- */

import React from 'react';
import ReactDOM from 'react-dom';

import 'normalize.css';
import 'antd/dist/antd.css';
import './index.scss';
import './Utils/styles/fontello.css';

import App from './App';
import * as serviceWorker from './serviceWorker';
import * as Sentry from '@sentry/browser';

import Root from './Root';
import ModelContext, { modelMethods } from './Models/context';

require('es6-promise').polyfill();

Sentry.init({ dsn: process.env.REACT_APP_LOGGER_DSN });

ReactDOM.render(
  <Root>
    <ModelContext.Provider value={modelMethods}>
      <App />
    </ModelContext.Provider>
  </Root>,
  document.getElementById('root'),
);

serviceWorker.register();
