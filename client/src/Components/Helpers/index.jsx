import React from "react";
import PropTypes from "prop-types";
import { Route, Redirect } from "react-router-dom";

export const PrivateRoute = ({ component: Component, ...routeProps }) => (
    <Route
        exact
        {...routeProps}
        render={
            props => (
                // firebase.getCurrentUser() ? (
                <Component {...props} />
            )
            // ) : (
            //  <Redirect to={{ pathname: "/", state: { from: props.location } }} />
            // )
        }
    />
);

PrivateRoute.propTypes = {
    component: PropTypes.object.isRequired
};
