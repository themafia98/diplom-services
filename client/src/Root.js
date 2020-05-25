import React from 'react';
import store from './Redux/store';

import { IntlProvider } from 'react-intl';
import { BrowserRouter } from 'react-router-dom';
import { Provider } from 'react-redux';
import ErrorBoundary from './Components/ErrorBoundary';

const Root = ({ children }) => {
  return (
    <BrowserRouter basename={'/'}>
      <ErrorBoundary>
        <Provider store={store}>
          <IntlProvider locale={'ru'}>{children}</IntlProvider>
        </Provider>
      </ErrorBoundary>
    </BrowserRouter>
  );
};

export default Root;
