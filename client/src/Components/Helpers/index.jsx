import React, { useState, useEffect } from "react";
import _ from 'lodash'
import PropTypes from "prop-types";
import { Route, Redirect } from "react-router-dom";
import Loader from '../Loader';

export const PrivateRoute = ({ component: Component, rest, ...routeProps }) => {
    let timer = null;
    const [route, setRoute] = useState(<Loader />);
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

                clearInterval(timer);
                setRoute(<Redirect to={"/"} />);
                setStatus(res.status);

            }
        }).catch(err => {
            console.error(err);
            clearInterval(timer);
            setRoute(<Redirect to={"/"} />);
            setStatus("error");
        });
    };

    const debounceGetRouters = _.debounce(getRouters, 1000);

    useEffect(() => {
        if (!init) {
            setInit(true);
            debounceGetRouters();
        }
        if (status !== 'error') {
            timer = setInterval(() => {
                debounceGetRouters();
            }, 15000);
        }
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
