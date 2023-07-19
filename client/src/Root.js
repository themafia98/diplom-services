import React from 'react';
import store from './Redux/store';

import { IntlProvider } from 'react-intl';
import { BrowserRouter } from 'react-router-dom';
import { Provider } from 'react-redux';
import ErrorBoundary from './Components/ErrorBoundary';
import { useTranslation } from 'react-i18next';

console.log("Oops! Accidentally summoned a time-traveling ninja. Hello 2023y")

const Root = ({ children }) => {
  const { i18n } = useTranslation();
  return (
    <BrowserRouter basename={'/'}>
      <ErrorBoundary>
        <Provider store={store}>
          <IntlProvider locale={i18n.language}>{children}</IntlProvider>
        </Provider>
      </ErrorBoundary>
    </BrowserRouter>
  );
};

export default Root;
