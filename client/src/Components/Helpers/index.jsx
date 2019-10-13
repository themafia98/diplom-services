import React from 'react';
import { Route, Redirect } from 'react-router-dom';


export const PrivateRoute = ({component: Component, ...routeProps }) => (
    <Route
        {...routeProps}
        render = {props =>
            localStorage.getItem('AuthToken') ?
            <Component {...props} />
            : <Redirect to = {{pathname: '/', state: { from: props.location }}} />
        }
    />
);
