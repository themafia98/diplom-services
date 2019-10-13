import React from 'react';
import { Route, Redirect } from 'react-router-dom';


export const PrivateRoute = ({component: Component, firebase, ...routeProps }) => (
    <Route
        exact
        {...routeProps}
        render = {props =>
            firebase.getCurrentUser() ?
            <Component {...props} firebase = {firebase} />
            : <Redirect to = {{pathname: '/', state: { from: props.location }}} />
        }
    />
);
