import React from "react";
import PropTypes from "prop-types";
import { Route, Redirect } from "react-router-dom";

export const PrivateRoute = ({ component: Component, firebase, ...routeProps }) => (
    <Route
        exact
        {...routeProps}
        render={props =>
            firebase.getCurrentUser() ? (
                <Component {...props} firebase={firebase} />
            ) : (
                <Redirect to={{ pathname: "/", state: { from: props.location } }} />
            )
        }
    />
);

PrivateRoute.propTypes = {
    component: PropTypes.object.isRequired,
    firebase: PropTypes.object.isRequired,
};
