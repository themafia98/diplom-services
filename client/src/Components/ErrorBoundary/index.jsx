import React from "react";
//import * as Sentry from "@sentry/browser";

import ErrorPage from "./ErrorPage";

class ErrorBoundary extends React.Component {
    state = {
        hasError: false,
        eventId: null,
        error: null
    };

    static getDerivedStateFromError(error) {
        return { hasError: true, error: error };
    }

    update = event => {
        this.setState({
            hasError: false,
            eventId: null,
            error: null
        });
    };

    componentDidCatch(error, errorInfo) {
        // Sentry.withScope(scope => {
        //  scope.setExtras(errorInfo);
        // const eventId = Sentry.captureException(error);
        // this.setState({ eventId });
        // });
    }

    logger = event => {
        //Sentry.init({ dsn: process.env.REACT_APP_LOGGER_DSN });
        //Sentry.showReportDialog({ eventId: this.state.eventId });
    };

    render() {
        if (this.state.hasError) {
            //render fallback UI
            return <ErrorPage update={this.update} logger={this.logger} error={this.state.error} />;
        }
        //when there's not an error, render children untouched
        return this.props.children;
    }
}
export default ErrorBoundary;
