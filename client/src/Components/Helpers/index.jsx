import React, { useState, useEffect } from "react";
import PropTypes from "prop-types";
import { Route, Redirect } from "react-router-dom";
import axios from "axios";

export const PrivateRoute = ({ component: Component, rest, ...routeProps }) => {

    const [route, setRoute] = useState(null);
    const [status, setStatus] = useState(null);
    const [init, setInit] = useState(null);

    const getRouters = async () => {
        await rest.authCheck().then(res => {
            if (res.status === 200) {
                if (res.status !== status) {
                    setRoute(<Component rest={rest} />);
                    setStatus(res.status);
                }
            } else {
                if (res.status !== status) {
                    setRoute(<Redirect to={"/"} />);
                    setStatus(res.status);
                }
            }
        })
    };

    useEffect(() => {
        if (!init) {
            setInit(true);
            getRouters();
        }
        const timer = setInterval(() => {
            getRouters();
        }, 20000);
        return () => clearInterval(timer);
    }, [""]);
    return (
        <Route
            exact
            {...routeProps}
            render={props => route}
        />
    );
}

PrivateRoute.propTypes = {
    component: PropTypes.object.isRequired
};
