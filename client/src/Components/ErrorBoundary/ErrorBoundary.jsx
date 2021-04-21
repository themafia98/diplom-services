import React, { Component, Fragment } from 'react';
import * as Sentry from '@sentry/browser';

import ErrorPage from './ErrorPage';

class ErrorBoundary extends Component {
  state = {
    hasError: false,
    eventId: null,
    error: null,
  };

  static getDerivedStateFromError = (error) => {
    return { hasError: true, error: error };
  };

  update = () => {
    this.setState({
      hasError: false,
      eventId: null,
      error: null,
    });
  };

  componentDidCatch = (error, errorInfo) => {
    Sentry.withScope((scope) => {
      scope.setExtras(errorInfo);
      const eventId = Sentry.captureException(error);
      this.setState({ eventId });
    });
  };

  logger = (event) => {
    Sentry.showReportDialog({ eventId: this.state.eventId });
  };

  render() {
    const { hasError } = this.state;
    const { children } = this.props;
    if (hasError) {
      return <ErrorPage update={this.update} logger={this.logger} error={this.state.error} />;
    }

    return <Fragment key={`${hasError}`}>{children}</Fragment>;
  }
}
export default ErrorBoundary;
